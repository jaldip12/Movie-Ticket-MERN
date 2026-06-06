import { useState, useEffect, useMemo, useRef, useCallback, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  Armchair,
  Accessibility,
  Heart,
} from "lucide-react";
import { api } from "@/lib/api";
import { SeatingLayoutSkeleton } from "@/components/ui/Skeleton";
import { socket, connectIfNeeded } from "@/lib/socket";
import StepIndicator from "@/components/booking/StepIndicator";
import AuditoriumGrid from "@/components/seating/AuditoriumGrid";
import { expandSection, rowLabelFor } from "@/lib/seatLayout";

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.6;
const ZOOM_STEP = 0.1;
const DEFAULT_TICKETS = 2;
const MAX_TICKETS = 10;

// Visual icon for non-regular seat types. We never overlay on regular seats.
const TYPE_ICON = {
  recliner: Armchair,
  wheelchair: Accessibility,
  loveseat: Heart,
  companion: Heart,
};

const TYPE_LABEL = {
  regular: "Regular",
  recliner: "Recliner",
  wheelchair: "Wheelchair-accessible",
  loveseat: "Loveseat",
  companion: "Companion",
};

const ShowSeatingLayout = ({
  seatingLayoutName,
  showId,
  showTime,
  showDate,
  movieTitle,
  theater,
  seatingLayoutLabel,
  bookedSeats = [],
  lockedSeats = [],
  cinemaId,
}) => {
  const navigate = useNavigate();
  const [seatingPlan, setSeatingPlan] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [ticketCount, setTicketCount] = useState(DEFAULT_TICKETS);
  const [liveBookedSeats, setLiveBookedSeats] = useState(() => new Set());
  const [liveLockedSeats, setLiveLockedSeats] = useState(() => new Set());

  // Auto-fit refs: containerRef wraps the scrollable area, contentRef wraps
  // the transform-scaled grid. We measure container width vs content's natural
  // (unscaled) offsetWidth and set zoom = min(1, ratio) so wide halls fit on
  // load — matches BookMyShow's "see the whole hall first" behaviour.
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  // Natural (unscaled) content size — needed to size the wrapper so the
  // LAYOUT box collapses to the scaled visual size. transform: scale() alone
  // shrinks visuals but not the layout box, which is why wide halls were
  // still triggering horizontal scroll.
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

  const fit = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;
    const containerW = container.clientWidth;
    const naturalW = content.offsetWidth; // offsetWidth ignores CSS transform
    const naturalH = content.offsetHeight;
    if (containerW <= 0 || naturalW <= 0) return;
    setNaturalSize({ w: naturalW, h: naturalH });
    const target = Math.min(1, containerW / naturalW);
    setZoom(+Math.max(MIN_ZOOM, target).toFixed(2));
  }, []);

  const unavailableSeats = useMemo(() => {
    const set = new Set();
    (Array.isArray(bookedSeats) ? bookedSeats : []).forEach((s) => set.add(s));
    (Array.isArray(lockedSeats) ? lockedSeats : []).forEach((s) => set.add(s));
    liveBookedSeats.forEach((s) => set.add(s));
    liveLockedSeats.forEach((s) => set.add(s));
    return set;
  }, [bookedSeats, lockedSeats, liveBookedSeats, liveLockedSeats]);

  // Subscribe to live seat updates for this show.
  useEffect(() => {
    if (!showId) return undefined;

    connectIfNeeded();
    socket.emit("subscribe:show", showId);

    const sameShow = (msg) => msg && String(msg.showId) === String(showId);

    const onLocked = (msg) => {
      if (!sameShow(msg) || !Array.isArray(msg.seats)) return;
      const incoming = new Set(msg.seats);
      setLiveLockedSeats((prev) => {
        const next = new Set(prev);
        incoming.forEach((s) => next.add(s));
        return next;
      });
      setSelectedSeats((prev) => {
        const collisions = prev.filter((s) =>
          incoming.has(`${s.row}${s.num}`)
        );
        if (collisions.length === 0) return prev;
        toast.error("Some of your seats just got locked by another user");
        return prev.filter((s) => !incoming.has(`${s.row}${s.num}`));
      });
    };

    const onReleased = (msg) => {
      if (!sameShow(msg) || !Array.isArray(msg.seats)) return;
      setLiveLockedSeats((prev) => {
        const next = new Set(prev);
        msg.seats.forEach((s) => next.delete(s));
        return next;
      });
    };

    const onBooked = (msg) => {
      if (!sameShow(msg) || !Array.isArray(msg.seats)) return;
      const incoming = new Set(msg.seats);
      setLiveLockedSeats((prev) => {
        const next = new Set(prev);
        incoming.forEach((s) => next.delete(s));
        return next;
      });
      setLiveBookedSeats((prev) => {
        const next = new Set(prev);
        incoming.forEach((s) => next.add(s));
        return next;
      });
    };

    socket.on("seats:locked", onLocked);
    socket.on("seats:released", onReleased);
    socket.on("seats:booked", onBooked);

    return () => {
      socket.emit("unsubscribe:show", showId);
      socket.off("seats:locked", onLocked);
      socket.off("seats:released", onReleased);
      socket.off("seats:booked", onBooked);
    };
  }, [showId]);

  useEffect(() => {
    let alive = true;
    const fetchSeatingLayout = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(
          `/seating/seatingplans/name/${seatingLayoutName}`
        );
        if (!alive) return;
        if (response.data?.statusCode === 200) {
          setSeatingPlan(response.data.data);
        } else {
          throw new Error("Failed to fetch seating layout");
        }
      } catch (err) {
        if (!alive) return;
        setError("Could not load the seating layout. Please try again.");
      } finally {
        if (alive) setIsLoading(false);
      }
    };

    if (seatingLayoutName) fetchSeatingLayout();
    return () => {
      alive = false;
    };
  }, [seatingLayoutName]);

  // Pre-expand each section once per layout. The expanded rows are what the
  // renderer iterates over — they include aisles, blocked seats, broken seats
  // and per-row width overrides as plain cell objects.
  const expanded = useMemo(() => {
    if (!seatingPlan) return [];
    return seatingPlan.sections.map((section) => ({
      section,
      ...expandSection(section),
    }));
  }, [seatingPlan]);

  // Auto-fit: run after the layout renders (useLayoutEffect avoids a flash at
  // 100% zoom) and re-fit on container resize. We don't observe the content
  // node — its size is independent of zoom (offsetWidth ignores transforms),
  // so there's no feedback loop.
  useLayoutEffect(() => {
    fit();
  }, [expanded, fit]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => fit());
    ro.observe(container);
    return () => ro.disconnect();
  }, [fit]);

  const isBookedOrLocked = (row, num) =>
    unavailableSeats.has(`${row}${num}`);

  const isSelected = (row, num) =>
    selectedSeats.some((s) => s.row === row && s.num === num);

  const toggleSeat = (sectionIndex, cell) => {
    const seatId = `${sectionIndex}-${cell.row}${cell.num}`;
    setSelectedSeats((prev) => {
      const existing = prev.find((s) => s.id === seatId);
      if (existing) return prev.filter((s) => s.id !== seatId);
      return [
        ...prev,
        {
          id: seatId,
          row: cell.row,
          num: cell.num,
          // Kept for backward compat with the booking-checkout payload, which
          // expects { row, displayNumber } pairs.
          seatNumber: cell.num,
          displayNumber: cell.num,
          section: expanded[sectionIndex]?.section?.name || "Section",
          price: cell.price,
          type: cell.type || "regular",
        },
      ];
    });
  };

  const totalAmount = useMemo(
    () => selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0),
    [selectedSeats]
  );

  const tierBreakdown = useMemo(() => {
    const map = new Map();
    selectedSeats.forEach((s) => {
      const key = s.section || "Section";
      const existing = map.get(key) || { name: key, price: s.price, count: 0 };
      existing.count += 1;
      existing.price = s.price;
      map.set(key, existing);
    });
    return Array.from(map.values());
  }, [selectedSeats]);

  // Auto-pick: highest-priced section first, find the first row with N
  // contiguous bookable seats. Aisles + blocked + broken cells break runs.
  const suggestion = useMemo(() => {
    if (!expanded.length || selectedSeats.length > 0) return null;
    const N = ticketCount;
    if (N < 1) return null;

    const sorted = [...expanded].sort(
      (a, b) => (b.section.price || 0) - (a.section.price || 0)
    );

    for (const { section, rows } of sorted) {
      for (const row of rows) {
        let run = [];
        for (const cell of row.cells) {
          if (cell.kind !== "seat") {
            run = [];
            continue;
          }
          if (isBookedOrLocked(cell.row, cell.num)) {
            run = [];
            continue;
          }
          run.push(cell);
          if (run.length === N) {
            return {
              sectionName: section.name,
              seats: run.map((c) => ({
                id: `${expanded.findIndex((e) => e.section === section)}-${c.row}${c.num}`,
                row: c.row,
                num: c.num,
                seatNumber: c.num,
                displayNumber: c.num,
                section: section.name,
                price: c.price,
                type: c.type || "regular",
              })),
            };
          }
        }
      }
    }
    return null;
  }, [expanded, ticketCount, selectedSeats.length, unavailableSeats]);

  const handleAutoPick = () => {
    if (!suggestion) return;
    setSelectedSeats(suggestion.seats);
  };

  const handleBooking = () => {
    if (!selectedSeats.length) {
      toast.error("Please select at least one seat.");
      return;
    }
    navigate(`/booking/${showId}`, {
      state: {
        selectedSeats,
        totalAmount,
        showDetails: {
          showId,
          cinemaId,
          theater: theater || seatingLayoutName,
          seatingLayoutName: seatingLayoutLabel || seatingLayoutName,
          time: showTime,
          date: showDate,
          movieTitle,
        },
      },
    });
  };

  // Light-theme cell renderer (BookMyShow-style). Tightened to ~28px so wide
  // halls (22-col IMAX) fit on one screen without zooming.
  const Cell = ({ sectionIndex, cell }) => {
    if (cell.kind === "aisle") {
      return <div className="w-3 shrink-0" aria-hidden="true" />;
    }
    if (cell.kind === "empty") {
      return (
        <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" aria-hidden="true" />
      );
    }
    if (cell.kind === "broken") {
      return (
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center bg-slate-50 border border-dashed border-slate-300 shrink-0"
          aria-label={`${cell.row}${cell.num} - out of order`}
          title={`${cell.row}${cell.num} - out of order`}
        >
          <span className="w-1 h-1 rounded-full bg-slate-300" />
        </div>
      );
    }
    if (cell.kind === "blocked") {
      return (
        <div
          aria-disabled="true"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center bg-slate-200 text-slate-400 cursor-not-allowed text-[10px] font-semibold tabular-nums shrink-0"
          title={`${cell.row}${cell.num} - sold out`}
        >
          {cell.num}
        </div>
      );
    }

    // cell.kind === "seat"
    const booked = isBookedOrLocked(cell.row, cell.num);
    const selected = isSelected(cell.row, cell.num);
    const Icon = TYPE_ICON[cell.type];

    if (booked) {
      return (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center bg-slate-200 text-slate-400 cursor-not-allowed text-[10px] font-semibold tabular-nums shrink-0"
          title={`${cell.row}${cell.num} - Booked`}
        >
          {cell.num}
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => toggleSeat(sectionIndex, cell)}
        className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-[10px] font-semibold tabular-nums transition-colors shrink-0 ${
          selected
            ? "bg-emerald-500 text-white border border-emerald-600 shadow-sm shadow-emerald-200"
            : "bg-white border border-emerald-500 text-slate-700 hover:bg-emerald-50"
        }`}
        title={`${cell.row}${cell.num} · ${TYPE_LABEL[cell.type] || "Seat"} · ₹${cell.price}`}
      >
        {Icon ? (
          <Icon
            className={`w-3 h-3 absolute -top-1 -right-1 ${
              selected ? "text-slate-900/90" : "text-amber-500"
            }`}
            strokeWidth={2.5}
            aria-hidden="true"
          />
        ) : null}
        {cell.num}
      </button>
    );
  };

  if (isLoading) return <SeatingLayoutSkeleton />;

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl m-6">
        {error}
        <button
          type="button"
          className="block mx-auto mt-4 h-11 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!seatingPlan) {
    return (
      <div className="text-center py-12 text-slate-400">
        No seating layout available.
      </div>
    );
  }

  const showSummary = selectedSeats.length > 0;

  return (
    <div className="p-4 md:p-6 pb-32 lg:pb-6 bg-slate-50 min-h-screen text-slate-800">
      <div className="mb-5">
        <StepIndicator current="seats" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
            Tickets
          </span>
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setTicketCount((n) => Math.max(1, n - 1))}
              className="h-9 w-9 inline-flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              disabled={ticketCount <= 1}
              aria-label="Decrease tickets"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-slate-800 tabular-nums">
              {ticketCount}
            </span>
            <button
              type="button"
              onClick={() => setTicketCount((n) => Math.min(MAX_TICKETS, n + 1))}
              className="h-9 w-9 inline-flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              disabled={ticketCount >= MAX_TICKETS}
              aria-label="Increase tickets"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() =>
              setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)))
            }
            disabled={zoom <= MIN_ZOOM + 1e-6}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            aria-label="Zoom out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-1 text-[11px] tabular-nums text-slate-500 w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() =>
              setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)))
            }
            disabled={zoom >= MAX_ZOOM - 1e-6}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            aria-label="Zoom in"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={fit}
            className="h-8 px-2 inline-flex items-center justify-center gap-1 rounded-lg text-slate-600 hover:bg-slate-50 text-xs"
            aria-label="Fit to screen"
            title="Fit layout to screen"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Fit
          </button>
        </div>
      </div>

      {suggestion && (
        <button
          type="button"
          onClick={handleAutoPick}
          className="mb-5 inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-semibold border border-emerald-500/40 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          Auto-pick {ticketCount} seat{ticketCount === 1 ? "" : "s"} together in{" "}
          {suggestion.sectionName}
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div
          ref={containerRef}
          // min-w-0 lets this grid cell shrink below its content's natural
          // width so wide halls don't push the whole PAGE into horizontal
          // scroll. Without it, CSS Grid's default min-width:auto on grid
          // items would force the page to be at least as wide as the widest
          // section + sidebar.
          className="min-w-0 overflow-auto scrollbar-thin scrollbar-thumb-slate-300 bg-white rounded-2xl border border-slate-200 shadow-sm py-6"
          style={{ touchAction: "pan-x pan-y" }}
        >
          {/* Sized wrapper collapses the layout box to the scaled visual so
              the scroll container doesn't see overflow when zoom < 1.
              overflow:hidden clips the transformed child's residual layout
              extent (transform: scale doesn't shrink layout boxes, only
              visuals) — without this, an inner phantom horizontal scrollbar
              appears even though nothing visible is overflowing. */}
          <div
            className="mx-auto overflow-hidden"
            style={{
              width: naturalSize.w > 0 ? `${Math.ceil(naturalSize.w * zoom)}px` : undefined,
              height: naturalSize.h > 0 ? `${Math.ceil(naturalSize.h * zoom)}px` : undefined,
            }}
          >
            <div
              ref={contentRef}
              className="origin-top-left inline-block transition-transform duration-150"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
              }}
            >
              <AuditoriumGrid
                sections={expanded}
                theme="light"
                renderCell={({ sectionIdx, cell }) => (
                  <Cell sectionIndex={sectionIdx} cell={cell} />
                )}
              />
            </div>
          </div>

          {/* Simple 3-item legend (matches BookMyShow). Seat-type icons stay
              on the seats themselves and are explained via tooltips. */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 px-3 py-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-white border border-emerald-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-emerald-500 border border-emerald-600" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-slate-200" />
              <span>Sold</span>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 self-start hidden lg:block">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Order Summary
            </h4>
            {tierBreakdown.length === 0 ? (
              <p className="text-slate-500 text-sm">
                Pick seats to see your total.
              </p>
            ) : (
              <ul className="space-y-2">
                {tierBreakdown.map((t) => (
                  <li
                    key={t.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="text-slate-700">
                      <span className="font-medium">{t.name}</span>
                      <span className="text-slate-500">
                        {" "}· ₹{t.price} × {t.count}
                      </span>
                    </div>
                    <div className="text-slate-900 font-semibold">
                      ₹{t.price * t.count}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-slate-200 mt-4 pt-3 flex items-center justify-between">
              <span className="text-slate-500 text-sm">Total</span>
              <span className="text-2xl font-extrabold text-slate-900">
                ₹{totalAmount}
              </span>
            </div>
            <button
              type="button"
              onClick={handleBooking}
              disabled={!showSummary}
              className={`mt-4 w-full h-11 rounded-xl font-semibold transition-all ${
                showSummary
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              Proceed to Pay
            </button>
          </div>
        </aside>
      </div>

      {showSummary && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 shadow-2xl pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
          <div className="max-w-6xl mx-auto px-4 pt-3 flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center gap-2">
              <span className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-bold tabular-nums shrink-0">
                {selectedSeats.length}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-500 truncate">
                  {selectedSeats
                    .slice()
                    .sort((a, b) => a.id.localeCompare(b.id))
                    .map((s) => `${s.row}${s.num}`)
                    .join(", ")}
                </p>
                <p className="text-base font-semibold text-slate-900 leading-tight">
                  Total <span className="text-emerald-600">₹{totalAmount}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleBooking}
              className="h-11 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-sm transition-all whitespace-nowrap"
            >
              Proceed to Pay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Re-exported for editor usage parity (admin live-preview uses the same path).
export { rowLabelFor };
export default ShowSeatingLayout;
