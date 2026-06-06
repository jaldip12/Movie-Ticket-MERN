const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

function buildPageList(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = Array.from(pages)
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
      out.push("ellipsis-" + i);
    }
  }
  return out;
}

export default function Pagination({
  page,
  pageCount,
  total,
  onChange,
  itemLabel = "items",
  disabled = false,
}) {
  const safePageCount = Math.max(1, pageCount || 1);
  const safePage = Math.min(Math.max(1, page || 1), safePageCount);
  const pages = buildPageList(safePage, safePageCount);
  const atFirst = safePage <= 1;
  const atLast = safePage >= safePageCount;

  const navBtn =
    "px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-40 disabled:hover:bg-slate-50 disabled:cursor-not-allowed transition-colors";

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-sm text-slate-600"
    >
      <span>
        Page {safePage} of {safePageCount}
        {typeof total === "number" ? ` · ${total} ${itemLabel}` : ""}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={disabled || atFirst}
          onClick={() => onChange?.(Math.max(1, safePage - 1))}
          className={`${navBtn} ${FOCUS_RING}`}
        >
          Prev
        </button>

        <ul className="hidden sm:flex items-center gap-1">
          {pages.map((p) =>
            typeof p === "string" ? (
              <li
                key={p}
                aria-hidden="true"
                className="px-2 text-slate-400 select-none"
              >
                …
              </li>
            ) : (
              <li key={p}>
                <button
                  type="button"
                  aria-label={`Go to page ${p}`}
                  aria-current={p === safePage ? "page" : undefined}
                  disabled={disabled || p === safePage}
                  onClick={() => onChange?.(p)}
                  className={`min-w-[2rem] px-2.5 py-1.5 rounded-lg border text-sm font-medium transition-colors ${FOCUS_RING} ${
                    p === safePage
                      ? "bg-red-50 border-red-200 text-red-600 cursor-default"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  {p}
                </button>
              </li>
            )
          )}
        </ul>

        <button
          type="button"
          aria-label="Next page"
          disabled={disabled || atLast}
          onClick={() => onChange?.(Math.min(safePageCount, safePage + 1))}
          className={`${navBtn} ${FOCUS_RING}`}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
