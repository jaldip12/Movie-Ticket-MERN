import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { MovieCard } from "@/components/nowshowing/nowshowing.jsx";
import { Skeleton } from "@/components/ui/Skeleton";
import { ScrollReveal, StaggerItem } from "@/components/ui/Motion";
import { stagger as staggerFactory, viewportOnce } from "@/lib/motion";

/**
 * Related-movies rail: pulls /movies?nowShowing=true, prefers items sharing
 * a genre with the current movie, falls back to any other now-showing movie,
 * caps at 8.
 */
export default function RelatedMovies({ currentMovieId, genres = [] }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/movies?nowShowing=true");
        if (!alive) return;
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setMovies(list);
      } catch (err) {
        if (!alive) return;
        setMovies([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const related = useMemo(() => {
    const others = movies.filter((m) => m._id !== currentMovieId);
    if (genres.length === 0) return others.slice(0, 8);

    const genreSet = new Set(genres);
    const scored = others.map((m) => {
      const ms = Array.isArray(m.genres) ? m.genres : [];
      const overlap = ms.filter((g) => genreSet.has(g)).length;
      return { m, overlap };
    });
    scored.sort((a, b) => b.overlap - a.overlap);
    return scored.map((s) => s.m).slice(0, 8);
  }, [movies, currentMovieId, genres]);

  const scrollRef = useRef(null);
  const scrollByDir = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(240, Math.floor(el.clientWidth * 0.8));
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  if (!loading && related.length === 0) return null;

  return (
    <ScrollReveal
      y={20}
      className="relative z-10 container mx-auto px-4 mt-10 md:mt-16 mb-10 md:mb-16 max-w-6xl"
    >
      <div className="flex items-end justify-between gap-3 mb-4">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
          You might also like
        </h2>
        {!loading && related.length > 3 && (
          <div className="hidden md:flex gap-2">
            <button
              type="button"
              onClick={() => scrollByDir(-1)}
              aria-label="Scroll related movies left"
              className="grid place-items-center w-10 h-10 rounded-full bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByDir(1)}
              aria-label="Scroll related movies right"
              className="grid place-items-center w-10 h-10 rounded-full bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-44 md:w-52 aspect-[2/3] rounded-2xl shrink-0"
            />
          ))}
        </div>
      ) : (
        <motion.div
          ref={scrollRef}
          variants={staggerFactory(0.05)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-3 -mx-4 px-4"
        >
          {related.map((m, idx) => (
            <StaggerItem
              key={m._id}
              className="w-44 md:w-56 shrink-0 snap-start"
            >
              <MovieCard movie={m} index={idx} />
            </StaggerItem>
          ))}
        </motion.div>
      )}
    </ScrollReveal>
  );
}
