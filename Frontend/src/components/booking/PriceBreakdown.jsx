import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Info } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/ui/Motion";
import { easeOutExpo } from "@/lib/motion";

/**
 * PriceBreakdown — reusable line-item receipt for a booking.
 *
 * Display order (Indian cinema convention):
 *   1. Tickets subtotal
 *   2. F&B subtotal       (only if > 0)
 *   3. Coupon discount    (only if > 0, shown red, negative)
 *   4. Subtotal           (after discount, before fees)
 *   5. Convenience fee    (collapsible — fees + GST hide behind a toggle)
 *   6. GST 18% on conv. fee  (CGST 9% + SGST 9% split shown in tooltip)
 *   7. Total (big red)
 *
 * GST is charged on the convenience fee ONLY — never on the ticket price.
 * All amounts are whole rupees.
 *
 * Props:
 *   seatsTotal      number  — per-seat subtotal
 *   fnbTotal        number  — F&B subtotal (omit row if 0)
 *   couponDiscount  number  — positive number; the discount amount
 *   couponCode      string  — coupon label, used in the discount row
 *   convenienceFee  number  — flat fee (typically 30)
 *   gstAmount       number  — total GST on convenience fee (CGST + SGST)
 *   totalAmount     number  — final grand total
 *   className       string  — optional extra classes for the wrapper
 */
export default function PriceBreakdown({
  seatsTotal = 0,
  fnbTotal = 0,
  couponDiscount = 0,
  couponCode = "",
  convenienceFee = 0,
  gstAmount = 0,
  totalAmount = 0,
  className = "",
}) {
  const seats = Number(seatsTotal) || 0;
  const fnb = Number(fnbTotal) || 0;
  const discount = Number(couponDiscount) || 0;
  const fee = Number(convenienceFee) || 0;
  const gst = Number(gstAmount) || 0;
  const total = Number(totalAmount) || 0;

  // Display the post-discount subtotal even if discount is 0.
  const subtotal = Math.max(0, seats + fnb - discount);

  // CGST/SGST split for the tooltip — half of the GST each, with halves
  // shown to two decimals so users see it adds back up to gst.
  const half = gst / 2;
  const tooltipText = `CGST ₹${half.toFixed(2)} + SGST ₹${half.toFixed(2)}`;

  const feesTotal = fee + gst;
  const [feesOpen, setFeesOpen] = useState(false);
  const gstTooltipId = useId();
  const feesPanelId = useId();

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl p-5 text-slate-900 ${className}`}
    >
      <h2 className="text-lg font-semibold tracking-tight mb-3">
        Price Breakdown
      </h2>

      <Stagger gap={0.04} className="space-y-2 text-sm">
        <StaggerItem y={6}>
          <div className="flex justify-between text-slate-700">
            <span>Tickets subtotal</span>
            <span className="tabular-nums">₹{seats}</span>
          </div>
        </StaggerItem>

        {fnb > 0 && (
          <StaggerItem y={6}>
            <div className="flex justify-between text-slate-700">
              <span>F&amp;B</span>
              <span className="tabular-nums">₹{fnb}</span>
            </div>
          </StaggerItem>
        )}

        {discount > 0 && (
          <StaggerItem y={6}>
            <div className="flex justify-between text-rose-700">
              <span>
                Coupon discount
                {couponCode ? ` (${couponCode})` : ""}
              </span>
              <span className="tabular-nums">−₹{discount}</span>
            </div>
          </StaggerItem>
        )}

        <StaggerItem y={6}>
          <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between text-slate-800">
            <span>Subtotal</span>
            <span className="tabular-nums">₹{subtotal}</span>
          </div>
        </StaggerItem>

        {/* Collapsible fees section — keeps the receipt compact on first glance */}
        <StaggerItem y={6}>
          <button
            type="button"
            onClick={() => setFeesOpen((v) => !v)}
            aria-expanded={feesOpen}
            aria-controls={feesPanelId}
            className="w-full flex justify-between items-center text-slate-700 hover:text-slate-900 transition-colors"
          >
            <span className="inline-flex items-center gap-1.5">
              Fees &amp; taxes
              <motion.span
                animate={{ rotate: feesOpen ? 180 : 0 }}
                transition={{ duration: 0.2, ease: easeOutExpo }}
                className="inline-flex"
              >
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </motion.span>
            </span>
            <span className="tabular-nums">₹{feesTotal}</span>
          </button>
        </StaggerItem>

        <AnimatePresence initial={false}>
          {feesOpen && (
            <motion.div
              id={feesPanelId}
              key="fees-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: easeOutExpo }}
              className="overflow-hidden"
            >
              <div className="pl-3 border-l-2 border-slate-200 space-y-2 mt-1">
                <div className="flex justify-between text-slate-700">
                  <span>Convenience fee</span>
                  <span className="tabular-nums">₹{fee}</span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span className="inline-flex items-center gap-1.5">
                    GST (18%)
                    <span className="relative inline-flex group">
                      <button
                        type="button"
                        aria-describedby={gstTooltipId}
                        aria-label={tooltipText}
                        className="inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-red-500/30 cursor-help"
                      >
                        <Info className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-800 transition-colors" />
                      </button>
                      <span
                        role="tooltip"
                        id={gstTooltipId}
                        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md border border-slate-200 bg-white/95 px-2 py-1 text-[11px] text-slate-800 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity shadow-lg shadow-slate-200"
                      >
                        {tooltipText}
                      </span>
                    </span>
                  </span>
                  <span className="tabular-nums">₹{gst}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <StaggerItem y={6}>
          <dl className="border-t border-slate-200 pt-3 mt-2 flex justify-between items-center">
            <dt className="text-base font-semibold">Total</dt>
            <dd
              aria-live="polite"
              className="text-2xl font-extrabold text-red-600 tabular-nums overflow-hidden inline-block leading-tight"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={total}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.28, ease: easeOutExpo }}
                  className="inline-block"
                >
                  ₹{total}
                </motion.span>
              </AnimatePresence>
            </dd>
          </dl>
        </StaggerItem>
      </Stagger>
    </div>
  );
}
