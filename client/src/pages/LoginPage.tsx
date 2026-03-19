import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(identifier, password);
      nav("/app");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge tone="brand" className="!rounded-md !px-2 font-bold uppercase tracking-wider">Secure Access</Badge>
        <Badge tone="neutral" className="!rounded-md !px-2 !bg-neutral-100 !text-neutral-500 !border-neutral-200">Production v1.0</Badge>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Sign In</h1>
      <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-500">
        Access the Online Voting System portal.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          <Input
            label="Email or Voter ID"
            placeholder="Enter your identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            className="!rounded-xl h-11"
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="!rounded-xl h-11"
            required
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
          <Link to="/forgot-password" title="Forgot Password" className="text-xs font-bold text-brand-900 transition-colors hover:text-brand-700">
            Forgot password?
          </Link>
          <Link to="/register" className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 transition-colors hover:text-neutral-900">
            Create an account
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {error ? (
          <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-[11px] font-bold text-danger-800 uppercase tracking-wide" role="alert">
            {error}
          </div>
        ) : null}

        <Button type="submit" loading={loading} fullWidth size="lg" className="h-12 !rounded-xl font-bold shadow-lg shadow-brand-950/20 bg-brand-950 hover:bg-neutral-900 transition-all">
          Login
        </Button>
        
        <div className="pt-6 border-t border-neutral-100 flex items-center justify-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
           <Lock size={12} />
           <span>End-to-End Encrypted Session</span>
        </div>
      </form>
    </div>
  );
}
