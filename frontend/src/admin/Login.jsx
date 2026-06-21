import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Mail, Lock, LogIn } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/admin/login", {
        email,
        password
      });

      localStorage.setItem("adminToken", res.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please verify your admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4">
      {/* Visual background grids */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Operations Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-violet-600/20 text-violet-400 rounded-2xl border border-violet-500/20 shadow-lg shadow-violet-500/10 mb-3">
            <ShieldAlert size={36} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
            Operations Panel
          </h1>
          <p className="text-slate-400 text-sm mt-1">StreetWheels Admin Command Center</p>
        </div>

        {/* Card */}
        <div className="glass-premium p-8 rounded-3xl">
          <h2 className="text-xl font-semibold text-white mb-2">System Sign-In</h2>
          <p className="text-slate-400 text-sm mb-6">Access central fleet control databases and booking queues.</p>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Operator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="admin@streetwheels.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full bg-slate-900/50 border border-slate-700/60 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-slate-600 outline-none transition-all text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Secret Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full bg-slate-900/50 border border-slate-700/60 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-slate-600 outline-none transition-all text-sm tracking-widest"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-2xl shadow-lg shadow-violet-600/25 hover:shadow-violet-600/35 flex items-center justify-center gap-2 transition-all cursor-pointer group text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In Operator</span>
                  <LogIn size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Action Link to Customer view */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs text-slate-500 hover:text-slate-400 font-semibold transition-colors"
          >
            ← Back to Customer Sign-In
          </a>
        </div>
      </div>
    </div>
  );
}