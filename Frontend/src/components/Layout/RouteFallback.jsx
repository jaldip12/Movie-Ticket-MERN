/**
 * Full-screen suspense fallback for lazy-loaded routes. Reserves the same
 * viewport block the route would occupy, so there's no layout shift between
 * fallback and the resolved page. Pure CSS spinner — keeps the fallback chunk
 * itself featherweight (no framer-motion, no lucide).
 */
export default function RouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-slate-900"
    >
      <div className="relative flex items-center justify-center mb-6">
        <span
          aria-hidden="true"
          className="block w-14 h-14 rounded-full border-[3px] border-slate-200 border-t-red-500 animate-spin"
        />
      </div>
      <p className="text-base md:text-lg font-bold tracking-tight">
        <span className="text-slate-900">Movie</span>
        <span className="text-red-500">Vista</span>
      </p>
      <p className="mt-1.5 text-xs text-slate-500 tracking-wider uppercase">
        Loading
      </p>
      <span className="sr-only">Loading page…</span>
    </div>
  );
}
