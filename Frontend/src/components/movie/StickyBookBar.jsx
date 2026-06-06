import { Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { springSnappy } from "@/lib/motion";

/**
 * Mobile-only sticky CTA at the bottom of the viewport. Tapping scrolls
 * the user to the showtimes section.
 */
export default function StickyBookBar({ priceFrom, onClick }) {
  const priceLabel =
    typeof priceFrom === "number" && Number.isFinite(priceFrom) && priceFrom > 0
      ? `From ₹${priceFrom} — `
      : "";

  return (
    <motion.div
      initial={{ y: 60 }}
      animate={{ y: 0 }}
      transition={springSnappy}
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
    >
      <Button
        onClick={onClick}
        aria-label={`Book tickets${priceLabel ? ` ${priceLabel.replace(/[—\s]+$/, "")}` : ""}`}
        className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all"
      >
        <Ticket className="w-4 h-4 mr-2" />
        {priceLabel}Book Tickets
      </Button>
    </motion.div>
  );
}
