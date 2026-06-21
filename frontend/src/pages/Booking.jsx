import { useState, useEffect } from "react";
import api from "../api/axios";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Calendar, MapPin, CreditCard, CheckCircle, Wallet, ArrowRight, ArrowLeft, ShieldCheck, Lock } from "lucide-react";

export default function Booking() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [carLoading, setCarLoading] = useState(true);
  const [step, setStep] = useState(1); // Steps: 1 = Details, 2 = Summary & Payment, 3 = Success

  // Form Details
  const [form, setForm] = useState({
    pickupLocation: state?.pickup || "",
    returnLocation: state?.drop || "",
    pickupDateTime: state?.pickupDateTime || "",
    returnDateTime: state?.returnDateTime || "",
    destination: ""
  });

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState("card"); // card or upi
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    cardName: "",
    upiId: ""
  });

  const [error, setError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    setCarLoading(true);
    api.get(`/cars/${id}`)
      .then(res => {
        setCar(res.data.car);
      })
      .catch(err => {
        console.error("Failed to load car for booking:", err);
      })
      .finally(() => {
        setCarLoading(false);
      });
  }, [id]);

  // Calculate days & pricing dynamically
  const calculatePricing = () => {
    if (!form.pickupDateTime || !form.returnDateTime || !car) return { days: 0, total: 0 };
    const start = new Date(form.pickupDateTime);
    const end = new Date(form.returnDateTime);
    if (start >= end) return { days: 0, total: 0 };
    
    const diffTime = end - start;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const total = days * car.pricePerDay;
    return { days, total };
  };

  const { days, total } = calculatePricing();

  const handleNextStep = () => {
    setError("");
    if (step === 1) {
      if (!form.pickupLocation || !form.returnLocation || !form.pickupDateTime || !form.returnDateTime || !form.destination) {
        setError("Please fill in all booking details.");
        return;
      }
      const start = new Date(form.pickupDateTime);
      const end = new Date(form.returnDateTime);
      if (start >= end) {
        setError("Return date must be after pickup date.");
        return;
      }
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setError("");
    if (step === 2) {
      setStep(1);
    }
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    if (step !== 2) return;
    setError("");

    // Validate payment fields
    if (paymentMethod === "card") {
      if (!paymentDetails.cardNumber || !paymentDetails.cardExpiry || !paymentDetails.cardCvv || !paymentDetails.cardName) {
        setError("Please complete all credit card fields.");
        return;
      }
    } else {
      if (!paymentDetails.upiId || !paymentDetails.upiId.includes("@")) {
        setError("Please enter a valid UPI address (e.g. name@upi).");
        return;
      }
    }

    setProcessingPayment(true);

    // Simulate payment gateway delay
    setTimeout(async () => {
      try {
        const res = await api.post("/bookings", {
          carId: id,
          ...form
        });
        if (res.data.success) {
          setBookingId(res.data.booking._id);
          setStep(3);
        } else {
          setError(res.data.message || "Booking failed.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Booking failed. The selected car might be booked.");
      } finally {
        setProcessingPayment(false);
      }
    }, 2200);
  };

  if (carLoading) {
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
          <h2 className="text-2xl font-bold text-white mb-2">Vehicle Unavailable</h2>
          <p className="text-slate-400 mb-6">This vehicle cannot be booked at the moment.</p>
          <Link to="/cars" className="px-6 py-2 bg-violet-600 rounded-xl text-sm font-semibold">Back to Fleet</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full">
        {/* Step Progress Header */}
        {step < 3 && (
          <div className="flex items-center justify-center gap-4 mb-8 max-w-md mx-auto">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-violet-400" : "text-slate-500"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? "bg-violet-600/20 border border-violet-500/40 text-violet-400" : "bg-slate-900 border border-slate-800"
              }`}>1</div>
              <span className="text-xs font-bold uppercase tracking-wider">Details</span>
            </div>
            <div className="h-[1px] bg-slate-800 flex-1"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-violet-400" : "text-slate-500"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? "bg-violet-600/20 border border-violet-500/40 text-violet-400" : "bg-slate-900 border border-slate-800"
              }`}>2</div>
              <span className="text-xs font-bold uppercase tracking-wider">Checkout</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-2xl max-w-3xl mx-auto">
            {error}
          </div>
        )}

        {/* STEP 1: Details */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 glass p-8 rounded-3xl border border-slate-800/80 space-y-6">
              <h2 className="text-2xl font-bold text-white">Enter Booking Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Pickup Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pickup Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                      <MapPin size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="Street, City, or Airport"
                      value={form.pickupLocation}
                      onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Return Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Return Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                      <MapPin size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="Drop Location"
                      value={form.returnLocation}
                      onChange={(e) => setForm({ ...form, returnLocation: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Pickup DateTime */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pickup Date & Time</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                      <Calendar size={16} />
                    </div>
                    <input
                      type="datetime-local"
                      value={form.pickupDateTime}
                      onChange={(e) => setForm({ ...form, pickupDateTime: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Return DateTime */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Return Date & Time</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                      <Calendar size={16} />
                    </div>
                    <input
                      type="datetime-local"
                      value={form.returnDateTime}
                      onChange={(e) => setForm({ ...form, returnDateTime: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Destination */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Trip Destination / Purpose</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                      <MapPin size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Business, Weekend Getaway to Lonavala"
                      value={form.destination}
                      onChange={(e) => setForm({ ...form, destination: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

              </div>

              {/* Navigation button */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleNextStep}
                  className="bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 px-6 rounded-2xl flex items-center gap-2 transition-all cursor-pointer group text-sm shadow-lg shadow-violet-600/20"
                >
                  <span>Checkout Fare Details</span>
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="glass p-6 rounded-3xl border border-slate-800/80 self-start space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Car Selected</h3>
              
              {car.image && (
                <img
                  src={`http://localhost:5001/uploads/${car.image}`}
                  alt={car.carName}
                  className="w-full aspect-video object-cover rounded-2xl bg-slate-900 border border-slate-850"
                />
              )}
              
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{car.brand || "Fleet"}</span>
                <h4 className="text-md font-bold text-white">{car.carName}</h4>
              </div>

              <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-900">
                <span className="text-slate-400">Rate / Day</span>
                <span className="font-extrabold text-white">₹{car.pricePerDay}</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Checkout / Payment Simulation */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Payment Details Form */}
            <div className="lg:col-span-2 glass p-8 rounded-3xl border border-slate-800/80 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h2 className="text-2xl font-bold text-white">Simulated Payment</h2>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
                  <ShieldCheck size={14} />
                  <span>Sandbox Active</span>
                </div>
              </div>

              {/* Payment selector */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === "card" 
                      ? "bg-violet-600/15 border-violet-500 text-violet-400 shadow-md shadow-violet-500/5" 
                      : "bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-white"
                  }`}
                >
                  <CreditCard size={24} />
                  <span className="text-xs font-bold uppercase tracking-wider">Credit / Debit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === "upi" 
                      ? "bg-violet-600/15 border-violet-500 text-violet-400 shadow-md shadow-violet-500/5" 
                      : "bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-white"
                  }`}
                >
                  <Wallet size={24} />
                  <span className="text-xs font-bold uppercase tracking-wider">UPI (GPay / PhonePe)</span>
                </button>
              </div>

              {/* Payment Fields */}
              <form onSubmit={submitBooking} className="space-y-4">
                {paymentMethod === "card" ? (
                  <div className="space-y-4">
                    {/* Cardholder name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={paymentDetails.cardName}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cardName: e.target.value })}
                        className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 px-4 text-slate-200 placeholder-slate-600 text-sm outline-none transition-all"
                        disabled={processingPayment}
                      />
                    </div>
                    {/* Card Number */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Card Number</label>
                      <input
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value.replace(/\D/g, "") })}
                        className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 px-4 text-slate-200 placeholder-slate-600 text-sm outline-none transition-all tracking-wider"
                        maxLength={16}
                        disabled={processingPayment}
                      />
                    </div>
                    {/* Expiry & CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={paymentDetails.cardExpiry}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cardExpiry: e.target.value })}
                          className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 px-4 text-slate-200 placeholder-slate-600 text-sm outline-none transition-all text-center"
                          maxLength={5}
                          disabled={processingPayment}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">CVV</label>
                        <input
                          type="password"
                          placeholder="***"
                          value={paymentDetails.cardCvv}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cardCvv: e.target.value.replace(/\D/g, "") })}
                          className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 px-4 text-slate-200 placeholder-slate-600 text-sm outline-none transition-all text-center tracking-widest"
                          maxLength={3}
                          disabled={processingPayment}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">UPI Address / VPA</label>
                    <input
                      type="text"
                      placeholder="username@upi"
                      value={paymentDetails.upiId}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 px-4 text-slate-200 placeholder-slate-600 text-sm outline-none transition-all"
                      disabled={processingPayment}
                    />
                    <p className="text-[10px] text-slate-500 mt-1.5">
                      Enter your exact UPI ID. Make sure you accept the simulated request from your mobile device.
                    </p>
                  </div>
                )}

                {/* Back and Confirm Controls */}
                <div className="pt-6 flex justify-between gap-4 border-t border-slate-900 mt-6">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={processingPayment}
                    className="border border-slate-800 text-slate-300 hover:text-white px-5 py-3.5 rounded-2xl flex items-center gap-1.5 transition-all text-sm cursor-pointer disabled:opacity-50"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={processingPayment}
                    className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all text-sm cursor-pointer shadow-lg shadow-violet-600/20"
                  >
                    {processingPayment ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>Processing payment...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={15} />
                        <span>Authorize & Pay ₹{total}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Fare Breakdown Summary Panel */}
            <div className="glass p-6 rounded-3xl border border-slate-800/80 self-start space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Fare Breakdown</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Base Rental Rate</span>
                  <span className="text-slate-200">₹{car.pricePerDay} / day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rental Duration</span>
                  <span className="text-slate-200 font-semibold">{days} Day(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Booking Service Fee</span>
                  <span className="text-emerald-400 font-medium">FREE</span>
                </div>
                
                <div className="h-[1px] bg-slate-900 pt-1"></div>
                
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-md font-bold text-white">Total Amount</span>
                  <span className="text-2xl font-black text-violet-400">₹{total}</span>
                </div>
              </div>

              {/* Safety notice banner */}
              <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/80 text-[10px] text-slate-500 leading-relaxed space-y-1.5">
                <div className="flex items-center gap-1 text-slate-400 font-bold">
                  <ShieldCheck size={12} className="text-violet-400" />
                  <span>Rental Safety Policy</span>
                </div>
                <span>Taxes & insurance coverage costs are pre-computed in daily rate. Drive safely and adhere to standard road regulations.</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Success Screen */}
        {step === 3 && (
          <div className="glass-premium p-10 rounded-3xl border border-slate-800/80 text-center max-w-xl mx-auto space-y-6">
            <div className="inline-flex items-center justify-center p-4 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full mb-2">
              <CheckCircle size={48} className="animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-white">Payment Authorized</h2>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Your payment was received successfully. We have sent a booking confirmation request to your WhatsApp number.
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-left space-y-3 text-sm max-w-md mx-auto">
              <div className="flex justify-between text-xs border-b border-slate-850 pb-2 text-slate-400">
                <span>Booking ID:</span>
                <span className="font-mono text-white select-all">{bookingId}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Vehicle Reserved:</span>
                <span className="text-slate-200 font-semibold">{car.carName}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Rental Duration:</span>
                <span className="text-slate-200">{days} Day(s)</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Total Charge Authorized:</span>
                <span className="text-emerald-400 font-bold">₹{total}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col md:flex-row justify-center gap-3">
              <Link
                to="/profile"
                className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm rounded-2xl transition-all cursor-pointer"
              >
                Track Booking Status
              </Link>
              <Link
                to="/home"
                className="px-6 py-3 border border-slate-800 text-slate-300 hover:text-white font-semibold text-sm rounded-2xl transition-all cursor-pointer"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}