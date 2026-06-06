import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import SidePanel from "./SidePanel";
import AdminHeader from "./AdminHeader";

const STORAGE_KEY = "adminSidebarExpanded";

export default function AdminLayout() {
  const location = useLocation();
  const [expanded, setExpanded] = useState(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem(STORAGE_KEY);
    return v === null ? true : v === "1";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, expanded ? "1" : "0");
  }, [expanded]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 z-50 bg-white border border-slate-300 rounded-md px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Skip to content
      </a>

      <SidePanel expanded={expanded} onToggle={() => setExpanded((p) => !p)} />

      <div
        className={`transition-[margin] duration-300 ${
          expanded ? "ml-64" : "ml-16"
        }`}
      >
        <AdminHeader />
        <main id="admin-main" className="p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
