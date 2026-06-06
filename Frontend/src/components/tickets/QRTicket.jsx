import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import QRCode from "qrcode";

/**
 * Renders a QR code for the given `value` onto a canvas. Dark modules on a
 * white background (the scanner-friendly orientation) — the wrapper card on
 * the page can be themed dark, but the code itself stays high-contrast so
 * scanners read it reliably.
 *
 * Props:
 *  - value:    the string to encode (typically a booking id)
 *  - size:     pixel width of the rendered QR (default 240)
 *  - className: extra classes for the outer wrapper
 */
export default function QRTicket({ value, size = 240, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;

    QRCode.toCanvas(
      canvas,
      String(value),
      {
        color: { dark: "#0f172a", light: "#ffffff" },
        margin: 2,
        width: size,
      },
      (err) => {
        if (err) {
          // Non-fatal — surface in console for the dev, leave canvas blank.
          // eslint-disable-next-line no-console
        }
      }
    );
  }, [value, size]);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="border border-red-200 rounded-xl p-2 bg-white">
        <motion.canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="rounded-lg block"
          role="img"
          aria-label="Ticket QR code"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      {value ? (
        <p className="text-xs text-slate-500 font-mono break-all text-center max-w-[260px]">
          {value}
        </p>
      ) : null}
    </div>
  );
}
