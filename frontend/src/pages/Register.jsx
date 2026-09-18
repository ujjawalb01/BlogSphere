import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BiUserPlus, BiArrowBack } from "react-icons/bi";
import API from "../api";

export default function Register() {
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await API.post("/auth/register", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center py-6 page-fade-in">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-[var(--line-strong)] bg-[var(--surface)] shadow-card md:grid-cols-12">
        
        {/* Form Column */}
        <section className="md:col-span-7 p-7 sm:p-10 order-2 md:order-1">
          <div className="mb-6">
            <span className="editorial-eyebrow mb-1.5 block">Create Account</span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)] mb-1">
              Start Writing on BlogSphere
            </h2>
            <p className="text-xs text-[var(--ink-secondary)]">
              Join a thoughtful community of writers, creators, and readers.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Aarav Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="editorial-input"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="aarav"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="editorial-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="editorial-input"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Choose a secure password"
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
                <span>Creating your account...</span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <BiUserPlus size={18} />
                  Create Your Account
                </span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-[var(--ink-muted)]">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[var(--accent)] hover:underline">
              Sign in
            </Link>
          </p>
        </section>

        {/* Editorial Brand Column */}
        <section className="md:col-span-5 relative overflow-hidden bg-[var(--surface-raised)] p-8 md:p-10 border-b md:border-b-0 md:border-l border-[var(--line)] flex flex-col justify-between order-1 md:order-2">
          <div>
            <span className="editorial-eyebrow block mb-2">Publishing &amp; Community</span>
            <span className="font-serif font-bold text-2xl text-[var(--ink)] tracking-tight">
              BlogSphere
            </span>
          </div>

          <div className="my-8">
            <blockquote className="font-serif italic text-xl sm:text-2xl text-[var(--ink)] leading-snug mb-3">
              “There is no greater agony than bearing an untold story inside you.”
            </blockquote>
            <cite className="text-xs font-mono text-[var(--ink-muted)] block not-italic">
              — Maya Angelou
            </cite>
          </div>

          <p className="text-xs text-[var(--ink-muted)]">
            Join thousands of writers sharing their craft on a platform built for words.
          </p>
        </section>

      </div>
    </div>
  );
}
