import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, error, hint, options, placeholder, id, ...props },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "flex h-11 w-full rounded-xl border bg-white dark:bg-slate-800 px-4 py-2 text-sm transition-colors appearance-none pr-10",
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
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
        </div>
        {error && <p className="text-xs text-red-500 dark:text-red-400 font-medium">{error}</p>}
        {hint && !error && (
          <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
