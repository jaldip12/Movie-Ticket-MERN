import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Loader2,
  Ticket,
  ShieldCheck,
  ScanLine,
  Film,
} from "lucide-react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import QRTicket from "@/components/tickets/QRTicket";
import PriceBreakdown from "@/components/booking/PriceBreakdown";

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
  date.setHours(parseInt(hours, 10) || 0, parseInt(minutes, 10) || 0);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatUsedAt = (value) => {
  if (!value) return "";
  try {
    const d = new Date(value);
    const time = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const day = d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    return `Used at ${time} on ${day}`;
  } catch {
    return "";
  }
};

export default function PublicTicket() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/bookings/public/${id}`);
        if (!cancelled) setTicket(res.data?.data || null);
      } catch (err) {
        if (!cancelled) {
          const message =
            err?.response?.data?.message ||
            (err?.response?.status === 404
              ? "Ticket not found."
              : "Failed to load ticket.");
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (id) load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="relative min-h-screen bg-white text-slate-900 flex flex-col overflow-hidden">
      {/* Decorative red glow */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-red-600/15 blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-[500px] w-[500px] rounded-full bg-rose-700/10 blur-3xl" />
      </div>

      {/* Slim brand bar */}
      <header className="relative z-10 border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 max-w-3xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-md">
              <Film className="w-4 h-4 text-slate-900" strokeWidth={2.5} />
            </div>
            <span className="text-base font-semibold tracking-tight text-slate-900">
              MovieVista
            </span>
          </Link>
          <span className="text-[11px] uppercase tracking-widest text-slate-500 font-medium">
            E-Ticket
          </span>
        </div>
      </header>

      <main className="relative z-10 flex-1 container mx-auto px-4 py-10 max-w-3xl">
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm p-16 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 backdrop-blur-sm p-10 text-center">
            <div className="grid place-items-center w-14 h-14 rounded-2xl bg-rose-100 border border-rose-200 mx-auto mb-4">
              <Ticket className="h-7 w-7 text-rose-700" />
            </div>
            <p className="text-lg font-semibold text-slate-900">Ticket unavailable</p>
            <p className="text-sm text-rose-700/80 mt-2">{error}</p>
            <Link
              to="/"
              className="inline-block mt-6 text-sm text-slate-700 hover:text-red-700 transition-colors"
            >
              Back to home
            </Link>
          </div>
        )}

        {!loading && !error && ticket && (
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl overflow-hidden"
          >
            {/* Red accent stripe on the left edge */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-red-700" />

            {/* Top: poster + headline meta */}
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-52 md:min-w-52 bg-white md:pl-1">
                <img
                  src={ticket?.show?.movie?.poster || FALLBACK_POSTER}
                  alt={ticket?.show?.movie?.title || "Movie poster"}
                  className="w-full h-64 md:h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_POSTER;
                  }}
                />
              </div>

              <div className="flex-1 p-6 md:p-7 flex flex-col gap-5">
                <div>
                  <p className="text-red-600 text-[11px] font-semibold tracking-widest uppercase mb-2">
                    Now Showing
                  </p>
                  <div className="flex items-start justify-between gap-3">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                      {ticket?.show?.movie?.title || "Untitled"}
                    </h1>
                    {ticket?.show?.movie?.certification && (
                      <Badge className="bg-slate-100 border border-slate-200 text-slate-800 text-[10px] uppercase tracking-wider px-2 py-0.5">
                        {ticket.show.movie.certification}
                      </Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 font-mono uppercase tracking-wider">
                    ID · {String(ticket?._id || "").slice(-8)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="h-4 w-4 text-red-600 shrink-0" />
                    <span>{formatDate(ticket?.show?.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="h-4 w-4 text-red-600 shrink-0" />
                    <span>{formatTime(ticket?.show?.time)}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2 text-slate-700">
                    <MapPin className="h-4 w-4 text-red-600 shrink-0" />
                    <span className="truncate">
                      {ticket?.show?.cinema?.name || "Cinema"}
                      {ticket?.show?.screen?.name
                        ? ` — ${ticket.show.screen.name}`
                        : ""}
                      {ticket?.show?.cinema?.city
                        ? ` · ${ticket.show.cinema.city}`
                        : ""}
                    </span>
                  </div>
                </div>

                {Array.isArray(ticket?.seats) && ticket.seats.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-1.5">
                      Seats · {ticket.seats.length}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {ticket.seats.map((seat) => (
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
              </div>
            </div>

            {/* Perforation */}
            <div
              aria-hidden
              className="relative h-px"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.12) 50%, transparent 50%)",
                backgroundSize: "10px 1px",
              }}
            />

            {/* Bottom: F&B + QR + status */}
            <div className="p-6 md:p-7 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-5">
                {Array.isArray(ticket?.fnbItems) && ticket.fnbItems.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">
                      Snacks & Drinks
                    </p>
                    <ul className="space-y-1.5 text-sm">
                      {ticket.fnbItems.map((it, i) => (
                        <li
                          key={`${it.name}-${i}`}
                          className="flex items-center justify-between text-slate-700"
                        >
                          <span className="truncate">
                            {it.name}{" "}
                            <span className="text-slate-500">× {it.quantity}</span>
                          </span>
                          <span className="text-slate-400 font-mono">
                            ₹{(it.price || 0) * (it.quantity || 0)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {ticket?.fnbPin && (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-50 px-3 py-1.5">
                        <ShieldCheck className="h-4 w-4 text-amber-700" />
                        <span className="text-xs uppercase tracking-wider text-amber-200/90 font-medium">
                          F&amp;B Pin
                        </span>
                        <span className="font-mono text-base text-amber-100 font-bold tracking-widest">
                          {ticket.fnbPin}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <PriceBreakdown
                  seatsTotal={ticket?.seatsTotal || 0}
                  fnbTotal={ticket?.fnbTotal || 0}
                  couponDiscount={
                    ticket?.couponDiscount ??
                    ticket?.appliedCoupon?.discountAmount ??
                    0
                  }
                  couponCode={ticket?.appliedCoupon?.code || ""}
                  convenienceFee={ticket?.convenienceFee || 0}
                  gstAmount={ticket?.gstAmount || 0}
                  totalAmount={ticket?.totalAmount || 0}
                />


                {ticket?.usedAt ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-200 flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{formatUsedAt(ticket.usedAt)}</span>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 flex items-start gap-2">
                    <ScanLine className="h-4 w-4 mt-0.5 text-red-600 shrink-0" />
                    <span>
                      Show this at the entry — staff will scan the QR.
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-3">
                <QRTicket value={ticket?._id} size={260} />
                {(ticket?.user?.firstname || ticket?.user?.lastname) && (
                  <p className="text-xs text-slate-500">
                    Holder ·{" "}
                    <span className="text-slate-700">
                      {[ticket?.user?.firstname, ticket?.user?.lastname]
                        .filter(Boolean)
                        .join(" ")}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </motion.article>
        )}
      </main>
    </div>
  );
}
