import React from "react";
import { Card } from "../components/ui/Card";
import { ShieldCheck } from "lucide-react";
import { Badge } from "../components/ui/Badge";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const points = [
    "Verified login and registration flows",
    "Clear voter, admin, and super-admin separation",
    "Responsive UI with simplified ballot review",
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfbfc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:h-[700px]">
        <Card className="relative hidden overflow-hidden bg-brand-950 p-8 text-white sm:p-10 lg:flex lg:flex-col lg:justify-between" variant="solid">
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight">SecureVote</div>
                <div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-brand-300/80 font-bold">Official Portal</div>
              </div>
            </div>

            <div>
              <Badge tone="secondary" className="border-white/10 bg-white/5 text-white/90">
                Secure Environment
              </Badge>
              <h1 className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
                Election integrity, <br />
                <span className="text-brand-300">digitally verified.</span>
              </h1>
              <p className="mt-6 text-base leading-relaxed text-brand-100/70">
                A professional-grade voting system designed for absolute security, transparency, and ease of use.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-3">
            {points.map((point) => (
              <div key={point} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                <div className="grid h-2 w-2 shrink-0 rounded-full bg-brand-300" />
                <div className="text-xs font-semibold text-brand-50/80 tracking-tight">{point}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col p-6 sm:p-8 lg:p-12 border-neutral-200/60 shadow-shadow-soft overflow-y-auto">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-950 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-900">SecureVote</div>
              <div className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-neutral-400 font-bold">Verified access</div>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
}

