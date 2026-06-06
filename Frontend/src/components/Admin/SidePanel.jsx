import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu as PiList, Power as PiPower } from "lucide-react";
import {
  LayoutGrid,
  Film,
  Sofa,
  Ticket,
  Building2,
  MonitorPlay,
  CalendarCheck,
  UsersRound,
  Utensils,
  Tag,
  MessageSquare,
  ScanLine,
  Megaphone,
  History,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Stagger, StaggerItem } from "@/components/ui/Motion";

const NAV_ITEMS = [
  { Icon: LayoutGrid, label: "Dashboard", path: "/admin", end: true },
  { Icon: Film, label: "Movies", path: "/admin/movies" },
  { Icon: Building2, label: "Cinemas", path: "/admin/cinemas" },
  { Icon: MonitorPlay, label: "Screens", path: "/admin/screens" },
  { Icon: Sofa, label: "Seating", path: "/admin/seating" },
  { Icon: Ticket, label: "Shows", path: "/admin/shows" },
  { Icon: CalendarCheck, label: "Bookings", path: "/admin/bookings" },
  { Icon: ScanLine, label: "Validate", path: "/admin/validate" },
  { Icon: UsersRound, label: "Users", path: "/admin/users" },
  { Icon: Utensils, label: "F&B Menu", path: "/admin/fnb" },
  { Icon: Tag, label: "Promo Codes", path: "/admin/coupons" },
  { Icon: MessageSquare, label: "Reviews", path: "/admin/reviews" },
  { Icon: Megaphone, label: "Banners", path: "/admin/banners" },
  { Icon: History, label: "Audit Log", path: "/admin/audit" },
];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const SidePanel = ({ expanded, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/auth/login", { replace: true });
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen flex flex-col
        bg-white border-r border-slate-200
        shadow-sm transition-[width] duration-300
        ${expanded ? "w-64" : "w-16"}`}
      aria-label="Admin navigation"
    >
      {/* Brand + collapse toggle */}
      <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-200">
        <button
          onClick={onToggle}
          className={`rounded-lg hover:bg-slate-100 transition p-2 shrink-0 text-slate-700 ${FOCUS_RING}`}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <PiList className="text-2xl" />
        </button>
        {expanded && (
          <Link
            to="/admin"
            className={`flex items-center gap-2 truncate rounded-md ${FOCUS_RING}`}
          >
            <div className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 shadow-sm shrink-0">
              <Film className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-semibold tracking-tight text-slate-900 truncate">
              MovieVista
            </span>
          </Link>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <Stagger gap={0.04} className="space-y-1">
          {NAV_ITEMS.map(({ Icon, label, path, end }) => (
            <StaggerItem key={path} y={6}>
              <NavLink
                to={path}
                end={end}
                title={!expanded ? label : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${FOCUS_RING}
                  ${
                    isActive
                      ? "text-red-600"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }
                  ${expanded ? "" : "justify-center"}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="admin-sidebar-active"
                        className="absolute inset-0 rounded-lg bg-red-50"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                        }}
                        aria-hidden="true"
                      />
                    )}
                    <Icon className="relative h-5 w-5 shrink-0" />
                    {expanded && (
                      <span className="relative text-sm font-medium truncate">
                        {label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </StaggerItem>
          ))}
        </Stagger>
      </nav>

      <div className="px-2 py-3 border-t border-slate-200">
        <button
          onClick={handleLogout}
          title={!expanded ? "Logout" : undefined}
          className={`w-full flex items-center gap-3 rounded-lg py-2.5 px-3
            bg-slate-50 border border-slate-200 text-slate-700
            hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600
            transition-colors ${FOCUS_RING}
            ${expanded ? "" : "justify-center"}`}
          aria-label="Log out"
        >
          <PiPower className="text-xl shrink-0" />
          {expanded && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default SidePanel;
