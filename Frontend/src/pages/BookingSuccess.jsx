import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Film,
  Loader2,
  MapPin,
  Share2,
  Ticket,
  Utensils,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Header } from "@/components/Headers/header";
import { Footer } from "@/components/Footer/footer";
import { Button } from "@/components/ui/button";
import QRTicket from "@/components/tickets/QRTicket";
import { PageTransition } from "@/components/ui/Motion";
import { api } from "@/lib/api";

const FALLBACK_POSTER = "/fallback.jpg";

// `relative` is required here so the absolutely-positioned red bar on the
// ticket card stays anchored to its parent card (it was previously bleeding
// up to the nearest positioned ancestor).
const glassCard =
  "relative rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl";

// 12 confetti particles. Pre-computed once at module scope so the array
// identity is stable and React doesn't reshuffle on every re-render.
const CONFETTI_PARTICLES = Array.from({ length: 14 }, (_, i) => {
  // Deterministic pseudo-random so SSR + client agree on positions.
  const seed = (i * 37) % 100;
  return {
    id: i,
    left: `${(seed * 1.3) % 100}%`,
    color: ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#a855f7"][i % 5],
    delay: (i % 6) * 0.05,
    drift: ((seed % 40) - 20),
    rotate: (seed % 360) - 180,
    size: 6 + (seed % 8),
  };
});

const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [hours, minutes] = String(timeStr).split(":");
  const date = new Date();
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10) || 0);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const BookingSuccess = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      navigate("/account/tickets", { replace: true });
      return;
    }
    let alive = true;
    (async () => {
      try {
        const res = await api.get(`/bookings/me/${bookingId}`);
        const data = res.data?.data;
        if (!alive) return;
        if (!data) {
          toast.error("Booking not found");
          navigate("/account/tickets", { replace: true });
          return;
        }
        setBooking(data);
      } catch (err) {
        if (!alive) return;
        const status = err?.response?.status;
        if (status === 404 || status === 403) {
          toast.error("We couldn't find that booking.");
        } else {
          toast.error(
            err?.response?.data?.message || "Could not load your booking."
          );
        }
        navigate("/account/tickets", { replace: true });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [bookingId, navigate]);

  const handleShareWhatsApp = () => {
    if (!booking?._id) return;
    const url = `${window.location.origin}/t/${booking._id}`;
    const text = `My ticket: ${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-white text-slate-900 flex flex-col">
        <Header />
        <main
          className="flex-1 grid place-items-center"
          role="status"
          aria-label="Loading booking details"
          aria-live="polite"
        >
          <Loader2 className="h-10 w-10 animate-spin text-red-600" />
          <span className="sr-only">Loading booking details</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (!booking) return null;

  const show = booking?.showId || {};
  const movie = show?.movieId || {};
  const screen = show?.screenId || {};
  const cinema = screen?.cinemaId || {};
  const fnbPin = booking?.fnbPin || booking?.fnb?.pin || null;

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-white text-slate-900 flex flex-col overflow-hidden print:bg-white">
        {/* Print stylesheet: hide everything except the ticket card region. */}
        <style>{`
          @media print {
            @page { margin: 12mm; }
            body { background: #fff !important; }
            .booking-success-print-hide { display: none !important; }
            .booking-success-print-only { display: block !important; }
            .booking-success-ticket {
              box-shadow: none !important;
              border-color: #e5e7eb !important;
              background: #fff !important;
              page-break-inside: avoid;
            }
          }
        `}</style>

        {/* Decorative red glows */}
        <div
          className="pointer-events-none absolute inset-0 -z-0 booking-success-print-hide"
          aria-hidden="true"
        >
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-red-600/10 blur-3xl" />
          <div className="absolute top-1/2 -right-40 h-[500px] w-[500px] rounded-full bg-rose-700/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 h-[420px] w-[600px] rounded-full bg-emerald-50 blur-3xl" />
        </div>

        {/* Confetti burst on mount */}
        <div
          className="pointer-events-none absolute inset-0 z-20 overflow-hidden booking-success-print-hide"
          aria-hidden="true"
        >
          {CONFETTI_PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: -40, x: 0, opacity: 0, rotate: 0, scale: 0.6 }}
              animate={{
                y: [-40, 80, 240, 420],
                x: [0, p.drift, -p.drift, p.drift * 1.5],
                opacity: [0, 1, 1, 0],
                rotate: [0, p.rotate, p.rotate * 2],
                scale: [0.6, 1, 1, 0.8],
              }}
              transition={{
                duration: 2.2,
                ease: "easeOut",
                delay: p.delay,
                times: [0, 0.15, 0.65, 1],
              }}
              style={{
                left: p.left,
                top: 80,
                width: p.size,
                height: p.size * 1.6,
                backgroundColor: p.color,
                borderRadius: 2,
              }}
              className="absolute"
            />
          ))}
        </div>

        <div className="booking-success-print-hide">
          <Header />
        </div>

        <main className="relative z-10 flex-1 container mx-auto px-4 py-12 max-w-3xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
          {/* Hero */}
          <motion.div
            variants={itemVariants}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: 0, opacity: 0 }}
              animate={{ scale: 1, rotate: -15, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 14,
                delay: 0.1,
              }}
              className="mx-auto grid place-items-center w-20 h-20 rounded-3xl bg-emerald-100 border border-emerald-200 mb-5 shadow-lg shadow-emerald-900/20"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </motion.div>
            <p className="text-emerald-700 text-xs font-semibold tracking-widest uppercase mb-2">
              Booking confirmed
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              You&apos;re going to the movies!
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              We&apos;ve sent your ticket to your account. Show the QR at the
              entrance.
            </p>
          </motion.div>

          {/* Ticket card */}
          <motion.div
            variants={itemVariants}
            className={`${glassCard} overflow-hidden booking-success-ticket`}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-red-700"
              aria-hidden="true"
            />

            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-44 md:min-w-44 bg-white">
                <img
                  src={movie?.poster || FALLBACK_POSTER}
                  alt={movie?.title || "Movie poster"}
                  className="w-full h-56 md:h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_POSTER;
                  }}
                />
              </div>

              <div className="flex-1 p-5 md:p-6 space-y-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                    {movie?.title || "Untitled"}
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-1.5 font-mono uppercase tracking-wider">
                    ID · {String(booking._id).slice(-8)}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="h-4 w-4 text-red-600 shrink-0" />
                    <span>{formatDate(show?.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="h-4 w-4 text-red-600 shrink-0" />
                    <span>{formatTime(show?.time)}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2 text-slate-700">
                    <MapPin className="h-4 w-4 text-red-600 shrink-0" />
                    <span className="truncate">
                      {cinema?.name || "Cinema"}
                      {screen?.name ? ` — ${screen.name}` : ""}
                    </span>
                  </div>
                </div>

                {Array.isArray(booking?.seats) && booking.seats.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-1.5">
                      Seats
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {booking.seats.map((seat, idx) => (
                        <motion.span
                          key={seat}
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 18,
                            delay: 0.6 + idx * 0.05,
                          }}
                          className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-md text-xs font-semibold"
                          aria-label={`Seat ${seat}`}
                        >
                          {seat}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-end justify-between pt-3 border-t border-slate-200">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                      Total paid
                    </p>
                    <div className="text-2xl font-bold text-slate-900">
                      ₹{booking?.totalAmount ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* QR */}
          <motion.div
            variants={itemVariants}
            className={`${glassCard} booking-success-ticket`}
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(220,38,38,0.35)",
                  "0 0 0 12px rgba(220,38,38,0)",
                ],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="rounded-2xl p-6 flex flex-col items-center text-center"
            >
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-medium mb-3">
                Show this at the entry
              </p>
              <div
                role="img"
                aria-label="Booking QR code"
                className="relative"
              >
                <QRTicket value={booking._id} size={220} />
                <span className="sr-only">
                  Booking reference: {String(booking._id).slice(-8)}. Present
                  this QR code at the cinema entry.
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* F&B PIN */}
          {fnbPin && (
            <motion.div
              variants={itemVariants}
              className={`${glassCard} p-5 flex items-start gap-4`}
            >
              <div className="grid place-items-center w-11 h-11 rounded-xl bg-amber-100 border border-amber-500/25 flex-shrink-0">
                <Utensils className="w-5 h-5 text-amber-700" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                  Snack counter PIN
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Show this PIN at the snack counter:{" "}
                  <span className="text-2xl font-extrabold tracking-[0.2em] text-slate-900 tabular-nums ml-1">
                    {fnbPin}
                  </span>
                </p>
              </div>
            </motion.div>
          )}

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 booking-success-print-hide"
          >
            <Link to="/account/tickets" className="flex-1">
              <Button className="w-full h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all">
                <Ticket className="w-4 h-4 mr-2" />
                View My Tickets
              </Button>
            </Link>
            <Button
              onClick={handleShareWhatsApp}
              className="flex-1 h-11 bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-500/25 hover:text-emerald-200 rounded-xl font-medium transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share with WhatsApp
            </Button>
            <Link to="/movies" className="flex-1">
              <Button className="w-full h-11 bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 rounded-xl font-medium transition-colors">
                <Film className="w-4 h-4 mr-2" />
                Browse more movies
              </Button>
            </Link>
          </motion.div>
          </motion.div>
        </main>

        <div className="booking-success-print-hide">
          <Footer />
        </div>
      </div>
    </PageTransition>
  );
};

export default BookingSuccess;
