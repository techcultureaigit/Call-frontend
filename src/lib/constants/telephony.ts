export const TELEPHONY_TABS = [
  { id: "buy" as const, label: "Buy Number" },
  { id: "sip" as const, label: "Add SIP Number" },
];

export const TELEPHONY_COUNTRIES = [
  { label: "United States (US)", value: "US" },
  { label: "India (IN)", value: "IN" },
  { label: "United Kingdom (GB)", value: "GB" },
  { label: "Canada (CA)", value: "CA" },
  { label: "Australia (AU)", value: "AU" },
];

export const AVAILABLE_NUMBERS: Record<
  string,
  { label: string; value: string }[]
> = {
  US: [
    { label: "+1 (415) 555-0142", value: "+14155550142" },
    { label: "+1 (212) 555-0198", value: "+12125550198" },
    { label: "+1 (650) 555-0173", value: "+16505550173" },
  ],
  IN: [
    { label: "+91 98765 43210", value: "+919876543210" },
    { label: "+91 91234 56789", value: "+919123456789" },
    { label: "+91 99887 76655", value: "+919988776655" },
  ],
  GB: [
    { label: "+44 20 7946 0958", value: "+442079460958" },
    { label: "+44 161 496 0123", value: "+441614960123" },
  ],
  CA: [
    { label: "+1 (416) 555-0187", value: "+14165550187" },
    { label: "+1 (604) 555-0164", value: "+16045550164" },
  ],
  AU: [
    { label: "+61 2 9876 5432", value: "+61298765432" },
    { label: "+61 3 8765 4321", value: "+61387654321" },
  ],
};

export const SIP_COUNTRY_CODES = [
  { label: "India (IN)", value: "IN" },
  { label: "United States (US)", value: "US" },
  { label: "United Kingdom (GB)", value: "GB" },
  { label: "Canada (CA)", value: "CA" },
  { label: "Australia (AU)", value: "AU" },
  { label: "Germany (DE)", value: "DE" },
  { label: "Singapore (SG)", value: "SG" },
];
