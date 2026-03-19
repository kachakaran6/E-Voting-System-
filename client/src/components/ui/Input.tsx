import React, { useId, useState } from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, className, type, ...props }: Props) {
  const fallbackId = useId();
  const inputId = props.id || fallbackId;
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <label className="block space-y-1.5" htmlFor={inputId}>
      {label ? <div className="ml-0.5 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</div> : null}
      <div className="relative">
        <input
          id={inputId}
          type={inputType}
          className={clsx(
            "h-10 w-full rounded-lg border bg-white px-3 text-sm font-medium text-neutral-900 shadow-sm outline-none transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-brand-700/60 focus:ring-2 focus:ring-brand-700/5",
            isPassword && "pr-10",
            error
              ? "border-danger-200 bg-danger-50/50 text-danger-900 focus:border-danger-400 focus:ring-danger-500/10"
              : "border-neutral-200",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error ? (
        <div className="ml-1 text-[11px] font-semibold text-danger-700" role="alert">
          {error}
        </div>
      ) : hint ? (
        <div className="ml-1 text-[11px] font-medium text-neutral-500">{hint}</div>
      ) : null}
    </label>
  );
}

