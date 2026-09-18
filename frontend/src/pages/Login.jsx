import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BiLogInCircle, BiLockAlt, BiUser, BiArrowBack } from "react-icons/bi";
import API from "../api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center py-6 page-fade-in">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-[var(--line-strong)] bg-[var(--surface)] shadow-card md:grid-cols-12">
        
        {/* Editorial Brand Column */}
        <section className="md:col-span-5 relative overflow-hidden bg-[var(--surface-raised)] p-8 md:p-10 border-b md:border-b-0 md:border-r border-[var(--line)] flex flex-col justify-between">
          <div>
            <span className="editorial-eyebrow block mb-2">Welcome Back</span>
            <span className="font-serif font-bold text-2xl text-[var(--ink)] tracking-tight">
              BlogSphere
            </span>
          </div>

          <div className="my-8">
            <blockquote className="font-serif italic text-xl sm:text-2xl text-[var(--ink)] leading-snug mb-3">
              “Reading is an exercise in empathy; an exercise in walking in someone else’s shoes for a while.”
            </blockquote>
            <cite className="text-xs font-mono text-[var(--ink-muted)] block not-italic">
              — Stories that stay with you
            </cite>
          </div>

          <p className="text-xs text-[var(--ink-muted)]">
            Explore ideas, save stories, and join the discourse.
          </p>
        </section>

        {/* Form Column */}
        <section className="md:col-span-7 p-7 sm:p-10">
          <div className="mb-6">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)] mb-1.5">
              Sign In to Your Corner
            </h2>
            <p className="text-xs text-[var(--ink-secondary)]">
              Enter your credentials to access your feed, library, and messages.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
                Email or Username
              </label>
              <input
                type="text"
                required
                placeholder="you@example.com or @username"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="editorial-input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[var(--accent)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                placeholder="Your secret password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="editorial-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary-editorial w-full py-3 text-sm mt-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <BiLogInCircle size={18} />
                  Sign In to BlogSphere
                </span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-[var(--ink-muted)]">
            Don’t have an account?{" "}
            <Link to="/register" className="font-semibold text-[var(--accent)] hover:underline">
              Create an account
            </Link>
          </p>
        </section>

      </div>
    </div>
  );
}
