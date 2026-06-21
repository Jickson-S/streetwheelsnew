import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { MapPin, Search, Calendar, Shield, Sparkles, Compass } from "lucide-react";

export default function Home() {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [pickupDateTime, setPickupDateTime] = useState("");
  const [returnDateTime, setReturnDateTime] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!pickupDateTime || !returnDateTime) {
      setError("Please specify search dates.");
      return;
    }
    if (new Date(pickupDateTime) >= new Date(returnDateTime)) {
      setError("Return date must be after pickup date.");
      return;
    }
    // Navigate to /cars with search state
    navigate("/cars", { 
      state: { 
        pickup, 
        drop, 
        pickupDateTime, 
        returnDateTime 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <div className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-20 w-full flex flex-col lg:flex-row items-center gap-12 relative">
        <div className="absolute top-10 left-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>

        {/* Text Area */}
        <div className="flex-1 space-y-6 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-600/10 text-violet-400 border border-violet-500/20 rounded-full text-xs font-semibold">
            <Sparkles size={14} />
            <span>Premium Self-Drive Fleet</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Rent the Drive That <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Fits Your Style</span>
          </h1>
          
          <p className="text-slate-400 text-lg max-w-xl mx-auto lg:mx-0">
            Choose from a wide variety of fully verified, clean, and well-maintained self-drive cars. Instantly book your next adventure with zero security deposit.
          </p>

          {/* Core Values grid */}
          <div className="grid grid-cols-3 gap-4 pt-6 max-w-md mx-auto lg:mx-0">
            <div className="p-3 bg-slate-900/40 rounded-2xl border border-slate-800/80 text-center">
              <Shield className="mx-auto text-violet-400 mb-1" size={20} />
              <span className="block text-xs font-semibold text-white">Fully Insured</span>
            </div>
            <div className="p-3 bg-slate-900/40 rounded-2xl border border-slate-800/80 text-center">
              <Sparkles className="mx-auto text-violet-400 mb-1" size={20} />
              <span className="block text-xs font-semibold text-white">Clean & Sanitized</span>
            </div>
            <div className="p-3 bg-slate-900/40 rounded-2xl border border-slate-800/80 text-center">
              <Compass className="mx-auto text-violet-400 mb-1" size={20} />
              <span className="block text-xs font-semibold text-white">24/7 Roadside</span>
            </div>
          </div>
        </div>

        {/* Search Widget Card */}
        <div className="w-full max-w-lg lg:w-[480px] z-10">
          <div className="glass-premium p-8 rounded-3xl">
            <h3 className="text-xl font-bold text-white mb-2">Find Your Perfect Car</h3>
            <p className="text-slate-400 text-sm mb-6">Specify details to load verified available vehicles.</p>
            
            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSearch} className="space-y-4">
              {/* Pickup location */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Pickup Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <MapPin size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter city or airport"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Drop location */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Drop-off Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <MapPin size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Same as pickup or new location"
                    value={drop}
                    onChange={(e) => setDrop(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Date picks */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Pickup Date & Time
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Calendar size={16} />
                    </div>
                    <input
                      type="datetime-local"
                      required
                      value={pickupDateTime}
                      onChange={(e) => { setPickupDateTime(e.target.value); if (error) setError(""); }}
                      className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 pl-10 pr-3 text-white outline-none transition-all text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Return Date & Time
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Calendar size={16} />
                    </div>
                    <input
                      type="datetime-local"
                      required
                      value={returnDateTime}
                      onChange={(e) => { setReturnDateTime(e.target.value); if (error) setError(""); }}
                      className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 pl-10 pr-3 text-white outline-none transition-all text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full mt-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-4 px-4 rounded-2xl shadow-lg shadow-violet-600/25 hover:shadow-violet-600/35 flex items-center justify-center gap-2 transition-all cursor-pointer group text-sm"
              >
                <Search size={18} />
                <span>Search Available Cars</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}