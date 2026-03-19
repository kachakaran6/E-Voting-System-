import React from "react";
import clsx from "clsx";

type BadgeTone = "brand" | "secondary" | "success" | "warning" | "danger" | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  brand: "border-brand-200/50 bg-brand-50 text-brand-900",
  secondary: "border-neutral-200/50 bg-neutral-100 text-neutral-800",
  success: "border-success-200/50 bg-success-50 text-success-800",
  warning: "border-warning-200/50 bg-warning-50 text-warning-800",
  danger: "border-danger-200/50 bg-danger-50 text-danger-800",
  neutral: "border-neutral-200/50 bg-neutral-50 text-neutral-600",
};

export function Badge({
  children,
  className,
  tone = "neutral",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em]",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
