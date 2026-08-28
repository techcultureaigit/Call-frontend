/**
 * reports-export.ts
 * Export analytics to a formatted PDF report (client-side).
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

type PdfDoc = jsPDF & { lastAutoTable?: { finalY: number } };

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

function drawSectionTitle(doc: jsPDF, y: number, title: string) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND_DARK);
  doc.text(title.toUpperCase(), MARGIN, y);
  return y + 5;
}

function tableStyles() {
  return {
    theme: "grid" as const,
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      overflow: "linebreak" as const,
      lineColor: [229, 231, 235] as [number, number, number],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: BRAND,
      textColor: 255,
      fontStyle: "bold" as const,
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: [252, 252, 253] as [number, number, number] },
    margin: { left: MARGIN, right: MARGIN },
  };
}

function drawHeader(doc: jsPDF, data: ReportsData) {
  const surveyLabel = data.surveyName ?? data.campaignName ?? "All Surveys";

  doc.setFillColor(...BRAND);
  doc.rect(0, 0, pageWidth(doc), 2.5, "F");

  let y = MARGIN + 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND_DARK);
  doc.text("AI AGENT - TECHCULTURE", MARGIN, y);

  y += 6;
  doc.setFontSize(18);
  doc.setTextColor(17, 24, 39);
  doc.text("Analytics Report", MARGIN, y);

  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `${formatPeriod(data.dateRange.from, data.dateRange.to)} · ${surveyLabel}`,
    MARGIN,
    y
  );

  return y + 10;
}

function buildAnalyticsPdf(data: ReportsData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" }) as PdfDoc;
  let y = drawHeader(doc, data);

  y = drawSectionTitle(doc, y, "Key metrics");
  autoTable(doc, {
    ...tableStyles(),
    startY: y,
    head: [["Metric", "Value", "Change"]],
    body: data.kpis.map((k) => [k.label, k.value, formatChange(k.change)]),
    columnStyles: {
      0: { cellWidth: 75 },
      1: { cellWidth: 35, halign: "right" },
      2: { cellWidth: 55 },
    },
  });
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
  autoTable(doc, {
    ...tableStyles(),
    startY: y,
    head: [["Outcome", "Count", "Share"]],
    body: [
      ["Connected", (data.calls?.connected ?? 0).toLocaleString(), pct(data.calls?.connected ?? 0, totalCalls)],
      ["Disconnected", (data.calls?.disconnected ?? 0).toLocaleString(), pct(data.calls?.disconnected ?? 0, totalCalls)],
      ["Missed", (data.calls?.missed ?? 0).toLocaleString(), pct(data.calls?.missed ?? 0, totalCalls)],
      ["Total", totalCalls.toLocaleString(), "100%"],
    ],
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 35, halign: "right" },
      2: { cellWidth: 35, halign: "right" },
    },
  });
  y = (doc.lastAutoTable?.finalY ?? y) + 8;

  y = ensureSpace(doc, y, 40);
  y = drawSectionTitle(doc, y, "Survey status");
  autoTable(doc, {
    ...tableStyles(),
    startY: y,
    head: [["Status", "Count", "Share"]],
    body: [
      ["Complete", (data.survey?.complete ?? 0).toLocaleString(), pct(data.survey?.complete ?? 0, surveyTotal)],
      ["Partially complete", (data.survey?.partially_complete ?? 0).toLocaleString(), pct(data.survey?.partially_complete ?? 0, surveyTotal)],
      ["Processing", (data.survey?.processing ?? 0).toLocaleString(), pct(data.survey?.processing ?? 0, surveyTotal)],
      ["Incomplete", (data.survey?.incomplete ?? 0).toLocaleString(), pct(data.survey?.incomplete ?? 0, surveyTotal)],
    ],
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 35, halign: "right" },
      2: { cellWidth: 35, halign: "right" },
    },
  });
  y = (doc.lastAutoTable?.finalY ?? y) + 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(`Progress: ${data.survey?.counting ?? "—"}`, MARGIN, y + 4);
  y += 10;

  y = ensureSpace(doc, y, 24);
  y = drawSectionTitle(doc, y, "Duration summary");
  autoTable(doc, {
    ...tableStyles(),
    startY: y,
    head: [["Average", "Median", "Sample size"]],
    body: [[
      data.duration?.averageLabel ?? "—",
      data.duration?.medianLabel ?? "—",
      (data.duration?.sampleSize ?? 0).toLocaleString(),
    ]],
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 55 },
      2: { cellWidth: 55, halign: "right" },
    },
  });
  y = (doc.lastAutoTable?.finalY ?? y) + 8;

  const surveys = data.responsesBySurvey ?? [];
  if (surveys.length > 0) {
    y = ensureSpace(doc, y, 20);
    y = drawSectionTitle(doc, y, `By survey (${surveys.length})`);
    autoTable(doc, {
      ...tableStyles(),
      startY: y,
      showHead: "everyPage",
      head: [["Survey", "Total", "Complete", "Partial", "Processing", "Incomplete", "Rate"]],
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
        0: { cellWidth: 52 },
        1: { cellWidth: 16, halign: "right" },
        2: { cellWidth: 18, halign: "right" },
        3: { cellWidth: 16, halign: "right" },
        4: { cellWidth: 20, halign: "right" },
        5: { cellWidth: 20, halign: "right" },
        6: { cellWidth: 16, halign: "right" },
      },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 8;
  }

  const trendRows = (data.callsOverTime ?? []).slice(-10);
  if (trendRows.length > 0) {
    y = ensureSpace(doc, y, 20);
    y = drawSectionTitle(doc, y, "Recent call activity");
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
        0: { cellWidth: 45 },
        1: { cellWidth: 22, halign: "right" },
        2: { cellWidth: 28, halign: "right" },
        3: { cellWidth: 32, halign: "right" },
        4: { cellWidth: 22, halign: "right" },
      },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 8;
  }

  const questions = data.questionBars ?? [];
  if (questions.length > 0) {
    for (let offset = 0; offset < questions.length; offset += QUESTION_BATCH_SIZE) {
      const batch = questions.slice(offset, offset + QUESTION_BATCH_SIZE);
      const batchEnd = offset + batch.length;
      const title =
        offset === 0
          ? `Question analytics (${questions.length})`
          : `Question analytics (${offset + 1}–${batchEnd} of ${questions.length})`;

      y = ensureSpace(doc, y, 20);
      y = drawSectionTitle(doc, y, title);
      autoTable(doc, {
        ...tableStyles(),
        startY: y,
        showHead: "everyPage",
        head: [["#", "Question", "Answered", "Skipped", "Rate"]],
        body: batch.map((q, index) => {
          const label = q.fullLabel || q.label || `Question ${offset + index + 1}`;
          const answered = q.answered ?? 0;
          const unanswered = q.unanswered ?? 0;
          const total = answered + unanswered;
          const rate =
            q.answerRate ?? (total ? Math.round((answered / total) * 1000) / 10 : 0);
          return [
            String(offset + index + 1),
            label,
            String(answered),
            String(unanswered),
            `${rate}%`,
          ];
        }),
        columnStyles: {
          0: { cellWidth: 10, halign: "right" },
          1: { cellWidth: 95 },
          2: { cellWidth: 20, halign: "right" },
          3: { cellWidth: 20, halign: "right" },
          4: { cellWidth: 16, halign: "right" },
        },
      });
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
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(`Generated ${generatedAt}`, pageWidth(doc) / 2, y, { align: "center" });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
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
      const doc = buildAnalyticsPdf(data);
      doc.save(`crm-analytics-${data.dateRange.from}-${data.dateRange.to}.pdf`);
    },
    { label: "Exporting", hint: "Preparing your report" }
  );
}
