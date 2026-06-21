import { useEffect, useState } from "react";
import api from "../api/axios";
import AdminLayout from "./AdminLayout";
import { Check, X, Clock, AlertCircle, Phone, Calendar, MapPin, Compass } from "lucide-react";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    setLoading(true);
    api.get("/admin/bookings")
      .then(res => {
        setBookings(res.data.bookings || []);
      })
      .catch(err => {
        console.error("Failed to load admin bookings:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const updateStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this booking as ${status}?`)) {
      return;
    }

    try {
      await api.put(`/admin/bookings/${id}`, { status });
      alert(`Booking updated to ${status}`);
      loadBookings();
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Cancelled":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "Completed":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      default: // Pending
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Bookings Queue</h1>
          <p className="text-slate-400 text-sm font-medium">Verify customer rental requests and approve active contracts.</p>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="glass h-40 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 glass rounded-3xl border border-slate-800/80 max-w-md mx-auto">
            <AlertCircle size={40} className="mx-auto text-slate-500 mb-3" />
            <h4 className="text-md font-bold text-white mb-1">Queue Empty</h4>
            <p className="text-slate-400 text-xs max-w-xs mx-auto">No customer reservation records were found in the database.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const pickupDate = b.pickupDateTime ? new Date(b.pickupDateTime).toLocaleString() : "N/A";
              const returnDate = b.returnDateTime ? new Date(b.returnDateTime).toLocaleString() : "N/A";
              
              return (
                <div
                  key={b._id}
                  className="glass p-6 rounded-3xl border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  {/* Left: Car & Client info */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(b.status)}`}>
                        {b.status}
                      </span>
                      <span className="text-xs text-slate-500 font-mono select-all">ID: {b._id}</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-md font-bold text-white">{b.carId?.carName || "Retired Car"}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Phone size={13} className="text-violet-500/50" />
                        <span>Client Phone: <strong className="text-white select-all">+{b.userId?.phone || "N/A"}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Compass size={13} className="text-violet-500/50" />
                        <span>Trip Route: <strong className="text-white">{b.destination || "Local"}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Pickup dates info */}
                  <div className="space-y-2 text-xs text-slate-400 md:border-l md:border-r border-slate-900 md:px-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-violet-400 shrink-0" />
                      <span>Pickup: <strong className="text-slate-200">{b.pickupLocation}</strong> ({pickupDate})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-rose-400 shrink-0" />
                      <span>Return: <strong className="text-slate-200">{b.returnLocation}</strong> ({returnDate})</span>
                    </div>
                  </div>

                  {/* Right: Actions and pricing */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 w-full md:w-auto border-t md:border-t-0 border-slate-900 pt-4 md:pt-0 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Authorized Charge</span>
                      <span className="text-lg font-bold text-violet-400">₹{b.totalPrice}</span>
                      <span className="block text-[10px] text-slate-500">({b.totalDays} Day{b.totalDays > 1 ? "s" : ""})</span>
                    </div>

                    {b.status === "Pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateStatus(b._id, "Confirmed")}
                          className="p-2 bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/20 text-emerald-400 hover:text-white rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
                        >
                          <Check size={14} />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => updateStatus(b._id, "Cancelled")}
                          className="p-2 bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 text-rose-400 hover:text-white rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
                        >
                          <X size={14} />
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}