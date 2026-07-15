import type { ActivityType } from "./activity";
import type { ID } from "./common";
import type { NotificationType } from "./notification";

export type TrendDirection = "up" | "down" | "neutral";

export interface DashboardKpi {
  id: string;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  trend: TrendDirection;
  icon: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  [key: string]: string | number;
}

export interface CampaignDistribution {
  name: string;
  value: number;
  fill: string;
}

export interface DashboardActivity {
  id: ID;
  type: ActivityType;
  title: string;
  description: string;
  performedBy: string;
  occurredAt: string;
}

export interface DashboardNotification {
  id: ID;
  title: string;
  description: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface TopCampaign {
  id: ID;
  name: string;
  status: "active" | "paused" | "completed" | "draft";
  calls: number;
  successRate: number;
  responses: number;
}

export interface RecentCustomer {
  id: ID;
  name: string;
  email: string;
  company?: string;
  status: "active" | "inactive" | "lead";
  lastContactAt: string;
  avatarUrl?: string;
}

export interface DashboardData {
  kpis: DashboardKpi[];
  callSuccessTrend: ChartDataPoint[];
  campaignDistribution: CampaignDistribution[];
  dailyCalls: ChartDataPoint[];
  recentActivities: DashboardActivity[];
  recentNotifications: DashboardNotification[];
  topCampaigns: TopCampaign[];
  recentCustomers: RecentCustomer[];
}
