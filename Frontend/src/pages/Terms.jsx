import { motion } from "framer-motion";
import { Header } from "@/components/Headers/header";
import { Footer } from "@/components/Footer/footer";

const glassCard =
  "rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl";

const sections = [
  {
    title: "1. Acceptance of terms",
    body: "By accessing or using MovieVista, you agree to be bound by these Terms of Service and any policies referenced herein. If you do not agree, do not use the service. We may update these terms from time to time and will indicate the effective date at the top of this page.",
  },
  {
    title: "2. Account responsibilities",
    body: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use. We reserve the right to suspend accounts that violate these terms or applicable law.",
  },
  {
    title: "3. Bookings and payments",
    body: "All ticket prices include applicable taxes and a convenience fee where indicated. Bookings are confirmed only upon successful payment. Cancellations and refunds are governed by the policy of the respective cinema partner; please review the cancellation window before checkout.",
  },
  {
    title: "4. Prohibited use",
    body: "You may not use MovieVista to engage in fraud, scrape data at scale, resell tickets without authorization, or interfere with the integrity of our systems. Violations may result in immediate termination and legal action.",
  },
  {
    title: "5. Intellectual property",
    body: "All content on MovieVista — including logos, copy, and design — is owned by us or our licensors. You may not reproduce, distribute, or create derivative works without our prior written consent.",
  },
  {
    title: "6. Limitation of liability",
    body: "To the maximum extent permitted by law, MovieVista shall not be liable for indirect, incidental, or consequential damages arising from your use of the service. Our total liability is limited to the amount you paid for the booking in question.",
  },
  {
    title: "7. Governing law",
    body: "These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.",
  },
];

const Terms = () => {
  return (
    <div className="relative min-h-screen bg-white text-slate-900 flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-red-600/10 blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-[500px] w-[500px] rounded-full bg-rose-700/10 blur-3xl" />
      </div>

      <Header />

      <main className="relative z-10 flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          <p className="text-red-600 text-xs font-semibold tracking-widest uppercase mb-2">
            Legal
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs text-slate-500">
            Last updated: 06 May 2026 — placeholder copy, final legal review
            pending.
          </p>
        </motion.div>

        <div className={`${glassCard} p-6 md:p-8 space-y-6`}>
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg md:text-xl font-semibold tracking-tight text-slate-900 mb-2">
                {section.title}
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
