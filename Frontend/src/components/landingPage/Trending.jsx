import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { FadeUp, Stagger, StaggerItem } from "@/components/ui/Motion";
import { api } from "@/lib/api";

function TrendingSkeleton() {
  return (
    <div className="flex gap-4 md:gap-5 overflow-hidden pb-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-[150px] md:w-[180px] rounded-2xl border border-slate-200 bg-slate-50 animate-pulse overflow-hidden"
        >
          <div className="w-full aspect-[2/3] bg-slate-50" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-3/4 bg-slate-100 rounded" />
            <div className="h-3 w-1/2 bg-slate-50 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendingCard({ movie, rank, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="group relative flex-shrink-0 w-[150px] md:w-[180px] rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-b from-slate-50 to-white hover:border-red-200 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
      aria-label={`Open ${movie.title}`}
    >
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-white">
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Rank badge — springs in with a small rotation flourish */}
        <motion.div
          initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
          whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.05 }}
          className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-slate-900 text-white border border-slate-900 backdrop-blur-sm"
        >
          <span className="text-xs font-bold tracking-tight text-white">
            #{rank}
          </span>
        </motion.div>
        {movie.rating != null && (
          <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 border border-slate-200 backdrop-blur-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-600" />
            <span className="text-xs font-semibold text-amber-600">
              {movie.rating}
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white to-transparent" />
      </div>
      <div className="p-3">
        <h3 className="text-sm md:text-base font-semibold text-slate-900 truncate">
          {movie.title}
        </h3>
        {Array.isArray(movie.genres) && movie.genres.length > 0 && (
          <p className="mt-0.5 text-[11px] md:text-xs text-slate-400 truncate">
            {movie.genres.slice(0, 2).join(" · ")}
          </p>
        )}
      </div>
    </motion.button>
  );
}

export function Trending() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/movies/trending?days=7&limit=8");
        const list = Array.isArray(res.data?.data?.items)
          ? res.data.data.items
          : [];
        if (alive) setItems(list);
      } catch (err) {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const scrollBy = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(240, Math.floor(el.clientWidth * 0.8));
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  // Hide entirely if not loading and there's nothing to show — prevents an
  // empty heading on a brand-new DB. (Backend already falls back, so this is
  // defensive.)
  if (!loading && items.length === 0) return null;

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <FadeUp className="mb-5 md:mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-red-600 text-xs font-semibold tracking-widest uppercase mb-2 inline-flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              What's hot
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Trending this week
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Most booked movies in the last 7 days.
            </p>
          </div>

          {!loading && items.length > 3 && (
            <div className="hidden md:flex gap-2">
              <motion.button
                type="button"
                onClick={() => scrollBy(-1)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                aria-label="Scroll left"
                className="grid place-items-center w-10 h-10 rounded-full bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <motion.button
                type="button"
                onClick={() => scrollBy(1)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                aria-label="Scroll right"
                className="grid place-items-center w-10 h-10 rounded-full bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </FadeUp>

        {loading ? (
          <TrendingSkeleton />
        ) : (
          <Stagger
            asScroll
            gap={0.06}
            className="flex gap-4 md:gap-5 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((movie, idx) => (
              <StaggerItem key={movie._id} className="snap-start">
                <TrendingCard
                  movie={movie}
                  rank={idx + 1}
                  onClick={() => navigate(`/movies/${movie._id}`)}
                />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}

export default Trending;
