import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowLeft, ChevronUp, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import FnbPicker from "@/components/booking/FnbPicker";
import CouponInput from "@/components/booking/CouponInput";
import PriceBreakdown from "@/components/booking/PriceBreakdown";
import StepIndicator from "@/components/booking/StepIndicator";
import MobileBottomSheet from "@/components/booking/MobileBottomSheet";
import {
  PageTransition,
  Stagger,
  StaggerItem,
} from "@/components/ui/Motion";
import { useAuth } from "@/context/AuthContext";

// Indian cinema fee rules — keep in sync with Backend confirmBooking().
const CONVENIENCE_FEE = 30;
const GST_RATE = 0.18;

const formatMmSs = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

// Shared "glass" surface token. Kept at module scope so it's not recreated
// per-render and to make it cheap to reuse elsewhere in this file.
const glassCard =
  "rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl";

/* ------------------------------------------------------------------ */
/*  Top-level subcomponents                                            */
/*  These were previously defined inline inside Proceedtopay which     */
/*  re-created their identity every render and forced React to remount */
/*  their subtrees. Pulling them out preserves identity and lets React */
/*  memoise + diff normally.                                           */
/* ------------------------------------------------------------------ */

const CountdownBadge = ({ remainingMs, size = "md" }) => {
  const expiringSoon = remainingMs > 0 && remainingMs <= 60_000;
  const critical = remainingMs > 0 && remainingMs <= 10_000;

  // <60s: gentle scale pulse. <10s: red colour flash on top of that.
  const animate = critical
    ? {
        scale: [1, 1.05, 1],
        backgroundColor: ["#fee2e2", "#fecaca", "#fee2e2"],
      }
    : expiringSoon
    ? { scale: [1, 1.05, 1] }
    : { scale: 1 };

  const transition = expiringSoon
    ? {
        duration: critical ? 0.6 : 1.1,
        repeat: Infinity,
        ease: "easeInOut",
      }
    : { duration: 0.2 };

  return (
    <motion.div
      animate={animate}
      transition={transition}
      className={`inline-flex items-center gap-2 rounded-xl text-sm font-bold border ${
        expiringSoon
          ? "bg-rose-100 text-rose-700 border-rose-200"
          : "bg-slate-50 text-slate-800 border-slate-200"
      } ${size === "lg" ? "px-4 py-3" : "px-4 py-2"}`}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Time left to confirm: ${formatMmSs(remainingMs)}`}
    >
      <Clock className={size === "lg" ? "w-5 h-5" : "w-4 h-4"} />
      <span className="text-[10px] uppercase tracking-wider opacity-80">
        Time left
      </span>
      <span
        className={`tabular-nums ${
          size === "lg" ? "text-2xl font-extrabold" : "text-base"
        }`}
      >
        {formatMmSs(remainingMs)}
      </span>
    </motion.div>
  );
};

const ConfirmButton = ({
  onClick,
  isConfirming,
  remainingMs,
  grandTotal,
  className = "",
}) => {
  const disabled = isConfirming || remainingMs <= 0;
  return (
    <motion.div whileTap={disabled ? undefined : { scale: 0.97 }} className={className}>
      <Button
        onClick={onClick}
        disabled={disabled}
        aria-disabled={disabled}
        title={isConfirming ? "Hold on, we're processing..." : undefined}
        className="w-full h-11 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isConfirming ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              role="status"
              aria-label="Confirming booking"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Confirming…
          </span>
        ) : (
          `Confirm & Pay ₹${grandTotal}`
        )}
      </Button>
    </motion.div>
  );
};

const OrderSummary = ({
  inSheet = false,
  remainingMs,
  seatsTotal,
  fnbTotal,
  discount,
  appliedCoupon,
  convenienceFee,
  gstAmount,
  grandTotal,
  isConfirming,
  onConfirm,
  onCancel,
}) => (
  <div className={inSheet ? "" : `${glassCard} p-5 text-slate-900`}>
    <Stagger gap={0.05} className="contents">
      <StaggerItem>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              Booking expires in
            </p>
            <div className="mt-1.5">
              <CountdownBadge remainingMs={remainingMs} size="lg" />
            </div>
          </div>
        </div>
      </StaggerItem>

      <StaggerItem>
        <PriceBreakdown
          seatsTotal={seatsTotal}
          fnbTotal={fnbTotal}
          couponDiscount={discount}
          couponCode={appliedCoupon?.code || ""}
          convenienceFee={convenienceFee}
          gstAmount={gstAmount}
          totalAmount={grandTotal}
          className={inSheet ? "border-0 bg-transparent shadow-none p-0" : ""}
        />
      </StaggerItem>

      <StaggerItem>
        <div className="mt-4 flex flex-col gap-2">
          <ConfirmButton
            onClick={onConfirm}
            isConfirming={isConfirming}
            remainingMs={remainingMs}
            grandTotal={grandTotal}
            className="w-full"
          />
          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="h-10 inline-flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel & go back
          </button>
        </div>
      </StaggerItem>
    </Stagger>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

const Proceedtopay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const stateRef = useRef(location.state || {});
  const [bookingDetails, setBookingDetails] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [isCreatingLock, setIsCreatingLock] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [fnbItems, setFnbItems] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const cancelledRef = useRef(false);

  // Initial load + lock creation
  useEffect(() => {
    const { selectedSeats, totalAmount, showDetails } = stateRef.current;

    if (!selectedSeats || !showDetails || typeof totalAmount !== "number") {
      navigate("/");
      return;
    }

    const seatsTotal = totalAmount;
    setBookingDetails({ selectedSeats, seatsTotal, showDetails });

    let alive = true;
    (async () => {
      try {
        const seats = selectedSeats.map(
          (seat) => `${seat.row}${seat.displayNumber}`
        );
        const res = await api.post("/bookings", {
          showId: showDetails.showId,
          seats,
        });
        if (!alive) return;
        const booking = res.data?.data;
        if (!booking?._id || !booking?.lockedUntil) {
          throw new Error("Invalid booking response");
        }
        setBookingId(booking._id);
        setLockedUntil(new Date(booking.lockedUntil));
      } catch (err) {
        if (!alive) return;
        const status = err.response?.status;
        const message =
          err.response?.data?.message ||
          (status === 409
            ? "Some seats were just taken. Please re-select."
            : "Could not lock seats. Please try again.");
        toast.error(message);
        navigate(-1);
      } finally {
        if (alive) setIsCreatingLock(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  // Countdown
  useEffect(() => {
    if (!lockedUntil) return undefined;

    const tick = () => {
      const ms = lockedUntil.getTime() - Date.now();
      setRemainingMs(ms);
      if (ms <= 0) {
        clearInterval(handle);
        if (!cancelledRef.current) {
          cancelledRef.current = true;
          toast.error("Lock expired, please re-select seats");
          navigate(-1);
        }
      }
    };

    tick();
    const handle = setInterval(tick, 1000);
    return () => clearInterval(handle);
  }, [lockedUntil, navigate]);

  // Best-effort cancellation on tab close
  useEffect(() => {
    if (!bookingId) return undefined;

    const beforeUnload = () => {
      try {
        const url = `${api.defaults.baseURL}/bookings/me/${bookingId}/cancel`;
        // sendBeacon doesn't carry cookies on every browser, but it's a
        // best-effort hint; actual cleanup is also handled server-side by
        // the periodic lock-cleanup loop.
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, new Blob([], { type: "application/json" }));
        }
      } catch {
        // ignore — server-side cleanup is the source of truth
      }
    };

    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [bookingId]);

  const fnbTotal = useMemo(
    () =>
      fnbItems.reduce(
        (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0),
        0
      ),
    [fnbItems]
  );

  const seatsTotal = bookingDetails?.seatsTotal || 0;
  // CouponInput emits { code, discount, finalTotal } — read `discount` not `discountAmount`.
  const discount = appliedCoupon?.discount || 0;
  const convenienceFee = CONVENIENCE_FEE;

  // Memoise the price math so re-renders don't recompute it (and don't
  // produce a fresh value identity that would invalidate downstream memo).
  const { subtotal, gstAmount, grandTotal } = useMemo(() => {
    const sub = Math.max(0, seatsTotal + fnbTotal - discount);
    const gst = Math.round(convenienceFee * GST_RATE);
    return {
      subtotal: sub,
      gstAmount: gst,
      grandTotal: sub + convenienceFee + gst,
    };
  }, [seatsTotal, fnbTotal, discount, convenienceFee]);
  // `subtotal` is computed for parity with the prior implementation even
  // though it's not rendered directly; PriceBreakdown derives its own view.
  void subtotal;

  const handleConfirm = async () => {
    if (!bookingId || isConfirming) return;
    setIsConfirming(true);
    try {
      const payload = {
        fnbItems: fnbItems.map((it) => ({
          itemId: it.itemId,
          quantity: it.quantity,
        })),
      };
      if (appliedCoupon?.code) payload.couponCode = appliedCoupon.code;

      const res = await api.post(
        `/bookings/me/${bookingId}/confirm`,
        payload
      );

      const ok =
        res.data?.success === true || res.data?.statusCode === 200;
      if (ok) {
        cancelledRef.current = true;
        toast.success("Booking confirmed!");
        navigate(`/booking/${bookingId}/success`, { replace: true });
      } else {
        toast.error(res.data?.message || "Could not confirm booking.");
      }
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;
      if (status === 410) {
        toast.error(message || "Lock expired. Please re-select seats.");
        cancelledRef.current = true;
        navigate(-1);
      } else {
        toast.error(message || "Could not confirm booking.");
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (cancelledRef.current) {
      navigate(-1);
      return;
    }
    cancelledRef.current = true;
    try {
      if (bookingId) {
        await api.post(`/bookings/me/${bookingId}/cancel`);
      }
    } catch {
      // ignore — best-effort
    } finally {
      navigate(-1);
    }
  };

  if (isCreatingLock || !bookingDetails) {
    return (
      <div
        className="min-h-screen bg-white flex items-center justify-center"
        role="status"
        aria-label="Loading booking details"
        aria-live="polite"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
        <span className="sr-only">Loading booking details</span>
      </div>
    );
  }

  const { showDetails, selectedSeats } = bookingDetails;

  const summaryProps = {
    remainingMs,
    seatsTotal,
    fnbTotal,
    discount,
    appliedCoupon,
    convenienceFee,
    gstAmount,
    grandTotal,
    isConfirming,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-white py-8 px-4 overflow-hidden">
        {/* Decorative red glows */}
        <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
          <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-red-600/15 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-rose-700/10 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative z-10 max-w-6xl mx-auto"
        >
          {/* Step indicator */}
          <div className="mb-5">
            <StepIndicator current="payment" />
          </div>

          {/* Mobile-only sticky countdown header so users see the timer above the fold */}
          <div className={`${glassCard} p-4 mb-5 lg:hidden flex items-center justify-between gap-3`}>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                Confirm Booking
              </p>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 mt-0.5">
                {showDetails.movieTitle}
              </h1>
            </div>
            <CountdownBadge remainingMs={remainingMs} />
          </div>

          {/* Two-column layout on desktop, single-column on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            {/* Left column */}
            <div className="space-y-5 min-w-0 pb-40 lg:pb-0">
              {/* Movie Details */}
              <div className={`${glassCard} p-5 text-slate-900`}>
                <div className="hidden lg:flex items-start justify-between gap-3 mb-3">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Confirm Booking
                  </h1>
                </div>
                <h2 className="text-lg font-semibold tracking-tight mb-3">
                  Movie Details
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm">
                  <dt className="text-slate-400">Movie</dt>
                  <dd className="text-slate-800 sm:text-right">
                    {showDetails.movieTitle}
                  </dd>
                  <dt className="text-slate-400">Date</dt>
                  <dd className="text-slate-800 sm:text-right">
                    {new Date(showDetails.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </dd>
                  <dt className="text-slate-400">Time</dt>
                  <dd className="text-slate-800 sm:text-right">
                    {showDetails.time}
                  </dd>
                  <dt className="text-slate-400">Theater</dt>
                  <dd className="text-slate-800 sm:text-right">
                    {showDetails.theater}
                  </dd>
                </dl>
              </div>

              {/* Selected Seats */}
              <div className={`${glassCard} p-5 text-slate-900`}>
                <h2 className="text-lg font-semibold tracking-tight mb-3">
                  Selected Seats
                </h2>
                <Stagger gap={0.05} className="flex flex-wrap gap-2">
                  {selectedSeats.map((seat) => (
                    <StaggerItem
                      key={`${seat.row}-${seat.displayNumber}`}
                      y={0}
                    >
                      <motion.span
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 18,
                        }}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700 border border-red-200"
                        aria-label={`Seat ${seat.row}${seat.displayNumber}`}
                      >
                        {seat.row}
                        {seat.displayNumber}
                      </motion.span>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>

              {/* F&B picker */}
              <FnbPicker
                showId={showDetails.showId}
                cinemaId={showDetails.cinemaId}
                onChange={setFnbItems}
              />

              {/* Coupon */}
              <CouponInput
                baseAmount={seatsTotal + fnbTotal}
                onApply={setAppliedCoupon}
              />

              {/* Contact info */}
              <div className={`${glassCard} p-5 text-slate-900`}>
                <h2 className="text-lg font-semibold tracking-tight mb-3">
                  Contact
                </h2>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-700 shrink-0">
                    <Mail className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                      Tickets will be sent to
                    </p>
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {user?.email || "your registered email"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: sticky order summary on desktop */}
            <aside className="hidden lg:block lg:sticky lg:top-24 self-start">
              <OrderSummary {...summaryProps} />
            </aside>
          </div>
        </motion.div>

        {/* Mobile bottom sheet: order summary + Confirm CTA */}
        <div className="lg:hidden">
          <MobileBottomSheet
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            ariaLabel="Order summary"
            trigger={
              <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 shadow-2xl pb-[calc(env(safe-area-inset-bottom)+0.5rem)]"
              >
                <div className="max-w-6xl mx-auto px-4 pt-3">
                  <button
                    type="button"
                    onClick={() => setSheetOpen(true)}
                    className="w-full flex items-center justify-between gap-3 mb-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                    aria-label="Show price breakdown"
                  >
                    <span className="text-xs text-slate-700 inline-flex items-center gap-2">
                      <ChevronUp className="w-4 h-4" />
                      Tap to see breakdown
                    </span>
                    <span className="text-base font-bold text-red-600 tabular-nums">
                      ₹{grandTotal}
                    </span>
                  </button>
                  <div className="flex items-center justify-between gap-3 pb-2">
                    <CountdownBadge remainingMs={remainingMs} />
                    <ConfirmButton
                      onClick={handleConfirm}
                      isConfirming={isConfirming}
                      remainingMs={remainingMs}
                      grandTotal={grandTotal}
                      className="flex-1"
                    />
                  </div>
                </div>
              </motion.div>
            }
          >
            <OrderSummary inSheet {...summaryProps} />
          </MobileBottomSheet>
        </div>
      </div>
    </PageTransition>
  );
};

export default Proceedtopay;
