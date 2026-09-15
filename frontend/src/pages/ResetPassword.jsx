import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setMsg("");
    setError("");

    try {
      const res = await API.put(`/auth/resetpassword/${token}`, { password });
      setMsg("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8">
        <p className="eyebrow mb-3 text-center">Account recovery</p><h2 className="editorial-title mb-6 text-center text-4xl font-semibold text-white">Choose a new password.</h2>
        
        {msg && <div className="bg-green-500/10 text-green-400 p-3 rounded mb-4">{msg}</div>}
        {error && <div className="bg-red-500/10 text-red-400 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 mb-2">New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? "Reset Password" : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
