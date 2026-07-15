import type {
  CustomerSource,
  CustomerStatus,
  CustomerTier,
} from "@/types/customer";

export const CUSTOMER_STATUS_OPTIONS: {
  label: string;
  value: CustomerStatus;
}[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Lead", value: "lead" },
  { label: "Prospect", value: "prospect" },
  { label: "Churned", value: "churned" },
];

export const CUSTOMER_TIER_OPTIONS: {
  label: string;
  value: CustomerTier;
}[] = [
  { label: "Enterprise", value: "enterprise" },
  { label: "Mid Market", value: "mid_market" },
  { label: "SMB", value: "smb" },
  { label: "Startup", value: "startup" },
];

export const CUSTOMER_SOURCE_OPTIONS: {
  label: string;
  value: CustomerSource;
}[] = [
  { label: "Website", value: "website" },
  { label: "Referral", value: "referral" },
  { label: "Campaign", value: "campaign" },
  { label: "Import", value: "import" },
  { label: "Manual", value: "manual" },
];

export const CUSTOMER_OWNERS = [
  { id: "usr_004", name: "Emily Watson" },
  { id: "usr_013", name: "James Wilson" },
  { id: "usr_003", name: "Mike Johnson" },
  { id: "usr_007", name: "Raj Patel" },
  { id: "usr_012", name: "Amanda Garcia" },
];
