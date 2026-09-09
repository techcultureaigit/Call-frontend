/**
 * reports-export.ts
 * Analytics PDF — Helvetica for English, Noto Sans Devanagari for Hindi only.
 * Layout mirrors the analytics page: KPIs, status, disconnect reason, questions.
 */
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import type {
  AnalyticsQuestionDetail,
  AnalyticsSurveyDates,
  ReportKpi,
  ReportPieSlice,
} from "@/types/reports";
import { withGlobalLoader } from "@/components/shared/api-loading.store";
import { STATUS_HINT_SHORT } from "@/modules/reports/analytics-theme";

export type AnalyticsPdfData = {
  dateRange: { from: string; to: string };
  surveyName?: string;
  campaignName?: string;
  surveyDates?: AnalyticsSurveyDates | null;
  kpis: ReportKpi[];
  surveyStatusBreakdown: ReportPieSlice[];
  reasonBreakdown: ReportPieSlice[];
  questions: AnalyticsQuestionDetail[];
  totalQuestions?: number;
  totalAnswers?: number;
};

const MARGIN = 12;
const FOOTER = 10;
const NAVY: [number, number, number] = [44, 59, 89];
const INK: [number, number, number] = [26, 34, 51];
const MUTED: [number, number, number] = [107, 119, 140];
const LINE: [number, number, number] = [226, 230, 237];
const ALT: [number, number, number] = [248, 249, 252];
const WHITE: [number, number, number] = [255, 255, 255];

const UI = "helvetica";
const HI = "NotoSansDevanagari";
const HI_FILE = "NotoSansDevanagari-Regular.ttf";
const HI_URL = "/fonts/NotoSansDevanagari-Regular.ttf";

const STATUS_ORDER = [
  "Complete",
  "Partially complete",
  "Incomplete",
  "Missed",
];

const REASON_MEANING: Record<string, string> = {
  "Disconnected by caller": "Caller hung up",
  "Disconnected by agent": "Agent or system ended the call",
  Unknown: "No reason recorded",
};

type PdfDoc = jsPDF & { lastAutoTable?: { finalY: number } };

let hiFontB64: string | null = null;

function toB64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

async function loadHiFont() {
  if (hiFontB64) return hiFontB64;
  const res = await fetch(HI_URL);
  if (!res.ok) throw new Error("Failed to load PDF Hindi font");
  hiFontB64 = toB64(await res.arrayBuffer());
  return hiFontB64;
}

function registerHiFont(doc: jsPDF, b64: string) {
  doc.addFileToVFS(HI_FILE, b64);
  doc.addFont(HI_FILE, HI, "normal");
  doc.addFont(HI_FILE, HI, "bold");
}

function hasHindi(text: string) {
  return /[\u0900-\u097F]/.test(text);
}

function period(from: string, to: string) {
  if (!from && !to) return "All time";
  const fmt = (v: string) => {
    const d = new Date(`${v}T00:00:00`);
    if (Number.isNaN(d.getTime())) return v;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  return `${fmt(from)} – ${fmt(to)}`;
}

function formatMetaDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const day = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${day}, ${time}`;
}

function pct(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 1000) / 10}%`;
}

function sliceCount(row: ReportPieSlice) {
  return Number(row.count ?? 0);
}

function sliceShare(row: ReportPieSlice, total: number) {
  const count = sliceCount(row);
  if (
    typeof row.value === "number" &&
    Number.isFinite(row.value) &&
    (row.value > 0 || count === 0)
  ) {
    return `${row.value}%`;
  }
  return pct(count, total);
}

function pw(doc: jsPDF) {
  return doc.internal.pageSize.getWidth();
}
function ph(doc: jsPDF) {
  return doc.internal.pageSize.getHeight();
}
function uw(doc: jsPDF) {
  return pw(doc) - MARGIN * 2;
}
function bottom(doc: jsPDF) {
  return ph(doc) - MARGIN - FOOTER;
}

function ensure(doc: PdfDoc, y: number, need: number) {
  if (y + need > bottom(doc)) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function cols(doc: jsPDF, fracs: number[]) {
  const total = uw(doc);
  const sum = fracs.reduce((a, b) => a + b, 0) || 1;
  return fracs.map((f) => Math.round((f / sum) * total * 100) / 100);
}

function kpiShare(kpi: ReportKpi) {
  if (kpi.id === "total_calls" || kpi.id === "avg_duration") {
    return kpi.changeLabel || "";
  }
  const n = Number(kpi.change);
  if (Number.isFinite(n) && kpi.changeLabel?.includes("%")) {
    return kpi.changeLabel;
  }
  if (Number.isFinite(n) && n > 0) return `${n}% of calls`;
  return kpi.changeLabel || "";
}

function typeLabel(type?: string) {
  const raw = (type || "").trim();
  if (!raw) return "—";
  if (/yes.?no/i.test(raw) || raw.toLowerCase() === "boolean") return "YES/NO";
  if (/text|open/i.test(raw)) return "TEXT";
  return raw.replace(/_/g, " ").toUpperCase();
}

function section(doc: jsPDF, y: number, title: string) {
  doc.setFont(UI, "bold");
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text(title, MARGIN, y);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y + 1.8, pw(doc) - MARGIN, y + 1.8);
  return y + 6;
}

function statusRowsForPdf(rows: ReportPieSlice[]) {
  const byName = new Map(rows.map((row) => [row.name, row]));
  return STATUS_ORDER.map((name) => {
    const row = byName.get(name);
    return {
      name,
      count: row ? sliceCount(row) : 0,
      value: row?.value ?? 0,
      fill: row?.fill ?? "",
    } satisfies ReportPieSlice;
  });
}

function drawHeader(doc: jsPDF, data: AnalyticsPdfData) {
  const survey = data.surveyName ?? data.campaignName ?? "Survey";
  const totalCalls = Number(
    data.kpis.find((kpi) => kpi.id === "total_calls")?.value ?? 0
  );

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pw(doc), 22, "F");

  doc.setFont(UI, "bold");
  doc.setFontSize(7);
  doc.setTextColor(180, 190, 210);
  doc.text("TECHCALL  |  AI VOICE & SURVEY CRM", MARGIN, 8);

  doc.setFontSize(14);
  doc.setTextColor(...WHITE);
  doc.text("Analytics Report", MARGIN, 16);

  doc.setFont(UI, "normal");
  doc.setFontSize(8);
  doc.setTextColor(210, 218, 230);
  doc.text(period(data.dateRange.from, data.dateRange.to), pw(doc) - MARGIN, 8, {
    align: "right",
  });
  doc.setFont(UI, "bold");
  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  doc.text(
    `${Number.isFinite(totalCalls) ? totalCalls : 0} calls`,
    pw(doc) - MARGIN,
    16,
    { align: "right" }
  );

  let y = 28;
  if (hasHindi(survey)) {
    doc.setFont(HI, "normal");
  } else {
    doc.setFont(UI, "bold");
  }
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  const lines = doc.splitTextToSize(survey, uw(doc));
  doc.text(lines, MARGIN, y);
  y += lines.length * 5 + 3;

  const dates = data.surveyDates;
  if (dates) {
    const start = dates.startAt
      ? formatMetaDateTime(dates.startAt)
      : dates.scheduledAt
        ? formatMetaDateTime(dates.scheduledAt)
        : "—";
    const end = dates.endAt ? formatMetaDateTime(dates.endAt) : "—";
    const window =
      dates.callWindowStart || dates.callWindowEnd
        ? `${dates.callWindowStart || "—"} – ${dates.callWindowEnd || "—"}`
        : "—";

    const meta = [
      `Created: ${formatMetaDateTime(dates.createdAt)}`,
      `Schedule: ${start} → ${end}`,
      `Call window: ${window}`,
    ];
    doc.setFont(UI, "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(meta.join("   ·   "), MARGIN, y);
    y += 5;
  }

  return y;
}

function drawKpis(doc: PdfDoc, y: number, kpis: ReportKpi[]) {
  if (!kpis.length) return y;
  y = section(doc, y, "Key metrics");
  const gap = 2.5;
  const n = Math.min(3, kpis.length);
  const cardW = (uw(doc) - gap * (n - 1)) / n;
  const cardH = 16;

  kpis.forEach((kpi, i) => {
    const col = i % n;
    const row = Math.floor(i / n);
    const x = MARGIN + col * (cardW + gap);
    const cy = y + row * (cardH + gap);

    doc.setDrawColor(...LINE);
    doc.setFillColor(...WHITE);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, cy, cardW, cardH, 1.2, 1.2, "FD");

    doc.setFont(UI, "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(kpi.label, x + 2.5, cy + 4.5);

    doc.setFont(UI, "bold");
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text(String(kpi.value), x + 2.5, cy + 10);

    doc.setFont(UI, "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...MUTED);
    doc.text(kpiShare(kpi), x + 2.5, cy + 13.8);
  });

  return y + Math.ceil(kpis.length / n) * (cardH + gap) + 2;
}

function drawBreakdownTable(
  doc: PdfDoc,
  y: number,
  title: string,
  hint: string,
  head: string[],
  body: string[][],
  fracs: number[]
) {
  y = ensure(doc, y, 28);
  y = section(doc, y, title);
  doc.setFont(UI, "normal");
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(hint, MARGIN, y);
  y += 3;

  const widths = cols(doc, fracs);
  autoTable(doc, {
    startY: y,
    theme: "plain",
    margin: { left: MARGIN, right: MARGIN },
    head: [head],
    body,
    styles: {
      font: UI,
      fontSize: 8.5,
      cellPadding: 2.2,
      textColor: INK,
      lineColor: LINE,
      lineWidth: 0.2,
      valign: "middle",
    },
    headStyles: {
      font: UI,
      fontStyle: "bold",
      fillColor: NAVY,
      textColor: WHITE,
      fontSize: 8,
      cellPadding: 2.4,
    },
    alternateRowStyles: { fillColor: ALT },
    columnStyles: {
      0: { cellWidth: widths[0], fontStyle: "bold" },
      1: { cellWidth: widths[1], textColor: MUTED, fontSize: 8 },
      2: { cellWidth: widths[2], halign: "right", fontStyle: "bold" },
      3: { cellWidth: widths[3], halign: "right" },
    },
  });
  return (doc.lastAutoTable?.finalY ?? y) + 6;
}

function buildPdf(data: AnalyticsPdfData, fontB64: string) {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
  }) as PdfDoc;
  registerHiFont(doc, fontB64);

  let y = drawHeader(doc, data);
  y = drawKpis(doc, y, data.kpis ?? []);

  const statusRows = statusRowsForPdf(data.surveyStatusBreakdown ?? []);
  const statusTotal =
    statusRows.reduce((sum, row) => sum + sliceCount(row), 0) ||
    Number(data.kpis.find((kpi) => kpi.id === "total_calls")?.value ?? 0);
  if (statusRows.some((row) => sliceCount(row) > 0) || statusTotal > 0) {
    y = drawBreakdownTable(
      doc,
      y,
      "Survey status",
      "Missed = did not pick up  ·  Incomplete = picked up, no answers",
      ["Status", "Meaning", "Count", "Share"],
      statusRows.map((row) => [
        row.name,
        STATUS_HINT_SHORT[row.name] || "Survey status",
        String(sliceCount(row)),
        sliceShare(row, statusTotal),
      ]),
      [26, 44, 15, 15]
    );
  }

  const reasonRows = (data.reasonBreakdown ?? []).filter(
    (row) => sliceCount(row) > 0
  );
  const reasonTotal = reasonRows.reduce((sum, row) => sum + sliceCount(row), 0);
  if (reasonRows.length) {
    y = drawBreakdownTable(
      doc,
      y,
      "Disconnect reason",
      "Who ended the connected call  ·  from Reason key",
      ["Reason", "Meaning", "Count", "Share"],
      reasonRows.map((row) => [
        row.name,
        REASON_MEANING[row.name] ||
          STATUS_HINT_SHORT[row.name] ||
          "Recorded hangup reason",
        String(sliceCount(row)),
        sliceShare(row, reasonTotal),
      ]),
      [40, 30, 15, 15]
    );
  }

  const questions = [...(data.questions ?? [])].sort(
    (a, b) =>
      (b.usersAnswered ?? b.answered) - (a.usersAnswered ?? a.answered)
  );
  const avgRate = questions.length
    ? Math.round(
        questions.reduce((s, q) => s + (q.answerRate ?? 0), 0) / questions.length
      )
    : 0;
  const answers =
    data.totalAnswers ??
    questions.reduce((s, q) => s + (q.usersAnswered ?? q.answered ?? 0), 0);
  const questionCount = data.totalQuestions ?? questions.length;

  if (questions.length) {
    y = ensure(doc, y, 24);
    y = section(doc, y, "Question analytics");
    doc.setFont(UI, "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(
      `${questionCount} questions  ·  ${avgRate}% avg answer rate  ·  ${answers} answers`,
      MARGIN,
      y
    );
    y += 3;

    const [c0, c1, c2, c3, c4, c5] = cols(doc, [6, 50, 12, 10, 10, 12]);
    autoTable(doc, {
      startY: y,
      theme: "plain",
      margin: { left: MARGIN, right: MARGIN },
      showHead: "everyPage",
      head: [["#", "Question", "Type", "Ans", "Skip", "Rate"]],
      body: questions.map((q, i) => [
        String(i + 1).padStart(2, "0"),
        (q.question || "").trim() || `Question ${i + 1}`,
        typeLabel(q.type),
        String(q.usersAnswered ?? q.answered ?? 0),
        String(q.usersSkipped ?? q.unanswered ?? 0),
        `${Math.round(q.answerRate ?? 0)}%`,
      ]),
      styles: {
        font: UI,
        fontSize: 8.5,
        cellPadding: { top: 2.4, right: 2, bottom: 2.4, left: 2 },
        textColor: INK,
        lineColor: LINE,
        lineWidth: 0.2,
        overflow: "linebreak",
        valign: "top",
      },
      headStyles: {
        font: UI,
        fontStyle: "bold",
        fillColor: NAVY,
        textColor: WHITE,
        fontSize: 8,
        cellPadding: 2.4,
        valign: "middle",
      },
      alternateRowStyles: { fillColor: ALT },
      columnStyles: {
        0: { cellWidth: c0, halign: "right", textColor: MUTED, fontSize: 8 },
        1: { cellWidth: c1, fontSize: 10 },
        2: { cellWidth: c2, fontSize: 7.5, textColor: MUTED },
        3: { cellWidth: c3, halign: "right", fontStyle: "bold" },
        4: { cellWidth: c4, halign: "right" },
        5: { cellWidth: c5, halign: "right", fontStyle: "bold" },
      },
      didParseCell: (hook) => {
        if (hook.section !== "body" || hook.column.index !== 1) return;
        const text = String(hook.cell.raw ?? "");
        if (hasHindi(text)) {
          hook.cell.styles.font = HI;
          hook.cell.styles.fontStyle = "normal";
          hook.cell.styles.fontSize = 10;
        }
      },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 5;
  }

  const when = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  y = ensure(doc, y, 6);
  doc.setFont(UI, "normal");
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(`Generated ${when}`, pw(doc) / 2, y, { align: "center" });

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.25);
    doc.line(MARGIN, ph(doc) - 7.5, pw(doc) - MARGIN, ph(doc) - 7.5);
    doc.setFont(UI, "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text("TechCall CRM", MARGIN, ph(doc) - 4);
    doc.text(`Page ${i} of ${pages}`, pw(doc) - MARGIN, ph(doc) - 4, {
      align: "right",
    });
  }

  return doc;
}

function fileSafe(v: string) {
  return v.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").slice(0, 40);
}

export async function exportReportsPdf(data: AnalyticsPdfData) {
  await withGlobalLoader(
    async () => {
      const font = await loadHiFont();
      const doc = buildPdf(data, font);
      const from = data.dateRange.from || "all";
      const to = data.dateRange.to || "time";
      const survey = fileSafe(data.surveyName || data.campaignName || "survey");
      doc.save(`analytics-${survey}-${from}-${to}.pdf`);
    },
    { label: "Exporting", hint: "Preparing your report" }
  );
}
