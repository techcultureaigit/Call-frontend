import type { CampaignAnalyticsData } from "@/types/campaign-analytics";
import { downloadCSV } from "@/lib/utils/csv";

export function analyticsToExcel(data: CampaignAnalyticsData): string {
  const sections: string[] = [];

  sections.push("Campaign Analytics Report");
  sections.push(`Period,${data.dateRange.from} to ${data.dateRange.to}`);
  sections.push(`Compare Period,${data.compareEnabled ? "Yes" : "No"}`);
  sections.push("");

  sections.push("KPIs");
  sections.push("Metric,Value,Change %");
  data.kpis.forEach((k) => {
    sections.push(`${k.label},${k.value},${k.change}`);
  });
  sections.push("");

  sections.push("AI Analytics");
  sections.push(`Conversation Score,${data.aiAnalytics.conversationScore}`);
  sections.push(`Avg Confidence,${data.aiAnalytics.avgConfidence}%`);
  sections.push(`Response Accuracy,${data.aiAnalytics.responseAccuracy}%`);
  sections.push("");

  sections.push("Campaign Performance");
  sections.push(
    "Campaign,Created By,Customers,Calls,Completed,Failed,Response %,Success %,Status"
  );
  data.performanceTable.forEach((r) => {
    sections.push(
      `${r.name},${r.createdByName},${r.customers},${r.calls},${r.completed},${r.failed},${r.responseRate},${r.successRate},${r.status}`
    );
  });

  return sections.join("\n");
}

export function exportAnalyticsExcel(data: CampaignAnalyticsData) {
  const csv = analyticsToExcel(data);
  downloadCSV(
    csv,
    `campaign-analytics-${data.dateRange.from}-${data.dateRange.to}.csv`
  );
}

export function exportAnalyticsPdf(data: CampaignAnalyticsData) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Campaign Analytics Report</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 40px; color: #111; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    .meta { color: #666; font-size: 14px; margin-bottom: 32px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0 32px; }
    th, td { border: 1px solid #e5e5e5; padding: 8px 12px; text-align: left; font-size: 13px; }
    th { background: #f5f5f5; font-weight: 600; }
    h2 { font-size: 16px; margin-top: 24px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
    .kpi { border: 1px solid #e5e5e5; border-radius: 8px; padding: 12px; }
    .kpi-label { font-size: 11px; color: #666; text-transform: uppercase; }
    .kpi-value { font-size: 20px; font-weight: 600; margin-top: 4px; }
  </style>
</head>
<body>
  <h1>Campaign Analytics Report</h1>
  <p class="meta">${data.dateRange.from} to ${data.dateRange.to}${data.compareEnabled ? " · Compare period enabled" : ""}</p>

  <h2>Key Metrics</h2>
  <div class="kpi-grid">
    ${data.kpis.map((k) => `<div class="kpi"><div class="kpi-label">${k.label}</div><div class="kpi-value">${k.value}</div></div>`).join("")}
  </div>

  <h2>AI Analytics</h2>
  <table>
    <tr><th>Metric</th><th>Value</th></tr>
    <tr><td>Conversation Score</td><td>${data.aiAnalytics.conversationScore}/100</td></tr>
    <tr><td>Avg Confidence</td><td>${data.aiAnalytics.avgConfidence}%</td></tr>
    <tr><td>Response Accuracy</td><td>${data.aiAnalytics.responseAccuracy}%</td></tr>
    <tr><td>Survey Completion</td><td>${data.aiAnalytics.avgSurveyCompletion}%</td></tr>
  </table>

  <h2>Campaign Performance</h2>
  <table>
    <tr><th>Campaign</th><th>Calls</th><th>Success %</th><th>Response %</th><th>Status</th></tr>
    ${data.performanceTable.map((r) => `<tr><td>${r.name}</td><td>${r.calls}</td><td>${r.successRate}%</td><td>${r.responseRate}%</td><td>${r.status}</td></tr>`).join("")}
  </table>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.print();
  }
}
