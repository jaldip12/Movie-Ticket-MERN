import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Ticket,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ScrollReveal } from "@/components/ui/Motion";
import { springSnappy } from "@/lib/motion";

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatReleaseDate(iso) {
  if (!iso) return "TBA";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "TBA";
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function ComingSoonSkeleton() {
  return (
    <div className="flex gap-4 md:gap-5 overflow-hidden pb-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-[160px] md:w-[200px] rounded-2xl border border-slate-200 bg-slate-50 animate-pulse overflow-hidden"
        >
          <div className="w-full aspect-[2/3] bg-slate-50" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-3/4 bg-slate-100 rounded" />
            <div className="h-3 w-1/2 bg-slate-50 rounded" />
            <div className="h-7 w-full bg-slate-50 rounded mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

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
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose?.();
        }
      }}
      className="flex flex-col gap-1.5 mt-2"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoFocus
        className="w-full h-8 px-2 text-xs rounded-md bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20"
        required
      />
      <div className="flex items-center gap-1.5">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-semibold py-1.5 rounded-md shadow-sm transition-all disabled:opacity-60"
        >
          {submitting ? "..." : "Subscribe"}
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

function ComingSoonCard({ movie, defaultEmail }) {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -3 }}
      transition={springSnappy}
      className="group relative flex-shrink-0 w-[170px] md:w-[210px] rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-b from-slate-50 to-white hover:border-red-200 transition-colors"
    >
      <button
        type="button"
        onClick={() => navigate(`/movies/${movie._id}`)}
        className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
        aria-label={`Open ${movie.title}`}
      >
        <div className="relative w-full aspect-[2/3] overflow-hidden bg-white">
          <img
            src={movie.poster}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
          <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/90 border border-slate-200 backdrop-blur-sm">
            <Ticket className="w-3 h-3 text-red-600" />
            <span className="text-[10px] font-semibold text-slate-900 uppercase tracking-wider">
              Coming
            </span>
          </div>
        </div>
      </button>
      <div className="p-3 md:p-3.5">
        <h3 className="text-sm md:text-base font-semibold text-slate-900 truncate">
          {movie.title}
        </h3>
        <p className="mt-1 text-[11px] md:text-xs text-slate-400 inline-flex items-center gap-1">
          <CalendarClock className="w-3 h-3 text-red-600" />
          Releases {formatReleaseDate(movie.releaseDate)}
        </p>

        <AnimatePresence initial={false} mode="wait">
          {showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
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
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-800 hover:bg-red-50 hover:border-red-200 hover:text-red-700 rounded-md text-xs font-medium py-1.5 transition-colors"
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

export function ComingSoonRail() {
  const { user } = useAuth();
  const scrollRef = useRef(null);
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
        if (alive) setMovies([]);
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

  if (!loading && movies.length === 0) return null;

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
              <Ticket className="w-3.5 h-3.5" />
              On the way
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Coming soon
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Subscribe and we'll email you on release day.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/coming-soon"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 hover:text-red-700 transition-colors whitespace-nowrap"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
            {!loading && movies.length > 3 && (
              <div className="hidden md:flex gap-2">
                <button
                  type="button"
                  onClick={() => scrollBy(-1)}
                  aria-label="Scroll left"
                  className="grid place-items-center w-10 h-10 rounded-full bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollBy(1)}
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
          <ComingSoonSkeleton />
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-5 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {movies.map((movie, idx) => (
              <motion.div
                key={movie._id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.3) }}
                className="snap-start"
              >
                <ComingSoonCard movie={movie} defaultEmail={defaultEmail} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-4 md:hidden flex justify-center">
          <Link
            to="/coming-soon"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 hover:text-red-700 transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </ScrollReveal>
  );
}

export default ComingSoonRail;
