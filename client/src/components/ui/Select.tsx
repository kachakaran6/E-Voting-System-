import React, { useId } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Select({ label, hint, error, className, children, ...props }: Props) {
  const fallbackId = useId();
  const selectId = props.id || fallbackId;

  return (
    <label className="block space-y-2" htmlFor={selectId}>
      {label ? <div className="ml-1 text-sm font-semibold text-slate-700">{label}</div> : null}
      <div className="relative">
        <select
          id={selectId}
          className={clsx(
            "h-12 w-full appearance-none rounded-2xl border bg-white/90 px-4 pr-12 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all duration-200 hover:border-slate-300 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10",
            error ? "border-danger-200 bg-danger-50/70 text-danger-900 focus:border-danger-400 focus:ring-danger-500/10" : "border-slate-200/80",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      {error ? (
        <div className="ml-1 text-xs font-medium text-danger-700" role="alert">
          {error}
        </div>
      ) : hint ? (
        <div className="ml-1 text-xs font-medium text-slate-500">{hint}</div>
      ) : null}
    </label>
  );
}
