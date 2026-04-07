import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, type, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-xl border bg-white dark:bg-slate-800 px-4 py-2 text-sm transition-colors",
            "placeholder:text-slate-400 dark:placeholder:text-slate-500",
            "text-slate-800 dark:text-white",
            "border-slate-300 dark:border-slate-600",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-transparent",
            "hover:border-slate-400 dark:hover:border-slate-500",
            "disabled:cursor-not-allowed disabled:opacity-60",
            error
              ? "border-red-400 dark:border-red-500 focus-visible:ring-red-500"
              : "",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 dark:text-red-400 font-medium">{error}</p>}
        {hint && !error && (
          <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
