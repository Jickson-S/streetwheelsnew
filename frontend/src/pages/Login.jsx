import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { Car, Smartphone, ArrowRight, ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      setError("Phone number and password are required");
      return;
    }
    
    // Simple validation for phone numbers
    if (!/^\d{10,12}$/.test(phone)) {
      setError("Please enter a valid phone number (10-12 digits without +)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { phone, password });
      localStorage.setItem("token", res.data.token);

      // If user profile is not complete, route to Profile completion page
      if (!res.data.user?.email || !res.data.user?.drivingLicense) {
        navigate("/complete-profile");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 px-4 relative overflow-hidden">
      {/* Background blobs for premium depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-violet-600/20 text-violet-400 rounded-2xl border border-violet-500/20 shadow-lg shadow-violet-500/10 mb-3">
            <Car size={36} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
            Street<span className="text-violet-400">Wheels</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Premium Self-Drive Car Rentals</p>
        </div>

        {/* Login Card */}
        <div className="glass-premium p-8 rounded-3xl shadow-2xl border border-slate-800/80">
          <h2 className="text-xl font-semibold text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400 text-sm mb-6">Enter your phone number and password to sign in.</p>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Phone Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Smartphone size={18} />
                </div>
                <input
                  type="tel"
                  placeholder="916369xxxxxx"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, ""));
                    if (error) setError("");
                  }}
                  className="w-full bg-slate-900/50 border border-slate-700/60 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 outline-none transition-all text-sm"
                  disabled={loading}
                  required
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                Include country code (e.g., 91 for India) without + symbol.
              </p>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full bg-slate-900/50 border border-slate-700/60 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3.5 pl-11 pr-10 text-white placeholder-slate-500 outline-none transition-all text-sm"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Recovery / Forgot password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-2xl shadow-lg shadow-violet-600/25 hover:shadow-violet-600/35 flex items-center justify-center gap-2 transition-all cursor-pointer group text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <p className="text-xs text-slate-400 text-center mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
              Register Here
            </Link>
          </p>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mt-6">
          <ShieldCheck size={14} className="text-violet-500/60" />
          <span>Secured Account Authentication</span>
        </div>
      </div>
    </div>
  );
}