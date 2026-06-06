import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Check, Eye, EyeOff, Loader2, Lock, X } from "lucide-react";
import AccountShell from "@/components/Layout/AccountShell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/Motion";
import { api } from "@/lib/api";

const inputClass =
  "h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:border-red-500 focus-visible:ring-red-500/20 pr-11";

const primaryBtn =
  "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed";

// Strength meter logic:
//   0–1 chars  → weak
//   2 of [lower, upper, digit, symbol] → medium
//   all 4 categories present → strong
function scorePassword(pwd) {
  if (!pwd || pwd.length <= 1) return { level: 0, label: "Too short" };

  const checks = [
    /[a-z]/.test(pwd),
    /[A-Z]/.test(pwd),
    /\d/.test(pwd),
    /[^A-Za-z0-9]/.test(pwd),
  ];
  const hit = checks.filter(Boolean).length;

  if (hit === 4) return { level: 3, label: "Strong" };
  if (hit >= 2) return { level: 2, label: "Medium" };
  return { level: 1, label: "Weak" };
}

function StrengthMeter({ password }) {
  const { level, label } = useMemo(() => scorePassword(password), [password]);
  const colors = ["bg-slate-200", "bg-rose-500", "bg-amber-500", "bg-emerald-500"];
  const labelColor =
    level === 0
      ? "text-slate-500"
      : level === 1
      ? "text-rose-600"
      : level === 2
      ? "text-amber-600"
      : "text-emerald-600";

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1.5">
        {[1, 2, 3].map((seg) => (
          <motion.div
            key={seg}
            className={`h-1.5 flex-1 rounded-full ${
              level >= seg ? colors[level] : "bg-slate-200"
            }`}
            initial={false}
            animate={{ scaleX: 1 }}
          />
        ))}
      </div>
      {password ? (
        <p className={`mt-1.5 text-xs font-medium ${labelColor}`}>{label}</p>
      ) : null}
    </div>
  );
}

function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  autoComplete,
  required,
}) {
  const [shown, setShown] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-slate-800 text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={shown ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          {shown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function Security() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const confirmShown = form.confirmPassword.length > 0;
  const passwordsMatch =
    confirmShown && form.newPassword === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.currentPassword) {
      setError("Enter your current password");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/users/me/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const msg = err.response?.data?.message || "Could not change password";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <AccountShell>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-start gap-3 pb-4 border-b border-slate-200">
            <div className="grid place-items-center w-10 h-10 rounded-xl bg-red-100 border border-red-200 text-red-700 flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
              <p className="text-sm text-slate-400 mt-1">
                Pick a strong password you don't use anywhere else.
              </p>
            </div>
          </div>

          {error && (
            <div className="text-rose-700 text-sm bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5">
              {error}
            </div>
          )}

          <PasswordField
            id="security-current-password"
            name="currentPassword"
            label="Current password"
            value={form.currentPassword}
            onChange={onChange}
            autoComplete="current-password"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <PasswordField
                id="security-new-password"
                name="newPassword"
                label="New password"
                value={form.newPassword}
                onChange={onChange}
                autoComplete="new-password"
                required
              />
              <StrengthMeter password={form.newPassword} />
            </div>
            <div>
              <PasswordField
                id="security-confirm-password"
                name="confirmPassword"
                label="Confirm new password"
                value={form.confirmPassword}
                onChange={onChange}
                autoComplete="new-password"
                required
              />
              {confirmShown && (
                <p
                  className={`mt-2 text-xs font-medium inline-flex items-center gap-1.5 ${
                    passwordsMatch ? "text-emerald-600" : "text-rose-600"
                  }`}
                  aria-live="polite"
                >
                  {passwordsMatch ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Passwords match
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5" />
                      Passwords do not match
                    </>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className={`h-11 px-6 ${primaryBtn}`}
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating…
                </span>
              ) : (
                "Update password"
              )}
            </Button>
          </div>
        </form>
      </AccountShell>
    </PageTransition>
  );
}
