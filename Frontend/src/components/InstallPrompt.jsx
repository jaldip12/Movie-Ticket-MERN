import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

const DISMISS_KEY = "mv_install_prompt_dismissed";

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  // iOS Safari uses navigator.standalone; everything else exposes the media query.
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  if (window.navigator?.standalone === true) return true;
  return false;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [path, setPath] = useState(() =>
    typeof window !== "undefined" ? window.location.pathname : "/"
  );
  const ios = isIOS();

  // Track route changes (works for both react-router pushes and back/forward).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const updatePath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", updatePath);
    // Patch history.pushState/replaceState to fire a 'locationchange' event we can listen for.
    const fire = () => window.dispatchEvent(new Event("locationchange"));
    const origPush = window.history.pushState;
    const origReplace = window.history.replaceState;
    window.history.pushState = function (...args) {
      const r = origPush.apply(this, args);
      fire();
      return r;
    };
    window.history.replaceState = function (...args) {
      const r = origReplace.apply(this, args);
      fire();
      return r;
    };
    window.addEventListener("locationchange", updatePath);
    return () => {
      window.removeEventListener("popstate", updatePath);
      window.removeEventListener("locationchange", updatePath);
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
    };
  }, []);

  // Listen for the install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  // iOS doesn't fire beforeinstallprompt — surface the manual hint once.
  useEffect(() => {
    if (!ios) return;
    if (isStandalone()) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* storage may be blocked — render anyway */
    }
    setVisible(true);
  }, [ios]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === "accepted") {
        setVisible(false);
      }
    } catch {
      // ignore — Chrome can throw if the prompt was already used
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  // Hide on admin pages
  if (path.startsWith("/admin")) return null;
  if (!visible) return null;
  if (isStandalone()) return null;

  // iOS-specific hint (no programmatic install available).
  if (ios && !deferredPrompt) {
    return (
      <div
        role="dialog"
        aria-label="Install MovieVista"
        className="fixed z-[60] bottom-4 right-4 left-4 sm:left-auto sm:max-w-sm bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl px-4 py-3 flex items-center gap-3"
      >
        <div className="grid place-items-center w-9 h-9 rounded-lg bg-red-100 border border-red-200 text-red-600 flex-shrink-0">
          <Share className="w-4 h-4" />
        </div>
        <p className="text-xs sm:text-sm text-slate-800 leading-snug flex-1">
          Tap <span className="font-semibold text-slate-900">Share</span> →{" "}
          <span className="font-semibold text-slate-900">Add to Home Screen</span>
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install hint"
          className="grid place-items-center w-7 h-7 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Standard beforeinstallprompt path (Chrome / Edge / Android)
  return (
    <div
      role="dialog"
      aria-label="Install MovieVista"
      className="fixed z-[60] bottom-4 right-4 left-4 sm:left-auto sm:max-w-sm bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl p-4 flex items-center gap-3"
    >
      <div className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-md text-white flex-shrink-0">
        <Download className="w-5 h-5" strokeWidth={2.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">Install MovieVista app</p>
        <p className="text-xs text-slate-400">Quicker access, full-screen.</p>
      </div>
      <button
        type="button"
        onClick={handleInstall}
        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md transition-all flex-shrink-0"
      >
        Install
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss install prompt"
        className="grid place-items-center w-7 h-7 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
