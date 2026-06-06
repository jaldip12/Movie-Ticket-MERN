import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Loader2,
  QrCode,
  Share2,
  Receipt,
} from "lucide-react";
import AccountShell from "@/components/Layout/AccountShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageTransition, Stagger, StaggerItem } from "@/components/ui/Motion";
import QRTicket from "@/components/tickets/QRTicket";
import PriceBreakdown from "@/components/booking/PriceBreakdown";
import ConfirmDialog from "@/components/Admin/ConfirmDialog";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

const FALLBACK_POSTER = "/fallback.jpg";

const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-IN", {
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

const isShowInFuture = (show) => {
  if (!show?.date) return false;
  try {
    const showDate = new Date(show.date);
    const [hours = 0, minutes = 0] = String(show.time || "00:00")
      .split(":")
      .map((n) => parseInt(n, 10) || 0);
    showDate.setHours(hours, minutes, 0, 0);
    return showDate.getTime() > Date.now();
  } catch {
    return false;
  }
};

const statusBadgeClass = (status) => {
  switch (status) {
    case "confirmed":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "cancelled":
      return "bg-rose-100 text-rose-700 border border-rose-200";
    case "pending":
      return "bg-amber-100 text-amber-700 border border-amber-500/25";
    default:
      return "bg-white/5 text-slate-700 border border-slate-200";
  }
};

const FILTERS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
];

function classifyBooking(booking) {
  const status = booking?.status || "confirmed";
  if (status === "cancelled") return "cancelled";
  if (isShowInFuture(booking?.showId)) return "upcoming";
  return "past";
}

function TicketCardSkeleton() {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col md:flex-row">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200" />
      <div className="w-full md:w-44 md:min-w-44">
        <Skeleton className="w-full h-56 md:h-full rounded-none" />
      </div>
      <div className="flex-1 p-5 md:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-48 sm:col-span-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-10 rounded-md" />
          <Skeleton className="h-6 w-10 rounded-md" />
          <Skeleton className="h-6 w-10 rounded-md" />
        </div>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketCard({ booking, onCancel, cancellingId }) {
  const [showQr, setShowQr] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const show = booking?.showId || {};
  const movie = show?.movieId || {};
  const screen = show?.screenId || {};
  const cinema = screen?.cinemaId || {};

  const status = booking?.status || "confirmed";
  const canCancel = status === "confirmed" && isShowInFuture(show);
  const isCancelling = cancellingId === booking?._id;
  const canShowQr = status === "confirmed";

  const handleShare = async () => {
    if (!booking?._id) return;
    const url = `${window.location.origin}/t/${booking._id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Ticket link copied to clipboard");
    } catch {
      // Fallback: open a prompt so the user can copy manually.
      window.prompt("Copy your ticket link:", url);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 360, damping: 26 }}
      className="relative rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl overflow-hidden flex flex-col md:flex-row"
    >
      {/* Red accent stripe on the left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-red-700" />

      <div className="w-full md:w-44 md:min-w-44 bg-white md:pl-1">
        <img
          src={movie?.poster || FALLBACK_POSTER}
          alt={movie?.title || "Movie poster"}
          className="w-full h-56 md:h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_POSTER;
          }}
        />
      </div>

      <div className="flex-1 p-5 md:p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
              {movie?.title || "Untitled"}
            </h2>
            <div className="text-[11px] text-slate-500 mt-1.5 font-mono uppercase tracking-wider">
              ID · {String(booking?._id || "").slice(-8)}
            </div>
          </div>
          <Badge
            className={`uppercase tracking-wide text-[10px] font-semibold px-2.5 py-1 ${statusBadgeClass(
              status
            )}`}
          >
            {status}
          </Badge>
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
              {booking.seats.map((seat) => (
                <span
                  key={seat}
                  className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-md text-xs font-semibold"
                >
                  {seat}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
              Total paid
            </p>
            <div className="text-xl font-bold text-slate-900">
              ₹{booking?.totalAmount ?? 0}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {canShowQr && (
              <Button
                onClick={() => setShowQr((v) => !v)}
                className="bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-200 hover:text-slate-900 rounded-lg font-medium h-9 px-3 transition-colors"
              >
                <QrCode className="h-4 w-4 mr-1.5" />
                {showQr ? "Hide QR" : "Show QR"}
              </Button>
            )}
            <Button
              onClick={() => setShowReceipt((v) => !v)}
              className="bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-200 hover:text-slate-900 rounded-lg font-medium h-9 px-3 transition-colors"
            >
              <Receipt className="h-4 w-4 mr-1.5" />
              {showReceipt ? "Hide receipt" : "Show receipt"}
            </Button>
            <Button
              onClick={handleShare}
              className="bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-200 hover:text-slate-900 rounded-lg font-medium h-9 px-3 transition-colors"
            >
              <Share2 className="h-4 w-4 mr-1.5" />
              Share
            </Button>
            {canCancel && (
              <Button
                onClick={() => onCancel(booking._id)}
                disabled={isCancelling}
                className="bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-500/25 hover:text-rose-200 rounded-lg font-medium h-9 px-4 transition-colors disabled:opacity-60"
              >
                {isCancelling ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Cancelling…
                  </span>
                ) : (
                  "Cancel"
                )}
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {showQr && canShowQr && (
            <motion.div
              key="qr-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mt-4 rounded-xl border border-slate-200 bg-white/60 p-4 flex flex-col items-center gap-2">
                <p className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                  Show this at the entry
                </p>
                <QRTicket value={booking._id} size={200} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {showReceipt && (
            <motion.div
              key="receipt-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mt-4">
                <PriceBreakdown
                  seatsTotal={booking?.seatsTotal || 0}
                  fnbTotal={booking?.fnbTotal || 0}
                  couponDiscount={
                    booking?.couponDiscount ??
                    booking?.appliedCoupon?.discountAmount ??
                    0
                  }
                  couponCode={booking?.appliedCoupon?.code || ""}
                  convenienceFee={booking?.convenienceFee || 0}
                  gstAmount={booking?.gstAmount || 0}
                  totalAmount={booking?.totalAmount || 0}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function MyTickets() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [filter, setFilter] = useState("upcoming");
  const [pendingCancelId, setPendingCancelId] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/bookings/me");
      const data = res.data?.data || [];
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to load your tickets.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const counts = useMemo(() => {
    const c = { upcoming: 0, past: 0, cancelled: 0 };
    for (const b of bookings) {
      const k = classifyBooking(b);
      c[k] = (c[k] || 0) + 1;
    }
    return c;
  }, [bookings]);

  const visibleBookings = useMemo(
    () => bookings.filter((b) => classifyBooking(b) === filter),
    [bookings, filter]
  );

  const handleRequestCancel = (id) => {
    if (!id) return;
    setPendingCancelId(id);
  };

  const handleConfirmCancel = async () => {
    const id = pendingCancelId;
    setPendingCancelId(null);
    if (!id) return;
    setCancellingId(id);
    try {
      await api.post(`/bookings/me/${id}/cancel`);
      toast.success("Booking cancelled.");
      await fetchBookings();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Could not cancel booking. Try again."
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <PageTransition>
      <AccountShell>
        <div className="pb-4 mb-6 border-b border-slate-200 flex items-start gap-3">
          <div className="grid place-items-center w-10 h-10 rounded-xl bg-red-100 border border-red-200 text-red-700 flex-shrink-0">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">My Tickets</h2>
            <p className="text-sm text-slate-400 mt-1">
              All your past and upcoming shows in one place.
            </p>
          </div>
        </div>

        {/* sr-only live region for toast announcements (cancel / removal) */}
        <div role="status" aria-live="polite" className="sr-only">
          {cancellingId ? "Cancelling booking" : ""}
        </div>

        {/* Status filter tabs */}
        <div
          className="mb-6 flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 w-fit"
          role="tablist"
          aria-label="Ticket status filter"
        >
          {FILTERS.map(({ key, label }) => {
            const active = filter === key;
            const count = counts[key] || 0;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(key)}
                className={[
                  "relative px-3.5 h-8 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5",
                  active
                    ? "text-white"
                    : "text-slate-700 hover:text-slate-900",
                ].join(" ")}
              >
                {active && (
                  <motion.span
                    layoutId="mytickets-filter-pill"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-600 to-red-700 shadow-md"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{label}</span>
                <span
                  className={[
                    "relative inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold",
                    active
                      ? "bg-white/25 text-white"
                      : "bg-white text-slate-600 border border-slate-200",
                  ].join(" ")}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="space-y-5">
            {[0, 1, 2].map((i) => (
              <TicketCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
            <p className="text-rose-700">{error}</p>
            <Button
              className="mt-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg h-10 px-5 transition-all"
              onClick={fetchBookings}
            >
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="py-14 flex flex-col items-center text-center">
            <div className="grid place-items-center w-14 h-14 rounded-2xl bg-red-100 border border-red-200 mb-4">
              <Ticket className="h-7 w-7 text-red-600" />
            </div>
            <p className="text-lg font-semibold text-slate-900">No tickets yet.</p>
            <p className="text-sm text-slate-400 mt-2 max-w-sm">
              Book a show and your tickets will appear here.
            </p>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && visibleBookings.length === 0 && (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="grid place-items-center w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 mb-3">
              <Ticket className="h-6 w-6 text-slate-500" />
            </div>
            <p className="text-base font-semibold text-slate-900">
              Nothing in {filter === "upcoming" ? "Upcoming" : filter === "past" ? "Past" : "Cancelled"}.
            </p>
            <p className="text-sm text-slate-400 mt-1.5 max-w-sm">
              Try a different tab above.
            </p>
          </div>
        )}

        {!loading && !error && visibleBookings.length > 0 && (
          <Stagger gap={0.07} key={filter} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {visibleBookings.map((booking) => (
                <StaggerItem key={booking._id}>
                  <TicketCard
                    booking={booking}
                    onCancel={handleRequestCancel}
                    cancellingId={cancellingId}
                  />
                </StaggerItem>
              ))}
            </AnimatePresence>
          </Stagger>
        )}

        <ConfirmDialog
          open={Boolean(pendingCancelId)}
          onClose={() => setPendingCancelId(null)}
          onConfirm={handleConfirmCancel}
          title="Cancel this booking?"
          message="Your seats will be released and any refund will follow the cinema's policy. This cannot be undone."
          confirmLabel="Yes, cancel booking"
          cancelLabel="Keep booking"
          danger
        />
      </AccountShell>
    </PageTransition>
  );
}
