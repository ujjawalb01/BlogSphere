import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BiMailSend, BiArrowBack } from "react-icons/bi";
import API from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setError("");

    try {
      const res = await API.post("/auth/forgotpassword", { email });
      setMsg(res.data?.data || "Password reset instructions sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4 page-fade-in">
      <div className="editorial-card w-full max-w-md p-8 sm:p-10 rounded-3xl shadow-card">
        
        <div className="mb-6 text-center">
          <span className="editorial-eyebrow mb-1.5 block">Account Recovery</span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)] mb-2">
            Forgot Password?
          </h1>
          <p className="text-xs text-[var(--ink-secondary)]">
            Enter your registered email address and we'll send you a link to reset your credentials.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="editorial-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-editorial w-full py-3 text-sm disabled:opacity-50"
          >
            {loading ? (
              <span>Sending Instructions...</span>
            ) : (
              <span className="flex items-center gap-1.5">
                <BiMailSend size={18} />
                Send Reset Link
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[var(--line)] pt-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition"
          >
            <BiArrowBack size={14} />
            <span>Return to Sign In</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
