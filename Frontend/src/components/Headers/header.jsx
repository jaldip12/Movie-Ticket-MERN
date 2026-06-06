import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  ChevronDown,
  Film,
  HelpCircle,
  LogOut,
  Map as MapIcon,
  MapPin,
  Menu,
  Search,
  Shield,
  Sparkles,
  Star,
  Ticket,
  User as UserIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCity } from "@/context/CityContext";
import { api } from "@/lib/api";

function formatYear(date) {
  if (!date) return "";
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "" : d.getFullYear();
}

function getInitials(user) {
  if (!user) return "U";
  const a = (user.firstname || "").charAt(0);
  const b = (user.lastname || "").charAt(0);
  return `${a}${b}`.toUpperCase() || "U";
}

/**
 * Self-contained search box. Used twice (desktop inline + mobile collapsible)
 * so its state, debouncing, and keyboard handling stay together.
 */
function MovieSearch({ variant = "desktop", autoFocus = false, onNavigate }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  // Debounced fetch
  useEffect(() => {
    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.length === 0) {
      setItems([]);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      try {
        const res = await api.get(
          `/movies/search?q=${encodeURIComponent(q)}&limit=8`,
          { signal: controller.signal }
        );
        const next = Array.isArray(res.data?.data?.items)
          ? res.data.data.items
          : [];
        setItems(next);
        setActiveIndex(next.length > 0 ? 0 : -1);
      } catch (err) {
        if (err?.name !== "CanceledError" && err?.name !== "AbortError") {
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Click-outside to close
  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const closeAndClear = () => {
    setOpen(false);
    setQuery("");
    setItems([]);
    setActiveIndex(-1);
  };

  const goToMovie = (movie) => {
    if (!movie?._id) return;
    closeAndClear();
    onNavigate?.();
    navigate(`/movies/${movie._id}`);
  };

  const goToSearchPage = () => {
    const q = query.trim();
    if (!q) return;
    closeAndClear();
    onNavigate?.();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === "Enter") {
      // Only follow a suggestion if the user explicitly arrowed onto it
      // (activeIndex > 0). Otherwise Enter sends them to the full search
      // results page — the conventional "search submit" behaviour.
      if (activeIndex > 0 && items[activeIndex]) {
        e.preventDefault();
        goToMovie(items[activeIndex]);
        return;
      }
      if (query.trim().length > 0) {
        e.preventDefault();
        goToSearchPage();
      }
      return;
    }
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + items.length) % items.length);
    }
  };

  const trimmed = query.trim();
  const showDropdown =
    open &&
    (loading ||
      items.length > 0 ||
      (trimmed.length >= 2 && !loading && items.length === 0));

  const wrapClass =
    variant === "desktop"
      ? "relative hidden md:block flex-1 max-w-[420px] min-w-0"
      : "relative w-full";

  return (
    <div ref={wrapRef} className={wrapClass}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search movies, genres, languages…"
          aria-label="Search movies"
          className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 rounded-xl pl-9 pr-9 h-10 text-sm outline-none transition-colors focus:bg-slate-100 focus:border-red-300"
        />
        {query && (
          <button
            type="button"
            onClick={closeAndClear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-6 h-6 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          role="listbox"
          className="absolute left-0 right-0 mt-2 z-50 bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-xl overflow-hidden"
        >
          {loading && (
            <div className="px-4 py-3 text-sm text-slate-400">Searching…</div>
          )}

          {!loading && items.length > 0 && (
            <ul className="max-h-[420px] overflow-y-auto py-1">
              {items.map((m, idx) => {
                const year = formatYear(m.releaseDate);
                const isActive = idx === activeIndex;
                return (
                  <li key={m._id} role="option" aria-selected={isActive}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => goToMovie(m)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                        isActive ? "bg-slate-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <img
                        src={m.poster}
                        alt={m.title}
                        loading="lazy"
                        className="w-8 h-12 rounded-md object-cover border border-slate-200 flex-shrink-0 bg-slate-50"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {m.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                          {year && <span>{year}</span>}
                          {m.certification && (
                            <>
                              {year && (
                                <span className="text-slate-600">•</span>
                              )}
                              <span className="px-1.5 py-px rounded-md border border-slate-200 bg-slate-50 text-slate-700 text-[10px] font-semibold uppercase tracking-wider">
                                {m.certification}
                              </span>
                            </>
                          )}
                          {m.rating != null && (
                            <span className="ml-auto inline-flex items-center gap-1 text-amber-700">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-600" />
                              {m.rating}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
              {trimmed.length > 0 && (
                <li className="border-t border-slate-200">
                  <button
                    type="button"
                    onClick={goToSearchPage}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2"
                  >
                    <Search className="w-3.5 h-3.5 text-red-600" />
                    See all results for "
                    <span className="text-slate-900 font-medium">{trimmed}</span>"
                  </button>
                </li>
              )}
            </ul>
          )}

          {!loading && trimmed.length >= 2 && items.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-slate-700">
                No results for "{trimmed}"
              </p>
              <button
                type="button"
                onClick={goToSearchPage}
                className="mt-2 text-xs text-red-600 hover:text-red-700 transition-colors"
              >
                Try broader search →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Avatar for the user menu — image if provided, gradient initials otherwise. */
function Avatar({ user, size = 36 }) {
  const dim = `${size}px`;
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={`${user.firstname || "User"} avatar`}
        className="rounded-full object-cover border border-slate-200"
        style={{ width: dim, height: dim }}
      />
    );
  }
  return (
    <span
      className="grid place-items-center rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-lg text-white font-semibold"
      style={{ width: dim, height: dim, fontSize: size * 0.4 }}
    >
      {getInitials(user)}
    </span>
  );
}

/** Hand-rolled user dropdown — avoids dragging a Radix portal here. */
function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const itemClass =
    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-800 hover:bg-slate-100 hover:text-slate-900 transition-colors";

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open user menu"
        aria-expanded={open}
        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-colors min-h-[40px]"
      >
        <Avatar user={user} size={32} />
        <span className="hidden lg:inline text-sm font-medium text-slate-800 max-w-[8rem] truncate">
          {user.firstname || "Account"}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 z-50 rounded-xl border border-slate-200 bg-white/95 backdrop-blur shadow-xl overflow-hidden"
          >
            <div className="px-3 py-3 border-b border-slate-200 flex items-center gap-3">
              <Avatar user={user} size={40} />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {[user.firstname, user.lastname].filter(Boolean).join(" ") ||
                    "User"}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {user.email || ""}
                </div>
              </div>
            </div>
            <div className="p-1.5">
              <Link
                to="/account/tickets"
                onClick={() => setOpen(false)}
                className={itemClass}
              >
                <Ticket className="w-4 h-4 text-red-600" />
                My Tickets
              </Link>
              <Link
                to="/account"
                onClick={() => setOpen(false)}
                className={itemClass}
              >
                <UserIcon className="w-4 h-4 text-red-600" />
                Profile
              </Link>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className={itemClass}
                >
                  <Shield className="w-4 h-4 text-red-600" />
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className={`${itemClass} w-full text-left text-rose-700 hover:text-rose-200 hover:bg-rose-50`}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Slide-in mobile drawer (right side). */
function MobileDrawer({ open, onClose, user, onLogout }) {
  const { city, openPicker } = useCity();
  // Close on ESC.
  useEffect(() => {
    if (!open) return undefined;
    const onEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const linkClass =
    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100 hover:text-slate-900 transition-colors";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white border-l border-slate-200 shadow-2xl shadow-slate-300 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 shadow-lg">
                  <Film className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-base font-semibold tracking-tight text-slate-900">
                  MovieVista
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="grid place-items-center w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {user && (
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 border border-slate-200">
                  <Avatar user={user} size={42} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {[user.firstname, user.lastname]
                        .filter(Boolean)
                        .join(" ") || "User"}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {user.email || ""}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  openPicker();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-colors"
              >
                <MapPin className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">{city}</span>
                <span className="ml-auto text-[11px] text-slate-400">
                  Change
                </span>
              </button>

              <div className="pt-1">
                <p className="px-4 pb-1 text-[10px] font-semibold tracking-widest uppercase text-slate-500">
                  Browse
                </p>
                <Link to="/movies" onClick={onClose} className={linkClass}>
                  <Sparkles className="w-4 h-4 text-red-600" />
                  Movies
                </Link>
                <Link
                  to="/coming-soon"
                  onClick={onClose}
                  className={linkClass}
                >
                  <MapIcon className="w-4 h-4 text-red-600" />
                  Coming Soon
                </Link>
                <Link to="/help" onClick={onClose} className={linkClass}>
                  <HelpCircle className="w-4 h-4 text-red-600" />
                  Help
                </Link>
              </div>

              {user ? (
                <div className="pt-1">
                  <p className="px-4 pb-1 text-[10px] font-semibold tracking-widest uppercase text-slate-500">
                    Account
                  </p>
                  <Link
                    to="/account/tickets"
                    onClick={onClose}
                    className={linkClass}
                  >
                    <Ticket className="w-4 h-4 text-red-600" />
                    My Tickets
                  </Link>
                  <Link
                    to="/account"
                    onClick={onClose}
                    className={linkClass}
                  >
                    <UserIcon className="w-4 h-4 text-red-600" />
                    Profile
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={onClose}
                      className={linkClass}
                    >
                      <Shield className="w-4 h-4 text-red-600" />
                      Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className={`${linkClass} w-full text-left text-rose-700 hover:text-rose-200 hover:bg-rose-50`}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-2">
                  <Link
                    to="/auth/login"
                    onClick={onClose}
                    className="block text-center w-full h-11 leading-[2.75rem] rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-lg transition-all text-sm"
                  >
                    Login / Sign up
                  </Link>
                </div>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Header() {
  const { user, logout } = useAuth();
  const { city, openPicker } = useCity();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close transient UI on route change.
  useEffect(() => {
    setMobileSearchOpen(false);
    setDrawerOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/", { replace: true });
  };

  const navLinkClass = (to) => {
    const active = location.pathname.startsWith(to);
    return `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? "text-slate-900 bg-slate-100"
        : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
    }`;
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto flex items-center px-4 h-16 gap-3">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group flex-shrink-0"
          >
            <div className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg transition-shadow group-hover:shadow-red-900/60">
              <Film
                className="w-[18px] h-[18px] text-white"
                strokeWidth={2.5}
              />
            </div>
            <span className="text-lg md:text-xl font-semibold tracking-tight text-slate-900">
              MovieVista
            </span>
          </Link>

          {/* City pin — desktop & mobile both render this, just different sizing */}
          <button
            type="button"
            onClick={openPicker}
            aria-label="Change city"
            className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 px-2.5 md:px-3 py-2 rounded-xl transition-colors min-h-[40px] flex-shrink-0"
          >
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium max-w-[6rem] md:max-w-[8rem] truncate">
              {city}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {/* Desktop search */}
          <MovieSearch variant="desktop" />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-auto">
            <Link to="/movies" className={navLinkClass("/movies")}>
              Movies
            </Link>
            <Link to="/coming-soon" className={navLinkClass("/coming-soon")}>
              Coming Soon
            </Link>
            <Link to="/help" className={navLinkClass("/help")}>
              Help
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 ml-auto lg:ml-2 flex-shrink-0">
            {/* Mobile search toggle */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen((v) => !v)}
              aria-label={mobileSearchOpen ? "Close search" : "Open search"}
              aria-expanded={mobileSearchOpen}
              className="md:hidden grid place-items-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-colors"
            >
              {mobileSearchOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>

            {/* Desktop user area */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <UserMenu user={user} onLogout={handleLogout} />
              ) : (
                <Link to="/auth/login">
                  <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all px-4 md:px-5 h-9 text-sm">
                    Login / Sign up
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile right-side cluster */}
            <div className="flex md:hidden items-center gap-2">
              {user ? (
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open menu"
                  className="grid place-items-center w-10 h-10 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                >
                  <Avatar user={user} size={28} />
                </button>
              ) : (
                <Link
                  to="/auth/login"
                  className="grid place-items-center h-10 px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-lg transition-all text-xs"
                >
                  Login
                </Link>
              )}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                className="grid place-items-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-colors"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile collapsible search bar */}
        {mobileSearchOpen && (
          <div className="md:hidden border-t border-slate-200 px-4 py-3 bg-white/95 backdrop-blur">
            <MovieSearch
              variant="mobile"
              autoFocus
              onNavigate={() => setMobileSearchOpen(false)}
            />
          </div>
        )}
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
    </>
  );
}
