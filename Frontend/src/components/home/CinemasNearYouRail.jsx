import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Ticket,
} from "lucide-react";
import { api } from "@/lib/api";
import { useCity } from "@/context/CityContext";
import { ScrollReveal } from "@/components/ui/Motion";
import { springSnappy } from "@/lib/motion";

function CinemaCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[260px] md:w-[300px] rounded-2xl border border-slate-200 bg-slate-50 animate-pulse p-4">
      <div className="h-5 w-3/4 bg-slate-100 rounded mb-3" />
      <div className="h-3 w-full bg-slate-50 rounded mb-2" />
      <div className="h-3 w-2/3 bg-slate-50 rounded mb-4" />
      <div className="h-9 w-full bg-slate-50 rounded-md" />
    </div>
  );
}

function CinemaCard({ cinema, onView }) {
  const showsToday = cinema.showsToday ?? cinema.todayShowCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={springSnappy}
      className="snap-start group flex-shrink-0 w-[260px] md:w-[300px] rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl hover:border-red-200 transition-colors p-4 md:p-5 flex flex-col"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="grid place-items-center w-11 h-11 rounded-xl bg-red-50 border border-red-200 shrink-0 overflow-hidden">
          {cinema.logo ? (
            <img
              src={cinema.logo}
              alt={`${cinema.chain || cinema.name} logo`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <Building2 className="w-5 h-5 text-red-600" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-slate-900 text-base font-semibold tracking-tight truncate group-hover:text-red-700 transition-colors">
            {cinema.name}
          </h3>
          {cinema.chain && (
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mt-0.5 truncate">
              {cinema.chain}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs md:text-sm text-slate-400 inline-flex items-start gap-1.5 line-clamp-1 mb-3">
        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-500" />
        <span className="truncate">{cinema.address || "Address unavailable"}</span>
      </p>

      {typeof showsToday === "number" && (
        <p className="text-[11px] text-slate-700 inline-flex items-center gap-1 mb-3">
          <Ticket className="w-3 h-3 text-red-600" />
          <span className="font-semibold text-slate-900">{showsToday}</span>
          <span>{showsToday === 1 ? "show" : "shows"} today</span>
        </p>
      )}

      <button
        type="button"
        onClick={() => onView(cinema)}
        className="mt-auto w-full inline-flex items-center justify-center gap-1.5 h-10 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-semibold rounded-xl shadow-lg transition-all"
      >
        View shows
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function CinemasNearYouRail() {
  const { city } = useCity();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const url = city
          ? `/cinemas?city=${encodeURIComponent(city)}`
          : "/cinemas";
        const res = await api.get(url);
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        if (alive) setCinemas(list);
      } catch (err) {
        if (alive) setCinemas([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [city]);

  const handleView = () => {
    // We don't yet have a per-cinema page or backend support for filtering
    // /movies by cinema, so just take the user to the movies index rather
    // than a dead-end URL.
    navigate("/movies");
  };

  const scrollByDir = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(280, Math.floor(el.clientWidth * 0.8));
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  if (!loading && cinemas.length === 0) return null;

  return (
    <ScrollReveal className="py-8 md:py-12 border-t border-slate-200">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-5 md:mb-7 flex items-end justify-between gap-4"
        >
          <div>
            <p className="text-red-600 text-xs font-semibold tracking-widest uppercase mb-2 inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Near you
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Cinemas in <span className="text-red-600">{city}</span>
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Premium screens, recliner seating, in-app F&B.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/movies"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 hover:text-red-700 transition-colors whitespace-nowrap"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
            {!loading && cinemas.length > 3 && (
              <div className="hidden md:flex gap-2">
                <button
                  type="button"
                  onClick={() => scrollByDir(-1)}
                  aria-label="Scroll left"
                  className="grid place-items-center w-10 h-10 rounded-full bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByDir(1)}
                  aria-label="Scroll right"
                  className="grid place-items-center w-10 h-10 rounded-full bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex gap-4 md:gap-5 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <CinemaCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex gap-4 md:gap-5 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {cinemas.map((cinema) => (
                <CinemaCard
                  key={cinema._id}
                  cinema={cinema}
                  onView={handleView}
                />
              ))}
            </div>
            {/* Edge fade affordance — only useful on touch/mobile where we
                hide the chevron buttons. Hidden from screen readers. */}
            <div
              aria-hidden="true"
              className="md:hidden pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent"
            />
          </div>
        )}
      </div>
    </ScrollReveal>
  );
}

export default CinemasNearYouRail;
