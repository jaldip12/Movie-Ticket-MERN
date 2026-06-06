import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Play, Star, Ticket, X } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/ui/Motion";

const chipBase =
  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border";
const neutralChip = `${chipBase} bg-white/5 text-slate-700 border-slate-200`;

/**
 * Convert assorted YouTube URL formats into a `/embed/<id>` URL safe to drop
 * in an <iframe>. Returns the input untouched if it's not a recognised
 * YouTube URL.
 */
export function toEmbedUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (host.endsWith("youtube.com")) {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : url;
      }
      if (u.pathname.startsWith("/embed/")) {
        return url;
      }
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/")[2];
        return id ? `https://www.youtube.com/embed/${id}` : url;
      }
    }
    return url;
  } catch {
    return url;
  }
}

function TrailerModal({ embedUrl, title, onClose }) {
  const closeBtnRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    // Save current focus + lock scroll
    previouslyFocusedRef.current = document.activeElement;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button on open (next tick to ensure it's mounted)
    const focusTimer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 0);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      clearTimeout(focusTimer);
      // Restore focus to the previously-focused element
      if (
        previouslyFocusedRef.current &&
        typeof previouslyFocusedRef.current.focus === "function"
      ) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} trailer`}
      onClick={onClose}
    >
      <button
        ref={closeBtnRef}
        type="button"
        aria-label="Close trailer"
        className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 rounded-full p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X className="w-6 h-6" />
      </button>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-slate-300 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={embedUrl}
          className="w-full h-full"
          title={`${title} Trailer`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </motion.div>
    </motion.div>
  );
}

export default function MovieHero({
  movie,
  formats = [],
  reviewSummary,
  onBookClick,
}) {
  const navigate = useNavigate();
  const [showTrailer, setShowTrailer] = useState(false);
  const embedUrl = toEmbedUrl(movie?.trailerUrl);

  // Backdrop parallax — subtle translate-Y as page scrolls
  const sectionRef = useRef(null);
  const { scrollY } = useScroll();
  const backdropY = useTransform(scrollY, [0, 600], [0, -20]);

  const languageLabel =
    Array.isArray(movie.languages) && movie.languages.length > 0
      ? movie.languages.join(" / ")
      : movie.language || "—";

  const ratingValue =
    typeof movie.rating === "number" && Number.isFinite(movie.rating)
      ? movie.rating.toFixed(1)
      : null;

  const reviewCount =
    reviewSummary?.count ?? movie.votes ?? null;

  const formatHours = (mins) => {
    if (!mins || mins <= 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const durationText = formatHours(movie.duration);

  const releaseLabel = movie.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="relative" ref={sectionRef}>
      {/* Blurred backdrop with subtle parallax */}
      <motion.div
        style={{ y: backdropY }}
        className="absolute inset-0 overflow-hidden h-[55vh] md:h-[70vh] will-change-transform"
      >
        <img
          src={movie.poster}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover blur-2xl scale-110 opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/60 via-white/85 to-white" />
      </motion.div>

      <div className="relative container mx-auto px-4 pt-4 pb-10 md:pt-6 md:pb-16">
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-700 hover:text-red-600 hover:bg-slate-50 mb-4 transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-end">
          {/* Poster — cinematic hover tilt */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            whileHover={{ rotateY: -3, scale: 1.02 }}
            style={{ transformPerspective: 800 }}
            className="w-[60vw] max-w-[280px] md:w-[280px] shrink-0 rounded-2xl overflow-hidden shadow-xl border border-slate-200 will-change-transform"
          >
            <img
              src={movie.poster || "/placeholder-poster.jpg"}
              alt={movie.title}
              className="w-full aspect-[2/3] object-cover"
            />
          </motion.div>

          {/* Right column */}
          <Stagger gap={0.08} className="flex-1 text-slate-900">
            <StaggerItem>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-3 md:mb-4 drop-shadow-lg">
                {movie.title}
              </h1>
            </StaggerItem>

            {/* Rating + meta row */}
            <StaggerItem>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {ratingValue ? (
                  <div className="inline-flex items-center bg-slate-50 border border-slate-200 backdrop-blur-sm rounded-full px-3 py-1">
                    <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-400 mr-1.5" />
                    <span className="font-semibold text-slate-900 text-sm">
                      {ratingValue}
                    </span>
                    <span className="text-slate-400 text-xs ml-0.5">/5</span>
                    {reviewCount != null && (
                      <span className="text-slate-400 text-xs ml-1.5">
                        ({reviewCount.toLocaleString()} review
                        {reviewCount === 1 ? "" : "s"})
                      </span>
                    )}
                  </div>
                ) : (
                  <span className={neutralChip}>No reviews yet</span>
                )}
                <span
                  className={`${chipBase} bg-red-100 text-red-700 border-red-200 uppercase font-semibold`}
                >
                  {movie.certification}
                </span>
                {durationText && (
                  <span className={neutralChip}>
                    <Clock className="w-3 h-3 mr-1" />
                    {durationText}
                  </span>
                )}
                {(formats.length > 0 ? formats : ["2D"]).map((f) => (
                  <span
                    key={f}
                    className={`${chipBase} bg-slate-100 text-slate-800 border-white/15 uppercase font-semibold tracking-wider`}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </StaggerItem>

            {/* Languages */}
            <StaggerItem>
              <div className="text-slate-700 text-sm md:text-base mb-2">
                {languageLabel}
              </div>
            </StaggerItem>

            {/* Genres */}
            {Array.isArray(movie.genres) && movie.genres.length > 0 && (
              <StaggerItem>
                <div className="text-slate-400 text-sm mb-4">
                  {movie.genres.slice(0, 4).join(" · ")}
                </div>
              </StaggerItem>
            )}

            {/* CTA row */}
            <StaggerItem>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {movie.trailerUrl && (
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      onClick={() => setShowTrailer(true)}
                      className="h-11 px-5 bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 rounded-xl transition-colors"
                    >
                      <Play className="w-4 h-4 mr-2 fill-current" />
                      Watch Trailer
                    </Button>
                  </motion.div>
                )}
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    onClick={onBookClick}
                    className="h-11 px-7 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all"
                  >
                    <Ticket className="w-4 h-4 mr-2" />
                    Book Tickets
                  </Button>
                </motion.div>
              </div>
            </StaggerItem>

            {/* Release line */}
            {releaseLabel && (
              <StaggerItem>
                <div className="text-slate-400 text-xs md:text-sm flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Releasing {releaseLabel}</span>
                  {movie.director && (
                    <span className="ml-1">· Director: {movie.director}</span>
                  )}
                </div>
              </StaggerItem>
            )}
          </Stagger>
        </div>
      </div>

      {showTrailer && embedUrl && (
        <TrailerModal
          embedUrl={embedUrl}
          title={movie.title}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>
  );
}
