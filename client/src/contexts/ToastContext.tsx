import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, BellRing, CheckCircle2, TriangleAlert, X } from "lucide-react";
import { Button } from "../components/ui/Button";

type ToastTone = "success" | "error" | "info" | "warning";

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
};

type ToastRecord = ToastInput & {
  id: string;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, { icon: typeof CheckCircle2; classes: string }> = {
  success: { icon: CheckCircle2, classes: "border-success-200 bg-success-50/95 text-success-900" },
  error: { icon: AlertCircle, classes: "border-danger-200 bg-danger-50/95 text-danger-900" },
  info: { icon: BellRing, classes: "border-brand-200 bg-brand-50/95 text-brand-900" },
  warning: { icon: TriangleAlert, classes: "border-warning-200 bg-warning-50/95 text-warning-900" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timers = useRef<Record<string, number>>({});

  const dismissToast = useCallback((id: string) => {
    if (timers.current[id]) {
      window.clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ duration = 3500, tone = "info", ...toast }: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((current) => [...current, { id, duration, tone, ...toast }]);
      timers.current[id] = window.setTimeout(() => dismissToast(id), duration);
      return id;
    },
    [dismissToast]
  );

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-[60] flex flex-col items-end gap-3 sm:inset-x-auto sm:right-4 sm:w-full sm:max-w-sm">
        {toasts.map((toast) => {
          const { icon: Icon, classes } = toneStyles[toast.tone || "info"];
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto w-full rounded-[1.5rem] border p-4 shadow-soft backdrop-blur ${classes}`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white/70">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{toast.title}</div>
                  {toast.description ? <div className="mt-1 text-sm text-current/80">{toast.description}</div> : null}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-current hover:bg-white/60"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
