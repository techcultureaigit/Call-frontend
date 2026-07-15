"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ClipboardList,
  Rocket,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CAMPAIGN_TYPE_OPTIONS,
  DAYS_OF_WEEK,
  DEFAULT_SCHEDULE,
  TIMEZONE_OPTIONS,
  WIZARD_STEPS,
} from "@/lib/constants/campaigns";
import { cn, formatDate, getInitials } from "@/lib/utils";
import { useCustomers } from "@/hooks/use-customers";
import { useSurveys } from "@/hooks/use-surveys";
import type { CampaignType, CampaignWizardValues } from "@/types/campaign";

const STEP_ICONS = [ClipboardList, Users, ClipboardList, Calendar, Check];

interface CampaignWizardProps {
  variant?: "modal" | "page";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCancel?: () => void;
  onSubmit: (values: CampaignWizardValues, launch: boolean) => Promise<void>;
  isLoading?: boolean;
}

const initialValues: CampaignWizardValues = {
  name: "",
  description: "",
  type: "customer_survey",
  customerIds: [],
  surveyId: "",
  schedule: { ...DEFAULT_SCHEDULE },
};

export function CampaignWizard({
  variant = "modal",
  open = false,
  onOpenChange,
  onCancel,
  onSubmit,
  isLoading,
}: CampaignWizardProps) {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<CampaignWizardValues>(initialValues);
  const [customerSearch, setCustomerSearch] = useState("");

  const { data: customersData, isLoading: customersLoading } = useCustomers({
    page: 1,
    limit: 50,
    search: customerSearch,
    status: "all",
  });
  const { data: surveys = [], isLoading: surveysLoading } = useSurveys(true);

  useEffect(() => {
    if (variant === "modal" && !open) {
      setStep(1);
      setValues(initialValues);
      setCustomerSearch("");
    }
  }, [open, variant]);

  const update = useCallback(
    (patch: Partial<CampaignWizardValues>) => {
      setValues((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const toggleCustomer = (id: string) => {
    const ids = values.customerIds.includes(id)
      ? values.customerIds.filter((c) => c !== id)
      : [...values.customerIds, id];
    update({ customerIds: ids });
  };

  const toggleDay = (day: number) => {
    const days = values.schedule.daysOfWeek.includes(day)
      ? values.schedule.daysOfWeek.filter((d) => d !== day)
      : [...values.schedule.daysOfWeek, day].sort();
    update({ schedule: { ...values.schedule, daysOfWeek: days } });
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return values.name.trim().length >= 2;
      case 2:
        return values.customerIds.length > 0;
      case 3:
        return values.surveyId.length > 0;
      case 4:
        return (
          values.schedule.startDate.length > 0 &&
          values.schedule.daysOfWeek.length > 0
        );
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 5 && canProceed()) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async (launch: boolean) => {
    await onSubmit(values, launch);
    if (variant === "modal") {
      onOpenChange?.(false);
    }
  };

  const selectedSurvey = surveys.find((s) => s.id === values.surveyId);
  const selectedCustomers =
    customersData?.data.filter((c) =>
      values.customerIds.includes(c.id)
    ) ?? [];

  const wizardContent = (
    <>
      <div className="border-b border-border/60 px-6 py-5">
        {variant === "modal" && (
          <>
            <h2 className="text-lg font-semibold">Create Campaign</h2>
            <p className="text-sm text-muted-foreground">
              Set up your campaign in 5 simple steps
            </p>
          </>
        )}

        <div className={cn("flex items-center gap-1", variant === "modal" && "mt-4")}>
            {WIZARD_STEPS.map((s, i) => {
              const Icon = STEP_ICONS[i];
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <div key={s.id} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        "flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : isDone
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-muted text-muted-foreground"
                      )}
                    >
                      {isDone ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Icon className="size-3.5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "hidden text-[10px] font-medium sm:block",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < WIZARD_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "mx-1 h-0.5 flex-1 rounded",
                        step > s.id ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">Step 1 — Name</h3>
                    <p className="text-xs text-muted-foreground">
                      Give your campaign a name and type
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="camp-name">Campaign Name</Label>
                    <Input
                      id="camp-name"
                      placeholder="e.g. Q3 Enterprise NPS Survey"
                      value={values.name}
                      onChange={(e) => update({ name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="camp-desc">Description</Label>
                    <textarea
                      id="camp-desc"
                      placeholder="Brief description of campaign goals..."
                      value={values.description}
                      onChange={(e) =>
                        update({ description: e.target.value })
                      }
                      rows={3}
                      className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-subtle placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Campaign Type</Label>
                    <Select
                      value={values.type}
                      onChange={(e) =>
                        update({ type: e.target.value as CampaignType })
                      }
                      options={CAMPAIGN_TYPE_OPTIONS}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">
                      Step 2 — Customers
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Select customers to include in this campaign
                    </p>
                  </div>
                  <Input
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {values.customerIds.length} selected
                  </p>
                  {customersLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border/60">
                      {(customersData?.data ?? []).map((customer) => (
                        <label
                          key={customer.id}
                          className="flex cursor-pointer items-center gap-3 border-b border-border/30 px-3 py-2.5 transition-colors last:border-0 hover:bg-muted/30"
                        >
                          <Checkbox
                            checked={values.customerIds.includes(customer.id)}
                            onChange={() => toggleCustomer(customer.id)}
                          />
                          <div className="flex size-8 items-center justify-center rounded-full bg-primary/8 text-xs font-medium text-primary">
                            {getInitials(
                              customer.firstName,
                              customer.lastName
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {customer.firstName} {customer.lastName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {customer.company} · {customer.email}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">Step 3 — Survey</h3>
                    <p className="text-xs text-muted-foreground">
                      Attach a survey to collect responses during calls
                    </p>
                  </div>
                  {surveysLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {surveys.map((survey) => (
                        <button
                          key={survey.id}
                          type="button"
                          onClick={() => update({ surveyId: survey.id })}
                          className={cn(
                            "w-full rounded-lg border p-4 text-left transition-colors",
                            values.surveyId === survey.id
                              ? "border-primary bg-primary/5"
                              : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium">
                                {survey.name}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {survey.description}
                              </p>
                            </div>
                            {values.surveyId === survey.id && (
                              <Check className="size-4 text-primary" />
                            )}
                          </div>
                          <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
                            <span>{survey.questionCount} questions</span>
                            <span>
                              ~{survey.estimatedDurationMinutes} min
                            </span>
                            <span>
                              {survey.responseCount} responses
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">
                      Step 4 — Schedule
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Configure when calls should be placed
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={values.schedule.startDate}
                        onChange={(e) =>
                          update({
                            schedule: {
                              ...values.schedule,
                              startDate: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date (optional)</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={values.schedule.endDate ?? ""}
                        onChange={(e) =>
                          update({
                            schedule: {
                              ...values.schedule,
                              endDate: e.target.value || undefined,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Time Zone</Label>
                    <Select
                      value={values.schedule.timeZone}
                      onChange={(e) =>
                        update({
                          schedule: {
                            ...values.schedule,
                            timeZone: e.target.value,
                          },
                        })
                      }
                      options={TIMEZONE_OPTIONS}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Call Window Start</Label>
                      <Input
                        type="time"
                        value={values.schedule.callWindowStart}
                        onChange={(e) =>
                          update({
                            schedule: {
                              ...values.schedule,
                              callWindowStart: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Call Window End</Label>
                      <Input
                        type="time"
                        value={values.schedule.callWindowEnd}
                        onChange={(e) =>
                          update({
                            schedule: {
                              ...values.schedule,
                              callWindowEnd: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Active Days</Label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className={cn(
                            "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                            values.schedule.daysOfWeek.includes(day.value)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">
                      Step 5 — Review
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Review your campaign before launching
                    </p>
                  </div>
                  <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
                    <ReviewRow label="Name" value={values.name} />
                    <ReviewRow
                      label="Type"
                      value={
                        CAMPAIGN_TYPE_OPTIONS.find(
                          (o) => o.value === values.type
                        )?.label
                      }
                    />
                    {values.description && (
                      <ReviewRow label="Description" value={values.description} />
                    )}
                    <ReviewRow
                      label="Customers"
                      value={`${values.customerIds.length} selected`}
                    />
                    <ReviewRow
                      label="Survey"
                      value={selectedSurvey?.name ?? "—"}
                    />
                    <ReviewRow
                      label="Schedule"
                      value={`${formatDate(values.schedule.startDate)} · ${values.schedule.callWindowStart}–${values.schedule.callWindowEnd}`}
                    />
                    <ReviewRow
                      label="Time Zone"
                      value={values.schedule.timeZone}
                    />
                  </div>
                  {selectedCustomers.length > 0 && (
                    <div className="rounded-lg border border-border/60 p-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Selected Customers
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCustomers.slice(0, 8).map((c) => (
                          <span
                            key={c.id}
                            className="rounded-md bg-muted px-2 py-0.5 text-xs"
                          >
                            {c.firstName} {c.lastName}
                          </span>
                        ))}
                        {selectedCustomers.length > 8 && (
                          <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            +{selectedCustomers.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="border-t border-border/60 px-6 py-4">
          <div className="flex w-full items-center justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (step === 1) {
                  if (variant === "page") onCancel?.();
                  else onOpenChange?.(false);
                } else {
                  handleBack();
                }
              }}
              disabled={variant === "modal" && step === 1}
            >
              <ArrowLeft className="size-4" />
              {step === 1 && variant === "page" ? "Cancel" : "Back"}
            </Button>

            <div className="flex items-center gap-2">
              {step === 5 ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit(false)}
                    disabled={isLoading}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    onClick={() => handleSubmit(true)}
                    disabled={isLoading}
                  >
                    <Rocket className="size-4" />
                    {isLoading ? "Launching…" : "Launch Campaign"}
                  </Button>
                </>
              ) : (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Next
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
    </>
  );

  if (variant === "page") {
    return (
      <div className="flex w-full min-h-[calc(100vh-14rem)] flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-card">
        {wizardContent}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        {wizardContent}
      </DialogContent>
    </Dialog>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
