import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import AccountShell from "@/components/Layout/AccountShell";
import { PageTransition } from "@/components/ui/Motion";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const SETTINGS = [
  {
    key: "emailOnBooking",
    label: "Booking confirmations",
    description: "Send me an email when I book a ticket",
  },
  {
    key: "emailOnReminder",
    label: "Show reminders",
    description: "Send me a reminder 1 hour before my show",
  },
  {
    key: "emailOnNewRelease",
    label: "New releases",
    description: "Email me when a movie I'm interested in releases",
  },
  {
    key: "promotionalEmails",
    label: "Promotional emails",
    description: "Special offers and discounts",
  },
];

const DEFAULT_PREFS = {
  emailOnBooking: true,
  emailOnReminder: true,
  emailOnNewRelease: false,
  promotionalEmails: false,
};

function ToggleSwitch({ checked, onClick, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      disabled={disabled}
      className={[
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        checked
          ? "bg-gradient-to-r from-red-600 to-red-700 shadow-md"
          : "bg-slate-200 border border-slate-300",
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      <motion.span
        className="inline-block h-4 w-4 rounded-full bg-white shadow-sm"
        animate={{ x: checked ? 24 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

export default function Notifications() {
  const { user, refresh } = useAuth();
  const serverPrefs = {
    ...DEFAULT_PREFS,
    ...(user?.notificationPreferences || {}),
  };

  // Optimistic local copy — flip immediately, roll back on failure.
  const [optimistic, setOptimistic] = useState({});
  const [pendingKey, setPendingKey] = useState(null);
  const [flashKey, setFlashKey] = useState(null);

  const prefs = { ...serverPrefs, ...optimistic };

  const handleToggle = async (key) => {
    if (pendingKey) return;
    const prev = prefs[key];
    const next = !prev;

    // Optimistic flip
    setOptimistic((o) => ({ ...o, [key]: next }));
    setPendingKey(key);
    try {
      await api.patch("/users/me/notifications", { [key]: next });
      await refresh();
      // refresh() pulls truth from server — clear our optimistic override.
      setOptimistic((o) => {
        const { [key]: _drop, ...rest } = o;
        return rest;
      });
      // Pulse green for a beat.
      setFlashKey(key);
      setTimeout(() => setFlashKey((current) => (current === key ? null : current)), 850);
      toast.success("Preferences updated");
    } catch (err) {
      // Roll back the optimistic flip.
      setOptimistic((o) => {
        const { [key]: _drop, ...rest } = o;
        return rest;
      });
      const msg =
        err?.response?.data?.message || "Could not update preferences";
      toast.error(msg);
    } finally {
      setPendingKey(null);
    }
  };

  return (
    <PageTransition>
      <AccountShell>
        <div className="pb-4 mb-6 border-b border-slate-200 flex items-start gap-3">
          <div className="grid place-items-center w-10 h-10 rounded-xl bg-red-100 border border-red-200 text-red-700 flex-shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Notification preferences
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Choose which emails you'd like to receive from us.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {SETTINGS.map(({ key, label, description }) => {
            const enabled = Boolean(prefs[key]);
            const loading = pendingKey === key;
            const flashing = flashKey === key;
            return (
              <motion.div
                key={key}
                animate={
                  flashing
                    ? { backgroundColor: ["#ffffff", "#ecfdf5", "#ffffff"] }
                    : { backgroundColor: "#ffffff" }
                }
                transition={{ duration: 0.8 }}
                className="rounded-xl border border-slate-200 p-4 md:p-5 flex items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-semibold text-slate-900">
                    {label}
                  </p>
                  <p className="text-xs md:text-sm text-slate-400 mt-1 leading-relaxed">
                    {description}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {loading && (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  )}
                  <ToggleSwitch
                    checked={enabled}
                    disabled={loading}
                    onClick={() => handleToggle(key)}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </AccountShell>
    </PageTransition>
  );
}
