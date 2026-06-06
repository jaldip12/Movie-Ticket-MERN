import { cn } from "@/lib/utils";

/**
 * Base shimmer block. Pass `className` to size and shape it.
 *
 * Theme: subtle white-on-dark wash on the navy admin background.
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-slate-100", className)}
      {...props}
    />
  );
}

/**
 * Single MovieCard placeholder. Mirrors the dimensions of the real card so
 * the layout doesn't reflow when data lands.
 *
 * Real card: rounded-xl, 2:3 poster, padded body w/ title, badge row, CTA pill.
 */
export function MovieCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/60 shadow-lg shadow-slate-200">
      <Skeleton className="aspect-[2/3] w-full rounded-none" />
      <div className="space-y-3 p-4 md:p-5">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />
        {/* Badge row */}
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        {/* CTA */}
        <Skeleton className="mt-2 h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

/**
 * Grid of MovieCardSkeleton items. Mirrors the responsive grid used by
 * NowShowing / AllMovies (2 / 3 / 4 columns).
 */
export function MovieGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Hero placeholder for the landing page carousel.
 */
export function HeroSkeleton() {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/60 md:aspect-[21/9]">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="absolute inset-0 flex flex-col justify-end gap-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 md:p-10">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-2/3 md:h-14" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-10 w-32 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Layout-shaped placeholder used on the booking / seating screens.
 */
export function SeatingLayoutSkeleton() {
  return (
    <div className="space-y-8 p-6">
      {Array.from({ length: 2 }).map((_, s) => (
        <div key={s} className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, r) => (
              <div key={r} className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex flex-1 gap-2">
                  {Array.from({ length: 10 }).map((_, c) => (
                    <Skeleton key={c} className="h-9 w-9 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <Skeleton className="mx-auto h-10 w-3/4 rounded-b-3xl" />
    </div>
  );
}
