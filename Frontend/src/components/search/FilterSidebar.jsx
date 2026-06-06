import { useState } from "react";
import { ChevronDown, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const glassCard =
  "rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl";

const chipBase =
  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer select-none";
const chipActive = "bg-red-100 text-red-700 border border-red-200";
const chipIdle =
  "bg-white/5 border border-slate-200 text-slate-700 hover:bg-white/10";

function ChipGroup({ options, selected, onToggle, emptyHint }) {
  if (!options || options.length === 0) {
    return (
      <p className="text-xs text-slate-500 italic">
        {emptyHint || "No options available"}
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`${chipBase} ${isActive ? chipActive : chipIdle}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-200 last:border-b-0 py-4 first:pt-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-sm font-semibold text-slate-900 mb-3 hover:text-red-700 transition-colors"
      >
        <span>{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

/**
 * Body of the filters panel — used both inline (desktop sidebar) and inside
 * the mobile bottom sheet so the controls stay identical between viewports.
 */
function FiltersBody({
  languages,
  genres,
  certifications,
  selectedLanguages,
  selectedGenres,
  selectedCerts,
  nowShowingOnly,
  onToggleLanguage,
  onToggleGenre,
  onToggleCert,
  onToggleNowShowing,
  onClearAll,
  hasAny,
}) {
  return (
    <div className="px-4 md:px-5">
      <Section title="Languages">
        <ChipGroup
          options={languages}
          selected={selectedLanguages}
          onToggle={onToggleLanguage}
          emptyHint="No languages in results"
        />
      </Section>
      <Section title="Genres">
        <ChipGroup
          options={genres}
          selected={selectedGenres}
          onToggle={onToggleGenre}
          emptyHint="No genres in results"
        />
      </Section>
      <Section title="Certification">
        <ChipGroup
          options={certifications}
          selected={selectedCerts}
          onToggle={onToggleCert}
        />
      </Section>
      <Section title="Availability" defaultOpen={true}>
        <label className="flex items-center justify-between gap-3 cursor-pointer group">
          <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
            Now Showing only
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={nowShowingOnly}
            onClick={onToggleNowShowing}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              nowShowingOnly ? "bg-red-500" : "bg-white/10"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                nowShowingOnly ? "translate-x-[18px]" : "translate-x-1"
              }`}
            />
          </button>
        </label>
      </Section>

      <div className="pt-4">
        <button
          type="button"
          onClick={onClearAll}
          disabled={!hasAny}
          className="w-full h-9 rounded-xl text-sm font-medium border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}

/**
 * Filter sidebar for the search results page.
 *
 * Desktop: renders inline as a glass card.
 * Mobile: renders a "Filters" trigger button with a count badge that opens a
 * full-height bottom sheet. Sheet is unmounted (via AnimatePresence) when
 * closed so it never traps focus on the wrong viewport.
 */
export default function FilterSidebar({
  languages = [],
  genres = [],
  certifications = ["U", "UA", "A"],
  selectedLanguages = [],
  selectedGenres = [],
  selectedCerts = [],
  nowShowingOnly = false,
  onToggleLanguage,
  onToggleGenre,
  onToggleCert,
  onToggleNowShowing,
  onClearAll,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCount =
    selectedLanguages.length +
    selectedGenres.length +
    selectedCerts.length +
    (nowShowingOnly ? 1 : 0);
  const hasAny = activeCount > 0;

  const bodyProps = {
    languages,
    genres,
    certifications,
    selectedLanguages,
    selectedGenres,
    selectedCerts,
    nowShowingOnly,
    onToggleLanguage,
    onToggleGenre,
    onToggleCert,
    onToggleNowShowing,
    onClearAll,
    hasAny,
  };

  return (
    <>
      {/* Desktop sidebar — sticky next to the result grid. */}
      <aside className="hidden md:block w-full md:w-72 flex-shrink-0">
        <div className={`${glassCard} sticky top-20 py-5`}>
          <div className="flex items-center justify-between px-5 pb-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-700">
              Filters
            </h2>
            {hasAny && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
          </div>
          <div className="pt-4">
            <FiltersBody {...bodyProps} />
          </div>
        </div>
      </aside>

      {/* Mobile trigger — fixed-position bottom sheet keeps results scrollable
          underneath while filters are open. */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-colors text-sm font-medium"
        >
          <Filter className="w-4 h-4 text-red-600" />
          Filters
          {hasAny && (
            <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-red-700 bg-red-100 border border-red-200 rounded-full px-1">
              {activeCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-white border-t border-slate-200 rounded-t-3xl shadow-2xl shadow-slate-300"
              >
                <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white/95 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-900">
                      Filters
                    </h2>
                    {hasAny && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
                        {activeCount}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close filters"
                    className="grid place-items-center w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="py-4">
                  <FiltersBody {...bodyProps} />
                </div>
                <div className="sticky bottom-0 px-5 py-3 border-t border-slate-200 bg-white/95 backdrop-blur">
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-lg transition-all text-sm"
                  >
                    Show results
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
