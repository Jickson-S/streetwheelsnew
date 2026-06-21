import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { Car, Smartphone, ArrowRight, ShieldCheck, User, Lock, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, phone, password, confirmPassword } = form;

    if (!name || !phone || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (!/^\d{10,12}$/.test(phone)) {
      setError("Please enter a valid phone number (10-12 digits without +)");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/register", {
        name,
        phone,
        password
      });

      localStorage.setItem("token", res.data.token);

      // Since profile is complete with name, check if they need email/driving license setup
      if (!res.data.user?.email || !res.data.user?.drivingLicense) {
        navigate("/complete-profile");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 px-4 py-12 relative overflow-hidden">
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

        {/* Registration Card */}
        <div className="glass-premium p-8 rounded-3xl shadow-2xl border border-slate-800/80">
          <h2 className="text-xl font-semibold text-white mb-2">Create Account</h2>
          <p className="text-slate-400 text-sm mb-6">Register to get started on your premium driving journey.</p>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (error) setError("");
                  }}
                  className="w-full bg-slate-900/50 border border-slate-700/60 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-slate-500 outline-none transition-all text-sm"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Phone Number Input */}
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
                  value={form.phone}
                  onChange={(e) => {
                    setForm({ ...form, phone: e.target.value.replace(/\D/g, "") });
                    if (error) setError("");
                  }}
                  className="w-full bg-slate-900/50 border border-slate-700/60 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-slate-500 outline-none transition-all text-sm"
                  disabled={loading}
                  required
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
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
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (error) setError("");
                  }}
                  className="w-full bg-slate-900/50 border border-slate-700/60 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 pl-11 pr-10 text-white placeholder-slate-500 outline-none transition-all text-sm"
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

            {/* Confirm Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={(e) => {
                    setForm({ ...form, confirmPassword: e.target.value });
                    if (error) setError("");
                  }}
                  className="w-full bg-slate-900/50 border border-slate-700/60 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 pl-11 pr-10 text-white placeholder-slate-500 outline-none transition-all text-sm"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-2xl shadow-lg shadow-violet-600/25 hover:shadow-violet-600/35 flex items-center justify-center gap-2 transition-all cursor-pointer group text-sm mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Login Redirection */}
          <p className="text-xs text-slate-400 text-center mt-6">
            Already have an account?{" "}
            <Link to="/" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mt-6">
          <ShieldCheck size={14} className="text-violet-500/60" />
          <span>Secured Encrypted Authentication</span>
        </div>
      </div>
    </div>
  );
}
