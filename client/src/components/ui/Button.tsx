import React from "react";
import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  fullWidth = false,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none whitespace-nowrap";
  const sizes: Record<NonNullable<Props["size"]>, string> = {
    sm: "h-8 px-3 text-xs uppercase tracking-wider",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base tracking-tight",
    icon: "h-10 w-10",
  };
  const variants: Record<string, string> = {
    primary:
      "border-brand-900 bg-brand-900 text-white shadow-shadow-soft hover:bg-brand-800 hover:border-brand-800 active:bg-brand-950",
    secondary:
      "border-neutral-200 bg-white text-neutral-700 shadow-shadow-soft hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-900 active:bg-neutral-100",
    danger:
      "border-danger-700 bg-danger-700 text-white shadow-shadow-soft hover:bg-danger-600 hover:border-danger-600 active:bg-danger-800",
    ghost:
      "border-transparent bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200/80",
    success:
      "border-success-700 bg-success-700 text-white shadow-shadow-soft hover:bg-success-600 hover:border-success-600 active:bg-success-800",
  };

  return (
    <button
      className={clsx(base, sizes[size], variants[variant], fullWidth && "w-full", className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/20 border-t-current" aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
}

