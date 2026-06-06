import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Film } from "lucide-react";
import { api } from "@/lib/api";
import { MovieCard } from "@/components/nowshowing/nowshowing";
import { MovieGridSkeleton } from "@/components/ui/Skeleton";
import { useCity } from "@/context/CityContext";
import { FadeUp, Stagger, StaggerItem } from "@/components/ui/Motion";

/**
 * NowShowingRail
 * --------------
 * Fetches `/movies?nowShowing=true` and (best-effort) attaches the city as a
 * query param. Filters by language client-side. The `when` filter is shown in
 * the parent QuickDiscoveryBar but is a no-op here for v1 — needs backend
 * support to filter movies by date.
 *
 * Re-fetches whenever the selected city changes.
 */
export function NowShowingRail({ language = "", when = "" }) {
  const { city } = useCity();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("nowShowing", "true");
        if (city) params.set("city", city);
        const res = await api.get(`/movies?${params.toString()}`);
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        if (alive) setMovies(list);
      } catch (err) {
        if (alive) setMovies([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [city]);

  const filtered = useMemo(() => {
    if (!language) return movies;
    const target = language.toLowerCase();
    return movies.filter((m) => {
      if (Array.isArray(m.languages)) {
        return m.languages.some((l) => (l || "").toLowerCase() === target);
      }
      return (m.language || "").toLowerCase() === target;
    });
  }, [movies, language]);

  // Cap the home grid; "View all →" routes users to /movies for the full list.
  const visible = filtered.slice(0, 8);

  return (
    <section className="container mx-auto px-4 py-10 md:py-14">
      <FadeUp className="mb-5 md:mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="text-red-600 text-xs font-semibold tracking-widest uppercase mb-2 inline-flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5" />
            In cinemas now
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Now showing in{" "}
            <span className="text-red-600">{city || "your city"}</span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {when
              ? `Filtered for ${when === "weekend" ? "this weekend" : when}.`
              : "Pick a movie, pick a seat, you're set."}
          </p>
        </div>

        <Link
          to="/movies"
          className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 hover:text-red-700 transition-colors whitespace-nowrap"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </FadeUp>

      {loading ? (
        <MovieGridSkeleton count={8} />
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm p-10 text-center">
          <Film className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-700 font-medium">
            No movies match these filters in {city}.
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Try clearing filters or switching cities.
          </p>
        </div>
      ) : (
        <Stagger
          asScroll
          gap={0.05}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
        >
          {visible.map((movie, idx) => (
            <StaggerItem key={movie._id || idx}>
              <MovieCard movie={movie} index={idx} />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <div className="mt-6 md:hidden flex justify-center">
        <Link
          to="/movies"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 hover:text-red-700 transition-colors"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

export default NowShowingRail;
