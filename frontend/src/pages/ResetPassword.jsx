import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BiLockAlt, BiCheckCircle } from "react-icons/bi";
import API from "../api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMsg("");
    setError("");

    try {
      await API.put(`/auth/resetpassword/${token}`, { password });
      setMsg("Password reset successfully! Redirecting you to sign in...");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Reset token invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4 page-fade-in">
      <div className="editorial-card w-full max-w-md p-8 sm:p-10 rounded-3xl shadow-card">
        
        <div className="mb-6 text-center">
          <span className="editorial-eyebrow mb-1.5 block">Security</span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)] mb-2">
            Set New Password
          </h1>
          <p className="text-xs text-[var(--ink-secondary)]">
            Choose a strong, memorable password for your BlogSphere account.
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
              New Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="editorial-input"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="editorial-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-editorial w-full py-3 text-sm disabled:opacity-50"
          >
            {loading ? (
              <span>Resetting Password...</span>
            ) : (
              <span className="flex items-center gap-1.5">
                <BiCheckCircle size={18} />
                Save New Password
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[var(--line)] pt-4">
          <Link
            to="/login"
            className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition"
          >
            Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
