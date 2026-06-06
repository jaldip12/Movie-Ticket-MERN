import { motion, LayoutGroup } from "framer-motion";
import { Calendar, ChevronDown, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const WHEN_OPTIONS = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "weekend", label: "This Weekend" },
];

function WhenChip({ value, active, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      layout
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={`relative inline-flex items-center gap-1.5 px-3.5 md:px-4 h-10 rounded-full text-sm font-medium whitespace-nowrap border ${
        active
          ? "border-red-300 text-white shadow-md"
          : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-colors"
      }`}
      aria-pressed={active}
    >
      {/* Morphing active background — flies between chips via shared layoutId */}
      {active && (
        <motion.span
          layoutId="quick-when-active"
          className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 to-red-700"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          aria-hidden="true"
        />
      )}
      <span className="relative inline-flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
        {value.label}
      </span>
    </motion.button>
  );
}

function FilterChip({ label, value, options, onChange, allLabel = "All" }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          type="button"
          layout
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="inline-flex items-center gap-2 h-10 px-3.5 md:px-4 rounded-full bg-slate-50 border border-slate-200 text-sm text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-colors whitespace-nowrap"
        >
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            {label}
          </span>
          <span className="font-medium text-slate-900">{value || allLabel}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-white/95 backdrop-blur border border-slate-200 text-slate-800 min-w-[10rem] max-h-72 overflow-y-auto rounded-xl shadow-xl"
        align="start"
      >
        <DropdownMenuLabel className="text-slate-400 text-[10px] uppercase tracking-wider font-medium">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-200" />
        <DropdownMenuItem
          onSelect={() => onChange("")}
          className={`cursor-pointer focus:bg-slate-100 rounded-md ${
            !value ? "text-red-600 font-semibold" : "text-slate-800"
          }`}
        >
          {allLabel}
        </DropdownMenuItem>
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt}
            onSelect={() => onChange(opt)}
            className={`cursor-pointer focus:bg-slate-100 rounded-md ${
              value === opt ? "text-red-600 font-semibold" : "text-slate-800"
            }`}
          >
            {opt}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Quick filter row: when (today/tomorrow/weekend) + language dropdown.
 * Format dropdown is omitted for v1 since format lives on Show, not Movie,
 * and we don't have a backend endpoint that filters movies by show-format.
 *
 * onChange emits `{ when, language }`. Parent owns the state.
 */
export function QuickDiscoveryBar({
  when,
  language,
  languageOptions = [],
  onChange,
}) {
  const update = (patch) => onChange({ when, language, ...patch });

  return (
    <section className="container mx-auto px-4 pt-5 md:pt-7">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl shadow-slate-200 p-3 md:p-4">
        <LayoutGroup>
          <div className="flex items-start md:items-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1">
            <div className="hidden md:inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-400 font-semibold pl-1 pr-2 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
              Quick pick
            </div>

            {WHEN_OPTIONS.map((opt) => (
              <WhenChip
                key={opt.id}
                value={opt}
                active={when === opt.id}
                onClick={() => update({ when: when === opt.id ? "" : opt.id })}
              />
            ))}

            <div className="w-px h-6 bg-slate-200 mx-1 shrink-0" aria-hidden />

            <FilterChip
              label="Language"
              value={language}
              options={languageOptions}
              onChange={(val) => update({ language: val })}
            />

            {(when || language) && (
              <button
                type="button"
                onClick={() => onChange({ when: "", language: "" })}
                className="ml-auto text-xs font-medium text-slate-400 hover:text-red-700 transition-colors whitespace-nowrap pr-1"
              >
                Clear
              </button>
            )}
          </div>
        </LayoutGroup>
      </div>
    </section>
  );
}

export default QuickDiscoveryBar;
