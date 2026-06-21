import { Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Car, Calendar, Compass, PlusCircle, LogOut, ShieldCheck, Users, MessageSquare } from "lucide-react";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  const isActive = (path) => location.pathname === path;

  const links = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Manage Fleet", path: "/admin/cars", icon: <Car size={18} /> },
    { label: "Bookings Queue", path: "/admin/bookings", icon: <Calendar size={18} /> },
    { label: "Trip Records", path: "/admin/trips", icon: <Compass size={18} /> },
    { label: "Customer Accounts", path: "/admin/users", icon: <Users size={18} /> },
    { label: "Add Fleet Vehicle", path: "/admin/add-car", icon: <PlusCircle size={18} /> },
    { label: "WhatsApp Monitor", path: "/admin/whatsapp", icon: <MessageSquare size={18} /> }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-900 bg-slate-900/40 backdrop-blur-xl flex flex-col justify-between shrink-0 p-6">
        <div className="space-y-8">
          {/* Brand header */}
          <div className="flex items-center gap-2 text-white pb-6 border-b border-slate-800/60">
            <div className="p-2 bg-violet-600/20 text-violet-400 border border-violet-500/20 rounded-xl">
              <ShieldCheck size={20} />
            </div>
            <span className="font-extrabold tracking-tight text-md">
              Ops<span className="text-violet-400">Center</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive(link.path)
                    ? "bg-violet-600/10 border border-violet-500/25 text-violet-400 shadow-md shadow-violet-500/5"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-slate-900/80 space-y-4">
          <Link
            to="/home"
            className="block text-center text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← View Customer Portal
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
          >
            <LogOut size={16} />
            <span>Log Out Ops</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-10 py-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
