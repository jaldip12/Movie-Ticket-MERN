import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Award, Star } from "lucide-react";
import { api } from "@/lib/api";
import { MovieCard } from "@/components/nowshowing/nowshowing";
import { MovieCardSkeleton } from "@/components/ui/Skeleton";
import { useCity } from "@/context/CityContext";
import { ScrollReveal } from "@/components/ui/Motion";

/**
 * TopRatedGrid
 * ------------
 * Pulls the now-showing list and sorts client-side by rating desc. Shows 4.
 * Re-fetches when city changes so the rating leaderboard reflects what's
 * actually playing locally.
 */
export function TopRatedGrid({ count = 4 }) {
  const { city } = useCity();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("nowShowing", "true");
        if (city) params.set("city", city);
        const res = await api.get(`/movies?${params.toString()}`);
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        if (alive) setMovies(list);
      } catch (err) {
        if (alive) setMovies([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [city]);

  const top = useMemo(() => {
    return [...movies]
      .filter((m) => m.rating != null)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, count);
  }, [movies, count]);

  if (!loading && top.length === 0) return null;

  return (
    <ScrollReveal className="py-8 md:py-12 border-t border-slate-200">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-5 md:mb-7"
        >
          <p className="text-amber-600 text-xs font-semibold tracking-widest uppercase mb-2 inline-flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            Critics' picks
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 inline-flex items-center gap-2">
            Top rated
            <motion.span
              // Brief wiggle on first view to draw attention to the rating
              // accent without being noisy on subsequent visits.
              initial={{ rotate: 0 }}
              whileInView={{ rotate: [0, -10, 10, 0] }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="inline-flex"
            >
              <Star className="w-5 h-5 md:w-6 md:h-6 fill-amber-400 text-amber-600" />
            </motion.span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            The highest-rated films playing right now.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {Array.from({ length: count }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {top.map((movie, idx) => (
              // MovieCard's root already runs whileHover={{ y: -4, scale: 1.02 }}
              // so we don't add another motion wrapper here.
              <MovieCard key={movie._id || idx} movie={movie} index={idx} />
            ))}
          </div>
        )}
      </div>
    </ScrollReveal>
  );
}

export default TopRatedGrid;
