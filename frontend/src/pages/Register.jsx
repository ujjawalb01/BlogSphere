import React, { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/register", form);

      // Save full user object
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[78vh] items-center justify-center py-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#20211f] shadow-2xl md:grid-cols-[1.1fr_.9fr]">
        <section className="order-2 p-7 sm:p-10 md:order-1 md:p-12">
          <p className="eyebrow mb-3">Create account</p>
          <h2 className="editorial-title mb-2 text-4xl font-semibold text-white">Start your corner of the internet.</h2>
          <p className="mb-7 text-sm leading-relaxed text-gray-400">Set up your profile and begin sharing with the BlogSphere community.</p>
          <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-300">Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Your name" className="input-field mt-2" /></label>
            <label className="block text-sm font-medium text-gray-300">Username<input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required placeholder="@username" className="input-field mt-2" /></label>
            <label className="block text-sm font-medium text-gray-300 sm:col-span-2">Email<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" type="email" className="input-field mt-2" /></label>
            <label className="block text-sm font-medium text-gray-300 sm:col-span-2">Password<input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="Create a password" type="password" className="input-field mt-2" /></label>
            <button disabled={loading} type="submit" className="w-full rounded-full py-3 sm:col-span-2 btn">{loading ? "Creating..." : "Create account"}</button>
          </form>
          <p className="mt-7 text-center text-sm text-gray-400">Already have an account? <Link to="/login" className="font-semibold text-[#d9ff65] hover:text-white">Sign in</Link></p>
        </section>
        <section className="relative order-1 overflow-hidden bg-[#d9ff65] p-8 text-[#202318] md:order-2 md:min-h-[610px] md:p-12">
          <div className="relative z-10 flex h-full flex-col justify-between"><div><p className="text-sm font-bold tracking-tight">BlogSphere</p><p className="mt-1 text-xs font-medium opacity-60">Stories are better when shared.</p></div><div><p className="mb-4 text-xs font-bold uppercase tracking-[.18em] opacity-60">Join the community</p><h1 className="editorial-title max-w-sm text-5xl font-semibold leading-[.94] md:text-6xl">Make room for your next good idea.</h1></div><p className="text-sm font-medium">Your voice belongs here.</p></div>
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full border-[28px] border-[#202318]/15" />
          <div className="absolute bottom-12 right-12 h-16 w-16 rounded-full bg-[#202318]/10" />
        </section>
      </div>
    </div>
  );
}
