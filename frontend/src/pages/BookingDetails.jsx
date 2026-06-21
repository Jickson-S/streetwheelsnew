import { useEffect, useState } from "react";
import api from "../api/axios";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ArrowLeft, Compass, Calendar, MapPin, Receipt, CheckCircle2, XCircle, Clock, Milestone, ShieldCheck } from "lucide-react";

export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/bookings/${id}`),
      api.get(`/bookings/${id}/trip`)
    ]).then(([bookingRes, tripRes]) => {
      setBooking(bookingRes.data.booking);
      setTrip(tripRes.data.trip);
    }).catch(err => {
      console.error("Failed to load booking details:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, [id]);

  const getStatusStyles = (status) => {
    switch (status) {
      case "Confirmed":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
          icon: <CheckCircle2 size={16} />,
          label: "Confirmed Booking"
        };
      case "Cancelled":
        return {
          bg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
          icon: <XCircle size={16} />,
          label: "Cancelled Booking"
        };
      case "Completed":
        return {
          bg: "bg-blue-500/10 border-blue-500/20 text-blue-400",
          icon: <CheckCircle2 size={16} />,
          label: "Completed Ride"
        };
      default: // Pending
        return {
          bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
          icon: <Clock size={16} />,
          label: "Pending Verification"
        };
    }
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

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Booking Not Found</h2>
          <p className="text-slate-400 mb-6">We couldn't retrieve the reservation data.</p>
          <Link to="/profile" className="px-6 py-2 bg-violet-600 rounded-xl text-sm font-semibold">Back to Profile</Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusStyles(booking.status);
  const pickupDate = booking.pickupDateTime ? new Date(booking.pickupDateTime).toLocaleString() : "N/A";
  const returnDate = booking.returnDateTime ? new Date(booking.returnDateTime).toLocaleString() : "N/A";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full space-y-6">
        
        {/* Header Back link */}
        <Link to="/profile" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white group transition-colors">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Invoice Summary Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left: General Booking details */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Status card */}
            <div className={`p-6 rounded-3xl border flex items-center gap-4 ${statusInfo.bg}`}>
              <div className="p-3 bg-white/5 rounded-2xl">
                {statusInfo.icon}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest block opacity-70">Order Status</span>
                <h2 className="text-xl font-bold">{statusInfo.label}</h2>
              </div>
            </div>

            {/* Car specifications */}
            <div className="glass p-6 rounded-3xl border border-slate-800/80 space-y-4">
              <h3 className="text-md font-bold text-white border-b border-slate-850 pb-3">Car Details</h3>
              <div className="flex items-start gap-4">
                {booking.carId?.image ? (
                  <img
                    src={`http://localhost:5001/uploads/${booking.carId.image}`}
                    alt={booking.carId.carName}
                    className="w-32 aspect-video object-cover rounded-xl bg-slate-900 border border-slate-850 shrink-0"
                  />
                ) : (
                  <div className="w-32 aspect-video bg-slate-900 border border-slate-800/50 text-[10px] text-slate-600 flex items-center justify-center font-bold uppercase rounded-xl shrink-0">
                    No Image
                  </div>
                )}
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">{booking.carId?.brand || "Fleet"}</span>
                  <h4 className="text-lg font-bold text-white">{booking.carId?.carName || "Retired Vehicle"}</h4>
                  <p className="text-xs text-slate-400 mt-1 uppercase">Fuel System: {booking.carId?.fuelType || "Petrol"}</p>
                </div>
              </div>
            </div>

            {/* Route itinerary card */}
            <div className="glass p-6 rounded-3xl border border-slate-800/80 space-y-4">
              <h3 className="text-md font-bold text-white border-b border-slate-850 pb-3">Route Itinerary</h3>
              <div className="space-y-4 text-xs text-slate-400">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pickup Point</span>
                    <strong className="text-slate-200 text-sm">{booking.pickupLocation}</strong>
                    <span className="block text-[10px] text-slate-500 mt-0.5">{pickupDate}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Return Point</span>
                    <strong className="text-slate-200 text-sm">{booking.returnLocation}</strong>
                    <span className="block text-[10px] text-slate-500 mt-0.5">{returnDate}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Compass size={16} className="text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Trip Destination</span>
                    <strong className="text-slate-200 text-sm">{booking.destination || "Local Travel"}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Odometer logs if trip completed */}
            {trip && (
              <div className="glass p-6 rounded-3xl border border-slate-800/80 space-y-4">
                <h3 className="text-md font-bold text-white border-b border-slate-850 pb-3 flex items-center gap-1.5">
                  <Milestone size={18} className="text-violet-400" />
                  <span>Trip Odometer Summary</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-400">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Starting Odo</span>
                    <strong className="text-slate-200 text-sm">{trip.startingKm} KM</strong>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Ending Odo</span>
                    <strong className="text-slate-200 text-sm">{trip.endingKm} KM</strong>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Distance Driven</span>
                    <strong className="text-violet-400 text-sm">{trip.totalKm} KM</strong>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Duration Log</span>
                    <strong className="text-slate-200 text-sm">{(trip.durationHours || 0).toFixed(1)} hrs</strong>
                  </div>
                </div>
                {trip.remarks && (
                  <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-850 text-xs text-slate-500 mt-2">
                    <span className="font-bold text-slate-400 block mb-0.5">Remarks / Details</span>
                    {trip.remarks}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right: Invoice Summary details */}
          <div className="space-y-6">
            
            {/* Receipt invoice details */}
            <div className="glass-premium p-6 rounded-3xl border border-slate-800/80 space-y-6">
              <h3 className="text-md font-bold text-white border-b border-slate-850 pb-3 flex items-center gap-1.5">
                <Receipt size={18} className="text-violet-400" />
                <span>Invoice Details</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Base Rate</span>
                  <span className="text-slate-200">₹{booking.pricePerDay} / day</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span className="text-slate-200">{booking.totalDays} Day(s)</span>
                </div>
                {trip && trip.tollAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Toll Charges</span>
                    <span className="text-slate-200">₹{trip.tollAmount}</span>
                  </div>
                )}
                
                <div className="h-[1px] bg-slate-900 my-2"></div>
                
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-sm font-bold text-white">Total Billing</span>
                  <span className="text-xl font-black text-violet-400">
                    ₹{trip ? (booking.totalPrice + (trip.tollAmount || 0)) : booking.totalPrice}
                  </span>
                </div>
              </div>

              {/* Receipt actions */}
              <button
                onClick={() => window.print()}
                className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold py-3 px-4 rounded-xl transition-all cursor-pointer text-center block"
              >
                Print Receipt
              </button>

              <div className="flex items-center justify-center gap-1 text-[9px] text-slate-600 text-center mt-2">
                <ShieldCheck size={12} className="text-violet-500/50" />
                <span>Secured Invoicing Record</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
