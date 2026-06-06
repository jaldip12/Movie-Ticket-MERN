import { motion, AnimatePresence } from "framer-motion";
import { cardCls } from "@/lib/adminStyles";
import Pagination from "./Pagination";

/**
 * AdminTable — the standard admin list shell.
 *
 * Renders: card → loading skeleton | empty | <thead/tbody> + (optional) pagination.
 *
 * columns: [{ key, header, align?: 'left'|'right', className?, render(row) }]
 * rowKey: (row, index) => string
 * pagination: { page, pageCount, total, onChange, itemLabel } — optional
 * caption: optional screen-reader-only caption for the table
 */
export default function AdminTable({
  rows = [],
  columns = [],
  rowKey,
  loading = false,
  emptyIcon: EmptyIcon,
  emptyTitle = "Nothing to show",
  emptyDescription,
  pagination,
  className = "",
  rowClassName,
  caption,
}) {
  return (
    <div className={`${cardCls} ${className}`.trim()}>
      {loading ? (
        <div className="p-4" role="status" aria-live="polite">
          <span className="sr-only">Loading…</span>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 rounded-md bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div className="text-slate-500 text-center py-16 flex flex-col items-center gap-2">
          {EmptyIcon ? <EmptyIcon className="w-7 h-7" /> : null}
          <p className="text-sm text-slate-600">{emptyTitle}</p>
          {emptyDescription ? (
            <p className="text-xs text-slate-500">{emptyDescription}</p>
          ) : null}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              {caption ? (
                <caption className="sr-only">{caption}</caption>
              ) : null}
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      className={`px-4 py-3 font-medium ${
                        col.align === "right" ? "text-right" : "text-left"
                      } ${col.headerClassName || ""}`.trim()}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout" initial={false}>
                  {rows.map((row, i) => {
                    const key = rowKey
                      ? rowKey(row, i)
                      : row?._id ?? row?.id ?? i;
                    const extra =
                      typeof rowClassName === "function"
                        ? rowClassName(row, i)
                        : rowClassName || "";
                    return (
                      <motion.tr
                        key={key}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className={`border-t border-slate-200 hover:bg-slate-50 transition-colors ${extra}`.trim()}
                      >
                        {columns.map((col) => (
                          <td
                            key={col.key}
                            className={`px-4 py-3 ${
                              col.align === "right"
                                ? "text-right whitespace-nowrap"
                                : ""
                            } ${col.className || ""}`.trim()}
                          >
                            {col.render
                              ? col.render(row, i)
                              : row?.[col.key] ?? "—"}
                          </td>
                        ))}
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {pagination ? <Pagination {...pagination} /> : null}
        </>
      )}
    </div>
  );
}
