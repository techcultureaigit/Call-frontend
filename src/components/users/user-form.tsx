"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  userFormSchema,
  USER_ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
  type UserFormValues,
} from "@/lib/validators/user";
import type { User } from "@/types/user";

interface UserFormProps {
  user?: User | null;
  onSubmit: (values: UserFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const defaultValues: UserFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "sales_rep",
  status: "invited",
};

export function UserForm({
  user,
  onSubmit,
  onCancel,
  isLoading,
}: UserFormProps) {
  const isEdit = Boolean(user);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(
      user
        ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone ?? "",
            role: user.role,
            status: user.status,
          }
        : defaultValues
    );
  }, [user, reset]);

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form
      onSubmit={handleFormSubmit}
      className="w-full rounded-xl border border-border/60 bg-card p-6 shadow-card lg:p-8"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" {...register("firstName")} />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" {...register("lastName")} />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>
          <div className="space-y-2 md:col-span-2 xl:col-span-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              disabled={isEdit}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" {...register("phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  id="role"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={USER_ROLE_OPTIONS.map((o) => ({
                    label: o.label,
                    value: o.value,
                  }))}
                />
              )}
            />
            {errors.role && (
              <p className="text-xs text-destructive">{errors.role.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  id="status"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={USER_STATUS_OPTIONS.map((o) => ({
                    label: o.label,
                    value: o.value,
                  }))}
                />
              )}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create user"}
          </Button>
        </div>
      </div>
    </form>
  );
}
