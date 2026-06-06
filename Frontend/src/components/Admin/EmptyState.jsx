/**
 * EmptyState — consistent empty/no-data display for admin lists.
 *
 * Usage:
 *   <EmptyState
 *     icon={Film}
 *     title="No movies yet"
 *     description="Add your first movie to start scheduling shows."
 *     action={<Link to="/admin/movies/new" className={primaryBtn}>Add Movie</Link>}
 *   />
 */
export default function EmptyState({
  icon: Icon,
  title = "Nothing to show",
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={`text-center py-14 px-6 flex flex-col items-center gap-3 ${className}`.trim()}
    >
      {Icon ? (
        <div className="grid place-items-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
      ) : null}
      <p className="text-sm font-medium text-slate-800">{title}</p>
      {description ? (
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
