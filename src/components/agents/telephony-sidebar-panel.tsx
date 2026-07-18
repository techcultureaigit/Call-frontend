"use client";

import { Info, Phone, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PurchasedNumber, SipTrunk, TelephonyTab } from "@/types/telephony";

interface TelephonySidebarPanelProps {
  activeTab: TelephonyTab;
  purchasedNumbers: PurchasedNumber[];
  sipTrunks: SipTrunk[];
  onDeletePurchased: (id: string) => void;
  onDeleteSip: (id: string) => void;
}

export function TelephonySidebarPanel({
  activeTab,
  purchasedNumbers,
  sipTrunks,
  onDeletePurchased,
  onDeleteSip,
}: TelephonySidebarPanelProps) {
  const isBuy = activeTab === "buy";
  const title = isBuy ? "Purchased Numbers" : "SIP Numbers";
  const count = isBuy ? purchasedNumbers.length : sipTrunks.length;
  const isEmpty = count === 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/40 px-5 py-4">
        <h2 className="text-base font-semibold text-foreground dark:text-foreground">
          {title}
        </h2>
        <Badge className="min-w-[22px] justify-center rounded-full px-2 py-0.5 text-[11px]">
          {count}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted/60">
              <Phone className="size-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {isBuy ? "No numbers purchased yet" : "No SIP trunks added yet"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              {isBuy
                ? "Buy a number to see it listed here"
                : "Integrate a SIP trunk to see it here"}
            </p>
          </div>
        ) : isBuy ? (
          <ul className="space-y-3">
            {purchasedNumbers.map((item) => (
              <li
                key={item.id}
                className="group rounded-xl border border-border/40 bg-muted/20 p-3 transition-colors hover:border-primary/20 hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.label}</p>
                    <p className="mt-1 font-mono text-sm text-primary">
                      {item.number}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {item.country} ·{" "}
                      {[item.inbound && "Inbound", item.outbound && "Outbound"]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => onDeletePurchased(item.id)}
                    aria-label={`Remove ${item.label}`}
                  >
                    <Trash2 className="size-3.5 text-red-600" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-3">
            {sipTrunks.map((item) => (
              <li
                key={item.id}
                className="group rounded-xl border border-border/40 bg-muted/20 p-3 transition-colors hover:border-primary/20 hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.trunkName}</p>
                    <p className="mt-1 font-mono text-sm">{item.phoneNumber}</p>
                    <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                      {item.sipIpAddress}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {item.countryCode} ·{" "}
                      {[item.inbound && "Inbound", item.outbound && "Outbound"]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => onDeleteSip(item.id)}
                    aria-label={`Remove ${item.trunkName}`}
                  >
                    <Trash2 className="size-3.5 text-red-600" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
