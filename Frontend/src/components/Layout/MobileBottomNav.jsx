import { Link, useLocation } from "react-router-dom";
import { Home, Search, Ticket, User } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Home", icon: Home, match: (p) => p === "/" },
  {
    to: "/search",
    label: "Search",
    icon: Search,
    match: (p) => p.startsWith("/search"),
  },
  {
    to: "/account/tickets",
    label: "Tickets",
    icon: Ticket,
    match: (p) => p.startsWith("/account/tickets") || p.startsWith("/t/"),
  },
  {
    to: "/account",
    label: "Account",
    icon: User,
    // Don't double-highlight when /account/tickets is active.
    match: (p) =>
      p === "/account" ||
      (p.startsWith("/account") && !p.startsWith("/account/tickets")),
  },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center justify-center gap-0.5 min-h-[56px] py-2 transition-colors ${
                  active
                    ? "text-red-600"
                    : "text-slate-400 hover:text-slate-800"
                }`}
              >
                {active && (
                  <span className="absolute top-1.5 w-1 h-1 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
                )}
                <Icon
                  className="w-[22px] h-[22px] mt-1.5"
                  strokeWidth={active ? 2.4 : 2}
                />
                <span
                  className={`text-[10px] font-medium tracking-wide ${
                    active ? "text-red-700" : ""
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
