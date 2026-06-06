import PublicShell from "@/components/Layout/PublicShell";
import { MoviesShell } from "@/components/nowshowing/nowshowing";

function AllMovies() {
  return (
    <PublicShell>
      <MoviesShell
        title="All Movies"
        subtitle="Browse the full catalogue – playing now, upcoming, and beyond."
        nowShowing={false}
      />
    </PublicShell>
  );
}

export default AllMovies;
