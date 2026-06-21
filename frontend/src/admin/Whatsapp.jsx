import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import api from "../api/axios";
import { MessageSquare, RefreshCw, CheckCircle, AlertTriangle, Wifi, WifiOff, Clock, AlertCircle } from "lucide-react";

export default function Whatsapp() {
  const [bots, setBots] = useState({ bot1: null, bot2: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const fetchStatus = async () => {
    try {
      const response = await api.get("/whatsapp/status");
      if (response.data && response.data.success) {
        setBots(response.data.data);
        setError(null);
      } else {
        setError("Failed to fetch WhatsApp bot status.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to WhatsApp API. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll status every 5 seconds
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReconnect = async (botName) => {
    setActionLoading((prev) => ({ ...prev, [botName]: true }));
    try {
      const response = await api.post(`/whatsapp/reconnect/${botName}`);
      if (response.data && response.data.success) {
        setBots((prev) => ({
          ...prev,
          [botName]: response.data.data
        }));
      }
    } catch (err) {
      console.error(err);
      alert(`Failed to reconnect ${botName}: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [botName]: false }));
      fetchStatus();
    }
  };

  const getStatusBadge = (bot) => {
    if (!bot) return null;
    if (bot.ready || bot.connected) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-emerald-400 text-xs font-semibold">
          <Wifi size={12} className="animate-pulse" />
          <span>Connected</span>
        </span>
      );
    }
    if (bot.reconnecting) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/25 rounded-full text-amber-400 text-xs font-semibold">
          <RefreshCw size={12} className="animate-spin" />
          <span>Reconnecting</span>
        </span>
      );
    }
    if (bot.qr) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 border border-violet-500/25 rounded-full text-violet-400 text-xs font-semibold">
          <Clock size={12} />
          <span>Awaiting QR Scan</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/25 rounded-full text-rose-400 text-xs font-semibold">
        <WifiOff size={12} />
        <span>Offline</span>
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30 p-6 rounded-3xl border border-slate-900">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
              <MessageSquare className="text-violet-400" />
              <span>WhatsApp Bot Monitor</span>
            </h1>
            <p className="text-slate-400 text-sm">Monitor bot connectivity, view registration QR codes, and manage recovery sessions.</p>
          </div>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-slate-200 hover:text-white transition-all text-sm font-semibold cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        {/* Global Error message */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">System Connection Issue</p>
              <p className="text-rose-400/80">{error}</p>
            </div>
          </div>
        )}

        {/* Bot status list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {["bot1", "bot2"].map((botName) => {
            const bot = bots[botName];
            const isReconnecting = actionLoading[botName] || (bot && bot.reconnecting);

            return (
              <div key={botName} className="glass p-6 rounded-3xl border border-slate-800/80 space-y-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white capitalize">{botName}</h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {botName === "bot1" ? "Primary OTP & Notification bot" : "Backup / Secondary operations bot"}
                      </p>
                    </div>
                    {getStatusBadge(bot)}
                  </div>

                  {/* Details */}
                  {bot ? (
                    <div className="space-y-4">
                      {/* QR Display */}
                      {bot.qr && !bot.ready && (
                        <div className="flex flex-col items-center bg-slate-950/60 p-6 rounded-2xl border border-slate-900 space-y-3">
                          <p className="text-xs text-slate-400 text-center font-medium">
                            Scan the QR code below using your WhatsApp Linked Devices screen.
                          </p>
                          <div className="p-3 bg-white rounded-2xl inline-block shadow-inner">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(bot.qr)}`}
                              alt={`WhatsApp QR code for ${botName}`}
                              className="w-48 h-48 block"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      )}

                      {/* Connection success state */}
                      {bot.ready && (
                        <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 flex items-start gap-3">
                          <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-emerald-400">Authenticated & Ready</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              This bot is successfully authenticated. It is fully operational and capable of sending notifications.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Error state */}
                      {bot.error && (
                        <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/10 flex items-start gap-3">
                          <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-rose-400">Client Exception Encountered</p>
                            <p className="text-xs text-slate-400 break-words mt-0.5 animate-pulse">
                              {bot.error}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="pt-2 border-t border-slate-900/60 flex justify-between items-center text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>Last Health Check</span>
                        </span>
                        <span>
                          {bot.lastUpdated ? new Date(bot.lastUpdated).toLocaleTimeString() : "Never"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-500 text-sm">
                      No client telemetry data received. Ensure process runtime is healthy.
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-900/60 flex gap-3">
                  <button
                    onClick={() => handleReconnect(botName)}
                    disabled={isReconnecting}
                    className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
                  >
                    <RefreshCw size={14} className={isReconnecting ? "animate-spin" : ""} />
                    <span>{isReconnecting ? "Initializing..." : "Force Reconnect"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
