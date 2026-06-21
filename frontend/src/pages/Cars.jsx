import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Users, Fuel, Sparkles, Filter, ShieldCheck, MapPin } from "lucide-react";

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFuel, setSelectedFuel] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const { state } = useLocation();

  useEffect(() => {
    setLoading(true);
    const endpoint = state?.pickupDateTime && state?.returnDateTime 
      ? "/cars/available" 
      : "/cars";
      
    const params = state?.pickupDateTime && state?.returnDateTime
      ? { pickupDateTime: state.pickupDateTime, returnDateTime: state.returnDateTime }
      : {};

    api.get(endpoint, { params })
      .then(res => {
        setCars(res.data.cars || []);
      })
      .catch(err => {
        console.error("Failed to load cars:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [state]);

  // Filter lists
  const brands = ["All", ...new Set(cars.map(c => c.brand).filter(Boolean))];
  const fuels = ["All", ...new Set(cars.map(c => c.fuelType).filter(Boolean))];

  const filteredCars = cars.filter(car => {
    const matchesFuel = selectedFuel === "All" || car.fuelType === selectedFuel;
    const matchesBrand = selectedBrand === "All" || car.brand === selectedBrand;
    return matchesFuel && matchesBrand;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Banner with pickup info if searched */}
        {state && (state.pickup || state.drop) && (
          <div className="mb-8 p-4 bg-violet-600/10 border border-violet-500/20 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <MapPin size={18} className="text-violet-400" />
              <span>Showing available cars from <strong className="text-white">{state.pickup || "Anywhere"}</strong> to <strong className="text-white">{state.drop || "Anywhere"}</strong></span>
            </div>
            <div className="px-3 py-1 bg-violet-600/20 border border-violet-500/30 text-violet-400 text-xs font-semibold rounded-lg">
              Verified Routes
            </div>
          </div>
        )}

        {/* Page Header & Filter controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Explore Our Fleet</h1>
            <p className="text-slate-400 text-sm">Select the perfect ride for your next journey.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Brand Filter */}
            <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-800">
              <Filter size={14} className="text-slate-400" />
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-transparent text-xs text-slate-200 outline-none pr-4 cursor-pointer"
              >
                <option value="All" className="bg-slate-900 text-white">All Brands</option>
                {brands.map(b => (
                  <option key={b} value={b} className="bg-slate-900 text-white">{b}</option>
                ))}
              </select>
            </div>

            {/* Fuel Filter */}
            <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-800">
              <Fuel size={14} className="text-slate-400" />
              <select
                value={selectedFuel}
                onChange={(e) => setSelectedFuel(e.target.value)}
                className="bg-transparent text-xs text-slate-200 outline-none pr-4 cursor-pointer"
              >
                <option value="All" className="bg-slate-900 text-white">All Fuels</option>
                {fuels.map(f => (
                  <option key={f} value={f} className="bg-slate-900 text-white">{f}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Fleet Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass border border-slate-800/80 rounded-3xl h-96 animate-pulse"></div>
            ))}
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-20 glass-premium rounded-3xl border border-slate-800/80 max-w-xl mx-auto">
            <Users size={48} className="mx-auto text-slate-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Cars Found</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto mb-6">
              We couldn't find any vehicles matching your selection. Try clearing filters or try again later.
            </p>
            <button
              onClick={() => { setSelectedBrand("All"); setSelectedFuel("All"); }}
              className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredCars.map(car => (
              <div
                key={car._id}
                className="glass rounded-3xl overflow-hidden border border-slate-800/80 hover:border-violet-500/40 shadow-md hover:shadow-xl hover:shadow-violet-500/5 transition-all group flex flex-col justify-between"
              >
                {/* Image panel */}
                <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden border-b border-slate-800/80">
                  {car.image ? (
                    <img
                      src={`http://localhost:5001/uploads/${car.image}`}
                      alt={car.carName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-slate-600 text-xs uppercase tracking-widest font-semibold flex flex-col items-center gap-1">
                      <span>No Vehicle Image</span>
                    </div>
                  )}
                  {/* Brand tag overlay */}
                  <div className="absolute top-4 left-4 bg-slate-950/80 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border border-slate-800">
                    {car.brand || "Standard"}
                  </div>
                  {/* Availability banner */}
                  {!car.available && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-rose-500/90 text-white font-bold text-xs uppercase tracking-wider px-4 py-1.5 rounded-full border border-rose-400/20 shadow-lg">
                        Currently Rented
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors">
                      {car.carName}
                    </h3>

                    {/* Features row */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Users size={14} className="text-violet-500/60" />
                        <span>{car.seats || 5} Seats</span>
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                      <span className="flex items-center gap-1 uppercase">
                        <Fuel size={14} className="text-violet-500/60" />
                        <span>{car.fuelType || "Petrol"}</span>
                      </span>
                      {car.transmission && (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                          <span className="text-[10px] bg-slate-900 border border-slate-800/80 text-slate-300 font-bold px-1.5 py-0.5 rounded uppercase">
                            {car.transmission === "Automatic" ? "Auto" : "Manual"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-900">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
                        Rate Per Day
                      </span>
                      <span className="text-xl font-extrabold text-white">
                        ₹{car.pricePerDay}
                      </span>
                    </div>

                    <Link
                      to={`/car/${car._id}`}
                      state={state}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-violet-600/10 hover:shadow-violet-600/20 transition-all cursor-pointer"
                    >
                      <Sparkles size={13} />
                      <span>Select Car</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}