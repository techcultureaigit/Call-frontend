"use client";

import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { className, indeterminate = false, checked = false, onChange, ...props },
    ref
  ) => {
    const innerRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => innerRef.current!);

    React.useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = Boolean(indeterminate);
      }
    }, [indeterminate, checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Tri-state: clicking an indeterminate box always means "select all"
      const nextChecked = indeterminate ? true : e.target.checked;
      if (indeterminate && innerRef.current) {
        innerRef.current.indeterminate = false;
        innerRef.current.checked = true;
      }
      onChange?.({
        ...e,
        target: { ...e.target, checked: nextChecked },
        currentTarget: { ...e.currentTarget, checked: nextChecked },
      } as React.ChangeEvent<HTMLInputElement>);
    };

    return (
      <label
        className={cn(
          "relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center",
          props.disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <input
          type="checkbox"
          ref={innerRef}
          checked={Boolean(checked)}
          onChange={handleChange}
          className="peer sr-only"
          {...props}
        />
        <span
          className={cn(
            "flex size-4 items-center justify-center rounded-[4px] border border-input bg-background shadow-subtle transition-all",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
            (checked || indeterminate) &&
              "border-primary bg-primary text-primary-foreground",
            indeterminate && "bg-primary/80"
          )}
        >
          {indeterminate ? (
            <Minus className="size-3" strokeWidth={3} />
          ) : checked ? (
            <Check className="size-3" strokeWidth={3} />
          ) : null}
        </span>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
