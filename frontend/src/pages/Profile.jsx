import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { 
  Calendar, MapPin, Compass, Clock, CheckCircle2, XCircle, 
  AlertCircle, ShoppingBag, Star, User, Smartphone, Mail, CreditCard, Edit3, Save, X 
} from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    email: "",
    drivingLicense: ""
  });
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Review Modal States
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/auth/profile"),
      api.get("/bookings/my")
    ])
      .then(([userRes, bookingsRes]) => {
        setUser(userRes.data.user);
        setEditForm({
          name: userRes.data.user?.name || "",
          phone: userRes.data.user?.phone || "",
          email: userRes.data.user?.email || "",
          drivingLicense: userRes.data.user?.drivingLicense || ""
        });
        setBookings(bookingsRes.data.bookings || []);
      })
      .catch(err => {
        console.error("Failed to load dashboard data:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const openReviewModal = (carId) => {
    setSelectedCarId(carId);
    setReviewRating(5);
    setReviewComment("");
    setReviewModalOpen(true);
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!selectedCarId) return;
    setSubmittingReview(true);
    try {
      await api.post(`/cars/${selectedCarId}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });
      alert("Thank you! Review posted successfully.");
      setReviewModalOpen(false);
    } catch (err) {
      alert("Failed to submit review: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.phone) {
      setEditError("Full Name and Phone Number are required");
      return;
    }

    if (!/^\d{10,12}$/.test(editForm.phone)) {
      setEditError("Please enter a valid phone number (10-12 digits without +)");
      return;
    }

    setSavingProfile(true);
    setEditError("");
    setEditSuccess("");

    try {
      const res = await api.put("/auth/profile", editForm);
      setUser(res.data.user);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      setEditSuccess("Profile updated successfully!");
      setIsEditing(false);
      
      // Auto clear success message
      setTimeout(() => setEditSuccess(""), 4000);
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update profile. Try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Compute stats
  const totalBookings = bookings.length;
  const totalSpent = bookings
    .filter(b => b.status === "Confirmed" || b.status === "Completed")
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const pendingCount = bookings.filter(b => b.status === "Pending").length;

  const getStatusStyles = (status) => {
    switch (status) {
      case "Confirmed":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
          icon: <CheckCircle2 size={13} className="shrink-0" />,
          label: "Confirmed"
        };
      case "Cancelled":
        return {
          bg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
          icon: <XCircle size={13} className="shrink-0" />,
          label: "Cancelled"
        };
      case "Completed":
        return {
          bg: "bg-blue-500/10 border-blue-500/20 text-blue-400",
          icon: <CheckCircle2 size={13} className="shrink-0" />,
          label: "Completed"
        };
      default: // Pending
        return {
          bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
          icon: <Clock size={13} className="shrink-0" />,
          label: "Pending Review"
        };
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
        
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">My Dashboard</h1>
          <p className="text-slate-400 text-sm">Monitor your booking statuses, trip itineraries, and profile parameters.</p>
        </div>

        {/* Master Layout: Profile Card left, Stats/Bookings right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Profile Card Section (1 Column) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-premium p-6 rounded-3xl border border-slate-800/80 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/5 rounded-full blur-2xl"></div>

              {/* Head Section */}
              <div className="text-center space-y-3 pb-6 border-b border-slate-900">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-black shadow-lg shadow-violet-500/20 mx-auto">
                  {getInitials(user?.name)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{user?.name || "Customer User"}</h3>
                  <span className="text-xs text-slate-500 capitalize tracking-wider">{user?.role || "Customer"} Account</span>
                </div>
              </div>

              {editSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span>{editSuccess}</span>
                </div>
              )}

              {editError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span>{editError}</span>
                </div>
              )}

              {!isEditing ? (
                /* Profile Display Panel */
                <div className="space-y-4 text-sm">
                  {/* Name field display */}
                  <div className="flex items-center gap-3.5 p-3 bg-slate-900/40 rounded-2xl border border-slate-850">
                    <User size={18} className="text-violet-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block">Full Name</span>
                      <strong className="text-slate-200">{user?.name || "N/A"}</strong>
                    </div>
                  </div>

                  {/* Phone field display */}
                  <div className="flex items-center gap-3.5 p-3 bg-slate-900/40 rounded-2xl border border-slate-850">
                    <Smartphone size={18} className="text-violet-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block">Phone Number</span>
                      <strong className="text-slate-200">+{user?.phone || "N/A"}</strong>
                    </div>
                  </div>

                  {/* Email field display */}
                  <div className="flex items-center gap-3.5 p-3 bg-slate-900/40 rounded-2xl border border-slate-850">
                    <Mail size={18} className="text-violet-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block">Email Address</span>
                      <strong className="text-slate-200">{user?.email || "N/A"}</strong>
                    </div>
                  </div>

                  {/* DL field display */}
                  <div className="flex items-center gap-3.5 p-3 bg-slate-900/40 rounded-2xl border border-slate-850">
                    <CreditCard size={18} className="text-violet-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block">Driving License</span>
                      <strong className="text-slate-200 uppercase tracking-widest">{user?.drivingLicense || "N/A"}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditForm({
                        name: user?.name || "",
                        phone: user?.phone || "",
                        email: user?.email || "",
                        drivingLicense: user?.drivingLicense || ""
                      });
                      setIsEditing(true);
                      setEditError("");
                    }}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 px-4 rounded-2xl shadow-md hover:shadow-violet-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs mt-4"
                  >
                    <Edit3 size={14} />
                    <span>Edit Profile Details</span>
                  </button>
                </div>
              ) : (
                /* Profile Edit Panel */
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {/* Full Name Input */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <User size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-2.5 pl-10 pr-4 text-white text-xs outline-none transition-all"
                        disabled={savingProfile}
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Smartphone size={16} />
                      </div>
                      <input
                        type="tel"
                        required
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value.replace(/\D/g, "") })}
                        className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-2.5 pl-10 pr-4 text-white text-xs outline-none transition-all"
                        disabled={savingProfile}
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-2.5 pl-10 pr-4 text-white text-xs outline-none transition-all"
                        disabled={savingProfile}
                      />
                    </div>
                  </div>

                  {/* Driving License Input */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Driving License</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <CreditCard size={16} />
                      </div>
                      <input
                        type="text"
                        value={editForm.drivingLicense}
                        onChange={(e) => setEditForm({ ...editForm, drivingLicense: e.target.value.toUpperCase() })}
                        className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-2.5 pl-10 pr-4 text-white text-xs outline-none transition-all uppercase tracking-wider"
                        disabled={savingProfile}
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      disabled={savingProfile}
                    >
                      <X size={14} />
                      <span>Cancel</span>
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md hover:shadow-violet-600/25"
                      disabled={savingProfile}
                    >
                      {savingProfile ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Save size={14} />
                          <span>Save</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Stats and Booking List Area (2 Columns) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass p-5 rounded-3xl border border-slate-800/80 flex items-center gap-4">
                <div className="p-3.5 bg-violet-600/10 text-violet-400 rounded-2xl border border-violet-500/15">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Bookings</span>
                  <span className="text-xl font-bold text-white">{totalBookings}</span>
                </div>
              </div>
              <div className="glass p-5 rounded-3xl border border-slate-800/80 flex items-center gap-4">
                <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/15">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Spend</span>
                  <span className="text-xl font-bold text-white">₹{totalSpent}</span>
                </div>
              </div>
              <div className="glass p-5 rounded-3xl border border-slate-800/80 flex items-center gap-4">
                <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/15">
                  <Clock size={20} />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pending Approvals</span>
                  <span className="text-xl font-bold text-white">{pendingCount}</span>
                </div>
              </div>
            </div>

            {/* Bookings List Area */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-1">Booking History</h3>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="glass h-40 rounded-3xl border border-slate-800/80 animate-pulse"></div>
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-16 glass rounded-3xl border border-slate-800/80 max-w-md mx-auto">
                  <AlertCircle size={40} className="mx-auto text-slate-500 mb-3" />
                  <h4 className="text-md font-bold text-white mb-1">No Bookings Yet</h4>
                  <p className="text-slate-400 text-xs max-w-xs mx-auto mb-4">
                    You haven't requested any vehicle rentals yet. Find your first ride today!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map(booking => {
                    const statusInfo = getStatusStyles(booking.status);
                    const pickupDate = booking.pickupDateTime ? new Date(booking.pickupDateTime).toLocaleString() : "N/A";
                    const returnDate = booking.returnDateTime ? new Date(booking.returnDateTime).toLocaleString() : "N/A";
                    
                    return (
                      <div
                        key={booking._id}
                        className="glass p-6 rounded-3xl border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col md:flex-row justify-between gap-6"
                      >
                        {/* Left: Car Details */}
                        <div className="flex gap-4 items-start">
                          {booking.carId?.image ? (
                            <img
                              src={`http://localhost:5001/uploads/${booking.carId.image}`}
                              alt={booking.carId.carName}
                              className="w-24 aspect-video object-cover rounded-xl bg-slate-900 border border-slate-850 shrink-0"
                            />
                          ) : (
                            <div className="w-24 aspect-video bg-slate-900 border border-slate-800/50 text-[10px] text-slate-600 flex items-center justify-center font-bold uppercase rounded-xl shrink-0">
                              No Image
                            </div>
                          )}
                          <div>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider mb-2 ${statusInfo.bg}`}>
                              {statusInfo.icon}
                              <span>{statusInfo.label}</span>
                            </span>
                            
                            <Link to={`/booking-details/${booking._id}`} className="hover:underline block">
                              <h4 className="text-md font-bold text-white hover:text-violet-400 transition-colors">
                                {booking.carId?.carName || "Unknown Vehicle"}
                              </h4>
                            </Link>
                            
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                              <Compass size={13} className="text-violet-500/60" />
                              <span>Destination: <strong className="text-slate-300 font-medium">{booking.destination || "Not Specified"}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Dates */}
                        <div className="md:border-l md:border-r border-slate-900 md:px-8 flex flex-col justify-center space-y-2 text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <MapPin size={13} className="text-violet-400" />
                            <span>Pickup: <strong className="text-slate-300">{booking.pickupLocation}</strong> ({pickupDate})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={13} className="text-rose-400" />
                            <span>Return: <strong className="text-slate-300">{booking.returnLocation}</strong> ({returnDate})</span>
                          </div>
                        </div>

                        {/* Right: Payment Details */}
                        <div className="flex flex-col items-end justify-center shrink-0 border-t md:border-t-0 border-slate-900 pt-4 md:pt-0">
                          <div className="text-left md:text-right">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Total Price</span>
                            <span className="text-xl font-extrabold text-violet-400">₹{booking.totalPrice}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-1">
                            ({booking.totalDays} Rental Day{booking.totalDays > 1 ? "s" : ""})
                          </span>
                          {["Confirmed", "Completed"].includes(booking.status) && booking.carId && (
                            <button
                              onClick={() => openReviewModal(booking.carId._id)}
                              className="mt-3 px-3 py-1.5 bg-violet-600/10 hover:bg-violet-600 border border-violet-500/25 hover:border-violet-600 text-violet-400 hover:text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <Star size={11} className="fill-current" />
                              <span>Write Review</span>
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Write Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-premium p-6 rounded-3xl max-w-sm w-full space-y-4 border border-slate-800">
            <h3 className="text-lg font-bold text-white">Write Vehicle Review</h3>
            <p className="text-slate-400 text-xs">Share your experience to help other drivers.</p>
            
            <form onSubmit={handlePostReview} className="space-y-4">
              {/* Rating selection stars */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="text-amber-400 transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Star size={24} className={star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-slate-700"} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment area */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Your Comment</label>
                <textarea
                  placeholder="Tell us about vehicle comfort, clean status, performance..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full h-24 bg-slate-900/50 border border-slate-800/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl p-3 text-slate-200 text-xs placeholder-slate-600 outline-none transition-all resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}