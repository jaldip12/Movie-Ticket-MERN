import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import { Header } from "@/components/Headers/header";
import { Footer } from "@/components/Footer/footer";
import { Button } from "@/components/ui/button";

const glassCard =
  "rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl";

const inputClass =
  "w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 rounded-xl px-4 h-11 text-sm outline-none transition-colors focus:bg-slate-100 focus:border-red-300";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    // No backend wired yet — fake an async ack.
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setForm({ name: "", email: "", message: "" });
      toast.success("We'll get back within 24 hours");
    }, 600);
  };

  return (
    <div className="relative min-h-screen bg-white text-slate-900 flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-red-600/10 blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-[500px] w-[500px] rounded-full bg-rose-700/10 blur-3xl" />
      </div>

      <Header />

      <main className="relative z-10 flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          <p className="text-red-600 text-xs font-semibold tracking-widest uppercase mb-2">
            Get in touch
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Contact us
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Questions about a booking, refunds, or partnerships? Drop us a
            line and we&apos;ll get back within 24 hours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Contact info */}
          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: "easeOut" }}
            className={`${glassCard} p-6 lg:col-span-2 space-y-5`}
          >
            <h2 className="text-lg font-semibold tracking-tight">
              Reach us directly
            </h2>

            <div className="flex items-start gap-3">
              <div className="grid place-items-center w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex-shrink-0">
                <Mail className="w-4 h-4 text-red-700" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                  Support email
                </p>
                <a
                  href="mailto:support@movievista.app"
                  className="text-sm text-slate-900 hover:text-red-700 transition-colors break-all"
                >
                  support@movievista.app
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="grid place-items-center w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex-shrink-0">
                <Phone className="w-4 h-4 text-red-700" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                  Phone
                </p>
                <p className="text-sm text-slate-900">+91 80 0000 0000</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mon–Sat, 10:00–19:00 IST
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="grid place-items-center w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex-shrink-0">
                <MapPin className="w-4 h-4 text-red-700" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                  Office
                </p>
                <p className="text-sm text-slate-900 leading-relaxed">
                  MovieVista HQ
                  <br />
                  100 Marine Drive
                  <br />
                  Mumbai 400020, India
                </p>
              </div>
            </div>
          </motion.aside>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
            className={`${glassCard} p-6 lg:col-span-3 space-y-4`}
          >
            <h2 className="text-lg font-semibold tracking-tight">
              Send us a message
            </h2>

            <div>
              <label
                htmlFor="contact-name"
                className="block text-xs uppercase tracking-wider text-slate-400 font-medium mb-1.5"
              >
                Your name
              </label>
              <input
                id="contact-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={inputClass}
                placeholder="Anika Sharma"
                autoComplete="name"
              />
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="block text-xs uppercase tracking-wider text-slate-400 font-medium mb-1.5"
              >
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="block text-xs uppercase tracking-wider text-slate-400 font-medium mb-1.5"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors focus:bg-slate-100 focus:border-red-300 resize-y"
                placeholder="Tell us what's on your mind…"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto h-11 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-60"
            >
              {submitting ? (
                "Sending…"
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </motion.form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
