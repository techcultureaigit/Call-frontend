import type { CampaignStatus, CampaignType } from "@/types/campaign";

export const CAMPAIGN_STATUS_OPTIONS: {
  label: string;
  value: CampaignStatus;
}[] = [
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Completed", value: "completed" },
  { label: "Stopped", value: "stopped" },
];

export const CAMPAIGN_TYPE_OPTIONS: {
  label: string;
  value: CampaignType;
}[] = [
  { label: "Outbound Sales", value: "outbound_sales" },
  { label: "Customer Survey", value: "customer_survey" },
  { label: "Follow-up", value: "follow_up" },
  { label: "Support", value: "support" },
];

export const TIMEZONE_OPTIONS = [
  { label: "UTC", value: "UTC" },
  { label: "Eastern (US)", value: "America/New_York" },
  { label: "Central (US)", value: "America/Chicago" },
  { label: "Pacific (US)", value: "America/Los_Angeles" },
  { label: "London", value: "Europe/London" },
  { label: "Paris", value: "Europe/Paris" },
  { label: "Singapore", value: "Asia/Singapore" },
  { label: "Tokyo", value: "Asia/Tokyo" },
];

export const DAYS_OF_WEEK = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export const WIZARD_STEPS = [
  { id: 1, label: "Name", description: "Campaign details" },
  { id: 2, label: "Customers", description: "Select audience" },
  { id: 3, label: "Survey", description: "Attach survey" },
  { id: 4, label: "Schedule", description: "Set timing" },
  { id: 5, label: "Review", description: "Confirm & launch" },
] as const;

export const DEFAULT_SCHEDULE = {
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  timeZone: "America/New_York",
  callWindowStart: "09:00",
  callWindowEnd: "17:00",
  daysOfWeek: [1, 2, 3, 4, 5] as number[],
};
