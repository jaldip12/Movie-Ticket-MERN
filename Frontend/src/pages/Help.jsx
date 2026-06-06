import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronDown,
  HelpCircle,
  Ticket,
  RefreshCcw,
  Receipt,
  Printer,
  Tag,
  ShieldCheck,
  Trash2,
  LifeBuoy,
} from "lucide-react";
import PublicShell from "@/components/Layout/PublicShell";

const FAQ_ITEMS = [
  {
    icon: Ticket,
    q: "How do I book a ticket?",
    a: (
      <>
        <p>Booking is a quick four-step flow:</p>
        <ol className="list-decimal pl-5 mt-2 space-y-1.5">
          <li>
            Pick a movie from the home page or the{" "}
            <Link to="/movies" className="text-red-600 hover:underline">
              Movies
            </Link>{" "}
            list.
          </li>
          <li>
            Choose a city, date and showtime that works for you. Cinemas and
            screens are listed with the formats available (2D, 3D, IMAX, etc.).
          </li>
          <li>
            Select your seats from the seating layout. Locked seats turn grey;
            available ones turn red on hover.
          </li>
          <li>
            Review your order, apply a promo code if you have one, and proceed
            to payment to receive your QR ticket.
          </li>
        </ol>
      </>
    ),
  },
  {
    icon: RefreshCcw,
    q: "How do I cancel a booking?",
    a: (
      <p>
        Open{" "}
        <Link to="/account/tickets" className="text-red-600 hover:underline">
          My Tickets
        </Link>{" "}
        and tap the booking you want to cancel. The "Cancel booking" button is
        available until the show actually starts. Once a show begins, the seats
        become non-refundable, so cancel earlier rather than later.
      </p>
    ),
  },
  {
    icon: Receipt,
    q: "How are refunds processed?",
    a: (
      <p>
        For cancellations made before showtime, the booking amount is reversed
        to your original payment method. Bank credits typically settle in 3–7
        working days. Our payments integration is being upgraded — until it
        goes live, support will process eligible refunds manually within 5
        working days. Drop us a note from the contact section below if you
        need an update.
      </p>
    ),
  },
  {
    icon: Tag,
    q: "What are the convenience fee + GST?",
    a: (
      <>
        <p>
          A flat <span className="text-red-700 font-medium">₹30</span>{" "}
          convenience fee applies per booking — this covers seat-locking,
          payment processing and your QR ticket. GST is charged at{" "}
          <span className="text-red-700 font-medium">18%</span> on the
          convenience fee, in line with Indian tax regulations (CGST 9% +
          SGST 9%).
        </p>
        <p className="mt-2">
          Ticket-price GST is already included by the cinema in the printed
          rate, so what you see on the seat layout is what you pay before
          fees.
        </p>
      </>
    ),
  },
  {
    icon: Printer,
    q: "Can I get a printed ticket?",
    a: (
      <p>
        Every confirmed booking gets a QR code. You can show the QR on your
        phone at the entry gate, or use the public ticket link from{" "}
        <Link to="/account/tickets" className="text-red-600 hover:underline">
          My Tickets
        </Link>{" "}
        to print it on plain paper. The cinema staff just need to scan the QR
        — no separate printout from the box office is required.
      </p>
    ),
  },
  {
    icon: Tag,
    q: "How do promo codes work?",
    a: (
      <>
        <p>
          Apply a promo code on the payment screen before paying. Two types
          exist:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1.5">
          <li>
            <strong className="text-slate-900">Single-use:</strong> usable once per
            account, often on first booking.
          </li>
          <li>
            <strong className="text-slate-900">Reusable:</strong> can be applied
            again until the validity end date.
          </li>
        </ul>
        <p className="mt-2">
          Codes have minimum order amounts and a per-user usage cap. If a code
          isn't sticking, double-check the validity window and the minimum
          amount in the code's terms.
        </p>
      </>
    ),
  },
  {
    icon: ShieldCheck,
    q: "How do I become a regular admin?",
    a: (
      <p>
        Admin privileges aren't open to self-signup. They're granted manually
        by the platform owner to cinema operators and staff. If you run a
        cinema and want to onboard, please reach out via the support contact
        below — we'll verify and provision an admin account for you.
      </p>
    ),
  },
  {
    icon: Trash2,
    q: "How do I delete my account?",
    a: (
      <p>
        Head over to{" "}
        <Link to="/account" className="text-red-600 hover:underline">
          Account
        </Link>{" "}
        and open the <span className="text-slate-900">Danger zone</span> tab.
        You'll need to type{" "}
        <span className="font-mono text-rose-700 px-1 rounded bg-rose-50 border border-rose-200">
          DELETE
        </span>{" "}
        to confirm. Past bookings remain on record for accounting and audit
        purposes but are detached from any usable login.
      </p>
    ),
  },
  {
    icon: LifeBuoy,
    q: "Contact support",
    a: (
      <p>
        For anything we haven't covered here, email{" "}
        <a
          href="mailto:support@cinepolis.example"
          className="text-red-600 hover:underline"
        >
          support@cinepolis.example
        </a>
        . Include your booking ID (if relevant) so we can help faster.
      </p>
    ),
  },
];

function FaqItem({ item, open, onToggle }) {
  const Icon = item.icon || HelpCircle;
  return (
    <div
      className={`rounded-2xl border transition-colors ${
        open
          ? "border-slate-200 bg-gradient-to-b from-slate-50 to-white border-l-4 border-l-red-500"
          : "border-slate-200 bg-gradient-to-b from-slate-50 to-white hover:border-slate-300"
      } backdrop-blur-sm shadow-xl overflow-hidden`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        <span className="grid place-items-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-red-600 flex-shrink-0">
          <Icon className="w-5 h-5" />
        </span>
        <span className="flex-1 text-sm md:text-base font-medium text-slate-900">
          {item.q}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform ${
            open ? "rotate-180 text-red-600" : ""
          }`}
        />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.2 }}
          className="px-5 pb-5 -mt-1"
        >
          <div className="ml-14 text-sm text-slate-700 leading-relaxed">
            {item.a}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function Help() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <PublicShell className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-red-600/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-rose-700/10 blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="mb-10 text-center">
            <p className="text-red-600 text-xs font-semibold tracking-widest uppercase mb-2">
              Support center
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Help & FAQ
            </h1>
            <p className="mt-3 text-sm md:text-base text-slate-400 max-w-xl mx-auto">
              Quick answers to the questions we hear most. Can't find what
              you need? Email{" "}
              <a
                href="mailto:support@cinepolis.example"
                className="text-red-600 hover:underline"
              >
                support@cinepolis.example
              </a>
              .
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <FaqItem
                key={idx}
                item={item}
                open={openIndex === idx}
                onToggle={() => setOpenIndex(openIndex === idx ? -1 : idx)}
              />
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm p-6 text-center">
            <p className="text-sm text-slate-400">
              Still stuck? Our team typically replies within one business day.
            </p>
            <a
              href="mailto:support@cinepolis.example"
              className="mt-3 inline-flex items-center gap-2 px-5 h-10 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-lg transition-all text-sm"
            >
              <LifeBuoy className="w-4 h-4" />
              Contact support
            </a>
          </div>
        </motion.div>
      </div>
    </PublicShell>
  );
}
