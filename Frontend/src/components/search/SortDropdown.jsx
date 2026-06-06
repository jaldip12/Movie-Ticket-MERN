import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const SORT_OPTIONS = [
  { id: "relevance", label: "Relevance" },
  { id: "topRated", label: "Top rated" },
  { id: "recent", label: "Recent" },
  { id: "az", label: "A-Z" },
];

/**
 * Sort dropdown for the search results page. Mirrors the admin filter
 * dropdown style so the page reads as part of the same visual system.
 */
export default function SortDropdown({ value = "relevance", onChange }) {
  const current =
    SORT_OPTIONS.find((o) => o.id === value) || SORT_OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-colors text-sm font-medium min-w-[140px] justify-between"
        >
          <span className="inline-flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-red-600" />
            <span className="text-slate-400 text-xs hidden sm:inline">
              Sort:
            </span>
            <span>{current.label}</span>
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-white/95 backdrop-blur border-slate-200 text-slate-800 min-w-[180px]"
      >
        <DropdownMenuLabel className="text-[10px] font-semibold tracking-widest uppercase text-slate-500">
          Sort by
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100" />
        {SORT_OPTIONS.map((opt) => {
          const isActive = opt.id === value;
          return (
            <DropdownMenuItem
              key={opt.id}
              onSelect={() => onChange?.(opt.id)}
              className={`text-sm cursor-pointer focus:bg-slate-100 focus:text-slate-900 ${
                isActive ? "text-red-700" : "text-slate-800"
              }`}
            >
              <span className="flex-1">{opt.label}</span>
              {isActive && <Check className="w-3.5 h-3.5 text-red-600" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
