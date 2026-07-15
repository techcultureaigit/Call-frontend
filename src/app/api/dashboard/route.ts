import { NextResponse } from "next/server";
import { getRecentNotifications } from "@/lib/data/notifications-repository";
import type { ApiResponse } from "@/types/api";
import type { DashboardData } from "@/types/dashboard";

const dashboardData: DashboardData = {
  kpis: [
    {
      id: "total-calls",
      label: "Total Calls",
      value: "12,847",
      change: 12.4,
      changeLabel: "vs last month",
      trend: "up",
      icon: "phone",
    },
    {
      id: "success-rate",
      label: "Success Rate",
      value: "78.6%",
      change: 3.2,
      changeLabel: "vs last month",
      trend: "up",
      icon: "check-circle",
    },
    {
      id: "active-campaigns",
      label: "Active Campaigns",
      value: "24",
      change: -2,
      changeLabel: "vs last month",
      trend: "down",
      icon: "megaphone",
    },
    {
      id: "total-customers",
      label: "Total Customers",
      value: "3,291",
      change: 8.1,
      changeLabel: "vs last month",
      trend: "up",
      icon: "users",
    },
    {
      id: "survey-responses",
      label: "Survey Responses",
      value: "1,956",
      change: 15.7,
      changeLabel: "vs last month",
      trend: "up",
      icon: "clipboard",
    },
    {
      id: "avg-call-duration",
      label: "Avg Call Duration",
      value: "4m 32s",
      change: 0,
      changeLabel: "vs last month",
      trend: "neutral",
      icon: "clock",
    },
  ],
  callSuccessTrend: [
    { label: "Mon", value: 72, success: 72, failed: 28 },
    { label: "Tue", value: 75, success: 75, failed: 25 },
    { label: "Wed", value: 68, success: 68, failed: 32 },
    { label: "Thu", value: 81, success: 81, failed: 19 },
    { label: "Fri", value: 79, success: 79, failed: 21 },
    { label: "Sat", value: 65, success: 65, failed: 35 },
    { label: "Sun", value: 58, success: 58, failed: 42 },
  ],
  campaignDistribution: [
    { name: "Outbound Sales", value: 35, fill: "var(--chart-1)" },
    { name: "Customer Surveys", value: 28, fill: "var(--chart-2)" },
    { name: "Follow-ups", value: 22, fill: "var(--chart-3)" },
    { name: "Support Calls", value: 15, fill: "var(--chart-4)" },
  ],
  dailyCalls: [
    { label: "6 AM", value: 42, calls: 42 },
    { label: "8 AM", value: 128, calls: 128 },
    { label: "10 AM", value: 245, calls: 245 },
    { label: "12 PM", value: 198, calls: 198 },
    { label: "2 PM", value: 312, calls: 312 },
    { label: "4 PM", value: 276, calls: 276 },
    { label: "6 PM", value: 154, calls: 154 },
    { label: "8 PM", value: 68, calls: 68 },
  ],
  recentActivities: [
    {
      id: "act-1",
      type: "call",
      title: "Outbound call completed",
      description: "Successfully reached John Mitchell for Q2 survey campaign.",
      performedBy: "Sarah Chen",
      occurredAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      id: "act-2",
      type: "deal_update",
      title: "Campaign status updated",
      description: "Enterprise NPS Survey moved to active status.",
      performedBy: "Alex Rivera",
      occurredAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: "act-3",
      type: "email",
      title: "Survey invitation sent",
      description: "Bulk email sent to 240 customers in Segment B.",
      performedBy: "System",
      occurredAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: "act-4",
      type: "note",
      title: "Customer note added",
      description: "Follow-up scheduled for Acme Corp renewal discussion.",
      performedBy: "Mike Johnson",
      occurredAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
    {
      id: "act-5",
      type: "status_change",
      title: "Response flagged for review",
      description: "Negative feedback flagged in Healthcare CX campaign.",
      performedBy: "System",
      occurredAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    },
  ],
  recentNotifications: [],
  topCampaigns: [
    {
      id: "camp-1",
      name: "Enterprise NPS Survey",
      status: "active",
      calls: 1842,
      successRate: 82,
      responses: 1240,
    },
    {
      id: "camp-2",
      name: "Q2 Outbound Sales",
      status: "active",
      calls: 2156,
      successRate: 76,
      responses: 980,
    },
    {
      id: "camp-3",
      name: "Customer Renewal Follow-up",
      status: "paused",
      calls: 890,
      successRate: 71,
      responses: 412,
    },
    {
      id: "camp-4",
      name: "Product Feedback Loop",
      status: "active",
      calls: 654,
      successRate: 88,
      responses: 578,
    },
    {
      id: "camp-5",
      name: "Churn Prevention",
      status: "completed",
      calls: 432,
      successRate: 69,
      responses: 298,
    },
  ],
  recentCustomers: [
    {
      id: "cust-1",
      name: "John Mitchell",
      email: "john.mitchell@acmecorp.com",
      company: "Acme Corp",
      status: "active",
      lastContactAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: "cust-2",
      name: "Emily Watson",
      email: "emily@techflow.io",
      company: "TechFlow",
      status: "active",
      lastContactAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    },
    {
      id: "cust-3",
      name: "Raj Patel",
      email: "raj.patel@globalfin.com",
      company: "GlobalFin",
      status: "lead",
      lastContactAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
    {
      id: "cust-4",
      name: "Lisa Thompson",
      email: "lisa.t@healthplus.org",
      company: "HealthPlus",
      status: "active",
      lastContactAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    },
    {
      id: "cust-5",
      name: "David Kim",
      email: "david.kim@retailmax.com",
      company: "RetailMax",
      status: "inactive",
      lastContactAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    },
  ],
};

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const recentNotifications = getRecentNotifications(4).map((n) => ({
    id: n.id,
    title: n.title,
    description: n.description,
    type: n.type,
    read: n.read,
    createdAt: n.createdAt,
  }));

  const response: ApiResponse<DashboardData> = {
    success: true,
    data: { ...dashboardData, recentNotifications },
  };

  return NextResponse.json(response);
}
