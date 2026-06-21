import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { KeyRound, Lock, ArrowRight, RefreshCw } from "lucide-react";

export default function Otp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  
  const { state } = useLocation();
  const navigate = useNavigate();

  // Redirect to login if phone is missing
  useEffect(() => {
    if (!state || !state.phone) {
      navigate("/");
    }
  }, [state, navigate]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("OTP code is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/verify-otp", {
        phone: state.phone,
        otp
      });

      localStorage.setItem("token", res.data.token);

      // If user profile is not complete, route to Profile completion page
      if (!res.data.user?.name || !res.data.user?.email) {
        navigate("/complete-profile");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    try {
      await api.post("/auth/send-otp", { phone: state.phone });
      setTimer(60);
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const formattedPhone = state?.phone 
    ? `+${state.phone.slice(0, state.phone.length - 10)} ${state.phone.slice(-10, -5)}-${state.phone.slice(-5)}`
    : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 px-4">
      {/* Background blur blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-violet-600/20 text-violet-400 rounded-2xl border border-violet-500/20 shadow-lg shadow-violet-500/10 mb-3">
            <Lock size={36} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
            Verification
          </h1>
          <p className="text-slate-400 text-sm mt-1">Check your WhatsApp messaging application</p>
        </div>

        {/* Card */}
        <div className="glass-premium p-8 rounded-3xl">
          <h2 className="text-xl font-semibold text-white mb-2">Enter Verification Code</h2>
          <p className="text-slate-400 text-sm mb-6">
            We sent a 6-digit verification code to <span className="text-slate-200 font-semibold">{formattedPhone}</span>.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={verifyOtp} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                One-Time Password (OTP)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <KeyRound size={18} />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="------"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ""));
                    if (error) setError("");
                  }}
                  className="w-full bg-slate-900/50 border border-slate-700/60 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3.5 pl-11 pr-4 text-center tracking-[1em] font-mono text-xl text-white placeholder-slate-600 outline-none transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-2xl shadow-lg shadow-violet-600/25 hover:shadow-violet-600/35 flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Verify Code</span>
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Resend Action */}
          <div className="mt-8 text-center text-sm border-t border-slate-800/80 pt-6">
            <span className="text-slate-400">Didn't receive the message? </span>
            {timer > 0 ? (
              <span className="text-slate-500 font-medium">Resend OTP in {timer}s</span>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-violet-400 hover:text-violet-300 font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                {resendLoading && <RefreshCw size={12} className="animate-spin" />}
                <span>Resend OTP</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}