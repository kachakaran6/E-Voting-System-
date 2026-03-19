import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { STATES } from "../utils/constants";

export function RegisterPage() {
  const { register, sendOtp } = useAuth();
  const { showToast } = useToast();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [voterId, setVoterId] = useState("");
  const [state, setState] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  const pwdMismatch = useMemo(() => Boolean(password && confirmPassword && password !== confirmPassword), [password, confirmPassword]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  async function handleSendOtp() {
    if (!email) return setError("Email is required to send OTP");
    setOtpLoading(true);
    setError(null);
    try {
      await sendOtp(email);
      setOtpSent(true);
      setTimer(60);
      showToast({ tone: "success", title: "OTP Sent", description: "Please check your email for the 6-digit code." });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pwdMismatch) return setError("Passwords do not match");
    if (!otp) return setError("Please enter the OTP sent to your email");
    
    setLoading(true);
    try {
      await register({
        fullName,
        email,
        password,
        confirmPassword,
        voterId,
        state,
        otp
      });
      showToast({ tone: "success", title: "Registration Successful", description: "You can now log in to the portal." });
      nav("/login");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge tone="brand" className="!rounded-md !px-2 font-bold">Registration</Badge>
        <Badge tone="neutral" className="!rounded-md !px-2 !bg-neutral-100 !text-neutral-500 !border-neutral-200">Email Verified</Badge>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Create Account</h1>
      <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-500">
        Register to participate in the upcoming elections.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            className="!rounded-xl h-10"
            required
          />
          <Input
            label="Email Address"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="!rounded-xl h-10"
            required
          />
          <Input
            label="Voter ID"
            placeholder="VT-XXXX-XXXX"
            value={voterId}
            onChange={(e) => setVoterId(e.target.value)}
            className="!rounded-xl h-10"
            required
          />
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Jurisdiction / State</label>
            <Select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="!rounded-xl h-10"
              required
            >
              <option value="" disabled>Select your state</option>
              {STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint="Min. 8 chars"
            autoComplete="new-password"
            className="!rounded-xl h-10"
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={pwdMismatch ? "Mismatch" : undefined}
            autoComplete="new-password"
            className="!rounded-xl h-10"
            required
          />
        </div>

        <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4 space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                label="OTP Verification"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="!rounded-xl h-10"
              />
            </div>
            <Button 
              type="button" 
              variant="secondary" 
              size="sm" 
              className="h-10 px-4 !rounded-xl font-bold" 
              onClick={handleSendOtp}
              disabled={otpLoading || timer > 0}
            >
              {timer > 0 ? `Resend in ${timer}s` : otpSent ? "Resend OTP" : "Send OTP"}
            </Button>
          </div>
          {!otpSent && <p className="text-[10px] text-neutral-500 font-medium ml-1">An OTP will be sent to your email for verification.</p>}
        </div>

        {error ? (
          <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-[11px] font-bold text-danger-800 uppercase tracking-wide" role="alert">
            {error}
          </div>
        ) : null}

        <div className="pt-2">
          <Button type="submit" loading={loading} fullWidth size="lg" className="h-12 !rounded-xl font-bold shadow-lg shadow-brand-950/20 bg-brand-950 hover:bg-neutral-900 transition-all">
            Register Now
          </Button>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs font-bold text-neutral-400">
            Already have an account?{" "}
            <Link to="/login" className="ml-1 text-brand-900 decoration-brand-200 underline underline-offset-4">
              Login here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
