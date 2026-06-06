/**
 * Shared motion language for the app. Importing the variants from here
 * (rather than defining one-offs at every call site) keeps timing/easing
 * consistent so pages feel like they belong to the same product.
 *
 * Usage:
 *   import { motion } from "framer-motion";
 *   import { fadeUp, stagger, easeOutExpo } from "@/lib/motion";
 *
 *   <motion.div variants={fadeUp} initial="hidden" animate="show" />
 *   <motion.div variants={stagger(0.08)} initial="hidden" animate="show">
 *     {items.map(...)}
 *   </motion.div>
 */

// ---------- Easing curves ----------
// Custom cubic-bezier values. Names come from popular easing libraries.

export const easeOutExpo = [0.16, 1, 0.3, 1];
export const easeOutQuart = [0.25, 1, 0.5, 1];
export const easeInOutCubic = [0.65, 0, 0.35, 1];
export const easeOutBack = [0.34, 1.56, 0.64, 1];

// ---------- Variant factories ----------

export const fadeIn = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.5, ease: easeOutQuart },
  },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

export const fadeDown = {
  hidden: { opacity: 0, y: -16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
};

export const slideUp = {
  hidden: { opacity: 0, y: "100%" },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOutExpo },
  },
  exit: {
    opacity: 0,
    y: "100%",
    transition: { duration: 0.3, ease: easeInOutCubic },
  },
};

/**
 * Parent stagger variants. Set delayChildren to delay before the first
 * child fires, and staggerChildren for the gap between each child.
 */
export const stagger = (staggerChildren = 0.06, delayChildren = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
});

// ---------- Common transition presets ----------

export const springSnappy = {
  type: "spring",
  stiffness: 380,
  damping: 30,
  mass: 0.8,
};

export const springGentle = {
  type: "spring",
  stiffness: 200,
  damping: 24,
};

// Tap/hover micro-interactions used by buttons + cards.
export const hoverLift = {
  whileHover: { y: -3, transition: { duration: 0.2, ease: easeOutQuart } },
  whileTap: { scale: 0.97, transition: { duration: 0.12 } },
};

export const hoverScale = {
  whileHover: { scale: 1.03, transition: { duration: 0.2, ease: easeOutQuart } },
  whileTap: { scale: 0.97, transition: { duration: 0.12 } },
};

// ---------- Viewport options shared across scroll-reveal components ----------

export const viewportOnce = { once: true, amount: 0.2 };
export const viewportAlways = { once: false, amount: 0.3 };
