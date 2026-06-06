import { Link } from "react-router-dom";
import {
  Facebook,
  Film,
  Heart,
  Instagram,
  MapPin,
  ShieldCheck,
  Twitter,
  Youtube,
} from "lucide-react";
import { useCity } from "@/context/CityContext";

const COMPANY_LINKS = [
  { label: "About us", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Careers", to: "/careers" },
];

const HELP_LINKS = [
  { label: "FAQ", to: "/help" },
  { label: "Refund policy", to: "/help#refunds" },
  { label: "Customer support", to: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Terms of use", to: "/terms" },
  { label: "Privacy policy", to: "/privacy" },
  { label: "Cookie policy", to: "/privacy#cookies" },
];

const SOCIAL_LINKS = [
  { label: "Twitter", icon: Twitter, href: "https://twitter.com" },
  { label: "Instagram", icon: Instagram, href: "https://instagram.com" },
  { label: "Facebook", icon: Facebook, href: "https://facebook.com" },
  { label: "YouTube", icon: Youtube, href: "https://youtube.com" },
];

// Curated fallback list for when the API hasn't returned cities yet — keeps
// the footer from looking empty on first paint.
const FALLBACK_CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
];

function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-3.5">
        {title}
      </h4>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="text-sm text-slate-400 hover:text-red-600 transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}

export function Footer() {
  const { cities, openPicker } = useCity();
  const cityChips =
    Array.isArray(cities) && cities.length > 0 ? cities : FALLBACK_CITIES;

  return (
    <footer className="relative bg-white border-t border-slate-200">
      <div className="container mx-auto px-4 py-12 md:py-14">
        {/* Brand block */}
        <div className="mb-10 max-w-2xl">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg">
              <Film
                className="w-[20px] h-[20px] text-white"
                strokeWidth={2.5}
              />
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-900">
              MovieVista
            </span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed">
            India's friendliest way to book a movie. Every screen, every
            showtime, in one place — from blockbusters to indie gems.
          </p>
        </div>

        {/* Link grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          <Section title="Company">
            {COMPANY_LINKS.map((l) => (
              <FooterLink key={l.label} to={l.to}>
                {l.label}
              </FooterLink>
            ))}
          </Section>

          <Section title="Help">
            {HELP_LINKS.map((l) => (
              <FooterLink key={l.label} to={l.to}>
                {l.label}
              </FooterLink>
            ))}
          </Section>

          <Section title="Legal">
            {LEGAL_LINKS.map((l) => (
              <FooterLink key={l.label} to={l.to}>
                {l.label}
              </FooterLink>
            ))}
          </Section>

          <Section title="Follow us">
            <li>
              <div className="flex items-center gap-2">
                {SOCIAL_LINKS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="grid place-items-center w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </li>
            <li>
              <a
                href="mailto:hello@movievista.example"
                className="text-sm text-slate-400 hover:text-red-600 transition-colors"
              >
                hello@movievista.example
              </a>
            </li>
          </Section>
        </div>

        {/* Cities served */}
        <div className="mt-10 md:mt-12 pt-8 border-t border-slate-200">
          <h4 className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-3.5 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-red-600" />
            Cities served
          </h4>
          <div className="flex flex-wrap gap-2">
            {cityChips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={openPicker}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 hover:text-red-700 hover:border-red-200 hover:bg-red-500/5 transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Trust + copyright strip */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 order-2 md:order-1">
            © {new Date().getFullYear()} MovieVista. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400 order-1 md:order-2">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% secure
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-red-600 fill-red-400" />
              Made in India
            </span>
            <span className="hidden md:inline text-slate-600">·</span>
            <span className="text-slate-500">
              Visa · Mastercard · UPI · NetBanking
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
