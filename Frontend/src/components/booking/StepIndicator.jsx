import { motion } from "framer-motion";
import { Armchair, CreditCard, PartyPopper } from "lucide-react";
import { easeOutExpo } from "@/lib/motion";

/**
 * StepIndicator — three-pill booking progress UI.
 *
 * Steps: seats -> payment -> done.
 *
 * Props:
 *   current  "seats" | "payment" | "done"
 *
 * Visual:
 *   - Done step      : red filled circle + animated check icon
 *   - Current step   : red gradient pill morphs in via shared layoutId
 *   - Upcoming step  : slate outline pill
 *   - Connecting line: thin slate track; grows red (scaleX) once step is done
 *
 * Mobile (<sm): condensed to a single active pill + "Step N of 3" caption.
 * Desktop (sm+): full pill row with connectors.
 */

const STEPS = [
  { id: "seats", label: "Select Seats", Icon: Armchair },
  { id: "payment", label: "Payment", Icon: CreditCard },
  { id: "done", label: "Done", Icon: PartyPopper },
];

function getStatus(stepId, current) {
  const order = STEPS.map((s) => s.id);
  const stepIdx = order.indexOf(stepId);
  const curIdx = order.indexOf(current);
  if (curIdx === -1 || stepIdx === -1) return "upcoming";
  if (stepIdx < curIdx) return "done";
  if (stepIdx === curIdx) return "current";
  return "upcoming";
}

const STATUS_LABEL = {
  done: "Completed",
  current: "In progress",
  upcoming: "Upcoming",
};

// Animated check that draws its stroke on mount via pathLength.
function AnimatedCheck({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <motion.path
        d="M5 12.5l4.5 4.5L19 7"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, ease: easeOutExpo, delay: 0.05 }}
      />
    </svg>
  );
}

export default function StepIndicator({ current = "seats", className = "" }) {
  const curIdx = STEPS.findIndex((s) => s.id === current);
  const activeStep = STEPS[curIdx] || STEPS[0];

  return (
    <div
      className={`w-full ${className}`}
      role="navigation"
      aria-label="Booking progress"
    >
      {/* Mobile: condensed */}
      <div className="sm:hidden">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-b from-red-600 to-red-700 text-white shadow-lg shrink-0">
              <activeStep.Icon className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium leading-none">
                Step {Math.max(curIdx, 0) + 1} of {STEPS.length}
              </p>
              <p className="text-sm font-semibold text-slate-900 truncate mt-0.5">
                {activeStep.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0" role="list">
            {STEPS.map((s, i) => {
              const status = getStatus(s.id, current);
              return (
                <span
                  key={s.id}
                  role="listitem"
                  aria-label={`Step ${i + 1} of ${STEPS.length}: ${STATUS_LABEL[status]}: ${s.label}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i < curIdx
                      ? "w-3 bg-red-500"
                      : i === curIdx
                        ? "w-6 bg-gradient-to-r from-red-500 to-red-600"
                        : "w-3 bg-slate-200"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop: full row */}
      <motion.ol
        className="hidden sm:flex items-center justify-center gap-2"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } },
        }}
      >
        {STEPS.map((step, i) => {
          const status = getStatus(step.id, current);
          const isLast = i === STEPS.length - 1;
          const Icon = step.Icon;

          // Text/icon color depending on status; the colored background pill
          // morphs in via a shared layoutId so the "active" highlight slides
          // between steps when the user advances.
          const pillBase =
            "relative inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold transition-colors";
          let pillText;
          if (status === "current") {
            pillText =
              " text-white border border-red-300 shadow-lg shadow-red-500/20";
          } else if (status === "done") {
            pillText = " bg-red-100 text-red-700 border border-red-200";
          } else {
            pillText = " bg-slate-50 text-slate-400 border border-slate-200";
          }

          return (
            <motion.li
              key={step.id}
              className="flex items-center gap-2"
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.45, ease: easeOutExpo },
                },
              }}
            >
              <div
                className={pillBase + pillText}
                aria-current={status === "current" ? "step" : undefined}
                aria-label={`${STATUS_LABEL[status]}: ${step.label}`}
              >
                {status === "current" && (
                  <motion.span
                    layoutId="step-pill"
                    className="absolute inset-0 -z-0 rounded-full bg-gradient-to-r from-red-600 to-red-700"
                    transition={{
                      type: "spring",
                      stiffness: 320,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative z-10 inline-flex items-center gap-2">
                  {status === "done" ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white">
                      <AnimatedCheck className="w-3 h-3" />
                    </span>
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  <span>{step.label}</span>
                </span>
              </div>

              {!isLast && (
                <span
                  aria-hidden="true"
                  className="relative h-[2px] w-10 rounded-full bg-slate-200 overflow-hidden"
                >
                  <motion.span
                    initial={false}
                    animate={{ scaleX: status === "done" ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: easeOutExpo }}
                    style={{ originX: 0 }}
                    className="absolute inset-0 bg-red-500/70 rounded-full"
                  />
                </span>
              )}
            </motion.li>
          );
        })}
      </motion.ol>
    </div>
  );
}
