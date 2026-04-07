import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "flex min-h-[100px] w-full rounded-xl border bg-white dark:bg-slate-800 px-4 py-3 text-sm transition-colors resize-none",
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
Textarea.displayName = "Textarea";

export { Textarea };
