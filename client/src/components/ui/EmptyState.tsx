import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Card } from "./Card";

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <Card className="border-dashed border-slate-200/80 bg-white/70 p-6 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-lg font-semibold text-slate-950">{title}</div>
      <div className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-slate-500">{description}</div>
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}
