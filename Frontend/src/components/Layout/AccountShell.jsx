import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Ticket,
  Heart,
  Bell,
  Lock,
  Trash2,
} from "lucide-react";
import PublicShell from "@/components/Layout/PublicShell";
import { Stagger, StaggerItem } from "@/components/ui/Motion";
import { useAuth } from "@/context/AuthContext";

// One source of truth for the sidebar — used both as the desktop column and the
// mobile horizontal pill rail.
const NAV_ITEMS = [
  { to: "/account/profile", label: "Profile", icon: User },
  { to: "/account/tickets", label: "My Tickets", icon: Ticket },
  { to: "/account/wishlist", label: "Wishlist", icon: Heart },
  { to: "/account/notifications", label: "Notifications", icon: Bell },
  { to: "/account/security", label: "Security", icon: Lock },
  { to: "/account/danger", label: "Delete account", icon: Trash2, danger: true },
];

function SidebarItem({ to, label, icon: Icon, danger }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          "relative group flex items-center gap-3 px-3.5 h-11 rounded-xl text-sm font-medium transition-colors",
          isActive
            ? danger
              ? "text-rose-700"
              : "text-red-600"
            : "text-slate-700 hover:text-slate-900 hover:bg-slate-100",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="account-nav-pill"
              className={[
                "absolute inset-0 rounded-xl border",
                danger
                  ? "bg-rose-50 border-rose-200"
                  : "bg-red-50 border-red-200",
              ].join(" ")}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          )}
          <Icon
            className={[
              "relative w-4 h-4 shrink-0 transition-colors",
              isActive
                ? danger
                  ? "text-rose-700"
                  : "text-red-600"
                : "text-slate-500 group-hover:text-slate-700",
            ].join(" ")}
          />
          <span className="relative truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}

function MobilePill({ to, label, icon: Icon, danger }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          "shrink-0 inline-flex items-center gap-2 px-3.5 h-9 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
          isActive
            ? danger
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-red-50 text-red-600 border-red-200"
            : "text-slate-700 border-slate-200 bg-slate-50 hover:bg-slate-100 hover:text-slate-900",
        ].join(" ")
      }
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </NavLink>
  );
}

/**
 * Wraps every /account/* page. Renders inside <PublicShell> so it gets the same
 * header/footer + city modal as the rest of the app.
 *
 * Desktop: 240-px sidebar on the left, glass content card on the right.
 * Mobile: sidebar collapses to a horizontally-scrollable pill rail at the top.
 */
export default function AccountShell({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const firstname = user?.firstname || "there";

  return (
    <PublicShell className="relative overflow-hidden">
      {/* Decorative red glow — matches login.jsx / MyTickets */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-red-600/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-rose-700/10 blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-10 md:py-14 max-w-6xl">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-8 md:mb-10"
        >
          <p className="text-red-600 text-xs font-semibold tracking-widest uppercase mb-2">
            Account
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Hi, {firstname}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Manage your bookings, profile and preferences.
          </p>
        </motion.div>

        {/* Mobile pill rail — only visible below md */}
        <nav
          aria-label="Account sections"
          className="md:hidden mb-6 -mx-4 px-4 overflow-x-auto scrollbar-hide"
        >
          <div className="flex items-center gap-2 min-w-max">
            {NAV_ITEMS.map((item) => (
              <MobilePill key={item.to} {...item} />
            ))}
          </div>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] gap-6 md:gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl p-2">
              <Stagger
                gap={0.05}
                role="navigation"
                aria-label="Account sections"
                className="flex flex-col gap-1"
              >
                {NAV_ITEMS.map((item) => (
                  <StaggerItem key={item.to}>
                    <SidebarItem {...item} />
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </aside>

          {/* Content card — crossfade keyed by route */}
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.section
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl p-5 md:p-8 min-w-0"
              >
                {children}
              </motion.section>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
