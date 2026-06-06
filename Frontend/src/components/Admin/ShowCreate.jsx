import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { PageTransition, Stagger, StaggerItem } from "@/components/ui/Motion";

const today = () => format(new Date(), "yyyy-MM-dd");

const initialForm = {
  movieId: "",
  cinemaId: "",
  screenId: "",
  date: today(),
  time: "",
  format: "2D",
  language: "",
  subtitles: "",
};

const FORMAT_OPTIONS = ["2D", "3D", "IMAX", "IMAX 3D", "4DX", "Dolby Atmos"];

const fieldClass =
  "w-full h-10 px-3 rounded-md bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20 transition-colors disabled:opacity-60";

const labelClass = "block mb-2 text-sm font-medium text-slate-800";

const ShowCreate = () => {
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loadingScreens, setLoadingScreens] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [moviesRes, cinemasRes] = await Promise.all([
          api.get("/movies?nowShowing=true"),
          api.get("/cinemas"),
        ]);
        if (cancelled) return;
        setMovies(moviesRes.data?.data ?? []);
        setCinemas(cinemasRes.data?.data ?? []);
      } catch (err) {
        toast.error("Failed to load movies or cinemas");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Whenever a cinema is selected, fetch its screens.
  useEffect(() => {
    if (!formData.cinemaId) {
      setScreens([]);
      return;
    }
    let cancelled = false;
    setLoadingScreens(true);
    (async () => {
      try {
        const res = await api.get(`/screens?cinemaId=${formData.cinemaId}`);
        if (cancelled) return;
        setScreens(res.data?.data ?? []);
      } catch (err) {
        if (!cancelled) toast.error("Failed to load screens");
      } finally {
        if (!cancelled) setLoadingScreens(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [formData.cinemaId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCinemaChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      cinemaId: e.target.value,
      screenId: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const {
      movieId,
      screenId,
      date,
      time,
      format: formatLabel,
      language,
      subtitles,
    } = formData;
    if (!movieId || !screenId || !date || !time) {
      toast.error("Please complete every field");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/shows", {
        movieId,
        screenId,
        date,
        time,
        format: formatLabel,
        language: language?.trim() || undefined,
        subtitles: subtitles?.trim() || undefined,
      });
      if (res.status === 201 || res.data?.statusCode === 201) {
        toast.success("Show created successfully");
        setFormData({ ...initialForm, date: today() });
      } else {
        toast.success("Show created");
        setFormData({ ...initialForm, date: today() });
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to create show";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto">
        <Link
          to="/admin/shows"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-4 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to shows
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Create New Show
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Schedule a movie on a screen at a specific date and time.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            <Stagger gap={0.06} className="space-y-5">
              <StaggerItem>
                <label htmlFor="show-movieId" className={labelClass}>
                  Movie
                </label>
                <select
                  id="show-movieId"
                  name="movieId"
                  value={formData.movieId}
                  onChange={handleInputChange}
                  className={fieldClass}
                  required
                >
                  <option value="">Select a movie</option>
                  {movies.map((movie) => (
                    <option key={movie._id} value={movie._id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </StaggerItem>

              <StaggerItem>
                <label htmlFor="show-cinemaId" className={labelClass}>
                  Cinema
                </label>
                <select
                  id="show-cinemaId"
                  name="cinemaId"
                  value={formData.cinemaId}
                  onChange={handleCinemaChange}
                  className={fieldClass}
                  required
                >
                  <option value="">Select a cinema</option>
                  {cinemas.map((cinema) => (
                    <option key={cinema._id} value={cinema._id}>
                      {cinema.name} — {cinema.city}
                    </option>
                  ))}
                </select>
              </StaggerItem>

              <StaggerItem>
                <label htmlFor="show-screenId" className={labelClass}>
                  Screen
                </label>
                <select
                  id="show-screenId"
                  name="screenId"
                  value={formData.screenId}
                  onChange={handleInputChange}
                  className={fieldClass}
                  required
                  disabled={!formData.cinemaId || loadingScreens}
                >
                  <option value="">
                    {!formData.cinemaId
                      ? "Pick a cinema first"
                      : loadingScreens
                      ? "Loading screens..."
                      : screens.length === 0
                      ? "No screens for this cinema"
                      : "Select a screen"}
                  </option>
                  {screens.map((screen) => (
                    <option key={screen._id} value={screen._id}>
                      {screen.name}
                      {screen.seatingPlanId?.name
                        ? ` (${screen.seatingPlanId.name})`
                        : ""}
                    </option>
                  ))}
                </select>
              </StaggerItem>

              <StaggerItem className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="show-date" className={labelClass}>
                    Date
                  </label>
                  <input
                    id="show-date"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={fieldClass}
                    required
                    min={today()}
                  />
                </div>
                <div>
                  <label htmlFor="show-time" className={labelClass}>
                    Time
                  </label>
                  <input
                    id="show-time"
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className={fieldClass}
                    required
                  />
                </div>
              </StaggerItem>

              <StaggerItem className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="show-format" className={labelClass}>
                    Format
                  </label>
                  <select
                    id="show-format"
                    name="format"
                    value={formData.format}
                    onChange={handleInputChange}
                    className={fieldClass}
                  >
                    {FORMAT_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="show-language" className={labelClass}>
                    Language
                  </label>
                  <input
                    id="show-language"
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    placeholder="Hindi"
                    className={fieldClass}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Override movie default for this show.
                  </p>
                </div>
                <div>
                  <label htmlFor="show-subtitles" className={labelClass}>
                    Subtitles
                  </label>
                  <input
                    id="show-subtitles"
                    type="text"
                    name="subtitles"
                    value={formData.subtitles}
                    onChange={handleInputChange}
                    placeholder="English"
                    className={fieldClass}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Leave blank if none.
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileTap={{ scale: 0.97 }}
                  className="w-full h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                  {isSubmitting ? "Creating..." : "Create Show"}
                </motion.button>
              </StaggerItem>
            </Stagger>
          </form>
        </div>
      </div>
    </PageTransition>
  );
};

export default ShowCreate;
