import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { KeyRound, Smartphone, Lock, Eye, EyeOff, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = Enter Phone, 2 = Verify Code & Reset Password
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!phone) {
      setError("Phone number is required");
      return;
    }

    if (!/^\d{10,12}$/.test(phone)) {
      setError("Please enter a valid phone number (10-12 digits without +)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/forgot-password", { phone });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to request code. Is this phone number registered?");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || !password || !confirmPassword) {
      setError("All fields are required");
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
      await api.post("/auth/reset-password", {
        phone,
        otp,
        password
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 3500);
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed. Please check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 px-4 relative overflow-hidden">
      {/* Background blur blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-violet-600/20 text-violet-400 rounded-2xl border border-violet-500/20 shadow-lg shadow-violet-500/10 mb-3">
            <KeyRound size={36} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
            Reset Password
          </h1>
          <p className="text-slate-400 text-sm mt-1">Recover your customer account</p>
        </div>

        {/* Card */}
        <div className="glass-premium p-8 rounded-3xl shadow-2xl border border-slate-800/80">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center justify-center p-3 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 mb-2">
                <CheckCircle size={44} className="animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-white">Password Updated!</h2>
              <p className="text-slate-400 text-sm">
                Your password has been reset successfully. Redirecting you back to the sign-in screen...
              </p>
              <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto mt-4"></div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">
                {step === 1 ? "Forgot Password?" : "Verify Reset Code"}
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                {step === 1
                  ? "Enter your registered phone number. We will send a security code to your WhatsApp to verify your account."
                  : `Please enter the 6-digit code sent to +${phone} and set a new password.`}
              </p>

              {error && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span>{error}</span>
                </div>
              )}

              {step === 1 ? (
                /* Step 1: Request OTP Form */
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Registered Phone
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                        <Smartphone size={18} />
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="916369xxxxxx"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/\D/g, ""));
                          if (error) setError("");
                        }}
                        className="w-full bg-slate-900/50 border border-slate-700/60 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 outline-none transition-all text-sm"
                        disabled={loading}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1.5">
                      Include country code (e.g., 91 for India) without + symbol.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-2xl shadow-lg shadow-violet-600/25 hover:shadow-violet-600/35 flex items-center justify-center gap-2 transition-all cursor-pointer group text-sm"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Send Reset Code</span>
                        <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Enter OTP and Reset Password Form */
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* OTP Code Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Verification Code
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                        <Lock size={18} />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        maxLength={6}
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/\D/g, ""));
                          if (error) setError("");
                        }}
                        className="w-full bg-slate-900/50 border border-slate-700/60 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 outline-none transition-all text-sm tracking-widest font-semibold"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* New Password Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError("");
                        }}
                        className="w-full bg-slate-900/50 border border-slate-700/60 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3.5 pl-11 pr-10 text-white placeholder-slate-500 outline-none transition-all text-sm"
                        disabled={loading}
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
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError("");
                        }}
                        className="w-full bg-slate-900/50 border border-slate-700/60 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3.5 pl-11 pr-10 text-white placeholder-slate-500 outline-none transition-all text-sm"
                        disabled={loading}
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

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold py-3.5 px-4 rounded-2xl border border-slate-700/60 transition-all text-sm"
                      disabled={loading}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-2/3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-2xl shadow-lg shadow-violet-600/25 hover:shadow-violet-600/35 flex items-center justify-center gap-2 transition-all cursor-pointer group text-sm"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Reset Password</span>
                          <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* Return Links */}
          <div className="mt-6 text-center border-t border-slate-800/80 pt-6">
            <Link
              to="/"
              className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors"
            >
              ← Back to Sign-In
            </Link>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mt-6">
          <ShieldCheck size={14} className="text-violet-500/60" />
          <span>Secured Account Recovery</span>
        </div>
      </div>
    </div>
  );
}
