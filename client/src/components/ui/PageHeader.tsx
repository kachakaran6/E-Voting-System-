import React from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700">{eyebrow}</div> : null}
        <h1 className="mt-1 text-[1.8rem] font-semibold tracking-tight text-slate-950 sm:text-[2rem]">{title}</h1>
        {description ? <p className="mt-1.5 text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
