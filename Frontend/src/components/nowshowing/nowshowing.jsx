import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Star,
  Film,
  Heart,
  Calendar,
  Clock,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MovieGridSkeleton } from "@/components/ui/Skeleton";
import {
  PageTransition,
  Stagger,
  StaggerItem,
} from "@/components/ui/Motion";
import { springSnappy } from "@/lib/motion";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Inline SVG data-URL so we never depend on a missing /fallback.jpg in /public.
// Light-theme tile: pale slate background, red play-triangle accent.
const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600'>` +
      `<rect width='400' height='600' fill='#f8fafc'/>` +
      `<rect x='40' y='40' width='320' height='520' rx='12' fill='none' stroke='#dc2626' stroke-opacity='0.35' stroke-width='2'/>` +
      `<g fill='#dc2626' fill-opacity='0.75' transform='translate(200,300)'>` +
      `<polygon points='-30,-30 30,0 -30,30'/>` +
      `</g>` +
      `<text x='200' y='420' font-family='sans-serif' font-size='18' fill='#64748b' text-anchor='middle'>Poster unavailable</text>` +
      `</svg>`
  );
const COMMON_LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Other"];
const SORT_OPTIONS = [
  { id: "newest", label: "Newest" },
  { id: "topRated", label: "Top rated" },
  { id: "soonest", label: "Soonest release" },
];

export function MovieCard({
  movie,
  index = 0,
  initialWishlisted,
  onWishlistChange,
}) {
  const navigate = useNavigate();
  const { status } = useAuth();
  const isAuthed = status === "authenticated";

  // If the parent told us the wishlist state up-front (e.g. the Wishlist page
  // already knows every card here is wishlisted), trust it and skip the GET.
  // Otherwise we'll do a per-card "is in wishlist?" probe on mount.
  const [isLiked, setIsLiked] = useState(Boolean(initialWishlisted));
  const [pending, setPending] = useState(false);
  // Guard against an infinite onError loop if the fallback itself fails (e.g.
  // a future CSP rule blocks data: URLs).
  const fallbackTriedRef = useRef(false);
  // Drives the brief "heart burst" pulse when the user toggles to liked.
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    // Parent supplied initial state — don't override it.
    if (initialWishlisted !== undefined) return;
    if (!isAuthed || !movie?._id) return;

    let alive = true;
    api
      .get(`/wishlist/${movie._id}`)
      .then((res) => {
        if (!alive) return;
        setIsLiked(Boolean(res.data?.data?.isWishlisted));
      })
      .catch(() => {
        // Swallow — anonymous-ish behavior, we don't want to spam the user.
      });
    return () => {
      alive = false;
    };
  }, [initialWishlisted, isAuthed, movie?._id]);

  const handleBookNow = useCallback(() => {
    navigate(`/movies/${movie._id}`);
  }, [movie._id, navigate]);

  const toggleFavorite = useCallback(
    async (e) => {
      e.stopPropagation();
      if (pending) return;

      if (!isAuthed) {
        toast("Sign in to save movies", { icon: "💛" });
        navigate("/auth/login");
        return;
      }

      const next = !isLiked;
      // Optimistic flip.
      setIsLiked(next);
      if (next) setBurst((n) => n + 1);
      setPending(true);
      try {
        if (next) {
          await api.post("/wishlist", { movieId: movie._id });
        } else {
          await api.delete(`/wishlist/${movie._id}`);
        }
        onWishlistChange?.(next);
      } catch (err) {
        // Roll back on failure.
        setIsLiked(!next);
        const msg =
          err?.response?.data?.message || "Could not update wishlist";
        toast.error(msg);
      } finally {
        setPending(false);
      }
    },
    [isAuthed, isLiked, movie._id, navigate, onWishlistChange, pending]
  );

  const {
    rating = "N/A",
    votes = 0,
    certification = "NA",
    language = "Unknown",
    languages,
    duration,
    releaseDate,
    featured,
  } = movie;
  const languageLabel =
    Array.isArray(languages) && languages.length > 0
      ? languages.join(", ")
      : language;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={springSnappy}
    >
      <Card
        className="overflow-hidden group cursor-pointer rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl transition-colors duration-300 hover:border-red-300"
        onClick={handleBookNow}
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            onError={(e) => {
              // Only swap to the fallback once — if the fallback itself fails,
              // do nothing to avoid an infinite reload loop.
              if (fallbackTriedRef.current) return;
              fallbackTriedRef.current = true;
              e.target.src = FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-95"
            loading="lazy"
          />
          {/* Gradient + soft red wash on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-white/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-tr from-red-600/0 via-transparent to-red-500/0 group-hover:from-red-600/10 group-hover:to-red-500/5 transition-colors duration-300" />

          {certification && (
            <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded-md border border-white/20">
              {certification}
            </span>
          )}

          {featured && (
            <span className="absolute top-3 left-1/2 -translate-x-1/2 bg-amber-50 text-amber-700 border border-amber-400/20 text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded-full backdrop-blur-sm">
              Featured
            </span>
          )}

          <motion.button
            type="button"
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={isLiked}
            onClick={toggleFavorite}
            disabled={pending}
            whileTap={{ scale: 0.8 }}
            className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm p-2 rounded-full text-white border border-slate-200 hover:bg-amber-500/20 hover:border-amber-400/40 transition-colors disabled:opacity-70"
          >
            <motion.span
              // Re-key on each burst so framer-motion re-runs the keyframes.
              key={burst}
              animate={
                burst > 0 ? { scale: [1, 1.4, 1] } : { scale: 1 }
              }
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="inline-flex"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isLiked ? "fill-amber-400 text-amber-600" : ""
                }`}
              />
            </motion.span>
          </motion.button>

          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1 text-slate-900 text-xs font-medium">
            <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
            <span className="font-bold">{rating}</span>
            <span className="text-slate-700">/10</span>
            <span className="text-slate-400 ml-1">({votes})</span>
          </div>
        </div>

        <CardContent className="p-4 md:p-5">
          <h2 className="text-base md:text-lg font-semibold tracking-tight line-clamp-1 text-slate-900 group-hover:text-red-700 transition-colors mb-3">
            {movie.title}
          </h2>

          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-700 border border-slate-200">
              {languageLabel}
            </span>
            {duration && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-700 border border-slate-200">
                <Clock className="w-3 h-3 mr-1" />
                {duration}m
              </span>
            )}
            {releaseDate && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-700 border border-slate-200">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(releaseDate).getFullYear()}
              </span>
            )}
          </div>

          <Button
            className="w-full h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all"
            onClick={(e) => {
              e.stopPropagation();
              handleBookNow();
            }}
          >
            <Film className="w-4 h-4 mr-2" />
            Book Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FilterDropdown({ label, value, options, onChange, allLabel = "All" }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-between gap-2 min-w-[8rem] h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-colors"
        >
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
            {label}
          </span>
          <span className="font-medium truncate max-w-[6rem] text-slate-900">
            {value || allLabel}
          </span>
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-white/95 backdrop-blur border border-slate-200 text-slate-800 min-w-[10rem] max-h-72 overflow-y-auto rounded-xl shadow-xl"
        align="start"
      >
        <DropdownMenuLabel className="text-slate-400 text-[10px] uppercase tracking-wider font-medium">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onSelect={() => onChange("")}
          className={`cursor-pointer focus:bg-slate-100 rounded-md ${
            !value ? "text-red-600 font-semibold" : "text-slate-800"
          }`}
        >
          {allLabel}
        </DropdownMenuItem>
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt}
            onSelect={() => onChange(opt)}
            className={`cursor-pointer focus:bg-slate-100 rounded-md ${
              value === opt ? "text-red-600 font-semibold" : "text-slate-800"
            }`}
          >
            {opt}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function FilterStrip({
  search,
  onSearchChange,
  language,
  onLanguageChange,
  genre,
  onGenreChange,
  sort,
  onSortChange,
  languageOptions,
  genreOptions,
}) {
  return (
    <div className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl p-3 md:p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search movies…"
            className="h-11 pl-9 rounded-xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:border-red-500 focus-visible:ring-red-500/20"
          />
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3 -mx-1 px-1 overflow-x-auto md:overflow-visible scrollbar-hide">
          <FilterDropdown
            label="Language"
            value={language}
            options={languageOptions}
            onChange={onLanguageChange}
          />
          <FilterDropdown
            label="Genre"
            value={genre}
            options={genreOptions}
            onChange={onGenreChange}
          />
          <FilterDropdown
            label="Sort"
            value={SORT_OPTIONS.find((s) => s.id === sort)?.label || ""}
            options={SORT_OPTIONS.map((s) => s.label)}
            onChange={(label) => {
              const found = SORT_OPTIONS.find((s) => s.label === label);
              onSortChange(found ? found.id : "newest");
            }}
            allLabel="Newest"
          />
        </div>
      </div>
    </div>
  );
}

function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useFilteredMovies({ nowShowing = false } = {}) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("");
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState("newest");
  // Bumped by refetch() to re-run the effect without reloading the page.
  const [retryNonce, setRetryNonce] = useState(0);

  const debouncedSearch = useDebouncedValue(search, 350);

  useEffect(() => {
    let alive = true;
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (nowShowing) params.set("nowShowing", "true");
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (language) params.set("language", language);
        if (genre) params.set("genre", genre);
        const qs = params.toString();
        const res = await api.get(`/movies${qs ? `?${qs}` : ""}`);
        if (!alive) return;
        if (res.data?.statusCode === 200) {
          setMovies(Array.isArray(res.data.data) ? res.data.data : []);
        } else {
          throw new Error(res.data?.message || "Unknown error");
        }
      } catch (err) {
        if (!alive) return;
        const msg = err.response?.data?.message || err.message;
        setError(`Error loading movies: ${msg}`);
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchMovies();
    return () => {
      alive = false;
    };
  }, [nowShowing, debouncedSearch, language, genre, retryNonce]);

  const refetch = useCallback(() => setRetryNonce((n) => n + 1), []);

  // Sort client-side – cheap and avoids leaning on backend support.
  const sorted = useMemo(() => {
    const copy = [...movies];
    if (sort === "topRated") {
      copy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === "soonest") {
      copy.sort(
        (a, b) =>
          new Date(a.releaseDate || 0).getTime() -
          new Date(b.releaseDate || 0).getTime()
      );
    } else {
      // newest
      copy.sort(
        (a, b) =>
          new Date(b.releaseDate || 0).getTime() -
          new Date(a.releaseDate || 0).getTime()
      );
    }
    return copy;
  }, [movies, sort]);

  const languageOptions = useMemo(() => {
    const set = new Set(COMMON_LANGUAGES);
    movies.forEach((m) => {
      if (Array.isArray(m.languages)) m.languages.forEach((l) => l && set.add(l));
      if (m.language) set.add(m.language);
    });
    return Array.from(set).filter(Boolean).sort();
  }, [movies]);

  const genreOptions = useMemo(() => {
    const set = new Set();
    movies.forEach((m) => {
      if (Array.isArray(m.genres)) m.genres.forEach((g) => g && set.add(g));
    });
    return Array.from(set).sort();
  }, [movies]);

  return {
    movies: sorted,
    loading,
    error,
    refetch,
    filters: {
      search,
      language,
      genre,
      sort,
      onSearchChange: setSearch,
      onLanguageChange: setLanguage,
      onGenreChange: setGenre,
      onSortChange: setSort,
    },
    options: { languageOptions, genreOptions },
  };
}

/**
 * Shared shell for the Movies / Now Showing pages. Both screens share the same
 * dark-navy hero, decorative red glows, filter strip, and grid — only the
 * heading copy and the underlying data filter change.
 */
function MoviesShell({ title, subtitle, nowShowing }) {
  const { movies, loading, error, filters, options, refetch } =
    useFilteredMovies({ nowShowing });

  return (
    <PageTransition className="relative min-h-screen bg-white py-10 md:py-16 overflow-hidden">
      {/* Decorative red glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-0"
      >
        <div className="absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-red-600/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-rose-700/10 blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-10"
        >
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base">{subtitle}</p>
        </motion.div>

        <FilterStrip
          {...filters}
          languageOptions={options.languageOptions}
          genreOptions={options.genreOptions}
        />

        {loading ? (
          <MovieGridSkeleton count={8} />
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
            <p className="text-rose-700 text-base">{error}</p>
            <Button
              className="mt-4 h-11 bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 rounded-xl"
              onClick={() => refetch?.()}
            >
              Try Again
            </Button>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <motion.span
              className="inline-flex"
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Search className="w-12 h-12 mb-4 text-slate-500" />
            </motion.span>
            <p className="text-lg mt-2">No movies match your filters.</p>
          </div>
        ) : (
          <Stagger
            asScroll
            gap={0.04}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
          >
            <AnimatePresence mode="popLayout">
              {movies.map((movie, index) => (
                <StaggerItem
                  key={movie._id || index}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    y: -10,
                    transition: { duration: 0.2 },
                  }}
                >
                  <MovieCard movie={movie} index={index} />
                </StaggerItem>
              ))}
            </AnimatePresence>
          </Stagger>
        )}
      </div>
    </PageTransition>
  );
}

export function NowShowing() {
  return (
    <MoviesShell
      title="Now Showing"
      subtitle="What's playing in cinemas this week."
      nowShowing
    />
  );
}

export { MoviesShell };
