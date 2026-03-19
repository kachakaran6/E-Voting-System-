import React from "react";
import { ShieldCheck } from "lucide-react";
import { Navigate } from "react-router-dom";
import type { Role } from "../contexts/AuthContext";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: Role[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white/90 p-8 text-center shadow-soft backdrop-blur-xl">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="mt-6 text-2xl font-semibold text-slate-950">Verifying secure session</div>
          <div className="mt-2 text-sm text-slate-500">
            Checking your identity and role permissions before opening the workspace.
          </div>
          <div className="mt-6 space-y-3">
            <div className="h-3 rounded-full bg-slate-200/80 animate-pulse" />
            <div className="h-3 w-4/5 rounded-full bg-slate-200/80 animate-pulse" />
            <div className="h-3 w-3/5 rounded-full bg-slate-200/80 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/app" replace />;
  return <>{children}</>;
}
