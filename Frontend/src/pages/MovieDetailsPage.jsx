import { useEffect } from "react";
import MovieDetails from "../components/nowshowing/MovieDetails";
import PublicShell from "../components/Layout/PublicShell";
import { PageTransition } from "@/components/ui/Motion";

function MovieDetailsPage() {
  // Land users at the top of the page whenever a movie detail mounts —
  // otherwise we inherit the previous route's scroll position.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PublicShell>
      <PageTransition>
        <MovieDetails />
      </PageTransition>
    </PublicShell>
  );
}

export default MovieDetailsPage;
