/**
 * Drop-in motion primitives. Saves writing variants + initial/animate/exit
 * boilerplate at every call site, and keeps the timing consistent.
 *
 * Examples:
 *   <FadeIn delay={0.1}><h1>Hello</h1></FadeIn>
 *   <FadeUp><HeroCard /></FadeUp>
 *   <ScrollReveal><MovieGrid /></ScrollReveal>
 *
 *   <Stagger gap={0.08}>
 *     {movies.map(m => <StaggerItem key={m.id}><MovieCard /></StaggerItem>)}
 *   </Stagger>
 *
 *   <HoverLift><div className="card">...</div></HoverLift>
 */

import { motion } from "framer-motion";
import {
  fadeIn as fadeInVariants,
  fadeUp as fadeUpVariants,
  scaleIn as scaleInVariants,
  stagger as staggerFactory,
  hoverLift as hoverLiftVariants,
  easeOutExpo,
  viewportOnce,
} from "@/lib/motion";

const baseProps = { initial: "hidden", animate: "show" };
const scrollProps = (viewport) => ({
  initial: "hidden",
  whileInView: "show",
  viewport: viewport || viewportOnce,
});

export function FadeIn({ children, delay = 0, className, as: Tag = "div", ...rest }) {
  return (
    <motion.div
      {...baseProps}
      variants={{
        hidden: fadeInVariants.hidden,
        show: {
          ...fadeInVariants.show,
          transition: { ...fadeInVariants.show.transition, delay },
        },
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function FadeUp({ children, delay = 0, y = 16, className, ...rest }) {
  return (
    <motion.div
      {...baseProps}
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: easeOutExpo, delay },
        },
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, delay = 0, className, ...rest }) {
  return (
    <motion.div
      {...baseProps}
      variants={{
        hidden: scaleInVariants.hidden,
        show: {
          ...scaleInVariants.show,
          transition: { ...scaleInVariants.show.transition, delay },
        },
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Viewport-triggered fade-up. Use for sections below the fold.
 */
export function ScrollReveal({ children, y = 24, className, viewport, ...rest }) {
  return (
    <motion.div
      {...scrollProps(viewport)}
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: easeOutExpo },
        },
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Parent that staggers its direct children. Pair with <StaggerItem>.
 * Set `gap` (seconds between children) and optional `delay` before first.
 */
export function Stagger({
  children,
  gap = 0.06,
  delay = 0,
  className,
  asScroll = false,
  ...rest
}) {
  const props = asScroll ? scrollProps() : baseProps;
  return (
    <motion.div
      {...props}
      variants={staggerFactory(gap, delay)}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, y = 16, ...rest }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: easeOutExpo },
        },
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hover/tap micro-interaction wrapper. Defaults: -3px lift on hover, 0.97
 * scale on tap. Pass `scale` for a scale-only hover instead of a y lift.
 */
export function HoverLift({ children, scale = false, className, ...rest }) {
  const hoverProps = scale
    ? {
        whileHover: { scale: 1.03, transition: { duration: 0.2 } },
        whileTap: { scale: 0.97 },
      }
    : hoverLiftVariants;
  return (
    <motion.div className={className} {...hoverProps} {...rest}>
      {children}
    </motion.div>
  );
}

/**
 * Page-level entry animation. Wrap a route's outermost element so the page
 * gently fades up when mounted.
 */
export function PageTransition({ children, className, ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOutExpo }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
