import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X, Loader2, TicketPercent } from "lucide-react";
import { api } from "@/lib/api";
import { easeOutExpo } from "@/lib/motion";

/**
 * CouponInput — apply / remove a promo code at checkout.
 *
 * Props:
 *  - baseAmount: number   (seats subtotal + fnb subtotal)
 *  - onApply:    (result: { code, discount, finalTotal } | null) => void
 *
 * Behavior:
 *  - Apply: trims+uppercases code, POST /coupons/validate. On success, calls
 *    onApply({ code, discount, finalTotal }) and shows the applied state.
 *  - Remove: clears state, calls onApply(null).
 *  - When baseAmount changes while a code is applied, silently re-validates
 *    after a 300ms debounce; if the coupon is no longer valid (e.g. minTotal
 *    not met) the state is cleared and onApply(null) is fired.
 */
export default function CouponInput({ baseAmount, onApply }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | applied | error
  const [errorMsg, setErrorMsg] = useState("");
  const [applied, setApplied] = useState(null); // { code, discount, finalTotal }
  const [showCheck, setShowCheck] = useState(false);

  const inputId = useId();
  const errorId = useId();

  // Stable ref for onApply so the auto-revalidate effect doesn't re-fire on
  // every render of the parent.
  const onApplyRef = useRef(onApply);
  useEffect(() => {
    onApplyRef.current = onApply;
  }, [onApply]);

  const doApply = async (rawCode, { silent = false } = {}) => {
    const normalized = (rawCode || "").trim().toUpperCase();
    if (!normalized) {
      setStatus("error");
      setErrorMsg("Enter a code");
      return;
    }

    if (!silent) setStatus("loading");
    try {
      const res = await api.post("/coupons/validate", {
        code: normalized,
        baseAmount: Number(baseAmount) || 0,
      });
      const data = res.data?.data;
      if (!data?.valid) {
        throw new Error(res.data?.message || "Invalid code");
      }
      const next = {
        code: data.code,
        discount: data.discount,
        finalTotal: data.finalTotal,
      };
      setApplied(next);
      // Only overwrite user-typed casing if the server returned a different
      // canonical code (avoids surprising cursor jumps mid-typing).
      setCode((prev) =>
        (prev || "").trim().toUpperCase() === data.code ? prev : data.code,
      );
      setStatus("applied");
      setErrorMsg("");
      // Briefly show the success checkmark on a fresh apply.
      if (!silent) {
        setShowCheck(true);
        setTimeout(() => setShowCheck(false), 1500);
      }
      onApplyRef.current?.(next);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to apply code";
      if (silent) {
        // Silent revalidation failed — clear without flashing loading state
        setApplied(null);
        setStatus("error");
        setErrorMsg(message);
        onApplyRef.current?.(null);
      } else {
        setStatus("error");
        setErrorMsg(message);
        setApplied(null);
        onApplyRef.current?.(null);
      }
    }
  };

  const handleApplyClick = (e) => {
    e?.preventDefault?.();
    if (status === "loading") return;
    doApply(code);
  };

  const handleRemove = () => {
    setApplied(null);
    setCode("");
    setStatus("idle");
    setErrorMsg("");
    setShowCheck(false);
    onApplyRef.current?.(null);
  };

  // Auto-revalidate when baseAmount changes and a coupon is applied.
  // Debounced 300ms so rapid F&B/seat updates don't spam the endpoint.
  useEffect(() => {
    if (!applied?.code) return;
    const id = setTimeout(() => {
      doApply(applied.code, { silent: true });
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseAmount]);

  const isApplied = status === "applied" && applied;

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl p-5">
      <label
        htmlFor={inputId}
        className="flex items-center gap-2 mb-3 text-slate-900 cursor-pointer"
      >
        <TicketPercent className="h-4 w-4 text-red-600" />
        <span className="text-sm font-semibold tracking-tight">
          Have a promo code?
        </span>
      </label>

      <form onSubmit={handleApplyClick} className="flex gap-2">
        <motion.input
          id={inputId}
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (status === "error") {
              setStatus("idle");
              setErrorMsg("");
            }
          }}
          disabled={isApplied || status === "loading"}
          placeholder="ENTER CODE"
          aria-invalid={status === "error" || undefined}
          aria-describedby={status === "error" && errorMsg ? errorId : undefined}
          className="flex-1 h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 tracking-wider uppercase focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none disabled:opacity-60 transition-colors"
          autoComplete="off"
          // Re-keying on the error message re-fires the shake animation
          // every time a new error is produced.
          key={errorMsg || "no-error"}
          animate={
            status === "error" && errorMsg ? { x: [-4, 4, -2, 2, 0] } : { x: 0 }
          }
          transition={{ duration: 0.35, ease: easeOutExpo }}
        />
        {isApplied ? (
          <motion.button
            type="button"
            onClick={handleRemove}
            whileTap={{ scale: 0.97 }}
            className="h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 text-sm font-semibold transition-colors"
          >
            Remove
          </motion.button>
        ) : (
          <motion.button
            type="submit"
            disabled={status === "loading" || !code.trim()}
            whileTap={{ scale: 0.97 }}
            className="h-11 px-5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Applying</span>
              </>
            ) : (
              <span>Apply</span>
            )}
          </motion.button>
        )}
      </form>

      {/* State row */}
      <div className="mt-3 min-h-[1.25rem]">
        <AnimatePresence initial={false} mode="wait">
          {status === "applied" && applied && (
            <motion.div
              key="applied"
              role="status"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: easeOutExpo }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3 text-sm rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
                <span className="flex items-center gap-2 text-emerald-700 min-w-0">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-200 shrink-0 relative">
                    <AnimatePresence initial={false} mode="wait">
                      {showCheck ? (
                        <motion.span
                          key="check-pop"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 22,
                          }}
                          className="inline-flex"
                        >
                          <Check className="h-3 w-3" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="check-static"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="inline-flex"
                        >
                          <Check className="h-3 w-3" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                  <span className="truncate">
                    Code{" "}
                    <span className="font-semibold text-slate-900">
                      {applied.code}
                    </span>{" "}
                    applied
                    <span className="text-emerald-700/80">
                      {" "}
                      · -₹{Number(applied.discount).toFixed(2)} off
                    </span>
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-emerald-700/80 hover:text-slate-900 inline-flex items-center gap-1 transition-colors shrink-0"
                  aria-label="Remove promo code"
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="text-xs">Remove</span>
                </button>
              </div>
            </motion.div>
          )}
          {status === "error" && errorMsg && (
            <motion.p
              key="error"
              id={errorId}
              role="alert"
              aria-live="polite"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: easeOutExpo }}
              className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 overflow-hidden"
            >
              {errorMsg}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
