import { useEffect, useState } from "react";
import api from "../api/axios";
import AdminLayout from "./AdminLayout";
import { Trash2, AlertCircle, Sparkles, Fuel, Users } from "lucide-react";

export default function AdminCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = () => {
    setLoading(true);
    api.get("/cars")
      .then(res => {
        setCars(res.data.cars || []);
      })
      .catch(err => {
        console.error("Failed to load admin cars:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteCar = async (id, name) => {
    if (!window.confirm(`Are you sure you want to retire and delete ${name} from the fleet?`)) {
      return;
    }

    try {
      await api.delete(`/cars/${id}`);
      alert("Car deleted successfully");
      loadCars();
    } catch (err) {
      alert("Failed to delete car: " + (err.response?.data?.message || err.message));
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/cars/${id}/status`, { available: !currentStatus });
      alert("Vehicle availability status updated!");
      loadCars();
    } catch (err) {
      alert("Failed to toggle status: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Manage Fleet</h1>
            <p className="text-slate-400 text-sm font-medium">Verify system inventory assets, pricing ranges, and active status.</p>
          </div>
        </div>

        {/* Fleet Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="glass h-48 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-16 glass rounded-3xl border border-slate-800/80 max-w-md mx-auto">
            <AlertCircle size={40} className="mx-auto text-slate-500 mb-3" />
            <h4 className="text-md font-bold text-white mb-1">Fleet Inventory Empty</h4>
            <p className="text-slate-400 text-xs max-w-xs mx-auto">
              Register new vehicles to enable customer reservations in databases.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cars.map((car) => (
              <div
                key={car._id}
                className="glass p-5 rounded-3xl border border-slate-800/80 flex flex-col justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div className="flex gap-4">
                  {/* Vehicle Thumbnail */}
                  {car.image ? (
                    <img
                      src={`http://localhost:5001/uploads/${car.image}`}
                      alt={car.carName}
                      className="w-28 aspect-video object-cover rounded-xl bg-slate-900 border border-slate-800 shrink-0"
                    />
                  ) : (
                    <div className="w-28 aspect-video bg-slate-950 text-[10px] text-slate-600 flex items-center justify-center font-bold uppercase rounded-xl border border-slate-900 shrink-0">
                      No Photo
                    </div>
                  )}

                  {/* Vehicle Meta details */}
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-slate-950 text-white text-[9px] font-extrabold uppercase rounded-md tracking-wider border border-slate-850">
                      {car.brand || "Fleet Asset"}
                    </span>
                    <h3 className="text-md font-bold text-white pt-1">{car.carName}</h3>
                    
                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1 uppercase">
                        <Fuel size={12} className="text-violet-500/50" />
                        <span>{car.fuelType || "Petrol"}</span>
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                      <span className="flex items-center gap-1">
                        <Users size={12} className="text-violet-500/50" />
                        <span>{car.seats || 5} Seats</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pricing & Control row */}
                <div className="flex items-center justify-between border-t border-slate-900 pt-4 mt-2">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Daily Cost</span>
                      <span className="text-lg font-bold text-white">₹{car.pricePerDay}</span>
                    </div>
                    
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Status</span>
                      <button
                        type="button"
                        onClick={() => toggleStatus(car._id, car.available)}
                        className={`mt-0.5 px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border cursor-pointer ${
                          car.available 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}
                      >
                        {car.available ? "Active" : "Maintenance"}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteCar(car._id, car.carName)}
                    className="p-2.5 bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-600 rounded-xl border border-rose-500/20 hover:border-rose-600 transition-all cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Trash2 size={14} />
                    <span>Retire Car</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}