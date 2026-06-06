import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";

/**
 * MobileBottomSheet — light-theme reusable bottom sheet with drag-to-dismiss.
 *
 * Props:
 *   trigger        ReactNode  — always-visible handle that toggles the sheet.
 *   open           boolean    — controlled open state.
 *   onOpenChange   (b)=>void  — controlled state setter.
 *   children       ReactNode  — sheet body.
 *   ariaLabel      string     — sheet aria-label, defaults to "Bottom sheet".
 *
 * Behavior:
 *   - Backdrop click / Escape / drag-down past 120px → close.
 *   - Body scroll-locked while open.
 *   - Focus is trapped inside the sheet; restored to opener on close.
 *   - Backdrop opacity tracks the drag offset for a tactile feel.
 */
export default function MobileBottomSheet({
  trigger,
  open,
  onOpenChange,
  children,
  ariaLabel = "Bottom sheet",
}) {
  const dragY = useMotionValue(0);
  // Fade the backdrop as user drags down so it feels like one continuous gesture.
  const backdropOpacity = useTransform(dragY, [0, 300], [0.4, 0]);
  const sheetRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  // Lock body scroll + close on Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onOpenChange?.(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  // Focus management: remember who opened us, move focus into the sheet,
  // and restore focus when we close.
  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current = document.activeElement;
      const id = requestAnimationFrame(() => {
        const first = sheetRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        first?.focus();
      });
      return () => cancelAnimationFrame(id);
    }
    if (previouslyFocusedRef.current?.focus) {
      previouslyFocusedRef.current.focus();
    }
  }, [open]);

  // Trap Tab inside the sheet.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== "Tab" || !sheetRef.current) return;
      const focusables = sheetRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {trigger}

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop — opacity tracks the drag-down progress */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ opacity: backdropOpacity }}
              className="fixed inset-0 z-40 bg-slate-900 backdrop-blur-sm"
              onClick={() => onOpenChange?.(false)}
              aria-hidden="true"
            />

            {/* Sheet */}
            <motion.div
              ref={sheetRef}
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              style={{ y: dragY }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 400) {
                  onOpenChange?.(false);
                } else {
                  dragY.set(0);
                }
              }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-slate-200 bg-white shadow-2xl pb-[env(safe-area-inset-bottom)] touch-pan-y"
            >
              <div className="sticky top-0 pt-3 pb-2 flex justify-center bg-white cursor-grab active:cursor-grabbing">
                <span
                  className="block w-12 h-1.5 rounded-full bg-slate-300"
                  aria-hidden="true"
                />
              </div>
              <div className="px-4 pb-5">{children}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
