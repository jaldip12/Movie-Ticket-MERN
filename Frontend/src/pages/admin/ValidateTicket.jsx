import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ScanLine,
  Keyboard,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  RotateCcw,
  Camera,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { PageTransition } from "@/components/ui/Motion";

const QR_REGION_ID = "qr-reader";

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
    return new Date(value).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
};

export default function ValidateTicket() {
  const [mode, setMode] = useState("scan"); // 'scan' | 'manual'
  const [manualId, setManualId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  // result shape:
  //   { kind: 'ok' | 'already' | 'error', booking?, message?, usedAt? }

  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);
  const lockedRef = useRef(false); // prevent duplicate scans firing
  const [cameraError, setCameraError] = useState(null);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      if (isScanningRef.current) {
        try {
          await scanner.stop();
        } finally {
          isScanningRef.current = false;
        }
      }
    } catch {
      // best-effort cleanup; ignore.
    } finally {
      try {
        await scanner.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
  }, []);

  const submitValidation = useCallback(async (bookingId) => {
    if (!bookingId) return;
    setSubmitting(true);
    try {
      const res = await api.post("/bookings/validate", { bookingId });
      const data = res.data?.data || {};
      const booking = data.booking || null;
      if (data.alreadyUsed) {
        setResult({
          kind: "already",
          booking,
          message: res.data?.message || "Already validated",
          usedAt: data.usedAt || booking?.usedAt,
        });
      } else {
        setResult({
          kind: "ok",
          booking,
          message: res.data?.message || "Booking validated",
        });
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        (err?.response?.status === 404
          ? "Booking not found"
          : "Validation failed");
      setResult({ kind: "error", message });
    } finally {
      setSubmitting(false);
    }
  }, []);

  const startScanner = useCallback(async () => {
    setCameraError(null);
    if (!document.getElementById(QR_REGION_ID)) return;
    if (isScanningRef.current) return;

    let scanner = null;
    try {
      scanner = new Html5Qrcode(QR_REGION_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          if (lockedRef.current) return;
          lockedRef.current = true;
          try {
            await stopScanner();
          } finally {
            await submitValidation(String(decodedText || "").trim());
          }
        },
        () => {
          // per-frame errors (no QR found yet) — silently ignore
        }
      );
      isScanningRef.current = true;
    } catch (err) {
      // Make sure a half-initialized scanner gets cleaned up so we don't
      // leak the camera / video element.
      try {
        if (scanner) {
          await scanner.clear();
        }
      } catch {
        // ignore
      }
      scannerRef.current = null;
      const message =
        err?.message ||
        "Unable to access the camera. Use Type ID mode instead.";
      setCameraError(String(message));
    }
  }, [stopScanner, submitValidation]);

  // Mount/unmount the scanner when in scan mode and there's no result yet.
  useEffect(() => {
    if (mode === "scan" && !result) {
      lockedRef.current = false;
      startScanner();
    }
    return () => {
      // Always destroy any active scanner instance (try/finally inside
      // stopScanner) and reset the duplicate-scan lock.
      stopScanner();
      lockedRef.current = false;
    };
  }, [mode, result, startScanner, stopScanner]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const id = manualId.trim();
    if (!id) return;
    await submitValidation(id);
  };

  const handleReset = async () => {
    setResult(null);
    setManualId("");
    setCameraError(null);
    lockedRef.current = false;
    // The effect will re-start the scanner if mode === 'scan'.
  };

  const renderResult = () => {
    if (!result) return null;

    if (result.kind === "ok") {
      const b = result.booking || {};
      const show = b.showId || {};
      const movie = show.movieId || {};
      const screen = show.screenId || {};
      const cinema = screen.cinemaId || {};
      const user = b.userId || {};
      const fullName = [user.firstname, user.lastname].filter(Boolean).join(" ");
      const seatCount = (b.seats || []).length;

      return (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 8, scale: 1 }}
          animate={{ opacity: 1, y: 0, scale: [1, 1.02, 1] }}
          transition={{
            opacity: { duration: 0.3 },
            y: { duration: 0.3 },
            scale: { duration: 0.5, times: [0, 0.5, 1] },
          }}
          className="rounded-2xl border border-emerald-200 bg-emerald-500/[0.08] p-6"
        >
          <div className="flex items-start gap-4">
            <div className="grid place-items-center w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 shrink-0">
              <CheckCircle2 className="h-6 w-6 text-emerald-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-emerald-700 text-xs font-semibold tracking-widest uppercase">
                Validated
              </p>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-1">
                Booking valid for {movie.title || "this show"}, {seatCount}{" "}
                {seatCount === 1 ? "seat" : "seats"}, gate at{" "}
                {formatTime(show.time) || "—"}
              </h2>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-sm text-slate-700">
                {fullName && (
                  <div>
                    <span className="text-slate-500">Holder · </span>
                    <span className="text-slate-900 font-medium">{fullName}</span>
                  </div>
                )}
                {cinema?.name && (
                  <div>
                    <span className="text-slate-500">Cinema · </span>
                    <span className="text-slate-900 font-medium">
                      {cinema.name}
                      {screen?.name ? ` — ${screen.name}` : ""}
                    </span>
                  </div>
                )}
                {Array.isArray(b.seats) && b.seats.length > 0 && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-500">Seats · </span>
                    <span className="text-slate-900 font-mono">
                      {b.seats.join(", ")}
                    </span>
                  </div>
                )}
                {b.fnbPin && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-500">F&amp;B Pin · </span>
                    <span className="text-amber-700 font-mono font-bold tracking-widest">
                      {b.fnbPin}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    if (result.kind === "already") {
      const usedAt = result.usedAt
        ? formatUsedAt(result.usedAt)
        : "earlier today";
      return (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-200 bg-amber-500/[0.08] p-6"
        >
          <div className="flex items-start gap-4">
            <div className="grid place-items-center w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 shrink-0">
              <AlertTriangle className="h-6 w-6 text-amber-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-amber-700 text-xs font-semibold tracking-widest uppercase">
                Already used
              </p>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-1">
                Already validated at {usedAt}
              </h2>
              <p className="mt-2 text-sm text-amber-700/90">
                Do not admit again without verification.
              </p>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        role="status"
        aria-live="polite"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-rose-200 bg-rose-500/[0.08] p-6"
      >
        <div className="flex items-start gap-4">
          <div className="grid place-items-center w-12 h-12 rounded-xl bg-rose-100 border border-rose-200 shrink-0">
            <XCircle className="h-6 w-6 text-rose-700" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-rose-700 text-xs font-semibold tracking-widest uppercase">
              Invalid
            </p>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-1">
              {result.message || "Validation failed"}
            </h2>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-6"
        >
          <p className="text-red-600 text-xs font-semibold tracking-widest uppercase mb-2">
            Cinema gate
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Validate Ticket
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Scan a QR code at the door, or paste a booking id manually.
          </p>
        </motion.div>

        {/* Mode tabs */}
        <div
          role="tablist"
          aria-label="Ticket validation mode"
          className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 mb-6"
        >
          <button
            type="button"
            role="tab"
            id="tab-scan"
            aria-selected={mode === "scan"}
            aria-controls="panel-scan"
            tabIndex={mode === "scan" ? 0 : -1}
            onClick={async () => {
              await stopScanner();
              setMode("scan");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${
              mode === "scan"
                ? "bg-red-100 text-red-600"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            <ScanLine className="h-4 w-4" aria-hidden="true" />
            Scan QR
          </button>
          <button
            type="button"
            role="tab"
            id="tab-manual"
            aria-selected={mode === "manual"}
            aria-controls="panel-manual"
            tabIndex={mode === "manual" ? 0 : -1}
            onClick={async () => {
              await stopScanner();
              setMode("manual");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${
              mode === "manual"
                ? "bg-red-100 text-red-600"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            <Keyboard className="h-4 w-4" aria-hidden="true" />
            Type ID
          </button>
        </div>

        {/* Capture panel — hidden once we have a result */}
        {!result && (
          <div className="rounded-2xl border border-slate-200 bg-white backdrop-blur-sm shadow-sm p-5 md:p-6 mb-6">
            {mode === "scan" ? (
              <div
                role="tabpanel"
                id="panel-scan"
                aria-labelledby="tab-scan"
                className="flex flex-col items-center gap-4"
              >
                <div
                  role="region"
                  aria-label="QR scanner"
                  id={QR_REGION_ID}
                  className="w-[360px] max-w-full aspect-square rounded-xl overflow-hidden border border-red-200 bg-white"
                />
                {cameraError ? (
                  <div className="w-full">
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-start gap-2">
                      <Camera
                        className="h-4 w-4 mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{cameraError}</span>
                    </div>
                    <div className="mt-3 flex justify-center">
                      <Button
                        type="button"
                        onClick={async () => {
                          await stopScanner();
                          setMode("manual");
                        }}
                        className="bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100 rounded-lg font-medium h-9 px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                      >
                        <Keyboard
                          className="h-4 w-4 mr-2"
                          aria-hidden="true"
                        />
                        Enter ID manually
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <ScanLine
                      className="h-3.5 w-3.5 text-red-600"
                      aria-hidden="true"
                    />
                    Point the camera at the ticket QR code.
                  </p>
                )}
                {submitting && (
                  <p className="text-sm text-slate-700 flex items-center gap-2">
                    <Loader2
                      className="h-4 w-4 animate-spin text-red-600"
                      aria-hidden="true"
                    />
                    Validating…
                  </p>
                )}
              </div>
            ) : (
              <form
                onSubmit={handleManualSubmit}
                role="tabpanel"
                id="panel-manual"
                aria-labelledby="tab-manual"
                className="flex flex-col gap-3"
              >
                <label
                  htmlFor="manual-id"
                  className="text-slate-800 text-sm font-medium"
                >
                  Booking ID
                </label>
                <Input
                  id="manual-id"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="e.g. 6123abc...f9"
                  autoFocus
                  className="h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 font-mono focus-visible:border-red-500 focus-visible:ring-red-500/20"
                />
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.97 }}
                  disabled={submitting || !manualId.trim()}
                  className="h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-sm transition-all disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />{" "}
                      Validating…
                    </span>
                  ) : (
                    "Validate"
                  )}
                </motion.button>
              </form>
            )}
          </div>
        )}

        {result && (
          <>
            {renderResult()}
            <div className="mt-5 flex justify-center">
              <Button
                onClick={handleReset}
                className="bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-200 hover:text-slate-900 rounded-xl font-medium h-10 px-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              >
                <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
                Scan another
              </Button>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}
