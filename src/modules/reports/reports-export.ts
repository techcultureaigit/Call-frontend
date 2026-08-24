/**
 * reports-export.ts
 * Export analytics to PDF/Excel — client-side from live analytics payload.
 */
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ReportsData } from "@/types/reports";
import { downloadCSV } from "@/lib/utils/csv";
import { withGlobalLoader } from "@/components/shared/api-loading.store";

const MARGIN = 14;

function addSectionTitle(doc: jsPDF, title: string, y: number) {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(17, 17, 17);
  doc.text(title, MARGIN, y);
  doc.setDrawColor(230, 230, 230);
  doc.line(MARGIN, y + 2, doc.internal.pageSize.getWidth() - MARGIN, y + 2);
  return y + 8;
}

function buildAnalyticsPdf(data: ReportsData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const surveyLabel = data.surveyName ?? data.campaignName ?? "All Surveys";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(17, 17, 17);
  doc.text("CRM Analytics Report", MARGIN, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(102, 102, 102);
  doc.text(
    `${data.dateRange.from} — ${data.dateRange.to} · ${surveyLabel}`,
    MARGIN,
    29
  );

  autoTable(doc, {
    startY: 36,
    head: [["Metric", "Value", "Change"]],
    body: data.kpis.map((k) => [
      k.label,
      k.value,
      `${k.change > 0 ? "+" : ""}${k.change}% ${k.changeLabel}`,
    ]),
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [248, 248, 248], textColor: [17, 17, 17] },
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: pageWidth - MARGIN * 2,
  });

  let y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? 80;
  y = addSectionTitle(doc, "Call Outcomes", y + 6);

  autoTable(doc, {
    startY: y,
    head: [["Outcome", "Count"]],
    body: [
      ["Connected", String(data.calls?.connected ?? 0)],
      ["Disconnected", String(data.calls?.disconnected ?? 0)],
      ["Missed", String(data.calls?.missed ?? 0)],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [248, 248, 248], textColor: [17, 17, 17] },
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: pageWidth - MARGIN * 2,
  });

  y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? y + 30;
  y = addSectionTitle(doc, "Survey Status", y + 6);

  autoTable(doc, {
    startY: y,
    head: [["Status", "Count"]],
    body: [
      ["Complete", String(data.survey?.complete ?? 0)],
      ["Incomplete", String(data.survey?.incomplete ?? 0)],
      ["Missed", String(data.survey?.missed ?? 0)],
      ["Counting", data.survey?.counting ?? "0/0"],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [248, 248, 248], textColor: [17, 17, 17] },
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: pageWidth - MARGIN * 2,
  });

  y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? y + 30;
  y = addSectionTitle(doc, "Duration", y + 6);

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: [
      ["Average", data.duration?.averageLabel ?? "—"],
      ["Median", data.duration?.medianLabel ?? "—"],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [248, 248, 248], textColor: [17, 17, 17] },
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: pageWidth - MARGIN * 2,
  });

  y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? y + 30;
  y = addSectionTitle(doc, "Answers by Question", y + 6);

  autoTable(doc, {
    startY: y,
    head: [["Question", "Answered", "Unanswered", "Rate"]],
    body: (data.questionBars ?? []).map((q) => [
      q.fullLabel || q.label,
      String(q.answered),
      String(q.unanswered),
      `${q.answerRate}%`,
    ]),
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
    headStyles: { fillColor: [248, 248, 248], textColor: [17, 17, 17] },
    columnStyles: { 0: { cellWidth: 90 } },
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: pageWidth - MARGIN * 2,
  });

  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(8);
  doc.setTextColor(153, 153, 153);
  doc.text(`Generated ${new Date().toLocaleString()}`, MARGIN, footerY);

  return doc;
}

export function reportsToExcel(data: ReportsData): string {
  const sections: string[] = [];
  const surveyLabel = data.surveyName ?? data.campaignName ?? "All Surveys";

  sections.push("CRM Analytics Report");
  sections.push(`Period,${data.dateRange.from} to ${data.dateRange.to}`);
  sections.push(`Survey,${surveyLabel}`);
  sections.push("");

  sections.push("KPIs");
  sections.push("Metric,Value,Change %");
  data.kpis.forEach((k) => {
    sections.push(`${k.label},${k.value},${k.change}`);
  });
  sections.push("");

  if (data.calls) {
    sections.push("Call Outcomes");
    sections.push("Outcome,Count");
    sections.push(`Connected,${data.calls.connected}`);
    sections.push(`Disconnected,${data.calls.disconnected}`);
    sections.push(`Missed,${data.calls.missed}`);
    sections.push("");
  }

  if (data.survey) {
    sections.push("Survey Status");
    sections.push("Status,Count");
    sections.push(`Complete,${data.survey.complete}`);
    sections.push(`Incomplete,${data.survey.incomplete}`);
    sections.push(`Missed,${data.survey.missed}`);
    sections.push(`Counting,${data.survey.counting}`);
    sections.push("");
  }

  if (data.duration) {
    sections.push("Duration");
    sections.push(
      `Average,${data.duration.averageLabel}`,
      `Median,${data.duration.medianLabel}`,
      `Sample,${data.duration.sampleSize}`
    );
    sections.push("");
  }

  sections.push("Calls Over Time");
  sections.push("Date,Calls,Connected,Disconnected,Missed");
  data.callsOverTime.forEach((d) => {
    sections.push(
      `${d.label},${d.calls ?? d.value},${d.connected ?? ""},${d.disconnected ?? ""},${d.missed ?? ""}`
    );
  });
  sections.push("");

  sections.push("Completion Trend");
  sections.push("Date,Success %");
  (data.successRateTrend ?? []).forEach((d) => {
    sections.push(`${d.label},${d.success ?? d.value}`);
  });
  sections.push("");

  sections.push("Answers by Question");
  sections.push("Question,Answered,Unanswered,Rate %");
  (data.questionBars ?? []).forEach((q) => {
    sections.push(
      `"${(q.fullLabel || q.label).replace(/"/g, '""')}",${q.answered},${q.unanswered},${q.answerRate}`
    );
  });
  sections.push("");

  sections.push("By Survey");
  sections.push("Survey,Total,Complete,Incomplete,Missed,Counting");
  (data.responsesBySurvey ?? []).forEach((d) => {
    sections.push(
      `"${d.name.replace(/"/g, '""')}",${d.total ?? d.value},${d.complete},${d.incomplete},${d.missed},${d.counting}`
    );
  });

  return sections.join("\n");
}

export async function exportReportsExcel(data: ReportsData) {
  await withGlobalLoader(
    async () => {
      await new Promise<void>((r) => setTimeout(r, 0));
      const csv = reportsToExcel(data);
      downloadCSV(
        csv,
        `crm-analytics-${data.dateRange.from}-${data.dateRange.to}.csv`
      );
    },
    { label: "Exporting", hint: "Preparing your file" }
  );
}

export async function exportReportsPdf(data: ReportsData) {
  await withGlobalLoader(
    async () => {
      await new Promise<void>((r) => setTimeout(r, 0));
      const doc = buildAnalyticsPdf(data);
      doc.save(
        `crm-analytics-${data.dateRange.from}-${data.dateRange.to}.pdf`
      );
    },
    { label: "Exporting", hint: "Preparing your file" }
  );
}
