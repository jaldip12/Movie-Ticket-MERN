import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Clock, Star, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroSkeleton } from "@/components/ui/Skeleton";
import { FadeUp } from "@/components/ui/Motion";
import { easeOutExpo } from "@/lib/motion";
import { api } from "@/lib/api";

function HeroSlide({ movie, onBook, eager }) {
  const trailerUrl = movie.trailer || movie.trailerUrl || movie.trailerLink;

  const openTrailer = (e) => {
    e.stopPropagation();
    if (!trailerUrl) return;
    window.open(trailerUrl, "_blank", "noopener,noreferrer");
  };

  // Cinematic copy reveal — each child animates with a staggered delay.
  const copyChild = (i) => ({
    initial: { opacity: 0, y: 18 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: easeOutExpo, delay: 0.1 + i * 0.08 },
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: easeOutExpo }}
      className="absolute inset-0"
    >
      <picture>
        {/* Ken Burns slow zoom — gives the still backdrop a cinematic breath. */}
        <motion.img
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </picture>
      {/* Cinema-style overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-white/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/55 to-transparent" />

      <div className="relative h-full container mx-auto px-4 md:px-6 flex items-end md:items-center pb-12 md:pb-0">
        <FadeUp delay={0.1} className="max-w-2xl">
          <motion.p
            {...copyChild(0)}
            className="text-red-600 text-xs md:text-sm font-semibold tracking-widest uppercase mb-2 md:mb-3"
          >
            {movie.isFeatured ? "Featured" : "Now Showing"}
          </motion.p>
          <motion.h1
            {...copyChild(1)}
            aria-live="polite"
            className="text-3xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight mb-3 md:mb-4 drop-shadow-lg"
          >
            {movie.title}
          </motion.h1>
          <motion.div
            {...copyChild(2)}
            className="flex flex-wrap gap-2 mb-3 md:mb-5"
          >
            {movie.certification && (
              <Badge className="bg-red-100 text-red-700 border border-red-200 hover:bg-red-500/20 font-semibold uppercase">
                {movie.certification}
              </Badge>
            )}
            {movie.duration && (
              <Badge className="bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100">
                <Clock className="w-3 h-3 mr-1" />
                {movie.duration} min
              </Badge>
            )}
            {Array.isArray(movie.languages) && movie.languages.length > 0 && (
              <Badge className="bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100">
                {movie.languages.slice(0, 2).join(", ")}
              </Badge>
            )}
            {Array.isArray(movie.genres) &&
              movie.genres.slice(0, 2).map((g) => (
                <Badge
                  key={g}
                  className="bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100"
                >
                  {g}
                </Badge>
              ))}
            {movie.rating != null && (
              <Badge className="bg-amber-50 text-amber-700 border border-amber-400/20 hover:bg-amber-400/15">
                <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-600" />
                {movie.rating}/10
              </Badge>
            )}
          </motion.div>
          {movie.description && (
            <motion.p
              {...copyChild(3)}
              className="hidden md:block text-slate-700 text-base mb-6 line-clamp-2 max-w-xl"
            >
              {movie.description}
            </motion.p>
          )}
          <motion.div {...copyChild(4)} className="flex flex-wrap gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() => onBook(movie)}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold px-6 md:px-8 h-12 rounded-xl shadow-lg transition-all"
              >
                <Film className="w-4 h-4 mr-2" />
                Book Now
              </Button>
            </motion.div>
            {trailerUrl && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  onClick={openTrailer}
                  variant="outline"
                  className="bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100 hover:text-slate-900 px-5 md:px-6 h-12 rounded-xl backdrop-blur-sm transition-all"
                >
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Watch Trailer
                </Button>
              </motion.div>
            )}
          </motion.div>
        </FadeUp>
      </div>
    </motion.div>
  );
}

function HeroCarousel({ movies }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const total = movies.length;

  const next = useCallback(() => {
    if (total === 0) return;
    setIndex((i) => (i + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    if (total === 0) return;
    setIndex((i) => (i - 1 + total) % total);
  }, [total]);

  // Pause when offscreen
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (total <= 1) return;
    if (paused || !inView) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next, total, paused, inView]);

  const goToBooking = (movie) => navigate(`/movies/${movie._id}`);

  if (total === 0) return <HeroSkeleton />;
  const movie = movies[index];

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative w-full overflow-hidden border-b border-slate-200 bg-white aspect-[16/11] sm:aspect-[16/9] md:aspect-[21/9] md:max-h-[60vh]"
    >
      <AnimatePresence mode="sync">
        <HeroSlide
          key={movie._id}
          movie={movie}
          onBook={goToBooking}
          eager={index === 0}
        />
      </AnimatePresence>

      {total > 1 && (
        <>
          <motion.button
            type="button"
            onClick={prev}
            aria-label="Previous"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="hidden md:flex absolute top-1/2 left-4 -translate-y-1/2 items-center justify-center w-11 h-11 rounded-full bg-white/80 border border-slate-200 hover:bg-white hover:border-slate-300 text-slate-900 transition-colors backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <motion.button
            type="button"
            onClick={next}
            aria-label="Next"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="hidden md:flex absolute top-1/2 right-4 -translate-y-1/2 items-center justify-center w-11 h-11 rounded-full bg-white/80 border border-slate-200 hover:bg-white hover:border-slate-300 text-slate-900 transition-colors backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
          <div className="absolute bottom-3 right-4 md:bottom-5 md:right-8 flex gap-2">
            {movies.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="relative h-1.5 rounded-full overflow-visible"
                style={{ width: i === index ? 24 : 12 }}
              >
                {/* Track */}
                <span
                  className={`absolute inset-0 rounded-full transition-colors ${
                    i === index
                      ? "bg-transparent"
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                />
                {/* Active pill morphs between dots via layoutId */}
                {i === index && (
                  <motion.span
                    layoutId="hero-active-dot"
                    className="absolute inset-0 rounded-full bg-red-500"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Home hero — full-bleed auto-rotating carousel of featured movies.
 * Falls back to nowShowing when no featured exist.
 */
export function Landingpage() {
  const [heroMovies, setHeroMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const fetchHero = async () => {
      setLoading(true);
      try {
        let list = [];
        try {
          const featuredRes = await api.get("/movies?featured=true");
          if (featuredRes.data?.statusCode === 200) {
            list = Array.isArray(featuredRes.data.data) ? featuredRes.data.data : [];
          }
        } catch {
          // ignore – fall through to nowShowing fallback
        }
        if (list.length === 0) {
          const fallbackRes = await api.get("/movies?nowShowing=true");
          if (fallbackRes.data?.statusCode === 200) {
            list = Array.isArray(fallbackRes.data.data)
              ? fallbackRes.data.data.slice(0, 5)
              : [];
          }
        }
        if (alive) setHeroMovies(list.slice(0, 5));
      } catch (err) {
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchHero();
    return () => {
      alive = false;
    };
  }, []);

  return loading ? (
    <div className="px-0 md:px-0">
      <HeroSkeleton />
    </div>
  ) : (
    <HeroCarousel movies={heroMovies} />
  );
}

export default Landingpage;
