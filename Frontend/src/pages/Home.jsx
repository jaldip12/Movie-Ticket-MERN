import { useEffect, useMemo, useState } from "react";
import PublicShell from "@/components/Layout/PublicShell";
import { Landingpage } from "@/components/landingPage/landingpage";
import { Trending } from "@/components/landingPage/Trending";
import { QuickDiscoveryBar } from "@/components/home/QuickDiscoveryBar";
import { NowShowingRail } from "@/components/home/NowShowingRail";
import { ComingSoonRail } from "@/components/home/ComingSoonRail";
import { CinemasNearYouRail } from "@/components/home/CinemasNearYouRail";
import { TopRatedGrid } from "@/components/home/TopRatedGrid";
import { TrustStrip } from "@/components/home/TrustStrip";
import { PageTransition, ScrollReveal } from "@/components/ui/Motion";
import { useCity } from "@/context/CityContext";
import { api } from "@/lib/api";

const COMMON_LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam"];

/**
 * Home
 * ----
 * Top-down: Hero -> QuickDiscovery -> Trending -> NowShowing -> ComingSoon ->
 * Cinemas -> TopRated -> TrustStrip.
 *
 * Quick filters are owned here so the discovery bar and the now-showing rail
 * stay in sync. Language options come from the live now-showing list (so we
 * never show a filter that has no movies behind it).
 */
function Home() {
  const { city } = useCity();
  const [filters, setFilters] = useState({ when: "", language: "" });
  const [languageOptions, setLanguageOptions] = useState(COMMON_LANGUAGES);

  // Pull language options from the now-showing list for this city. This keeps
  // the language dropdown honest — only languages that actually have movies
  // playing show up.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const params = new URLSearchParams();
        params.set("nowShowing", "true");
        if (city) params.set("city", city);
        const res = await api.get(`/movies?${params.toString()}`);
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        const set = new Set(COMMON_LANGUAGES);
        list.forEach((m) => {
          if (Array.isArray(m.languages)) m.languages.forEach((l) => l && set.add(l));
          if (m.language) set.add(m.language);
        });
        if (alive) setLanguageOptions(Array.from(set).filter(Boolean).sort());
      } catch {
        // keep defaults on failure
      }
    })();
    return () => {
      alive = false;
    };
  }, [city]);

  const handleFiltersChange = (next) =>
    setFilters((prev) => ({ ...prev, ...next }));

  const decorativeGlows = useMemo(
    () => (
      <div className="pointer-events-none fixed inset-0 -z-0" aria-hidden="true">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-red-600/10 blur-3xl" />
        <div className="absolute top-[40%] -right-40 h-[500px] w-[500px] rounded-full bg-rose-700/10 blur-3xl" />
      </div>
    ),
    []
  );

  return (
    <PublicShell>
      <PageTransition>
        <div className="relative bg-white overflow-hidden">
          {decorativeGlows}

          <div className="relative z-10">
            {/* Full-bleed hero (animates on mount via its own choreography) */}
            <Landingpage />

            {/* Quick discovery filters */}
            <ScrollReveal>
              <QuickDiscoveryBar
                when={filters.when}
                language={filters.language}
                languageOptions={languageOptions}
                onChange={handleFiltersChange}
              />
            </ScrollReveal>

            {/* Trending — keep using the existing component */}
            <ScrollReveal>
              <Trending />
            </ScrollReveal>

            {/* Now showing in [city], filtered by quick chips */}
            <ScrollReveal>
              <NowShowingRail
                language={filters.language}
                when={filters.when}
              />
            </ScrollReveal>

            {/* Coming soon */}
            <ScrollReveal>
              <ComingSoonRail />
            </ScrollReveal>

            {/* Cinemas in [city] */}
            <ScrollReveal>
              <CinemasNearYouRail />
            </ScrollReveal>

            {/* Top rated */}
            <ScrollReveal>
              <TopRatedGrid count={4} />
            </ScrollReveal>

            {/* Trust strip */}
            <ScrollReveal>
              <TrustStrip />
            </ScrollReveal>
          </div>
        </div>
      </PageTransition>
    </PublicShell>
  );
}

export default Home;
