import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { ShieldCheck, Star, Ticket } from "lucide-react";
import { easeOutExpo } from "@/lib/motion";

/**
 * TrustStrip
 * ----------
 * 3-up reassurance row sitting near the bottom of Home. Numbers are
 * intentionally hard-coded for the Indian market — wiring them to /admin/stats
 * would surface PII-style data to non-admins and is overkill for v1.
 *
 * Each stat's primary number counts up from 0 once its block scrolls into
 * view, lending a "live ticker" feeling without needing a real socket.
 */
const STATS = [
  {
    icon: Ticket,
    iconClass: "text-red-600 bg-red-50 border-red-200",
    count: 1200,
    prefix: "",
    suffix: "+ bookings",
    format: (v) =>
      v >= 1000 ? `${(v / 1000).toFixed(1)}K` : Math.round(v).toString(),
    label: "made on MovieVista today",
  },
  {
    icon: Star,
    iconClass: "text-amber-700 bg-amber-50 border-amber-400/20",
    count: 4.6,
    prefix: "",
    suffix: " / 5",
    format: (v) => v.toFixed(1),
    label: "across 850+ verified reviews",
    isStar: true,
  },
  {
    icon: ShieldCheck,
    iconClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
    count: 100,
    prefix: "",
    suffix: "% secure",
    format: (v) => Math.round(v).toString(),
    label: "RBI-grade payments, encrypted end-to-end",
  },
];

function CountUp({ to, format, duration = 1.4 }) {
  const ref = useRef(null);
  const mv = useMotionValue(0);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState(format(0));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, to, {
      duration,
      ease: easeOutExpo,
    });
    const unsub = mv.on("change", (v) => setDisplay(format(v)));
    return () => {
      controls.stop();
      unsub();
    };
  }, [inView, to, duration, format, mv]);

  return <span ref={ref}>{display}</span>;
}

export function TrustStrip() {
  return (
    <section className="py-10 md:py-14 border-t border-slate-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.suffix + idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.7,
                  ease: easeOutExpo,
                  delay: idx * 0.1,
                }}
                className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl p-4 md:p-5 flex items-center gap-4"
              >
                <div
                  className={`grid place-items-center w-12 h-12 rounded-xl border shrink-0 ${stat.iconClass}`}
                >
                  <Icon
                    aria-hidden="true"
                    className={`w-5 h-5 ${stat.isStar ? "fill-amber-400" : ""}`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-900 text-base md:text-lg font-bold tracking-tight tabular-nums">
                    <CountUp to={stat.count} format={stat.format} />
                    {stat.suffix}
                  </p>
                  <p className="text-xs md:text-sm text-slate-400 leading-tight mt-0.5">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TrustStrip;
