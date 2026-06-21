import { useEffect, useState } from "react";
import api from "../api/axios";
import AdminLayout from "./AdminLayout";
import { Users, Mail, CreditCard, AlertCircle, Phone, Calendar } from "lucide-react";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    api.get("/admin/users")
      .then(res => {
        setUsers(res.data.users || []);
      })
      .catch(err => {
        console.error("Failed to load users:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Customer Accounts</h1>
          <p className="text-slate-400 text-sm font-medium">Verify customer identities, check email addresses, and review active driving licenses.</p>
        </div>

        {/* List Grid */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="glass h-24 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 glass rounded-3xl border border-slate-800/80 max-w-md mx-auto">
            <AlertCircle size={40} className="mx-auto text-slate-500 mb-3" />
            <h4 className="text-md font-bold text-white mb-1">No Customers Registered</h4>
            <p className="text-slate-400 text-xs max-w-xs mx-auto">The database records do not contain any customer accounts yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="glass p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-slate-400"
              >
                {/* Profile info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-violet-600/15 border border-violet-500/20 text-violet-400 rounded-lg">
                      <Users size={14} />
                    </span>
                    <h3 className="text-sm font-bold text-white">{user.name || "Incomplete Profile"}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 pl-0.5">
                    <Phone size={12} className="text-slate-500" />
                    <span>Phone: <strong className="text-slate-200 select-all">+{user.phone}</strong></span>
                  </div>
                </div>

                {/* Driving details */}
                <div className="space-y-1.5 md:border-l md:border-r border-slate-900 md:px-8 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5">
                    <Mail size={12} className="text-slate-500 shrink-0" />
                    <span>Email: <strong className="text-slate-200 select-all">{user.email || "N/A"}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CreditCard size={12} className="text-slate-500 shrink-0" />
                    <span>DL: <strong className="text-slate-200 uppercase select-all">{user.drivingLicense || "N/A"}</strong></span>
                  </div>
                </div>

                {/* Account Details */}
                <div className="flex items-center gap-1.5 shrink-0 text-slate-500 border-t md:border-t-0 border-slate-900 pt-3 md:pt-0 w-full md:w-auto">
                  <Calendar size={12} />
                  <span>Registered: <strong>{new Date(user.createdAt).toLocaleDateString()}</strong></span>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
