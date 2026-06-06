import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export default function AdminHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/auth/login", { replace: true });
  };

  const initial = (user?.firstname || user?.email || "A")
    .toString()
    .charAt(0)
    .toUpperCase();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-[0.2em] text-slate-500 font-medium">
          Admin Console
        </span>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden md:flex items-center gap-2.5">
            <div className="grid place-items-center h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white text-sm font-semibold shadow-sm">
              {initial}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-800 font-medium">
                {user.firstname || "Admin"}
              </span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 font-medium">
                {user.role || "admin"}
              </span>
            </div>
          </div>
        )}

        <motion.button
          onClick={handleLogout}
          whileTap={{ scale: 0.97 }}
          aria-label="Logout"
          className={`inline-flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 hover:text-rose-600 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${FOCUS_RING}`}
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </motion.button>
      </div>
    </header>
  );
}
