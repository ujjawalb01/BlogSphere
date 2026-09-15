import React, { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/login", form);

      // Save full user object
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[78vh] items-center justify-center py-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#20211f] shadow-2xl md:grid-cols-[.9fr_1.1fr]">
        <section className="relative overflow-hidden bg-[#d9ff65] p-8 text-[#202318] md:min-h-[560px] md:p-12">
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div><p className="text-sm font-bold tracking-tight">BlogSphere</p><p className="mt-1 text-xs font-medium opacity-60">A place for thoughtful stories.</p></div>
            <div className="max-w-sm"><p className="mb-4 text-xs font-bold uppercase tracking-[.18em] opacity-60">Welcome back</p><h1 className="editorial-title text-5xl font-semibold leading-[.94] md:text-6xl">Keep up with the people and ideas you care about.</h1></div>
            <p className="text-sm font-medium">Read. Share. Connect.</p>
          </div>
          <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full border-[28px] border-[#202318]/15" />
          <div className="absolute right-12 top-16 h-20 w-20 rounded-full bg-[#202318]/10" />
        </section>

        <section className="p-7 sm:p-10 md:p-12">
          <p className="eyebrow mb-3">Sign in</p>
          <h2 className="editorial-title mb-2 text-4xl font-semibold text-white">Welcome back.</h2>
          <p className="mb-8 text-sm leading-relaxed text-gray-400">Enter your details to return to your feed.</p>
          <form onSubmit={submit} className="space-y-5">
            <label className="block text-sm font-medium text-gray-300">Email or username<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" type="text" className="input-field mt-2" /></label>
            <label className="block text-sm font-medium text-gray-300">Password<input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="Your password" type="password" className="input-field mt-2" /></label>
            <div className="flex justify-end"><Link to="/forgot-password" className="text-sm font-medium text-[#d9ff65] hover:text-white">Forgot password?</Link></div>
            <button disabled={loading} type="submit" className="w-full rounded-full py-3 btn">{loading ? "Signing in..." : "Sign in"}</button>
          </form>
          <p className="mt-7 text-center text-sm text-gray-400">New here? <Link to="/register" className="font-semibold text-[#d9ff65] hover:text-white">Create an account</Link></p>
        </section>
      </div>
    </div>
  );
}
