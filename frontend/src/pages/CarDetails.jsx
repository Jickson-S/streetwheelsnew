import { useEffect, useState } from "react";
import api from "../api/axios";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Users, Fuel, Sparkles, Shield, ArrowLeft, CheckCircle2, BadgePercent, Zap, Star } from "lucide-react";

export default function CarDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const [car, setCar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/cars/${id}`),
      api.get(`/cars/${id}/reviews`)
    ]).then(([carRes, reviewRes]) => {
      setCar(carRes.data.car);
      setReviews(reviewRes.data.reviews || []);
    }).catch(err => {
      console.error("Failed to load details:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, [id]);

  const handleBook = () => {
    navigate(`/booking/${id}`, { state });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Car Not Found</h2>
          <p className="text-slate-400 mb-6">The vehicle you are looking for does not exist or has been removed.</p>
          <Link to="/cars" className="px-6 py-2 bg-violet-600 rounded-xl text-sm font-semibold">Back to Fleet</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Back Link */}
        <Link to="/cars" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 group transition-colors">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Fleet</span>
        </Link>

        {/* Detailed Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Title & Brand Panel */}
            <div className="glass p-6 rounded-3xl border border-slate-800/80">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                <span className="px-2.5 py-1 bg-violet-600/10 border border-violet-500/20 text-violet-400 text-xs font-semibold rounded-lg uppercase tracking-wider">
                  {car.brand || "Verified Fleet"}
                </span>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                  car.available 
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                    : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                }`}>
                  {car.available ? "Available Now" : "Currently Rented"}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                {car.carName}
              </h1>
              {reviews.length > 0 && (
                <div className="flex items-center gap-1 mt-2 text-sm text-amber-400 font-bold">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  <span>
                    {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                  </span>
                  <span className="text-slate-500 text-xs font-medium">({reviews.length} Customer Reviews)</span>
                </div>
              )}
            </div>

            {/* Showcase Image Panel */}
            <div className="glass rounded-3xl overflow-hidden border border-slate-800/80 aspect-video bg-slate-900 flex items-center justify-center relative">
              {car.image ? (
                <img
                  src={`http://localhost:5001/uploads/${car.image}`}
                  alt={car.carName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-slate-600 tracking-wider text-sm font-semibold uppercase">No Image Available</span>
              )}
            </div>

            {/* Spec Sheet Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-center space-y-1">
                <Users className="mx-auto text-violet-400 mb-1" size={20} />
                <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Seating Capacity</span>
                <span className="text-sm font-bold text-white">{car.seats || 5} Seats</span>
              </div>
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-center space-y-1">
                <Fuel className="mx-auto text-violet-400 mb-1" size={20} />
                <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fuel System</span>
                <span className="text-sm font-bold text-white uppercase">{car.fuelType || "Petrol"}</span>
              </div>
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-center space-y-1">
                <Sparkles className="mx-auto text-violet-400 mb-1" size={20} />
                <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Transmission</span>
                <span className="text-sm font-bold text-white">{car.transmission || "Automatic"}</span>
              </div>
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-center space-y-1">
                <Shield className="mx-auto text-violet-400 mb-1" size={20} />
                <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Safety Status</span>
                <span className="text-sm font-bold text-white">Dual Airbags</span>
              </div>
            </div>

            {/* Description & Host details */}
            <div className="glass p-6 rounded-3xl border border-slate-800/80 space-y-4">
              <h3 className="text-lg font-bold text-white">Rental Policy & Inclusion</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Free Cancellation up to 24h before pick-up</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Zero Security Deposit structure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Speed limit capped at 120 km/hr</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Clean car guarantee inside out</span>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="glass p-6 rounded-3xl border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <h3 className="text-lg font-bold text-white">Customer Reviews</h3>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1 text-xs bg-violet-600/10 border border-violet-500/20 text-violet-400 font-bold px-3 py-1 rounded-xl">
                    <Star size={12} className="fill-violet-400 text-violet-400" />
                    <span>
                      {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} ({reviews.length})
                    </span>
                  </div>
                )}
              </div>
              
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No reviews for this vehicle yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {reviews.map((r) => (
                    <div key={r._id} className="border-b border-slate-900/50 pb-3 last:border-b-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">{r.userId?.name || "Verified Customer"}</span>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-800"}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">{r.comment || "No comment left."}</p>
                      <span className="block text-[9px] text-slate-600">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Pricing & Booking Card (Side panel) */}
          <div className="space-y-6">
            
            {/* Booking Action Card */}
            <div className="glass-premium p-6 rounded-3xl border border-slate-800/80 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/10 rounded-full blur-2xl"></div>

              <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest block mb-1">Total Rate</span>
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-3xl font-black text-white">₹{car.pricePerDay}</span>
                <span className="text-slate-400 text-sm">/ day</span>
              </div>

              {/* Offer Alerts */}
              <div className="mb-6 p-4.5 bg-violet-600/10 border border-violet-500/20 rounded-2xl space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <BadgePercent size={18} className="text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Unlimited Kilometers</span>
                    Enjoy unlimited driving range on your rental duration.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <Zap size={18} className="text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Instant Approval</span>
                    WhatsApp confirmation within 10 minutes.
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleBook}
                disabled={!car.available}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-2xl shadow-lg shadow-violet-600/20 hover:shadow-violet-600/35 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
              >
                <span>{car.available ? "Rent Vehicle" : "Currently Unavailable"}</span>
              </button>

              <p className="text-[10px] text-slate-500 text-center mt-3">
                Prices exclude tolls, parking fees, and dynamic state entry taxes.
              </p>
            </div>

            {/* Quick Support Widget */}
            <div className="glass p-6 rounded-3xl border border-slate-800/80">
              <h4 className="text-sm font-bold text-white mb-2">Need Assistance?</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Chat with our customer service operations if you have questions about trip coverage or custom rates.
              </p>
              <a
                href={`https://wa.me/${import.meta.env.VITE_BOT1_NUMBER || "916369121707"}`}
                target="_blank"
                rel="noreferrer"
                className="block text-center text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors border border-violet-500/20 hover:border-violet-500/40 py-2.5 rounded-xl bg-violet-600/5"
              >
                Contact Support Bot
              </a>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}