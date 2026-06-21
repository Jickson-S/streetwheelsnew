import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { Car, Calendar, Compass, PlusCircle, ArrowRight, ShieldCheck, Sparkles, Server } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: "Fleet Vehicles", count: "12", subText: "Active in database", color: "text-violet-400 bg-violet-600/10 border-violet-500/15" },
    { label: "System Bookings", count: "48", subText: "Total reservations", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/15" },
    { label: "Completed Trips", count: "36", subText: "Historical logs", color: "text-blue-400 bg-blue-500/10 border-blue-500/15" }
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30 p-6 rounded-3xl border border-slate-900">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Central Console</h1>
            <p className="text-slate-400 text-sm">System diagnostic metrics and rapid administrative shortcuts.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-semibold">
            <Server size={14} className="animate-pulse" />
            <span>Core Engines Operational</span>
          </div>
        </div>

        {/* Diagnostic Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="glass p-6 rounded-3xl border border-slate-800/80 space-y-2">
              <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">{stat.label}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{stat.count}</span>
                <span className="text-slate-400 text-xs">{stat.subText}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Action Shortcuts */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Operations Shortcuts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Shortcut 1 */}
            <button
              onClick={() => navigate("/admin/bookings")}
              className="glass p-6 rounded-3xl border border-slate-800/80 hover:border-violet-500/30 text-left space-y-4 group transition-all cursor-pointer"
            >
              <div className="p-3 bg-violet-600/10 text-violet-400 border border-violet-500/20 rounded-2xl inline-block">
                <Calendar size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white group-hover:text-violet-400 transition-colors flex items-center gap-1">
                  <span>Manage Booking Queue</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </h4>
                <p className="text-xs text-slate-400 mt-1">Review pending customer reservation requests and approve/cancel actions.</p>
              </div>
            </button>

            {/* Shortcut 2 */}
            <button
              onClick={() => navigate("/admin/cars")}
              className="glass p-6 rounded-3xl border border-slate-800/80 hover:border-violet-500/30 text-left space-y-4 group transition-all cursor-pointer"
            >
              <div className="p-3 bg-violet-600/10 text-violet-400 border border-violet-500/20 rounded-2xl inline-block">
                <Car size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white group-hover:text-violet-400 transition-colors flex items-center gap-1">
                  <span>Manage Fleet Vehicles</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </h4>
                <p className="text-xs text-slate-400 mt-1">View currently loaded cars, edit parameters, or delete retired units.</p>
              </div>
            </button>

            {/* Shortcut 3 */}
            <button
              onClick={() => navigate("/admin/add-car")}
              className="glass p-6 rounded-3xl border border-slate-800/80 hover:border-violet-500/30 text-left space-y-4 group transition-all cursor-pointer"
            >
              <div className="p-3 bg-violet-600/10 text-violet-400 border border-violet-500/20 rounded-2xl inline-block">
                <PlusCircle size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white group-hover:text-violet-400 transition-colors flex items-center gap-1">
                  <span>Add Fleet Vehicle</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </h4>
                <p className="text-xs text-slate-400 mt-1">Register a new rental vehicle into database with image assets and pricing specifications.</p>
              </div>
            </button>

            {/* Shortcut 4 */}
            <button
              onClick={() => navigate("/admin/trips")}
              className="glass p-6 rounded-3xl border border-slate-800/80 hover:border-violet-500/30 text-left space-y-4 group transition-all cursor-pointer"
            >
              <div className="p-3 bg-violet-600/10 text-violet-400 border border-violet-500/20 rounded-2xl inline-block">
                <Compass size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white group-hover:text-violet-400 transition-colors flex items-center gap-1">
                  <span>Log Trip Records</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </h4>
                <p className="text-xs text-slate-400 mt-1">Submit post-trip logs including starting/ending odometer readings, tolls, and margin checks.</p>
              </div>
            </button>

          </div>
        </div>

      </div>
    </AdminLayout>
  );
}