import { motion } from "framer-motion";
import { Header } from "@/components/Headers/header";
import { Footer } from "@/components/Footer/footer";

const glassCard =
  "rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl";

const sections = [
  {
    title: "1. Information we collect",
    body: "We collect information you provide directly — name, email, phone, payment metadata — and information generated through your use of the service, such as bookings, device identifiers, and approximate location for city selection. We do not store full payment card numbers; those are handled by our PCI-compliant payment partners.",
  },
  {
    title: "2. How we use information",
    body: "We use your information to confirm bookings, send tickets and receipts, prevent fraud, improve the product, and communicate occasional service updates. We do not sell your personal information.",
  },
  {
    title: "3. Sharing with partners",
    body: "We share booking details with the cinema and payment processor required to fulfil your booking. These partners are contractually bound to protect your data and use it only for the purposes we authorize.",
  },
  {
    title: "4. Cookies and tracking",
    body: "We use first-party cookies for authentication and basic analytics. You can disable cookies in your browser, but parts of the service — especially checkout — may stop working as expected.",
  },
  {
    title: "5. Data retention",
    body: "We retain booking records for as long as required by tax and accounting law in India, typically seven years. Account data is retained while your account is active and deleted on request, subject to legal hold requirements.",
  },
  {
    title: "6. Your rights",
    body: "You may access, correct, or delete your personal information by writing to support@movievista.app. We respond to verified requests within 30 days.",
  },
  {
    title: "7. Contact",
    body: "Questions about this policy? Reach our Data Protection team at privacy@movievista.app or via the contact form.",
  },
];

const Privacy = () => {
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
            Privacy Policy
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

export default Privacy;
