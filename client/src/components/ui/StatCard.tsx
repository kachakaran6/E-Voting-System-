import React from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  accent = "brand",
}: {
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  icon: LucideIcon;
  accent?: "brand" | "secondary" | "success" | "warning";
}) {
  const accents = {
    brand: "bg-brand-50 text-brand-900 ring-brand-100/50",
    secondary: "bg-neutral-100 text-neutral-800 ring-neutral-200/50",
    success: "bg-success-50 text-success-800 ring-success-100/50",
    warning: "bg-warning-50 text-warning-800 ring-warning-100/50",
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">{label}</div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">{value}</div>
          {detail ? <div className="mt-1.5 text-xs font-medium text-neutral-500">{detail}</div> : null}
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-lg shadow-sm ring-1 ${accents[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
