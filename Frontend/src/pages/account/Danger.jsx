import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Loader2, ShieldAlert } from "lucide-react";
import AccountShell from "@/components/Layout/AccountShell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/Motion";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const inputClass =
  "h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:border-red-500 focus-visible:ring-red-500/20";

export default function Danger() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [invalidShake, setInvalidShake] = useState(0);

  const canDelete = confirmText === "DELETE";

  // Close modal on Escape
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  const handlePrimaryClick = () => {
    if (!canDelete) {
      // Trigger shake animation by bumping the key
      setInvalidShake((n) => n + 1);
      return;
    }
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    setSubmitting(true);
    try {
      await api.delete("/users/me", { data: { confirmText: "DELETE" } });
      toast.success("Account deleted");
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Could not delete account";
      toast.error(msg);
      setSubmitting(false);
      setShowModal(false);
    }
  };

  return (
    <PageTransition>
      <AccountShell>
        <div className="flex items-start gap-3 pb-4 border-b border-rose-200">
          <div className="grid place-items-center w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 text-rose-700 flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Delete my account
            </h2>
            <p
              id="danger-warning-copy"
              className="text-sm text-slate-400 mt-1 leading-relaxed"
            >
              Deleting your account will permanently remove your profile data.
              Your past bookings remain in our records for accounting/audit
              purposes but will no longer be linked to a usable account.
            </p>
          </div>
        </div>

        <motion.div
          key={invalidShake}
          animate={
            invalidShake
              ? { x: [-4, 4, -2, 2, 0] }
              : { x: 0 }
          }
          transition={{ duration: 0.32 }}
          className="rounded-xl border border-rose-200 bg-rose-500/5 p-4 mt-5 space-y-3"
        >
          <Label
            htmlFor="danger-confirm-input"
            className="text-slate-800 text-sm font-medium"
          >
            Type{" "}
            <span className="font-mono text-rose-700 px-1.5 py-0.5 rounded-md bg-rose-50 border border-rose-200">
              DELETE
            </span>{" "}
            to confirm
          </Label>
          <Input
            id="danger-confirm-input"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            autoComplete="off"
            className={inputClass}
          />
          <Button
            type="button"
            onClick={handlePrimaryClick}
            disabled={submitting}
            aria-describedby="danger-warning-copy"
            className="h-11 px-6 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting…
              </span>
            ) : (
              "Delete my account"
            )}
          </Button>
        </motion.div>

        {/* Second-step confirmation modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => !submitting && setShowModal(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="danger-modal-title"
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="relative w-full max-w-md rounded-2xl border border-rose-200 bg-white shadow-2xl p-6"
              >
                <div className="flex items-start gap-3">
                  <div className="grid place-items-center w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 text-rose-700 flex-shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2
                      id="danger-modal-title"
                      className="text-lg font-semibold text-slate-900"
                    >
                      Are you absolutely sure?
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                      This will permanently delete the account associated with{" "}
                      <span className="font-medium text-slate-900 break-all">
                        {user?.email || "your email"}
                      </span>
                      . This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                    className="h-10 px-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 text-sm font-medium transition-colors disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={submitting}
                    className="h-10 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-lg shadow-rose-900/30 transition-all disabled:opacity-60 inline-flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting…
                      </>
                    ) : (
                      "Yes, delete my account permanently"
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AccountShell>
    </PageTransition>
  );
}
