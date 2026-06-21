import { useEffect, useState } from "react";
import api from "../api/axios";
import AdminLayout from "./AdminLayout";
import { Compass, PlusCircle, AlertCircle, Calendar, ChevronRight, Calculator, FileSpreadsheet } from "lucide-react";

export default function Trips() {
  const [form, setForm] = useState({
    bookingId: "",
    startingKm: "",
    endingKm: "",
    tollAmount: 0,
    paymentWithoutToll: 0,
    timeIn: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString().substring(0, 16), // default hours back
    timeOut: new Date().toISOString().substring(0, 16),
    marginPayment: 0,
    remarks: ""
  });

  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = () => {
    setTripsLoading(true);
    api.get("/admin/trip")
      .then(res => {
        setTrips(res.data.trips || []);
      })
      .catch(err => {
        console.error("Failed to load trips:", err);
      })
      .finally(() => {
        setTripsLoading(false);
      });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.bookingId || !form.startingKm || !form.endingKm) {
      setError("Booking ID, Starting KM, and Ending KM are required.");
      return;
    }

    if (+form.endingKm <= +form.startingKm) {
      setError("Ending Odometer must be greater than Starting Odometer.");
      return;
    }

    if (new Date(form.timeOut) <= new Date(form.timeIn)) {
      setError("Trip End Time (Time Out) must be after Trip Start Time (Time In).");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.post("/admin/trip", {
        ...form,
        startingKm: +form.startingKm,
        endingKm: +form.endingKm,
        tollAmount: +form.tollAmount,
        paymentWithoutToll: +form.paymentWithoutToll,
        marginPayment: +form.marginPayment
      });

      alert("Trip logged successfully");
      setForm({
        bookingId: "",
        startingKm: "",
        endingKm: "",
        tollAmount: 0,
        paymentWithoutToll: 0,
        timeIn: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString().substring(0, 16),
        timeOut: new Date().toISOString().substring(0, 16),
        marginPayment: 0,
        remarks: ""
      });
      loadTrips();
    } catch (err) {
      setError("Failed to save trip: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Live previews
  const totalKm = form.startingKm && form.endingKm ? +form.endingKm - +form.startingKm : 0;
  const totalPayment = (+form.paymentWithoutToll || 0) + (+form.tollAmount || 0);

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Trip Records</h1>
          <p className="text-slate-400 text-sm font-medium">Log finalized rental trips, check mileage counts, and archive transactions.</p>
        </div>

        {/* Split Screen Container */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left: Input Form Panel */}
          <div className="lg:col-span-2 glass p-6 rounded-3xl border border-slate-800/80 space-y-6 self-start">
            <h3 className="text-lg font-bold text-white border-b border-slate-850 pb-3 flex items-center gap-2">
              <PlusCircle size={18} className="text-violet-400" />
              <span>Log Completed Trip</span>
            </h3>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              {/* Booking ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Booking ID</label>
                <input
                  type="text"
                  placeholder="e.g. 65dbxxxxxxx"
                  value={form.bookingId}
                  onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-2.5 px-4 text-slate-200 placeholder-slate-600 text-xs outline-none transition-all"
                  disabled={submitting}
                />
              </div>

              {/* starting/ending KM */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Starting Odo</label>
                  <input
                    type="number"
                    placeholder="km"
                    value={form.startingKm}
                    onChange={(e) => setForm({ ...form, startingKm: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-2.5 px-4 text-slate-200 placeholder-slate-600 text-xs outline-none transition-all text-center"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ending Odo</label>
                  <input
                    type="number"
                    placeholder="km"
                    value={form.endingKm}
                    onChange={(e) => setForm({ ...form, endingKm: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-2.5 px-4 text-slate-200 placeholder-slate-600 text-xs outline-none transition-all text-center"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* billing values */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Fare Amt</label>
                  <input
                    type="number"
                    placeholder="₹"
                    value={form.paymentWithoutToll}
                    onChange={(e) => setForm({ ...form, paymentWithoutToll: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-2.5 px-4 text-slate-200 placeholder-slate-600 text-xs outline-none transition-all text-center"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Toll Amt</label>
                  <input
                    type="number"
                    placeholder="₹"
                    value={form.tollAmount}
                    onChange={(e) => setForm({ ...form, tollAmount: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-2.5 px-4 text-slate-200 placeholder-slate-600 text-xs outline-none transition-all text-center"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Preview parameters card */}
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-900 text-xs space-y-2.5">
                <div className="flex items-center gap-1.5 text-slate-400 font-bold mb-1">
                  <Calculator size={13} className="text-violet-400" />
                  <span>Calculated Previews</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trip Distance:</span>
                  <span className="text-white font-bold">{totalKm > 0 ? `${totalKm} KM` : "--"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Billing Payment:</span>
                  <span className="text-emerald-400 font-bold">₹{totalPayment}</span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-2xl shadow-lg shadow-violet-600/20 flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Submit Log File</span>
                    <ChevronRight size={14} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: History List Panel */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-violet-400" />
              <span>Historical Archives</span>
            </h3>

            {tripsLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="glass h-24 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-12 glass rounded-3xl border border-slate-800/80">
                <AlertCircle size={32} className="mx-auto text-slate-600 mb-2" />
                <p className="text-xs text-slate-500">No trips logged in system files yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trips.map((t) => (
                  <div
                    key={t._id}
                    className="glass p-5 rounded-2xl border border-slate-800/80 text-xs text-slate-400 space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                      <span className="text-slate-500 font-medium font-mono select-all">
                        Booking: {typeof t.bookingId === "object" ? t.bookingId?._id : t.bookingId}
                      </span>
                      <span className="text-emerald-400 font-extrabold text-sm">₹{t.totalPayment}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">Trip Distance</span>
                        <strong className="text-slate-200">{t.totalKm} KM</strong>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">Odo Readings</span>
                        <strong className="text-slate-200">{t.startingKm} - {t.endingKm}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">Base Odometer</span>
                        <strong className="text-slate-200">₹{t.paymentWithoutToll}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">Toll Cost</span>
                        <strong className="text-slate-200">₹{t.tollAmount}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}