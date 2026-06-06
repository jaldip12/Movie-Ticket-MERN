import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Film } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageTransition, Stagger, StaggerItem } from "@/components/ui/Motion";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [tab, setTab] = useState("email"); // "email" | "phone"

  // Email tab state
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [errorKey, setErrorKey] = useState(0); // bump to retrigger shake
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  // Phone tab state
  const [phoneStep, setPhoneStep] = useState("phone"); // "phone" | "otp"
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneErrorKey, setPhoneErrorKey] = useState(0);
  const [phoneSubmitting, setPhoneSubmitting] = useState(false);

  // Forgot password placeholder modal
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleInputChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const navigateAfterLogin = (user) => {
    const from = location.state?.from;
    const fallback = user.role === "admin" ? "/admin" : "/";
    navigate(from || fallback, { replace: true });
  };

  const triggerError = (msg) => {
    setError(msg);
    setErrorKey((k) => k + 1);
  };

  const triggerPhoneError = (msg) => {
    setPhoneError(msg);
    setPhoneErrorKey((k) => k + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await api.post("/users/login", formData);
      const user = res.data?.data;
      if (!user) throw new Error("Login failed");

      login(user);
      navigateAfterLogin(user);
    } catch (err) {
      triggerError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const switchTab = (next) => {
    if (next === tab) return;
    setTab(next);
    setError("");
    setPhoneError("");
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setPhoneError("");
    if (!/^\d{10}$/.test(phone.trim())) {
      triggerPhoneError("Enter a 10-digit phone number");
      return;
    }
    setPhoneSubmitting(true);
    try {
      await api.post("/users/otp/request", { phone: phone.trim() });
      setPhoneStep("otp");
      setOtp("");
    } catch (err) {
      triggerPhoneError(
        err.response?.data?.message || "Could not send OTP. Please try again."
      );
    } finally {
      setPhoneSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setPhoneError("");
    if (!/^\d{6}$/.test(otp.trim())) {
      triggerPhoneError("Enter the 6-digit OTP");
      return;
    }
    setPhoneSubmitting(true);
    try {
      const res = await api.post("/users/otp/verify", {
        phone: phone.trim(),
        otp: otp.trim(),
      });
      const user = res.data?.data;
      if (!user) throw new Error("Login failed");

      login(user);
      navigateAfterLogin(user);
    } catch (err) {
      triggerPhoneError(
        err.response?.data?.message || "Verification failed. Please try again."
      );
    } finally {
      setPhoneSubmitting(false);
    }
  };

  const editPhone = () => {
    setPhoneStep("phone");
    setOtp("");
    setPhoneError("");
  };

  const handlePasswordKeyEvent = (e) => {
    if (typeof e.getModifierState === "function") {
      setCapsOn(e.getModifierState("CapsLock"));
    }
  };

  const handleForgotClick = () => {
    // Prefer route if it exists; otherwise show placeholder modal.
    // Using modal here to avoid hard-coding non-existent routes.
    setForgotOpen(true);
  };

  // Esc closes the forgot-password modal
  useEffect(() => {
    if (!forgotOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setForgotOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [forgotOpen]);

  return (
    <PageTransition>
      <div className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden px-4">
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
          className="relative z-10 w-full max-w-md"
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
              Welcome back. Sign in to continue.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl p-7 md:p-8">
            {/* Tab switcher — animated layoutId pill */}
            <div
              role="tablist"
              aria-label="Login method"
              className="relative mb-6 grid grid-cols-2 gap-1.5 p-1 rounded-xl border border-slate-200 bg-slate-50"
            >
              {["email", "phone"].map((value) => {
                const active = tab === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => switchTab(value)}
                    className={`relative h-9 rounded-lg text-sm font-medium transition-colors ${focusRing} ${
                      active ? "text-white" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="login-tab-pill"
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-600 to-red-700 shadow-md"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 capitalize">
                      {value === "email" ? "Email" : "Phone"}
                    </span>
                  </button>
                );
              })}
            </div>

            {tab === "email" && (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div
                  aria-live="polite"
                  role="alert"
                  className="min-h-0"
                >
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
                  <StaggerItem className="space-y-2">
                    <Label
                      htmlFor="login-email"
                      className="text-slate-800 text-sm font-medium"
                    >
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="username"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:border-red-500 focus-visible:ring-red-500/20"
                    />
                  </StaggerItem>

                  <StaggerItem className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="login-password"
                        className="text-slate-800 text-sm font-medium"
                      >
                        Password
                      </Label>
                      <button
                        type="button"
                        onClick={handleForgotClick}
                        className={`text-xs text-slate-500 hover:text-red-600 transition-colors rounded ${focusRing}`}
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        onKeyDown={handlePasswordKeyEvent}
                        onKeyUp={handlePasswordKeyEvent}
                        required
                        className="h-11 pr-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:border-red-500 focus-visible:ring-red-500/20"
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
                    <AnimatePresence>
                      {capsOn && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.18 }}
                          className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-medium"
                          role="status"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Caps Lock is on
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </StaggerItem>

                  <StaggerItem>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className={`w-full h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed ${focusRing}`}
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2 justify-center">
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
                          Signing in…
                        </span>
                      ) : (
                        "Sign in"
                      )}
                    </Button>
                  </StaggerItem>
                </Stagger>
              </form>
            )}

            {tab === "phone" && (
              <div className="space-y-5">
                <div aria-live="polite" role="alert" className="min-h-0">
                  <AnimatePresence mode="wait" initial={false}>
                    {phoneError && (
                      <motion.div
                        key={phoneErrorKey}
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
                        {phoneError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {phoneStep === "phone" && (
                  <form onSubmit={handleSendOtp} className="space-y-5" noValidate>
                    <Stagger gap={0.05} className="space-y-5">
                      <StaggerItem className="space-y-2">
                        <Label
                          htmlFor="login-phone"
                          className="text-slate-800 text-sm font-medium"
                        >
                          Phone
                        </Label>
                        <Input
                          id="login-phone"
                          name="phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          placeholder="10-digit phone"
                          value={phone}
                          onChange={(e) =>
                            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                          }
                          required
                          className="h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:border-red-500 focus-visible:ring-red-500/20"
                        />
                      </StaggerItem>

                      <StaggerItem>
                        <Button
                          type="submit"
                          disabled={phoneSubmitting}
                          className={`w-full h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed ${focusRing}`}
                        >
                          {phoneSubmitting ? (
                            <span className="flex items-center gap-2 justify-center">
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
                              Sending…
                            </span>
                          ) : (
                            "Send OTP"
                          )}
                        </Button>
                      </StaggerItem>
                    </Stagger>
                  </form>
                )}

                {phoneStep === "otp" && (
                  <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
                    <Stagger gap={0.05} className="space-y-5">
                      <StaggerItem className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="login-otp"
                            className="text-slate-800 text-sm font-medium"
                          >
                            OTP for {phone}
                          </Label>
                          <button
                            type="button"
                            onClick={editPhone}
                            className={`text-xs text-slate-500 hover:text-red-600 transition-colors rounded ${focusRing}`}
                          >
                            Edit phone
                          </button>
                        </div>
                        <Input
                          id="login-otp"
                          name="otp"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          placeholder="6-digit OTP"
                          value={otp}
                          onChange={(e) =>
                            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                          }
                          required
                          className="h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:border-red-500 focus-visible:ring-red-500/20 tracking-widest font-mono"
                        />
                      </StaggerItem>

                      <StaggerItem>
                        <Button
                          type="submit"
                          disabled={phoneSubmitting}
                          className={`w-full h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed ${focusRing}`}
                        >
                          {phoneSubmitting ? (
                            <span className="flex items-center gap-2 justify-center">
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
                              Verifying…
                            </span>
                          ) : (
                            "Verify & Sign in"
                          )}
                        </Button>
                      </StaggerItem>
                    </Stagger>
                  </form>
                )}
              </div>
            )}

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
              to="/auth/signup"
              className={`block text-center w-full h-11 leading-[2.75rem] rounded-xl border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 hover:border-slate-300 font-medium transition-colors ${focusRing}`}
            >
              Create an account
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            By continuing, you agree to our Terms & Privacy Policy.
          </p>
        </motion.div>

        {/* Forgot password placeholder modal */}
        <AnimatePresence>
          {forgotOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="forgot-title"
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setForgotOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl p-6"
              >
                <h2
                  id="forgot-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Forgot password
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Coming soon — password reset is on the way. In the meantime,
                  please contact support if you can't sign in.
                </p>
                <div className="mt-5 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    className={`h-9 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium rounded-lg ${focusRing}`}
                  >
                    Got it
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
