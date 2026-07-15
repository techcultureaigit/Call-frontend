"use client";

import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate, checked, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => innerRef.current!);

    React.useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = Boolean(indeterminate);
      }
    }, [indeterminate]);

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
          checked={checked}
          className="peer sr-only"
          {...props}
        />
        <span
          className={cn(
            "flex size-4 items-center justify-center rounded-[4px] border border-input bg-background shadow-subtle transition-all",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
            "peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground",
            indeterminate && "border-primary bg-primary/80 text-primary-foreground"
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
