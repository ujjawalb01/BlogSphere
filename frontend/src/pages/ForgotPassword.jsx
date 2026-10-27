import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiMailSend, BiArrowBack } from "react-icons/bi";
import API from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const timer = window.setTimeout(() => setResendSeconds((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  const requestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setError("");
    try {
      const res = await API.post("/auth/forgot-password", { email });
      setOtpStep(true);
      setResendSeconds(30);
      setMsg(res.data?.message || "A verification code was sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not send a verification code. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setError("");
    try {
      const res = await API.post("/auth/verify-reset-otp", { email, otp });
      navigate("/reset-password/" + encodeURIComponent(res.data.resetToken));
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setLoading(true);
    setMsg("");
    setError("");
    try {
      const res = await API.post("/auth/resend-otp", { email, purpose: "forgot-password" });
      setResendSeconds(30);
      setMsg(res.data?.message || "A new verification code was sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend the code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4 page-fade-in">
      <div className="editorial-card w-full max-w-md p-6 sm:p-10 rounded-3xl shadow-card">
        <div className="mb-6 text-center">
          <span className="editorial-eyebrow mb-1.5 block">Account Recovery</span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)] mb-2">
            {otpStep ? "Verify Your Email" : "Forgot Password?"}
          </h1>
          <p className="text-xs text-[var(--ink-secondary)]">
            {otpStep
              ? "Enter the 6-digit code sent to " + email + " to continue."
              : "Enter your registered email address and we'll send you a verification code."}
          </p>
        </div>

        {msg && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 text-center">
            {msg}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400 text-center">
            {error}
          </div>
        )}

        {!otpStep ? (
          <form onSubmit={requestCode} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="editorial-input" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary-editorial w-full py-3 text-sm disabled:opacity-50">
              {loading ? <span>Sending Code...</span> : <span className="flex items-center gap-1.5"><BiMailSend size={18} /> Send Verification Code</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">Verification Code</label>
              <input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit code" className="editorial-input" />
            </div>
            <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary-editorial w-full py-3 text-sm disabled:opacity-50">
              {loading ? "Verifying..." : "Verify Code"}
            </button>
            <button type="button" onClick={resendCode} disabled={loading || resendSeconds > 0} className="w-full text-xs text-[var(--accent)] hover:underline disabled:cursor-not-allowed disabled:opacity-50">
              {resendSeconds > 0 ? "Send again in " + resendSeconds + "s" : "Send OTP again"}
            </button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-[var(--line)] pt-4">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition">
            <BiArrowBack size={14} /><span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
