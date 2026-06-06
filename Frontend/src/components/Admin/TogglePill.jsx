import { motion } from "framer-motion";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export default function TogglePill({
  on,
  busy = false,
  onClick,
  onLabel = "On",
  offLabel = "Off",
  ariaLabel,
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={busy}
      whileTap={{ scale: 0.95 }}
      aria-pressed={Boolean(on)}
      aria-label={ariaLabel}
      animate={{
        backgroundColor: on ? "rgb(254 226 226)" : "rgb(241 245 249)",
        color: on ? "rgb(220 38 38)" : "rgb(71 85 105)",
        borderColor: on ? "rgb(254 202 202)" : "rgb(226 232 240)",
      }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
      className={`relative inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full font-medium border disabled:opacity-60 ${FOCUS_RING}`}
    >
      <motion.span
        aria-hidden="true"
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`block h-2 w-2 rounded-full ${
          on ? "bg-red-500" : "bg-slate-400"
        }`}
      />
      <span>{on ? onLabel : offLabel}</span>
    </motion.button>
  );
}
