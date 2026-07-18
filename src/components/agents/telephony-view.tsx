"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { usePageMeta } from "@/hooks";
import {
  AVAILABLE_NUMBERS,
  SIP_COUNTRY_CODES,
  TELEPHONY_COUNTRIES,
  TELEPHONY_TABS,
} from "@/lib/constants/telephony";
import { cn } from "@/lib/utils";
import type {
  BuyNumberFormValues,
  PurchasedNumber,
  SipTrunk,
  SipTrunkFormValues,
  TelephonyTab,
} from "@/types/telephony";
import { TelephonySidebarPanel } from "./telephony-sidebar-panel";

const INITIAL_BUY: BuyNumberFormValues = {
  label: "",
  country: "",
  number: "",
  inbound: false,
  outbound: false,
};

const INITIAL_SIP: SipTrunkFormValues = {
  trunkName: "",
  sipIpAddress: "",
  countryCode: "IN",
  phoneNumber: "",
  username: "",
  password: "",
  inbound: true,
  outbound: true,
};

export function TelephonyView() {
  const [activeTab, setActiveTab] = useState<TelephonyTab>("buy");
  const [buyForm, setBuyForm] = useState<BuyNumberFormValues>(INITIAL_BUY);
  const [sipForm, setSipForm] = useState<SipTrunkFormValues>(INITIAL_SIP);
  const [purchasedNumbers, setPurchasedNumbers] = useState<PurchasedNumber[]>(
    []
  );
  const [sipTrunks, setSipTrunks] = useState<SipTrunk[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Telephony",
    breadcrumbs: [
      { label: "Agents", href: "/agents" },
      { label: "Telephony" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  const numberOptions = useMemo(() => {
    if (!buyForm.country) return [];
    return AVAILABLE_NUMBERS[buyForm.country] ?? [];
  }, [buyForm.country]);

  const handleCountryChange = (country: string) => {
    const numbers = AVAILABLE_NUMBERS[country] ?? [];
    setBuyForm({
      ...buyForm,
      country,
      number: numbers[0]?.value ?? "",
    });
  };

  const handleBuyNumber = () => {
    if (!buyForm.label.trim()) {
      toast.error("Number label is required");
      return;
    }
    if (!buyForm.country) {
      toast.error("Please select a country");
      return;
    }
    if (!buyForm.number) {
      toast.error("Please select a number");
      return;
    }
    if (!buyForm.inbound && !buyForm.outbound) {
      toast.error("Select at least one call type");
      return;
    }

    setIsSubmitting(true);
    const countryLabel =
      TELEPHONY_COUNTRIES.find((c) => c.value === buyForm.country)?.label ??
      buyForm.country;
    const numberLabel =
      numberOptions.find((n) => n.value === buyForm.number)?.label ??
      buyForm.number;

    const purchased: PurchasedNumber = {
      id: crypto.randomUUID?.() ?? `num-${Date.now()}`,
      label: buyForm.label.trim(),
      country: countryLabel,
      countryCode: buyForm.country,
      number: numberLabel,
      inbound: buyForm.inbound,
      outbound: buyForm.outbound,
      createdAt: new Date().toISOString(),
    };

    setPurchasedNumbers((prev) => [purchased, ...prev]);
    setBuyForm(INITIAL_BUY);
    setIsSubmitting(false);
    toast.success(`Number "${purchased.label}" purchased successfully`);
  };

  const handleIntegrateSip = () => {
    if (!sipForm.trunkName.trim()) {
      toast.error("SIP trunk name is required");
      return;
    }
    if (!sipForm.sipIpAddress.trim()) {
      toast.error("SIP IP address is required");
      return;
    }
    if (!sipForm.phoneNumber.trim()) {
      toast.error("Phone number is required");
      return;
    }
    if (!sipForm.username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (!sipForm.password.trim()) {
      toast.error("Password is required");
      return;
    }
    if (!sipForm.inbound && !sipForm.outbound) {
      toast.error("Select at least one call type");
      return;
    }

    setIsSubmitting(true);
    const trunk: SipTrunk = {
      id: crypto.randomUUID?.() ?? `sip-${Date.now()}`,
      trunkName: sipForm.trunkName.trim(),
      sipIpAddress: sipForm.sipIpAddress.trim(),
      countryCode: sipForm.countryCode,
      phoneNumber: sipForm.phoneNumber.trim(),
      username: sipForm.username.trim(),
      inbound: sipForm.inbound,
      outbound: sipForm.outbound,
      createdAt: new Date().toISOString(),
    };

    setSipTrunks((prev) => [trunk, ...prev]);
    setSipForm(INITIAL_SIP);
    setIsSubmitting(false);
    toast.success(`SIP trunk "${trunk.trunkName}" integrated successfully`);
  };

  return (
    <div className="bg-linear-to-b from-brand/5 to-transparent">
      <PageContainer size="full">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Phone Number Management
            </h1>
            <button
              type="button"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card/80 text-muted-foreground shadow-sm transition-colors hover:bg-card"
              aria-label="Help"
            >
              <HelpCircle className="size-4" />
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-card">
                <div className="flex border-b border-border/40">
                  {TELEPHONY_TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "relative flex-1 px-4 py-3.5 text-sm font-medium transition-colors sm:px-6",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {tab.label}
                        {isActive && (
                          <motion.span
                            layoutId="telephony-tab-indicator"
                            className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="p-5 sm:p-6">
                  {activeTab === "buy" ? (
                    <BuyNumberForm
                      values={buyForm}
                      numberOptions={numberOptions}
                      onCountryChange={handleCountryChange}
                      onChange={setBuyForm}
                      onSubmit={handleBuyNumber}
                      isSubmitting={isSubmitting}
                    />
                  ) : (
                    <SipTrunkForm
                      values={sipForm}
                      onChange={setSipForm}
                      onSubmit={handleIntegrateSip}
                      isSubmitting={isSubmitting}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <TelephonySidebarPanel
                activeTab={activeTab}
                purchasedNumbers={purchasedNumbers}
                sipTrunks={sipTrunks}
                onDeletePurchased={(id) => {
                  setPurchasedNumbers((prev) => prev.filter((n) => n.id !== id));
                  toast.success("Number removed");
                }}
                onDeleteSip={(id) => {
                  setSipTrunks((prev) => prev.filter((n) => n.id !== id));
                  toast.success("SIP trunk removed");
                }}
              />
            </div>
          </div>
        </motion.div>
      </PageContainer>
    </div>
  );
}

function BuyNumberForm({
  values,
  numberOptions,
  onCountryChange,
  onChange,
  onSubmit,
  isSubmitting,
}: {
  values: BuyNumberFormValues;
  numberOptions: { label: string; value: string }[];
  onCountryChange: (country: string) => void;
  onChange: (values: BuyNumberFormValues) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <h3 className="text-sm font-semibold text-foreground dark:text-foreground">
          Buy new number
        </h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="number-label">Number Label</Label>
        <Input
          id="number-label"
          value={values.label}
          onChange={(e) => onChange({ ...values, label: e.target.value })}
          placeholder="e.g. Marketing Number, Support Line"
          className="h-10 rounded-xl"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="select-country">Select Country</Label>
          <Select
            id="select-country"
            value={values.country}
            onChange={(e) => onCountryChange(e.target.value)}
            options={TELEPHONY_COUNTRIES}
            placeholder="Select country"
            className="h-10 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="select-number">Select Number</Label>
          <Select
            id="select-number"
            value={values.number}
            onChange={(e) => onChange({ ...values, number: e.target.value })}
            options={numberOptions}
            placeholder={
              values.country ? "Select number" : "Select country first"
            }
            disabled={!values.country}
            className="h-10 rounded-xl"
          />
        </div>
      </div>

      <CallTypeCheckboxes
        inbound={values.inbound}
        outbound={values.outbound}
        onInboundChange={(inbound) => onChange({ ...values, inbound })}
        onOutboundChange={(outbound) => onChange({ ...values, outbound })}
      />

      <div className="flex justify-end border-t border-border/40 pt-5">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl px-6"
        >
          Buy Number
        </Button>
      </div>
    </form>
  );
}

function SipTrunkForm({
  values,
  onChange,
  onSubmit,
  isSubmitting,
}: {
  values: SipTrunkFormValues;
  onChange: (values: SipTrunkFormValues) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground dark:text-foreground">
          Add New SIP Trunk
        </h3>
        <p className="text-xs text-muted-foreground">
          Configure a new SIP trunk connection.
        </p>
      </div>

      <div className="space-y-2">
        <Label>
          Call Type<span className="text-red-500">*</span>
        </Label>
        <CallTypeCheckboxes
          inbound={values.inbound}
          outbound={values.outbound}
          onInboundChange={(inbound) => onChange({ ...values, inbound })}
          onOutboundChange={(outbound) => onChange({ ...values, outbound })}
          inboundLabel="Inbound calls"
          outboundLabel="Outbound calls"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="trunk-name">
            SIP Trunk Name<span className="text-red-500">*</span>
          </Label>
          <Input
            id="trunk-name"
            value={values.trunkName}
            onChange={(e) =>
              onChange({ ...values, trunkName: e.target.value })
            }
            placeholder="My SIP Trunk"
            className="h-10 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sip-ip">
            SIP IP Address<span className="text-red-500">*</span>
          </Label>
          <Input
            id="sip-ip"
            value={values.sipIpAddress}
            onChange={(e) =>
              onChange({ ...values, sipIpAddress: e.target.value })
            }
            placeholder="e.g., 44.229.228.186/32"
            className="h-10 rounded-xl"
          />
        </div>
      </div>

      <div className="flex gap-3 rounded-xl border border-border/40 bg-muted/30 p-4">
        <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">
            Static IP SIP Servers Available.
          </span>{" "}
          VozzoAI Labs offers SIP servers with static IP addresses for enterprise
          clients requiring IP allowlisting. Static IP infrastructure uses a /24
          block across US, EU, and India regions. Available for enterprise
          accounts.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="country-code">
            Country Code<span className="text-red-500">*</span>
          </Label>
          <Select
            id="country-code"
            value={values.countryCode}
            onChange={(e) =>
              onChange({ ...values, countryCode: e.target.value })
            }
            options={SIP_COUNTRY_CODES}
            className="h-10 rounded-xl"
          />
          <p className="text-[11px] text-muted-foreground">
            Select the country ISO code
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sip-phone">
            Phone Number<span className="text-red-500">*</span>
          </Label>
          <Input
            id="sip-phone"
            value={values.phoneNumber}
            onChange={(e) =>
              onChange({ ...values, phoneNumber: e.target.value })
            }
            placeholder="e.g., 919898989797"
            className="h-10 rounded-xl"
          />
          <p className="text-[11px] text-muted-foreground">
            Enter the number as per SIP
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground dark:text-foreground">
          Authentication
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sip-username">
              Username<span className="text-red-500">*</span>
            </Label>
            <Input
              id="sip-username"
              value={values.username}
              onChange={(e) =>
                onChange({ ...values, username: e.target.value })
              }
              placeholder="Authentication username"
              className="h-10 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sip-password">
              Password<span className="text-red-500">*</span>
            </Label>
            <Input
              id="sip-password"
              type="password"
              value={values.password}
              onChange={(e) =>
                onChange({ ...values, password: e.target.value })
              }
              placeholder="Authentication password"
              className="h-10 rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-border/40 pt-5">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl px-6"
        >
          Integrate SIP Trunk
        </Button>
      </div>
    </form>
  );
}

function CallTypeCheckboxes({
  inbound,
  outbound,
  onInboundChange,
  onOutboundChange,
  inboundLabel = "Inbound Calls",
  outboundLabel = "Outbound Calls",
}: {
  inbound: boolean;
  outbound: boolean;
  onInboundChange: (checked: boolean) => void;
  onOutboundChange: (checked: boolean) => void;
  inboundLabel?: string;
  outboundLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-6">
      <label className="flex cursor-pointer items-center gap-2.5 text-sm">
        <Checkbox
          checked={inbound}
          onChange={(e) => onInboundChange(e.target.checked)}
        />
        <span>{inboundLabel}</span>
      </label>
      <label className="flex cursor-pointer items-center gap-2.5 text-sm">
        <Checkbox
          checked={outbound}
          onChange={(e) => onOutboundChange(e.target.checked)}
        />
        <span>{outboundLabel}</span>
      </label>
    </div>
  );
}
