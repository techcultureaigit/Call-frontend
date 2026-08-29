/**
 * reports-export.ts
 * Export analytics to a formatted PDF report (client-side).
 * Uses Noto Sans Devanagari so Hindi / Unicode question text renders correctly.
 */
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import type { ReportsData } from "@/types/reports";
import { withGlobalLoader } from "@/components/shared/api-loading.store";

const MARGIN = 12;
const FOOTER_SPACE = 10;
const BRAND: [number, number, number] = [13, 148, 136];
const BRAND_DARK: [number, number, number] = [15, 118, 110];
const QUESTION_BATCH_SIZE = 40;
const UNICODE_FONT = "NotoSansDevanagari";
const UNICODE_FONT_FILE = "NotoSansDevanagari-Regular.ttf";
const UNICODE_FONT_URL = "/fonts/NotoSansDevanagari-Regular.ttf";

type PdfDoc = jsPDF & { lastAutoTable?: { finalY: number } };

let unicodeFontBase64: string | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function loadUnicodeFontBase64() {
  if (unicodeFontBase64) return unicodeFontBase64;
  const res = await fetch(UNICODE_FONT_URL);
  if (!res.ok) {
    throw new Error("Failed to load PDF Unicode font");
  }
  unicodeFontBase64 = arrayBufferToBase64(await res.arrayBuffer());
  return unicodeFontBase64;
}

function registerUnicodeFont(doc: jsPDF, base64: string) {
  doc.addFileToVFS(UNICODE_FONT_FILE, base64);
  doc.addFont(UNICODE_FONT_FILE, UNICODE_FONT, "normal");
  doc.addFont(UNICODE_FONT_FILE, UNICODE_FONT, "bold");
  doc.setFont(UNICODE_FONT, "normal");
}

function formatChange(change: number) {
  if (!Number.isFinite(change) || change === 0) return "No change";
  return `${change > 0 ? "+" : ""}${change}% vs prior period`;
}

function formatPeriod(from: string, to: string) {
  const fmt = (value: string) => {
    const d = new Date(`${value}T00:00:00`);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  return `${fmt(from)} – ${fmt(to)}`;
}

function pct(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 1000) / 10}%`;
}

function pageWidth(doc: jsPDF) {
  return doc.internal.pageSize.getWidth();
}

function pageHeight(doc: jsPDF) {
  return doc.internal.pageSize.getHeight();
}

function usableWidth(doc: jsPDF) {
  return pageWidth(doc) - MARGIN * 2;
}

function contentBottom(doc: jsPDF) {
  return pageHeight(doc) - MARGIN - FOOTER_SPACE;
}

function ensureSpace(doc: PdfDoc, y: number, needed: number) {
  if (y + needed > contentBottom(doc)) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

/** Distribute column widths as fractions of usable page width. */
function colWidths(doc: jsPDF, fractions: number[]) {
  const total = usableWidth(doc);
  const sum = fractions.reduce((a, b) => a + b, 0) || 1;
  return fractions.map((f) => Math.round(((f / sum) * total) * 100) / 100);
}

function drawSectionTitle(doc: jsPDF, y: number, title: string) {
  doc.setFont(UNICODE_FONT, "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND_DARK);
  doc.text(title.toUpperCase(), MARGIN, y);
  return y + 5;
}

function tableStyles() {
  return {
    theme: "grid" as const,
    tableWidth: "auto" as const,
    styles: {
      font: UNICODE_FONT,
      fontStyle: "normal" as const,
      fontSize: 8,
      cellPadding: 2.5,
      overflow: "linebreak" as const,
      valign: "middle" as const,
      lineColor: [229, 231, 235] as [number, number, number],
      lineWidth: 0.1,
      textColor: [17, 24, 39] as [number, number, number],
    },
    headStyles: {
      font: UNICODE_FONT,
      fontStyle: "bold" as const,
      fillColor: BRAND,
      textColor: 255,
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [252, 252, 253] as [number, number, number],
    },
    margin: { left: MARGIN, right: MARGIN },
  };
}

function drawHeader(doc: jsPDF, data: ReportsData) {
  const surveyLabel = data.surveyName ?? data.campaignName ?? "All Surveys";

  doc.setFillColor(...BRAND);
  doc.rect(0, 0, pageWidth(doc), 2.5, "F");

  let y = MARGIN + 2;
  doc.setFont(UNICODE_FONT, "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND_DARK);
  doc.text("AI AGENT - TECHCULTURE", MARGIN, y);

  y += 6;
  doc.setFontSize(18);
  doc.setTextColor(17, 24, 39);
  doc.text("Analytics Report", MARGIN, y);

  y += 7;
  doc.setFont(UNICODE_FONT, "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `${formatPeriod(data.dateRange.from, data.dateRange.to)} · ${surveyLabel}`,
    MARGIN,
    y
  );

  return y + 10;
}

function buildAnalyticsPdf(data: ReportsData, fontBase64: string): jsPDF {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
  }) as PdfDoc;
  registerUnicodeFont(doc, fontBase64);

  let y = drawHeader(doc, data);
  const w = (fractions: number[]) => colWidths(doc, fractions);

  y = drawSectionTitle(doc, y, "Key metrics");
  {
    const [c0, c1, c2] = w([50, 20, 30]);
    autoTable(doc, {
      ...tableStyles(),
      startY: y,
      head: [["Metric", "Value", "Change"]],
      body: data.kpis.map((k) => [k.label, String(k.value), formatChange(k.change)]),
      columnStyles: {
        0: { cellWidth: c0 },
        1: { cellWidth: c1, halign: "right" },
        2: { cellWidth: c2 },
      },
    });
  }
  y = (doc.lastAutoTable?.finalY ?? y) + 8;

  const totalCalls = data.calls?.total ?? 0;
  const surveyTotal =
    data.survey?.total ??
    (data.survey?.complete ?? 0) +
      (data.survey?.incomplete ?? 0) +
      (data.survey?.partially_complete ?? 0) +
      (data.survey?.processing ?? 0) +
      (data.survey?.missed ?? 0);

  y = ensureSpace(doc, y, 40);
  y = drawSectionTitle(doc, y, "Call outcomes");
  {
    const [c0, c1, c2] = w([45, 27.5, 27.5]);
    autoTable(doc, {
      ...tableStyles(),
      startY: y,
      head: [["Outcome", "Count", "Share"]],
      body: [
        [
          "Connected",
          (data.calls?.connected ?? 0).toLocaleString(),
          pct(data.calls?.connected ?? 0, totalCalls),
        ],
        [
          "Disconnected",
          (data.calls?.disconnected ?? 0).toLocaleString(),
          pct(data.calls?.disconnected ?? 0, totalCalls),
        ],
        [
          "Missed",
          (data.calls?.missed ?? 0).toLocaleString(),
          pct(data.calls?.missed ?? 0, totalCalls),
        ],
        ["Total", totalCalls.toLocaleString(), "100%"],
      ],
      columnStyles: {
        0: { cellWidth: c0 },
        1: { cellWidth: c1, halign: "right" },
        2: { cellWidth: c2, halign: "right" },
      },
    });
  }
  y = (doc.lastAutoTable?.finalY ?? y) + 8;

  y = ensureSpace(doc, y, 40);
  y = drawSectionTitle(doc, y, "Survey status");
  {
    const [c0, c1, c2] = w([45, 27.5, 27.5]);
    autoTable(doc, {
      ...tableStyles(),
      startY: y,
      head: [["Status", "Count", "Share"]],
      body: [
        [
          "Complete",
          (data.survey?.complete ?? 0).toLocaleString(),
          pct(data.survey?.complete ?? 0, surveyTotal),
        ],
        [
          "Partially complete",
          (data.survey?.partially_complete ?? 0).toLocaleString(),
          pct(data.survey?.partially_complete ?? 0, surveyTotal),
        ],
        [
          "Processing",
          (data.survey?.processing ?? 0).toLocaleString(),
          pct(data.survey?.processing ?? 0, surveyTotal),
        ],
        [
          "Incomplete",
          (data.survey?.incomplete ?? 0).toLocaleString(),
          pct(data.survey?.incomplete ?? 0, surveyTotal),
        ],
      ],
      columnStyles: {
        0: { cellWidth: c0 },
        1: { cellWidth: c1, halign: "right" },
        2: { cellWidth: c2, halign: "right" },
      },
    });
  }
  y = (doc.lastAutoTable?.finalY ?? y) + 4;

  doc.setFont(UNICODE_FONT, "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(`Progress: ${data.survey?.counting ?? "—"}`, MARGIN, y + 4);
  y += 10;

  y = ensureSpace(doc, y, 24);
  y = drawSectionTitle(doc, y, "Duration summary");
  {
    const [c0, c1, c2] = w([1, 1, 1]);
    autoTable(doc, {
      ...tableStyles(),
      startY: y,
      head: [["Average", "Median", "Sample size"]],
      body: [
        [
          data.duration?.averageLabel ?? "—",
          data.duration?.medianLabel ?? "—",
          (data.duration?.sampleSize ?? 0).toLocaleString(),
        ],
      ],
      columnStyles: {
        0: { cellWidth: c0 },
        1: { cellWidth: c1 },
        2: { cellWidth: c2, halign: "right" },
      },
    });
  }
  y = (doc.lastAutoTable?.finalY ?? y) + 8;

  const surveys = data.responsesBySurvey ?? [];
  if (surveys.length > 0) {
    y = ensureSpace(doc, y, 20);
    y = drawSectionTitle(doc, y, `By survey (${surveys.length})`);
    {
      const [c0, c1, c2, c3, c4, c5, c6] = w([34, 10, 12, 10, 12, 12, 10]);
      autoTable(doc, {
        ...tableStyles(),
        startY: y,
        showHead: "everyPage",
        head: [
          [
            "Survey",
            "Total",
            "Complete",
            "Partial",
            "Processing",
            "Incomplete",
            "Rate",
          ],
        ],
        body: surveys.map((row) => [
          row.name,
          row.total.toLocaleString(),
          row.complete.toLocaleString(),
          row.partially_complete.toLocaleString(),
          row.processing.toLocaleString(),
          row.incomplete.toLocaleString(),
          `${row.completionRate}%`,
        ]),
        columnStyles: {
          0: { cellWidth: c0 },
          1: { cellWidth: c1, halign: "right" },
          2: { cellWidth: c2, halign: "right" },
          3: { cellWidth: c3, halign: "right" },
          4: { cellWidth: c4, halign: "right" },
          5: { cellWidth: c5, halign: "right" },
          6: { cellWidth: c6, halign: "right" },
        },
      });
    }
    y = (doc.lastAutoTable?.finalY ?? y) + 8;
  }

  const trendRows = (data.callsOverTime ?? []).slice(-10);
  if (trendRows.length > 0) {
    y = ensureSpace(doc, y, 20);
    y = drawSectionTitle(doc, y, "Recent call activity");
    {
      const [c0, c1, c2, c3, c4] = w([28, 18, 18, 18, 18]);
      autoTable(doc, {
        ...tableStyles(),
        startY: y,
        head: [["Date", "Calls", "Connected", "Disconnected", "Missed"]],
        body: trendRows.map((point) => [
          point.label,
          String(point.calls ?? point.value ?? 0),
          String(point.connected ?? "—"),
          String(point.disconnected ?? "—"),
          String(point.missed ?? "—"),
        ]),
        columnStyles: {
          0: { cellWidth: c0 },
          1: { cellWidth: c1, halign: "right" },
          2: { cellWidth: c2, halign: "right" },
          3: { cellWidth: c3, halign: "right" },
          4: { cellWidth: c4, halign: "right" },
        },
      });
    }
    y = (doc.lastAutoTable?.finalY ?? y) + 8;
  }

  // Prefer detailed questions list when available (correct Hindi text)
  const detailQuestions = data.questions ?? [];
  const questionBars = data.questionBars ?? [];
  const questionRows =
    detailQuestions.length > 0
      ? detailQuestions.map((q, index) => ({
          index: index + 1,
          text: (q.question || "").trim() || `Question ${index + 1}`,
          answered: q.usersAnswered ?? q.answered ?? 0,
          skipped: q.usersSkipped ?? q.unanswered ?? 0,
          rate: Math.round(q.answerRate ?? 0),
        }))
      : questionBars.map((q, index) => {
          const answered = q.answered ?? 0;
          const unanswered = q.unanswered ?? 0;
          const total = answered + unanswered;
          const rate =
            q.answerRate ??
            (total ? Math.round((answered / total) * 1000) / 10 : 0);
          return {
            index: index + 1,
            text: (q.fullLabel || q.label || "").trim() || `Question ${index + 1}`,
            answered,
            skipped: unanswered,
            rate,
          };
        });

  if (questionRows.length > 0) {
    for (
      let offset = 0;
      offset < questionRows.length;
      offset += QUESTION_BATCH_SIZE
    ) {
      const batch = questionRows.slice(offset, offset + QUESTION_BATCH_SIZE);
      const batchEnd = offset + batch.length;
      const title =
        offset === 0
          ? `Question analytics (${questionRows.length})`
          : `Question analytics (${offset + 1}–${batchEnd} of ${questionRows.length})`;

      y = ensureSpace(doc, y, 20);
      y = drawSectionTitle(doc, y, title);
      {
        const [c0, c1, c2, c3, c4] = w([8, 58, 12, 12, 10]);
        autoTable(doc, {
          ...tableStyles(),
          startY: y,
          showHead: "everyPage",
          head: [["#", "Question", "Answered", "Skipped", "Rate"]],
          body: batch.map((q) => [
            String(q.index),
            q.text,
            String(q.answered),
            String(q.skipped),
            `${q.rate}%`,
          ]),
          columnStyles: {
            0: { cellWidth: c0, halign: "right" },
            1: { cellWidth: c1 },
            2: { cellWidth: c2, halign: "right" },
            3: { cellWidth: c3, halign: "right" },
            4: { cellWidth: c4, halign: "right" },
          },
          didParseCell: (hookData) => {
            // Keep Unicode font on every cell (Hindi questions)
            hookData.cell.styles.font = UNICODE_FONT;
          },
        });
      }
      y = (doc.lastAutoTable?.finalY ?? y) + 8;
    }
  }

  const generatedAt = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  y = ensureSpace(doc, y, 8);
  doc.setFont(UNICODE_FONT, "normal");
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(`Generated ${generatedAt}`, pageWidth(doc) / 2, y, {
    align: "center",
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i);
    doc.setFont(UNICODE_FONT, "normal");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Ai Agent - TechCulture · Page ${i} of ${totalPages}`,
      pageWidth(doc) / 2,
      pageHeight(doc) - 6,
      { align: "center" }
    );
  }

  return doc;
}

export async function exportReportsPdf(data: ReportsData) {
  await withGlobalLoader(
    async () => {
      const fontBase64 = await loadUnicodeFontBase64();
      const doc = buildAnalyticsPdf(data, fontBase64);
      doc.save(`crm-analytics-${data.dateRange.from}-${data.dateRange.to}.pdf`);
    },
    { label: "Exporting", hint: "Preparing your report" }
  );
}
