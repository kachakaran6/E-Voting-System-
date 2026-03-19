import React from "react";
import clsx from "clsx";

type CardProps = {
  className?: string;
  children: React.ReactNode;
  variant?: "panel" | "subtle" | "solid";
};

export function Card({ className, children, variant = "panel" }: CardProps) {
  const variants = {
    panel: "border border-neutral-200/60 bg-white shadow-shadow-soft",
    subtle: "border border-neutral-200/80 bg-neutral-50 shadow-sm",
    solid: "border border-brand-950 bg-brand-950 text-white shadow-shadow-hard",
  };

  return <section className={clsx("rounded-xl overflow-hidden", variants[variant], className)}>{children}</section>;
}

