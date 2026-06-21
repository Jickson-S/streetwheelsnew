import { Link, useNavigate, useLocation } from "react-router-dom";
import { Car, User, LogOut, CalendarRange } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/home" className="flex items-center gap-2 text-white hover:text-violet-400 transition-colors">
          <div className="p-2 bg-violet-600/20 text-violet-400 rounded-xl border border-violet-500/20">
            <Car size={22} />
          </div>
          <span className="font-extrabold tracking-tight text-lg">
            Street<span className="text-violet-400">Wheels</span>
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/home"
            className={`text-sm font-semibold transition-colors ${
              isActive("/home") ? "text-violet-400" : "text-slate-300 hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            to="/cars"
            className={`text-sm font-semibold transition-colors ${
              isActive("/cars") ? "text-violet-400" : "text-slate-300 hover:text-white"
            }`}
          >
            Browse Fleet
          </Link>
          <Link
            to="/profile"
            className={`text-sm font-semibold transition-colors inline-flex items-center gap-1 ${
              isActive("/profile") ? "text-violet-400" : "text-slate-300 hover:text-white"
            }`}
          >
            <CalendarRange size={15} />
            <span>My Bookings</span>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <User size={14} className="text-violet-400" />
            <span className="text-xs text-slate-300 font-medium">Customer</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/20 hover:bg-rose-500/10 border border-slate-700/30 hover:border-rose-500/20 rounded-xl transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
