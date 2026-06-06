import { motion } from "framer-motion";
import { Film, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Header } from "@/components/Headers/header";
import { Footer } from "@/components/Footer/footer";

const glassCard =
  "rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl";

const features = [
  {
    icon: Film,
    title: "Curated for movie lovers",
    body: "From the latest blockbusters to indie gems and regional cinema — we surface what matters and skip the noise.",
  },
  {
    icon: MapPin,
    title: "Across India",
    body: "Mumbai, Delhi, Bengaluru, Hyderabad, Ahmedabad, Pune and more — book in your city with showtimes that actually fit your day.",
  },
  {
    icon: ShieldCheck,
    title: "Trust, baked in",
    body: "Secure payments, transparent fees, instant QR tickets. No surprises at the counter, no hidden charges.",
  },
];

const About = () => {
  return (
    <div className="relative min-h-screen bg-white text-slate-900 flex flex-col overflow-hidden">
      {/* Decorative red glows */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-red-600/10 blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-[500px] w-[500px] rounded-full bg-rose-700/10 blur-3xl" />
      </div>

      <Header />

      <main className="relative z-10 flex-1 container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`${glassCard} p-8 md:p-12 mb-10`}
        >
          <p className="inline-flex items-center gap-2 text-red-600 text-xs font-semibold tracking-widest uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            About MovieVista
          </p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            India&apos;s modern movie booking app —
            <span className="block bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
              built for the way you actually watch movies.
            </span>
          </h1>
          <p className="mt-5 text-slate-700 text-base md:text-lg leading-relaxed max-w-3xl">
            We started MovieVista with a simple idea: booking a movie should
            feel as good as watching one. No clutter, no five-tap checkouts,
            no juggling between apps to find a seat. Just clean showtimes,
            honest pricing, and a ticket on your phone before the trailers
            start.
          </p>
          <p className="mt-4 text-slate-400 text-sm md:text-base leading-relaxed max-w-3xl">
            Today we work with hundreds of screens across India&apos;s biggest
            cities and a growing roster of independent theatres. Our team is
            small, our standards are high, and we obsess over the details so
            you can focus on the popcorn.
          </p>
        </motion.section>

        {/* Feature blurbs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.1 + idx * 0.08,
                  ease: "easeOut",
                }}
                className={`${glassCard} p-6`}
              >
                <div className="grid place-items-center w-11 h-11 rounded-xl bg-red-100 border border-red-200 mb-4">
                  <Icon className="w-5 h-5 text-red-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  {feature.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
