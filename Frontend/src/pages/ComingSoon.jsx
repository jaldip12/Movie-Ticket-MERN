import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { CalendarClock, Bell, Clock, X } from "lucide-react";
import PublicShell from "@/components/Layout/PublicShell";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  PageTransition,
  Stagger,
  StaggerItem,
} from "@/components/ui/Motion";
import { springSnappy } from "@/lib/motion";

// Inline SVG poster fallback (matches the style used on the Movies grid).
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

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatReleaseDate(iso) {
  if (!iso) return "TBA";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "TBA";
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function NotifyForm({ movieId, defaultEmail, onClose }) {
  const [email, setEmail] = useState(defaultEmail || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (submitting) return;

    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      toast.error("Please enter a valid email");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/movie-notifications", { movieId, email: trimmed });
      toast.success("We'll let you know!");
      onClose?.();
    } catch (err) {
      const message =
        err?.response?.data?.message || "Could not subscribe — try again";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onClick={(e) => e.stopPropagation()}
      className="flex flex-col gap-2 mt-3"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoFocus
        className="w-full h-9 px-2.5 text-sm rounded-md bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20"
        required
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-semibold py-1.5 rounded-md shadow-sm transition-all disabled:opacity-60"
        >
          {submitting ? "Subscribing..." : "Subscribe"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="grid place-items-center w-7 h-7 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}

function MovieCard({ movie, defaultEmail }) {
  const [showForm, setShowForm] = useState(false);
  const fallbackTriedRef = useRef(false);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={springSnappy}
      className="group rounded-xl overflow-hidden border border-slate-200 bg-white/60 shadow-lg shadow-slate-200 transition-colors hover:border-red-200"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-white">
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          onError={(e) => {
            if (fallbackTriedRef.current) return;
            fallbackTriedRef.current = true;
            e.target.src = FALLBACK_IMAGE;
          }}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-white/30 to-transparent" />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-slate-900 text-base font-semibold tracking-tight line-clamp-1">
          {movie.title}
        </h3>
        <p className="text-xs text-slate-400 inline-flex items-center gap-1.5">
          <CalendarClock className="w-3.5 h-3.5 text-red-600" />
          Releases on {formatReleaseDate(movie.releaseDate)}
        </p>

        <AnimatePresence initial={false} mode="wait">
          {showForm ? (
            <motion.div
              key="form"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <NotifyForm
                movieId={movie._id}
                defaultEmail={defaultEmail}
                onClose={() => setShowForm(false)}
              />
            </motion.div>
          ) : (
            <motion.button
              key="cta"
              type="button"
              onClick={() => setShowForm(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-800 hover:bg-red-50 hover:border-red-200 hover:text-red-700 rounded-md text-xs font-medium py-1.5 transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              Notify me
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// 3-by-4 placeholder grid shown while the coming-soon list loads.
function ComingSoonGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden border border-slate-200 bg-white/60 animate-pulse"
        >
          <div className="w-full aspect-[2/3] bg-slate-100" />
          <div className="p-4 space-y-2">
            <div className="h-4 w-3/4 bg-slate-100 rounded" />
            <div className="h-3 w-1/2 bg-slate-100 rounded" />
            <div className="h-7 w-full bg-slate-100 rounded mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ComingSoon() {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultEmail = user?.email || "";

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/movies/coming-soon");
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        if (alive) setMovies(list);
      } catch (err) {
        if (alive) toast.error("Failed to load coming soon movies");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <PublicShell>
      <PageTransition className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-0"
        >
          <div className="absolute -top-40 -left-40 h-[400px] w-[400px] rounded-full bg-red-600/10 blur-3xl" />
          <div className="absolute top-[40%] -right-40 h-[400px] w-[400px] rounded-full bg-rose-700/10 blur-3xl" />
        </div>

        <section className="container mx-auto px-4 py-10 md:py-14 relative z-10">
          <div className="mb-8 md:mb-10">
            <p className="text-red-600 text-xs font-semibold tracking-widest uppercase mb-2">
              Upcoming Releases
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Coming Soon
            </h1>
            <p className="mt-2 text-sm md:text-base text-slate-400 max-w-xl">
              Be the first to know when these hit screens. Subscribe and we'll
              email you on release day.
            </p>
          </div>

          {loading ? (
            <ComingSoonGridSkeleton count={10} />
          ) : movies.length === 0 ? (
            <div className="text-slate-500 text-center py-20 flex flex-col items-center gap-3">
              <motion.span
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="grid place-items-center w-14 h-14 rounded-2xl bg-red-50 border border-red-200"
              >
                <Clock className="w-7 h-7 text-red-600" />
              </motion.span>
              <p className="text-base font-semibold text-slate-900">
                No upcoming movies right now — check back soon.
              </p>
              <button
                type="button"
                onClick={() => {
                  // Scrolling up gives mobile a clearer "I can use the
                  // page header to subscribe to alerts" affordance.
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="mt-2 inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-semibold shadow-lg transition-all"
              >
                <Bell className="w-4 h-4" />
                Get notified
              </button>
            </div>
          ) : (
            <Stagger
              asScroll
              gap={0.05}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
            >
              {movies.map((m) => (
                <StaggerItem key={m._id}>
                  <MovieCard movie={m} defaultEmail={defaultEmail} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </section>
      </PageTransition>
    </PublicShell>
  );
}
