export type TelephonyTab = "buy" | "sip";

export interface PurchasedNumber {
  id: string;
  label: string;
  country: string;
  countryCode: string;
  number: string;
  inbound: boolean;
  outbound: boolean;
  createdAt: string;
}

export interface SipTrunk {
  id: string;
  trunkName: string;
  sipIpAddress: string;
  countryCode: string;
  phoneNumber: string;
  username: string;
  inbound: boolean;
  outbound: boolean;
  createdAt: string;
}

export interface BuyNumberFormValues {
  label: string;
  country: string;
  number: string;
  inbound: boolean;
  outbound: boolean;
}

export interface SipTrunkFormValues {
  trunkName: string;
  sipIpAddress: string;
  countryCode: string;
  phoneNumber: string;
  username: string;
  password: string;
  inbound: boolean;
  outbound: boolean;
}
