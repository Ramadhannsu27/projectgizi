import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "normal"
  | "obesitas"
  | "overweight"
  | "stunting"
  | "severely_stunting"
  | "secondary"
  | "outline"
  | "destructive"
  | "info"
  | "warning";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  normal: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800",
  obesitas: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800",
  overweight: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  stunting: "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  severely_stunting: "bg-orange-200 dark:bg-orange-900/60 text-orange-900 dark:text-orange-200 border-orange-300 dark:border-orange-700",
  secondary: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600",
  outline: "border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 bg-transparent",
  destructive: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800",
  info: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  warning: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
};

const labels: Record<BadgeVariant, string> = {
  normal: "Normal",
  obesitas: "Obesitas",
  overweight: "Overweight",
  stunting: "Stunting",
  severely_stunting: "Stunting Berat",
  secondary: "Secondary",
  outline: "Outline",
  destructive: "Error",
  info: "Info",
  warning: "Warning",
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "secondary", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
          variants[variant],
          className
        )}
        {...props}
      >
        {children ?? labels[variant]}
      </span>
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
