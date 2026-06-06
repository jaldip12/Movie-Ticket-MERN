import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import ReviewSection from "@/components/reviews/ReviewSection";
import MovieHero from "@/components/movie/MovieHero";
import ShowtimesList from "@/components/movie/ShowtimesList";
import RelatedMovies from "@/components/movie/RelatedMovies";
import StickyBookBar from "@/components/movie/StickyBookBar";

function MovieDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[40vh] md:h-[55vh] overflow-hidden">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>
      <div className="container mx-auto px-4 -mt-24 md:-mt-40 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          <Skeleton className="w-40 md:w-64 aspect-[2/3] rounded-2xl shrink-0" />
          <div className="flex-1 space-y-4 pt-4 md:pt-24">
            <Skeleton className="h-10 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-12 w-40 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Synopsis with a "Read more" expand-toggle and a soft fade after ~4 lines
 * when collapsed.
 */
function Synopsis({ description }) {
  const [expanded, setExpanded] = useState(false);
  if (!description) return null;
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4 }}
      className="relative z-10 container mx-auto px-4 mt-6 md:mt-10 max-w-4xl"
    >
      <h2 className="text-lg md:text-xl font-semibold tracking-tight text-slate-900 mb-3">
        Synopsis
      </h2>
      <div className="relative">
        <p
          className={`text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-line ${
            expanded ? "" : "line-clamp-4"
          }`}
        >
          {description}
        </p>
        {!expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-50 to-transparent" />
        )}
      </div>
      {description.length > 240 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </motion.section>
  );
}

function AboutMovie({ movie }) {
  const hasCast = Array.isArray(movie.cast) && movie.cast.length > 0;
  const hasDirector = !!movie.director;
  const hasGenres = Array.isArray(movie.genres) && movie.genres.length > 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4 }}
      className="relative z-10 container mx-auto px-4 mt-8 md:mt-12 max-w-6xl"
    >
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900 mb-4">
        About this movie
      </h2>

      {!hasCast && !hasDirector ? (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm p-5 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">
                Cast
              </h3>
              <p className="text-slate-700 text-sm">
                Cast & crew coming soon.
              </p>
            </div>
            <div>
              <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">
                Director
              </h3>
              <p className="text-slate-700 text-sm">
                Director info coming soon.
              </p>
            </div>
            <div>
              <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">
                Tags
              </h3>
              {hasGenres ? (
                <div className="flex flex-wrap gap-1.5">
                  {movie.genres.map((g) => (
                    <span
                      key={g}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-700 text-sm">—</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm p-5 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">
              Cast
            </h3>
            <p className="text-slate-700 text-sm">
              {hasCast ? movie.cast.join(", ") : "—"}
            </p>
          </div>
          <div>
            <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">
              Director
            </h3>
            <p className="text-slate-700 text-sm">
              {hasDirector ? movie.director : "—"}
            </p>
          </div>
          <div>
            <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">
              Tags
            </h3>
            {hasGenres ? (
              <div className="flex flex-wrap gap-1.5">
                {movie.genres.map((g) => (
                  <span
                    key={g}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {g}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-700 text-sm">—</p>
            )}
          </div>
        </div>
      )}
    </motion.section>
  );
}

export default function MovieDetailsPage() {
  const navigate = useNavigate();
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formats, setFormats] = useState([]);

  useEffect(() => {
    let alive = true;
    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/movies/${movieId}`);
        if (!alive) return;
        if (res.data?.statusCode === 200 && res.data?.data) {
          const m = res.data.data;
          const movieData = {
            id: m?._id || movieId,
            title: m?.title || "Unknown Title",
            poster: m?.poster || "",
            duration: m?.duration ?? null,
            certification: m?.certification || "N/A",
            genres: Array.isArray(m?.genres) ? m.genres : [],
            releaseDate: m?.releaseDate || null,
            languages: Array.isArray(m?.languages) ? m.languages : [],
            language: m?.language || "",
            description: m?.description || "No description available",
            trailerUrl: m?.trailerUrl || "",
            rating: m?.rating ?? null,
            votes: m?.votes ?? 0,
            cast: Array.isArray(m?.cast) ? m.cast : [],
            director: m?.director || "",
          };
          setMovie(movieData);
          document.title = `${movieData.title} - MovieVista`;
        } else {
          throw new Error("Movie not found");
        }
      } catch (err) {
        if (alive) {
          setError(
            err.response?.data?.message || "Failed to load movie details."
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    if (movieId) fetchMovie();
    return () => {
      alive = false;
    };
  }, [movieId]);

  const scrollToShowtimes = useCallback(() => {
    document
      .getElementById("showtimes")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleFormatsChange = useCallback((next) => {
    setFormats(next);
  }, []);

  if (loading) return <MovieDetailsSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-900 gap-4 px-4 text-center">
        <div className="text-xl">{error}</div>
        <Button
          onClick={() => navigate(-1)}
          className="h-11 bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 rounded-xl transition-colors"
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Go Back
        </Button>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-900 gap-4 px-4 text-center">
        <div className="text-xl">Movie not found</div>
        <Button
          onClick={() => navigate("/movies")}
          className="h-11 bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 rounded-xl transition-colors"
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Browse Movies
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white pb-32 md:pb-0 overflow-hidden">
      {/* Decorative red glows */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-40 -left-32 h-[500px] w-[500px] rounded-full bg-red-600/15 blur-3xl" />
        <div className="absolute top-1/4 -right-40 h-[500px] w-[500px] rounded-full bg-rose-700/10 blur-3xl" />
      </div>

      <MovieHero
        movie={movie}
        formats={formats}
        onBookClick={scrollToShowtimes}
      />

      <Synopsis description={movie.description} />

      <ShowtimesList
        movieId={movie.id}
        onFormatsChange={handleFormatsChange}
      />

      <AboutMovie movie={movie} />

      <div className="relative z-10">
        <ReviewSection movieId={movie.id} />
      </div>

      <RelatedMovies currentMovieId={movie.id} genres={movie.genres} />

      <StickyBookBar onClick={scrollToShowtimes} />
    </div>
  );
}
