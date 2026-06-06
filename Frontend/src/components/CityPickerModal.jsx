import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Search, X } from "lucide-react";
import { useCity } from "@/context/CityContext";

// A short curated list of "popular" cities we surface at the top when the
// API returns a long tail. Any city in the API response that matches one of
// these is hoisted; the rest fall into the "All cities" grid.
const POPULAR = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
];

function CityCard({ name, active, onPick }) {
  // First letter avatar — keeps things visual without needing per-city assets.
  const letter = (name || "?").charAt(0).toUpperCase();
  return (
    <button
      type="button"
      onClick={() => onPick(name)}
      className={`group flex flex-col items-center gap-2 rounded-xl border p-3 transition-all min-h-[100px] ${
        active
          ? "border-red-500/50 bg-red-50 shadow-lg"
          : "border-slate-200 bg-slate-50 hover:border-red-200 hover:bg-slate-100"
      }`}
    >
      <span
        className={`grid place-items-center w-12 h-12 rounded-xl text-lg font-semibold transition-colors ${
          active
            ? "bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg"
            : "bg-slate-50 border border-slate-200 text-slate-800 group-hover:bg-slate-200"
        }`}
      >
        {letter}
      </span>
      <span
        className={`text-xs md:text-sm font-medium tracking-tight text-center line-clamp-1 ${
          active ? "text-red-200" : "text-slate-800"
        }`}
      >
        {name}
      </span>
    </button>
  );
}

export default function CityPickerModal() {
  const { isOpen, firstVisit, cities, city, pickAndClose, closePicker } =
    useCity();
  const [query, setQuery] = useState("");

  // Reset search every time the modal opens.
  useEffect(() => {
    if (isOpen) setQuery("");
  }, [isOpen]);

  // Lock body scroll while open (modal is a focus surface).
  useEffect(() => {
    if (!isOpen) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  const { popular, rest } = useMemo(() => {
    const list = Array.isArray(cities) ? cities : [];
    const q = query.trim().toLowerCase();
    const filtered = q
      ? list.filter((c) => c.toLowerCase().includes(q))
      : list;
    const popularSet = new Set(POPULAR.map((p) => p.toLowerCase()));
    const popularHits = [];
    const restHits = [];
    filtered.forEach((c) => {
      if (popularSet.has(c.toLowerCase())) popularHits.push(c);
      else restHits.push(c);
    });
    return { popular: popularHits, rest: restHits };
  }, [cities, query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="city-picker-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm px-0 md:px-4 py-0 md:py-6"
          // Backdrop click closes only when not first-visit.
          onClick={() => {
            if (!firstVisit) closePicker();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full md:max-w-2xl max-h-[92vh] md:max-h-[80vh] flex flex-col rounded-t-2xl md:rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 md:px-6 py-4 border-b border-slate-200">
              <div className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg flex-shrink-0">
                <MapPin className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg md:text-xl font-semibold tracking-tight text-slate-900">
                  {firstVisit ? "Where are you watching?" : "Change city"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pick your city to see shows and cinemas near you.
                </p>
              </div>
              {!firstVisit && (
                <button
                  type="button"
                  onClick={closePicker}
                  aria-label="Close"
                  className="grid place-items-center w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search */}
            <div className="px-5 md:px-6 py-4 border-b border-slate-200">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search city"
                  aria-label="Search city"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 text-sm outline-none transition-colors focus:bg-slate-100 focus:border-red-300"
                />
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 md:px-6 py-5">
              {cities.length === 0 ? (
                <div className="text-center text-slate-400 py-10 text-sm">
                  Loading cities…
                </div>
              ) : (
                <div className="space-y-6">
                  {popular.length > 0 && (
                    <section>
                      <h3 className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-3">
                        Popular cities
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                        {popular.map((c) => (
                          <CityCard
                            key={c}
                            name={c}
                            active={c === city}
                            onPick={pickAndClose}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {rest.length > 0 && (
                    <section>
                      <h3 className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-3">
                        {popular.length > 0 ? "All cities" : "Cities"}
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                        {rest.map((c) => (
                          <CityCard
                            key={c}
                            name={c}
                            active={c === city}
                            onPick={pickAndClose}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {popular.length === 0 && rest.length === 0 && (
                    <div className="text-center text-slate-400 py-10 text-sm">
                      No cities match "{query}".
                    </div>
                  )}
                </div>
              )}
            </div>

            {firstVisit && (
              <div className="px-5 md:px-6 py-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 text-center">
                Choose a city to continue. You can change this anytime from the
                header.
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
