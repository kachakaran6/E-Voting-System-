import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Card } from "./Card";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg";
};

export function Modal({ open, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-950/60 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <Card
        className={`relative z-10 w-full ${size === "lg" ? "max-w-2xl" : "max-w-lg"} !p-0 shadow-shadow-hard`}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
          className="outline-none"
        >
          <div className="flex items-start justify-between gap-4 border-b border-neutral-100 p-6">
            <div>
              <h2 id={titleId} className="text-lg font-bold tracking-tight text-neutral-900">
                {title}
              </h2>
              {description ? (
                <p id={descriptionId} className="mt-1 text-sm leading-6 text-neutral-500">
                  {description}
                </p>
              ) : null}
            </div>
            <button 
              onClick={onClose} 
              className="mt-[-4px] mr-[-4px] p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-lg hover:bg-neutral-50"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-5">{children}</div>
          {footer ? (
            <div className="bg-neutral-50 px-6 py-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end border-t border-neutral-100">
              {footer}
            </div>
          ) : null}
        </div>
      </Card>
    </div>,
    document.body
  );
}
