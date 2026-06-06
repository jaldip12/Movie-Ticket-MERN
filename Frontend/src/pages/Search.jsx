import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Search as SearchIcon, TrendingUp, X } from "lucide-react";
import PublicShell from "@/components/Layout/PublicShell";
import { MovieCard } from "@/components/nowshowing/nowshowing";
import { MovieGridSkeleton } from "@/components/ui/Skeleton";
import FilterSidebar from "@/components/search/FilterSidebar";
import SortDropdown from "@/components/search/SortDropdown";
import {
  PageTransition,
  Stagger,
  StaggerItem,
} from "@/components/ui/Motion";
import { api } from "@/lib/api";

// NOTE: removed duplicate `shadow-` (only `shadow-xl` belongs here).
const glassCard =
  "rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl";

const TRENDING_SEARCHES = [
  "Inception",
  "Kalki",
  "Pathaan",
  "RRR",
  "Oppenheimer",
];

const RECENT_KEY = "recentSearches";
const RECENT_MAX = 8;

/* ------------------------------ helpers ------------------------------ */

function readRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function writeRecent(list) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX)));
  } catch {
    /* ignore quota / private mode */
  }
}

function pushRecent(query) {
  const q = (query || "").trim();
  if (q.length < 2) return readRecent();
  const lower = q.toLowerCase();
  const existing = readRecent().filter((s) => s.toLowerCase() !== lower);
  const next = [q, ...existing].slice(0, RECENT_MAX);
  writeRecent(next);
  return next;
}

function uniqSorted(arr) {
  return Array.from(new Set(arr.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );
}

/**
 * Pull every value out of either `field` (string | array) or a plural
 * version of it (e.g. `language` or `languages`). Movies in this codebase
 * use both shapes depending on origin, so the search page has to be
 * tolerant of either.
 */
function collectMulti(movie, singular, plural) {
  const out = [];
  const single = movie?.[singular];
  const many = movie?.[plural];
  if (typeof single === "string" && single.trim()) out.push(single.trim());
  if (Array.isArray(single)) out.push(...single.filter(Boolean));
  if (Array.isArray(many)) out.push(...many.filter(Boolean));
  return out;
}

/* --------------------------- recent searches --------------------------- */

function ChipRow({ items, onPick, onRemove, accent = "red" }) {
  if (!items || items.length === 0) return null;
  const accentClass =
    accent === "amber"
      ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
      : "bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200 hover:border-slate-300";
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((q) => (
        <span
          key={q}
          className={`group inline-flex items-center gap-1.5 pl-3 ${
            onRemove ? "pr-1" : "pr-3"
          } py-1.5 rounded-full text-sm border ${accentClass} transition-colors cursor-pointer`}
          onClick={() => onPick(q)}
        >
          {q}
          {onRemove && (
            <button
              type="button"
              aria-label={`Remove ${q} from recent searches`}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(q);
              }}
              className="grid place-items-center w-5 h-5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------ page ------------------------------ */

export default function Search() {
  const [params, setParams] = useSearchParams();
  const urlQuery = (params.get("q") || "").trim();

  // Local input state. Drives the debounced URL sync.
  const [input, setInput] = useState(urlQuery);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters (client-side).
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedCerts, setSelectedCerts] = useState([]);
  const [nowShowingOnly, setNowShowingOnly] = useState(false);
  const [sort, setSort] = useState("relevance");

  const [recent, setRecent] = useState(() => readRecent());

  // Keep input in sync if user navigates with a different ?q= (e.g. via
  // the header search). Local edits stay authoritative otherwise.
  useEffect(() => {
    setInput(urlQuery);
  }, [urlQuery]);

  // Debounce typed input → URL. setSearchParams keeps the user on the page
  // (no full nav) so the focused input is never blurred mid-typing.
  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = input.trim();
    if (trimmed === urlQuery) return undefined;
    debounceRef.current = setTimeout(() => {
      const next = new URLSearchParams(params);
      if (trimmed) next.set("q", trimmed);
      else next.delete("q");
      setParams(next, { replace: true });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  // Fetch results when the URL query changes.
  useEffect(() => {
    if (!urlQuery) {
      setItems([]);
      setError(null);
      setLoading(false);
      return undefined;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await api.get(
          `/movies/search?q=${encodeURIComponent(urlQuery)}&limit=24`
        );
        if (!alive) return;
        const next = Array.isArray(res.data?.data?.items)
          ? res.data.data.items
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
        setItems(next);
        // Promote successful queries into the recent list.
        setRecent(pushRecent(urlQuery));
      } catch (err) {
        if (!alive) return;
        setError(
          err?.response?.data?.message || "Search failed. Please try again."
        );
        setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [urlQuery]);

  /* ---------- derived filter option lists from current results ---------- */
  const { languageOptions, genreOptions } = useMemo(() => {
    const langs = [];
    const gens = [];
    items.forEach((m) => {
      langs.push(...collectMulti(m, "language", "languages"));
      gens.push(...collectMulti(m, "genre", "genres"));
    });
    return {
      languageOptions: uniqSorted(langs),
      genreOptions: uniqSorted(gens),
    };
  }, [items]);

  /* ---------------------- apply filters + sort ---------------------- */
  const visibleItems = useMemo(() => {
    let out = items;

    if (selectedLanguages.length) {
      out = out.filter((m) => {
        const langs = collectMulti(m, "language", "languages");
        return langs.some((l) => selectedLanguages.includes(l));
      });
    }
    if (selectedGenres.length) {
      out = out.filter((m) => {
        const gens = collectMulti(m, "genre", "genres");
        return gens.some((g) => selectedGenres.includes(g));
      });
    }
    if (selectedCerts.length) {
      out = out.filter((m) =>
        m?.certification ? selectedCerts.includes(m.certification) : false
      );
    }
    if (nowShowingOnly) {
      out = out.filter((m) => {
        if (typeof m?.nowShowing === "boolean") return m.nowShowing;
        if (typeof m?.isNowShowing === "boolean") return m.isNowShowing;
        if (typeof m?.status === "string") {
          return m.status.toLowerCase().includes("now");
        }
        // Fallback: a movie that has already released is treated as showing.
        if (m?.releaseDate) {
          return new Date(m.releaseDate).getTime() <= Date.now();
        }
        return false;
      });
    }

    switch (sort) {
      case "topRated":
        out = [...out].sort(
          (a, b) => (Number(b?.rating) || 0) - (Number(a?.rating) || 0)
        );
        break;
      case "recent":
        out = [...out].sort(
          (a, b) =>
            new Date(b?.createdAt || 0).getTime() -
            new Date(a?.createdAt || 0).getTime()
        );
        break;
      case "az":
        out = [...out].sort((a, b) =>
          (a?.title || "").localeCompare(b?.title || "")
        );
        break;
      case "relevance":
      default:
        // Backend order = relevance — leave untouched.
        break;
    }

    return out;
  }, [
    items,
    selectedLanguages,
    selectedGenres,
    selectedCerts,
    nowShowingOnly,
    sort,
  ]);

  /* ------------------------- toggle helpers ------------------------- */
  const toggleIn = (setter) => (val) =>
    setter((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  const clearAllFilters = () => {
    setSelectedLanguages([]);
    setSelectedGenres([]);
    setSelectedCerts([]);
    setNowShowingOnly(false);
  };

  const filteredOutByFilters =
    items.length > 0 && visibleItems.length === 0;

  const submitSearch = (q) => {
    const trimmed = (q || "").trim();
    if (!trimmed) return;
    setInput(trimmed);
    const next = new URLSearchParams(params);
    next.set("q", trimmed);
    setParams(next, { replace: false });
  };

  const removeRecent = (q) => {
    const next = readRecent().filter(
      (s) => s.toLowerCase() !== q.toLowerCase()
    );
    writeRecent(next);
    setRecent(next);
  };

  /* ------------------------------ render ------------------------------ */
  return (
    <PublicShell>
      <PageTransition className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-0 overflow-hidden"
        >
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-red-600/10 blur-3xl" />
          <div className="absolute top-1/2 -right-40 h-[500px] w-[500px] rounded-full bg-rose-700/10 blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 md:py-10 max-w-7xl">
          {/* ---------- Big search input ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mb-6"
          >
            <p className="text-red-600 text-xs font-semibold tracking-widest uppercase mb-2">
              Search
            </p>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900">
              {urlQuery ? (
                <>
                  Results for{" "}
                  <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                    &ldquo;{urlQuery}&rdquo;
                  </span>
                </>
              ) : (
                "Find your next movie"
              )}
            </h1>
          </motion.div>

          <div className={`${glassCard} p-3 md:p-4 mb-8`}>
            <form
              role="search"
              aria-label="Movie search"
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch(input);
              }}
              className="relative"
            >
              <SearchIcon
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search movies, genres, languages…"
                aria-label="Search movies"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 rounded-xl pl-12 pr-12 h-12 md:h-14 text-base md:text-lg outline-none transition-colors focus:bg-slate-100 focus:border-red-300"
              />
              {input && (
                <button
                  type="button"
                  onClick={() => setInput("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-8 h-8 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          {/* ---------- No-query state: trending + recent ---------- */}
          {!urlQuery && (
            <div className="space-y-6">
              {recent.length > 0 && (
                <section className={`${glassCard} p-5 md:p-6`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-red-600" />
                    <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-700">
                      Recent searches
                    </h2>
                  </div>
                  <ChipRow
                    items={recent}
                    onPick={submitSearch}
                    onRemove={removeRecent}
                  />
                </section>
              )}

              <section className={`${glassCard} p-5 md:p-6`}>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-700">
                    Trending
                  </h2>
                </div>
                <ChipRow
                  items={TRENDING_SEARCHES}
                  onPick={submitSearch}
                  accent="amber"
                />
              </section>

              <div
                className={`${glassCard} p-10 md:p-14 flex flex-col items-center text-center`}
              >
                <div className="grid place-items-center w-14 h-14 rounded-2xl bg-red-100 border border-red-200 mb-4">
                  <SearchIcon className="h-7 w-7 text-red-600" />
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  Start typing to find a movie.
                </p>
                <p className="text-sm text-slate-400 mt-2 max-w-sm">
                  Search by title, language, genre, or certification.
                </p>
              </div>
            </div>
          )}

          {/* ---------- Results layout ---------- */}
          {urlQuery && (
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              <FilterSidebar
                languages={languageOptions}
                genres={genreOptions}
                selectedLanguages={selectedLanguages}
                selectedGenres={selectedGenres}
                selectedCerts={selectedCerts}
                nowShowingOnly={nowShowingOnly}
                onToggleLanguage={toggleIn(setSelectedLanguages)}
                onToggleGenre={toggleIn(setSelectedGenres)}
                onToggleCert={toggleIn(setSelectedCerts)}
                onToggleNowShowing={() => setNowShowingOnly((v) => !v)}
                onClearAll={clearAllFilters}
              />

              <div className="flex-1 min-w-0">
                {/* Result toolbar — count + sort. */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="text-sm text-slate-400">
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <motion.span
                          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="inline-flex"
                        >
                          <SearchIcon className="w-3.5 h-3.5 text-red-600" />
                        </motion.span>
                        Searching…
                      </span>
                    ) : (
                      <>
                        <span className="text-slate-900 font-semibold">
                          {visibleItems.length}
                        </span>{" "}
                        {visibleItems.length === 1 ? "result" : "results"} for{" "}
                        <span className="text-slate-900">&ldquo;{urlQuery}&rdquo;</span>
                      </>
                    )}
                  </p>
                  <SortDropdown value={sort} onChange={setSort} />
                </div>

                {/* States — animate the swap between them. */}
                <AnimatePresence mode="wait">
                  {loading && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MovieGridSkeleton count={8} />
                    </motion.div>
                  )}

                  {!loading && error && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                      role="alert"
                      className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700"
                    >
                      <p>{error}</p>
                      <button
                        type="button"
                        onClick={() => submitSearch(urlQuery)}
                        className="mt-3 text-xs text-rose-700 underline-offset-2 hover:underline"
                      >
                        Retry
                      </button>
                    </motion.div>
                  )}

                  {!loading && !error && items.length === 0 && (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                      className={`${glassCard} p-10 md:p-14 flex flex-col items-center text-center`}
                    >
                      <p className="text-lg font-semibold text-slate-900">
                        No results for &ldquo;{urlQuery}&rdquo;
                      </p>
                      <p className="text-sm text-slate-400 mt-2 max-w-sm">
                        Try a different title, genre, or language.
                      </p>
                      {TRENDING_SEARCHES.length > 0 && (
                        <div className="mt-5">
                          <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
                            Did you mean…
                          </p>
                          <ChipRow
                            items={TRENDING_SEARCHES.slice(0, 4)}
                            onPick={submitSearch}
                            accent="amber"
                          />
                        </div>
                      )}
                    </motion.div>
                  )}

                  {!loading && !error && items.length > 0 && filteredOutByFilters && (
                    <motion.div
                      key="filtered-empty"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                      className={`${glassCard} p-10 md:p-14 flex flex-col items-center text-center`}
                    >
                      <p className="text-lg font-semibold text-slate-900">
                        No results match your filters
                      </p>
                      <p className="text-sm text-slate-400 mt-2 max-w-sm">
                        Try clearing filters or a different query.
                      </p>
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="mt-5 inline-flex items-center justify-center h-10 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-lg transition-all text-sm"
                      >
                        Clear all filters
                      </button>
                    </motion.div>
                  )}

                  {!loading && !error && visibleItems.length > 0 && (
                    <Stagger
                      key="results"
                      asScroll
                      gap={0.05}
                      className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    >
                      {visibleItems.map((m, idx) => {
                        const handleEngage = () => {
                          // Promote query into recent searches whenever the
                          // user actually engages with a result.
                          setRecent(pushRecent(urlQuery));
                        };
                        return (
                          <StaggerItem
                            key={m._id || idx}
                            role="button"
                            tabIndex={0}
                            onClick={handleEngage}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleEngage();
                              }
                            }}
                          >
                            <MovieCard movie={m} index={idx} />
                          </StaggerItem>
                        );
                      })}
                    </Stagger>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </PublicShell>
  );
}
