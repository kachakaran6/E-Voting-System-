import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { OtpInput } from "../components/ui/OtpInput";

export function ForgotPasswordPage() {
  const { forgotPassword, resetPassword } = useAuth();
  const { showToast } = useToast();
  const nav = useNavigate();
  
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const pwdMismatch = Boolean(newPassword && confirmPassword && newPassword !== confirmPassword);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return setError("Email is required");
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(email);
      setStep("OTP");
      showToast({ tone: "success", title: "OTP Sent", description: "Verification code sent to your email." });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (pwdMismatch) return setError("Passwords do not match");
    if (!otp) return setError("OTP is required");
    
    setLoading(true);
    setError(null);
    try {
      await resetPassword(email, otp, newPassword);
      showToast({ tone: "success", title: "Password Reset", description: "Your password has been updated successfully." });
      nav("/login");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-neutral-950 transition-colors">
          <ArrowLeft size={14} />
          Back to Login
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge tone="brand" className="!rounded-md !px-2 font-bold">Account Recovery</Badge>
      </div>
      
      <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
        {step === "EMAIL" ? "Forgot Password?" : "Reset Password"}
      </h1>
      <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-500">
        {step === "EMAIL" 
          ? "Enter your registered email to receive a password reset code." 
          : "Enter the code sent to your email and set a new password."}
      </p>

      {step === "EMAIL" ? (
        <form onSubmit={handleSendOtp} className="mt-8 space-y-6">
          <Input
            label="Recovery Email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="!rounded-xl h-11"
            required
          />
          
          {error && (
            <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-[11px] font-bold text-danger-800 uppercase tracking-wide">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} fullWidth size="lg" className="h-12 !rounded-xl font-bold shadow-lg shadow-brand-950/20 bg-brand-950 hover:bg-neutral-900 transition-all">
            Send Reset Code
          </Button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="mt-8 space-y-5">
          <div className="rounded-2xl border border-neutral-100 bg-neutral-50/40 p-5 space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1 block">Enter 6-digit code</label>
            <OtpInput 
              length={6} 
              value={otp} 
              onChange={setOtp} 
            />
          </div>
          <div className="grid gap-4">
            <Input
              label="New Password"
              type="password"
              placeholder="Create a strong password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="!rounded-xl h-11"
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={pwdMismatch ? "Passwords do not match" : undefined}
              className="!rounded-xl h-11"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-[11px] font-bold text-danger-800 uppercase tracking-wide">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} fullWidth size="lg" className="h-12 !rounded-xl font-bold shadow-lg shadow-brand-950/20 bg-brand-950 hover:bg-neutral-900 transition-all mt-4">
            Reset Password
          </Button>
        </form>
      )}
    </div>
  );
}
