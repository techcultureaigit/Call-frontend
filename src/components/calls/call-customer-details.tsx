"use client";

import Link from "next/link";
import {
  Building2,
  ExternalLink,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import type { CallCustomerSnapshot } from "@/types/call";

interface CallCustomerDetailsProps {
  customer: CallCustomerSnapshot;
}

export function CallCustomerDetails({ customer }: CallCustomerDetailsProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
      <div className="flex items-center gap-3">
        <Avatar className="size-12">
          {customer.avatarUrl && (
            <AvatarImage src={customer.avatarUrl} alt={customer.firstName} />
          )}
          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
            {getInitials(customer.firstName, customer.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {customer.firstName} {customer.lastName}
          </p>
          <p className="text-sm text-muted-foreground">{customer.company}</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 shrink-0" asChild>
          <Link href={`/customers?id=${customer.id}`}>
            <ExternalLink className="size-3.5" />
            Profile
          </Link>
        </Button>
      </div>

      <div className="mt-4 space-y-2.5">
        {customer.jobTitle && (
          <div className="flex items-center gap-2 text-sm">
            <User className="size-3.5 text-muted-foreground" />
            <span>{customer.jobTitle}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Mail className="size-3.5 text-muted-foreground" />
          <span className="truncate">{customer.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="size-3.5 text-muted-foreground" />
          <span>{customer.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="size-3.5 text-muted-foreground" />
          <span>{customer.company}</span>
        </div>
      </div>
    </div>
  );
}
