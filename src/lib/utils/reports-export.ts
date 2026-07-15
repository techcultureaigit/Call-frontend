import type { ReportsData } from "@/types/reports";
import { downloadCSV } from "@/lib/utils/csv";

export function reportsToExcel(data: ReportsData): string {
  const sections: string[] = [];

  sections.push("CRM Analytics Report");
  sections.push(`Period,${data.dateRange.from} to ${data.dateRange.to}`);
  sections.push(
    `Campaign,${data.campaignName ?? "All Campaigns"}`
  );
  sections.push("");

  sections.push("KPIs");
  sections.push("Metric,Value,Change %");
  data.kpis.forEach((k) => {
    sections.push(`${k.label},${k.value},${k.change}`);
  });
  sections.push("");

  sections.push("Calls Over Time");
  sections.push("Date,Calls");
  data.callsOverTime.forEach((d) => {
    sections.push(`${d.label},${d.calls ?? d.value}`);
  });
  sections.push("");

  sections.push("Success Rate Trend");
  sections.push("Date,Success %");
  data.successRateTrend.forEach((d) => {
    sections.push(`${d.label},${d.success ?? d.value}`);
  });
  sections.push("");

  sections.push("Responses by Campaign");
  sections.push("Campaign,Responses");
  data.responsesByCampaign.forEach((d) => {
    sections.push(`${d.label},${d.responses ?? d.value}`);
  });
  sections.push("");

  sections.push("Sentiment Breakdown");
  sections.push("Sentiment,Percentage");
  data.sentimentBreakdown.forEach((d) => {
    sections.push(`${d.name},${d.value}%`);
  });

  return sections.join("\n");
}

export function exportReportsExcel(data: ReportsData) {
  const csv = reportsToExcel(data);
  downloadCSV(csv, `crm-report-${data.dateRange.from}-${data.dateRange.to}.csv`);
}

export function exportReportsPdf(data: ReportsData) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>CRM Analytics Report</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 40px; color: #111; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    .meta { color: #666; font-size: 13px; margin-bottom: 32px; }
    h2 { font-size: 16px; margin: 24px 0 12px; border-bottom: 1px solid #eee; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; background: #f8f8f8; }
    .kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .kpi { border: 1px solid #eee; border-radius: 8px; padding: 16px; }
    .kpi-label { font-size: 11px; color: #666; text-transform: uppercase; }
    .kpi-value { font-size: 22px; font-weight: 700; margin-top: 4px; }
    .kpi-change { font-size: 12px; color: #16a34a; margin-top: 4px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>CRM Analytics Report</h1>
  <p class="meta">${data.dateRange.from} — ${data.dateRange.to} · ${data.campaignName ?? "All Campaigns"}</p>

  <div class="kpis">
    ${data.kpis
      .map(
        (k) => `
      <div class="kpi">
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-value">${k.value}</div>
        <div class="kpi-change">${k.change > 0 ? "+" : ""}${k.change}% ${k.changeLabel}</div>
      </div>`
      )
      .join("")}
  </div>

  <h2>Calls Over Time</h2>
  <table>
    <tr><th>Date</th><th>Calls</th></tr>
    ${data.callsOverTime.map((d) => `<tr><td>${d.label}</td><td>${d.calls ?? d.value}</td></tr>`).join("")}
  </table>

  <h2>Success Rate Trend</h2>
  <table>
    <tr><th>Date</th><th>Success Rate</th></tr>
    ${data.successRateTrend.map((d) => `<tr><td>${d.label}</td><td>${d.success ?? d.value}%</td></tr>`).join("")}
  </table>

  <h2>Responses by Campaign</h2>
  <table>
    <tr><th>Campaign</th><th>Responses</th></tr>
    ${data.responsesByCampaign.map((d) => `<tr><td>${d.label}</td><td>${d.responses ?? d.value}</td></tr>`).join("")}
  </table>

  <h2>Sentiment Breakdown</h2>
  <table>
    <tr><th>Sentiment</th><th>Share</th></tr>
    ${data.sentimentBreakdown.map((d) => `<tr><td>${d.name}</td><td>${d.value}%</td></tr>`).join("")}
  </table>

  <p style="margin-top:40px;font-size:11px;color:#999;">Generated ${new Date().toLocaleString()}</p>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}
