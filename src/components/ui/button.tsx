import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "destructive"
    | "ghost"
    | "success"
    | "warning"
    | "info";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98] dark:focus-visible:ring-offset-slate-900";

    const variants: Record<string, string> = {
      primary:
        "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 shadow-sm dark:hover:bg-green-500",
      secondary:
        "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 focus-visible:ring-slate-400",
      outline:
        "border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:ring-slate-400",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm dark:hover:bg-red-500",
      ghost:
        "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-slate-400",
      success:
        "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 shadow-sm dark:hover:bg-green-500",
      warning:
        "bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-400 shadow-sm dark:hover:bg-amber-400",
      info: "bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-blue-400 shadow-sm dark:hover:bg-blue-400",
    };

    const sizes: Record<string, string> = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      xl: "h-14 px-8 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
