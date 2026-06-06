import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Check, Eye, EyeOff, Film } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageTransition, Stagger, StaggerItem } from "@/components/ui/Motion";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const initialForm = {
  firstname: "",
  lastname: "",
  email: "",
  password: "",
  number: "",
  gender: "",
  city: "",
};

const inputClass =
  "h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:border-red-500 focus-visible:ring-red-500/20";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

function scorePassword(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score += 1;
  if (pw.length >= 10) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  // Map 0..5 -> 0 (none), 1-2 (weak), 3 (medium), 4-5 (strong)
  if (score <= 2) return 1;
  if (score === 3) return 2;
  return 3;
}

const strengthMeta = {
  0: { label: "", color: "bg-slate-200", text: "text-slate-400" },
  1: { label: "Weak", color: "bg-rose-500", text: "text-rose-600" },
  2: { label: "Medium", color: "bg-amber-500", text: "text-amber-600" },
  3: { label: "Strong", color: "bg-emerald-500", text: "text-emerald-600" },
};

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [errorKey, setErrorKey] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const strength = useMemo(() => scorePassword(form.password), [form.password]);
  const strengthInfo = strengthMeta[strength];

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onPhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({ ...prev, number: digits }));
  };

  const triggerError = (msg) => {
    setError(msg);
    setErrorKey((k) => k + 1);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const required = [
      "firstname",
      "lastname",
      "email",
      "password",
      "number",
      "gender",
      "city",
    ];
    const missing = required.filter((k) => !form[k]?.trim?.());
    if (missing.length) {
      triggerError("Please fill all the fields");
      return;
    }
    if (form.password.length < 6) {
      triggerError("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/users/register", form);
      const newUser = res.data?.data;
      login(newUser);
      toast.success("Welcome to MovieVista!");
      setSuccess(true);
      // Briefly show success state before navigating
      setTimeout(() => navigate("/", { replace: true }), 700);
    } catch (err) {
      triggerError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
      setSubmitting(false);
    }
  };


  return (
    <PageTransition>
      <div className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden px-4 py-12">
        {/* Decorative background — soft red glows + subtle grid */}
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-red-600/15 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-rose-700/15 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full max-w-lg"
        >
          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className={`flex items-center gap-2.5 rounded-md ${focusRing}`}>
              <div className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg">
                <Film className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-semibold tracking-tight text-slate-900">
                MovieVista
              </span>
            </Link>
            <p className="mt-4 text-sm text-slate-400">
              Create your account to start booking.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl p-7 md:p-8">
            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              <div aria-live="polite" role="alert" className="min-h-0">
                <AnimatePresence mode="wait" initial={false}>
                  {error && (
                    <motion.div
                      key={errorKey}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        x: [-6, 6, -4, 4, 0],
                        transition: {
                          opacity: { duration: 0.18 },
                          y: { duration: 0.18 },
                          x: { duration: 0.4, ease: "easeOut" },
                        },
                      }}
                      exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
                      className="text-rose-700 text-sm bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Stagger gap={0.05} className="space-y-5">
                <StaggerItem className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-firstname"
                      className="text-slate-800 text-sm font-medium"
                    >
                      First name
                    </Label>
                    <Input
                      id="signup-firstname"
                      name="firstname"
                      autoComplete="given-name"
                      value={form.firstname}
                      onChange={onChange}
                      placeholder="Jane"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-lastname"
                      className="text-slate-800 text-sm font-medium"
                    >
                      Last name
                    </Label>
                    <Input
                      id="signup-lastname"
                      name="lastname"
                      autoComplete="family-name"
                      value={form.lastname}
                      onChange={onChange}
                      placeholder="Doe"
                      className={inputClass}
                    />
                  </div>
                </StaggerItem>

                <StaggerItem className="space-y-2">
                  <Label
                    htmlFor="signup-email"
                    className="text-slate-800 text-sm font-medium"
                  >
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </StaggerItem>

                <StaggerItem className="space-y-2">
                  <Label
                    htmlFor="signup-password"
                    className="text-slate-800 text-sm font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={onChange}
                      placeholder="••••••••"
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className={`absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-800 rounded-r-md ${focusRing}`}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Password strength meter */}
                  <div className="flex items-center gap-2 pt-1">
                    <div
                      className="flex-1 grid grid-cols-3 gap-1"
                      role="meter"
                      aria-label="Password strength"
                      aria-valuemin={0}
                      aria-valuemax={3}
                      aria-valuenow={strength}
                    >
                      {[1, 2, 3].map((seg) => {
                        const filled = strength >= seg;
                        const segColor = filled ? strengthInfo.color : "bg-slate-200";
                        return (
                          <motion.span
                            key={seg}
                            initial={false}
                            animate={{ opacity: filled ? 1 : 0.6 }}
                            transition={{ duration: 0.2 }}
                            className={`h-1.5 rounded-full transition-colors ${segColor}`}
                          />
                        );
                      })}
                    </div>
                    <span
                      className={`text-xs font-medium min-w-[3.5rem] text-right ${strengthInfo.text}`}
                    >
                      {strengthInfo.label || "—"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">At least 6 characters.</p>
                </StaggerItem>

                <StaggerItem className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-number"
                      className="text-slate-800 text-sm font-medium"
                    >
                      Phone
                    </Label>
                    <Input
                      id="signup-number"
                      name="number"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      value={form.number}
                      onChange={onPhoneChange}
                      placeholder="9876543210"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-gender"
                      className="text-slate-800 text-sm font-medium"
                    >
                      Gender
                    </Label>
                    <select
                      id="signup-gender"
                      name="gender"
                      value={form.gender}
                      onChange={onChange}
                      className={`w-full h-11 rounded-md bg-slate-50 border border-slate-200 text-slate-900 px-3 text-sm focus-visible:border-red-500 ${focusRing}`}
                    >
                      <option value="" className="bg-white">
                        Select
                      </option>
                      <option value="male" className="bg-white">
                        Male
                      </option>
                      <option value="female" className="bg-white">
                        Female
                      </option>
                      <option value="other" className="bg-white">
                        Other
                      </option>
                    </select>
                  </div>
                </StaggerItem>

                <StaggerItem className="space-y-2">
                  <Label
                    htmlFor="signup-city"
                    className="text-slate-800 text-sm font-medium"
                  >
                    City
                  </Label>
                  <Input
                    id="signup-city"
                    name="city"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={onChange}
                    placeholder="Ahmedabad"
                    className={inputClass}
                  />
                </StaggerItem>

                <StaggerItem>
                  <Button
                    type="submit"
                    disabled={submitting || success}
                    className={`w-full h-11 text-white font-semibold rounded-xl shadow-lg transition-all disabled:cursor-not-allowed ${focusRing} ${
                      success
                        ? "bg-emerald-600 hover:bg-emerald-600"
                        : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-60"
                    }`}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {success ? (
                        <motion.span
                          key="success"
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="flex items-center gap-2 justify-center"
                        >
                          <Check className="w-4 h-4" strokeWidth={3} />
                          Account created
                        </motion.span>
                      ) : submitting ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-2 justify-center"
                        >
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Creating account…
                        </motion.span>
                      ) : (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          Create account
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </StaggerItem>
              </Stagger>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs uppercase tracking-wider text-slate-500">
                  or
                </span>
              </div>
            </div>

            <Link
              to="/auth/login"
              className={`block text-center w-full h-11 leading-[2.75rem] rounded-xl border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 hover:border-slate-300 font-medium transition-colors ${focusRing}`}
            >
              I already have an account
            </Link>
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">
            By continuing, you agree to our Terms & Privacy Policy.
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}
