import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useCity } from "@/context/CityContext";
import { springSnappy, stagger as staggerFactory } from "@/lib/motion";
import { StaggerItem } from "@/components/ui/Motion";

const FORMAT_FALLBACK = "2D";

/**
 * Build a 7-day date strip starting from today. Today is selected by default.
 */
function buildDateStrip() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return {
      key: `${yyyy}-${mm}-${dd}`,
      day: d
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase(),
      date: dd,
      month: d
        .toLocaleDateString("en-US", { month: "short" })
        .toUpperCase(),
      isToday: i === 0,
    };
  });
}

function formatShowTime(timeStr) {
  const [hours, minutes] = (timeStr || "0:0").split(":");
  const date = new Date();
  date.setHours(parseInt(hours, 10) || 0, parseInt(minutes, 10) || 0);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const FilterPill = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors ${
      active
        ? "bg-red-600 text-white border-red-500"
        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
    }`}
  >
    {children}
  </button>
);

export default function ShowtimesList({ movieId, onFormatsChange }) {
  const navigate = useNavigate();
  const { city, openPicker } = useCity();
  const dateStrip = useMemo(() => buildDateStrip(), []);
  const [selectedDate, setSelectedDate] = useState(dateStrip[0].key);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formatFilter, setFormatFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  // The most recently clicked show pill — drives the layoutId highlight so
  // the selection ring smoothly slides between buttons.
  const [activeShowId, setActiveShowId] = useState(null);

  // Fetch shows for movie + city + date
  useEffect(() => {
    let alive = true;
    if (!movieId) return undefined;
    const fetchShows = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        params.set("movieId", movieId);
        if (city) params.set("city", city);
        if (selectedDate) params.set("date", selectedDate);
        const res = await api.get(`/shows?${params.toString()}`);
        if (!alive) return;
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setShows(data);
      } catch (err) {
        if (!alive) return;
        setError("Failed to load showtimes. Please try again.");
        setShows([]);
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchShows();
    return () => {
      alive = false;
    };
  }, [movieId, city, selectedDate]);

  // Aggregate set of formats / languages across all loaded shows.
  // Bubble formats up so the Hero can show format chips.
  const { formats, languages } = useMemo(() => {
    const fSet = new Set();
    const lSet = new Set();
    shows.forEach((s) => {
      if (s.format) fSet.add(s.format);
      if (s.language) lSet.add(s.language);
    });
    return {
      formats: Array.from(fSet).sort(),
      languages: Array.from(lSet).sort(),
    };
  }, [shows]);

  useEffect(() => {
    if (typeof onFormatsChange === "function") {
      onFormatsChange(formats);
    }
  }, [formats, onFormatsChange]);

  // Group filtered shows by cinema, sorted alphabetically.
  const cinemaGroups = useMemo(() => {
    const filtered = shows.filter((s) => {
      if (formatFilter && s.format !== formatFilter) return false;
      if (languageFilter && s.language !== languageFilter) return false;
      return true;
    });

    const groups = new Map();
    filtered.forEach((show) => {
      const cinema = show?.screenId?.cinemaId;
      const id =
        cinema?._id?.$oid || cinema?._id || cinema?.name || "unknown";
      if (!groups.has(id)) {
        groups.set(id, {
          id,
          name: cinema?.name || "Theater",
          city: cinema?.city || "",
          address: cinema?.address || "",
          chain: cinema?.chain || "",
          shows: [],
        });
      }
      groups.get(id).shows.push(show);
    });

    // Sort each cinema's shows by time
    const arr = Array.from(groups.values()).map((g) => ({
      ...g,
      shows: [...g.shows].sort((a, b) =>
        String(a.time || "").localeCompare(String(b.time || ""))
      ),
    }));
    arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [shows, formatFilter, languageFilter]);

  const handleShowClick = (show) => {
    const id = show._id?.$oid || show._id;
    if (!id) return;
    setActiveShowId(id);
    navigate(`/show/${id}/seats`);
  };

  const selectedDateLabel = useMemo(() => {
    try {
      return new Date(selectedDate).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  return (
    <motion.section
      id="showtimes"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4 }}
      className="relative z-10 container mx-auto px-4 mt-8 md:mt-12 max-w-6xl"
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
          Showtimes in <span className="text-red-600">{city}</span>
        </h2>
        <button
          type="button"
          onClick={openPicker}
          className="inline-flex items-center gap-1.5 text-xs md:text-sm text-slate-700 hover:text-red-600 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          Change city
        </button>
      </div>

      {/* Date strip */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl mb-4 overflow-hidden">
        <div className="flex items-center gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-3 py-3">
          {dateStrip.map((d) => {
            const active = selectedDate === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setSelectedDate(d.key)}
                aria-pressed={active}
                aria-label={`${d.isToday ? "Today" : d.day} ${d.date} ${d.month}`}
                className={`flex flex-col items-center justify-center min-w-[60px] h-16 px-3 rounded-xl shrink-0 snap-start transition-colors min-h-[44px] ${
                  active
                    ? "bg-red-600 text-white shadow-lg"
                    : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                <span className="text-[10px] font-bold tracking-wider">
                  {d.isToday ? "TODAY" : d.day}
                </span>
                <span className="text-lg font-extrabold leading-none my-0.5">
                  {d.date}
                </span>
                <span className="text-[10px] font-medium">{d.month}</span>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        {(formats.length > 0 || languages.length > 0) && (
          <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-slate-200 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {formats.length > 0 && (
                <>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                    Format
                  </span>
                  <FilterPill
                    active={!formatFilter}
                    onClick={() => setFormatFilter("")}
                  >
                    All
                  </FilterPill>
                  {formats.map((f) => (
                    <FilterPill
                      key={f}
                      active={formatFilter === f}
                      onClick={() => setFormatFilter(f)}
                    >
                      {f}
                    </FilterPill>
                  ))}
                </>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {languages.length > 0 && (
                <>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                    Language
                  </span>
                  <FilterPill
                    active={!languageFilter}
                    onClick={() => setLanguageFilter("")}
                  >
                    All
                  </FilterPill>
                  {languages.map((l) => (
                    <FilterPill
                      key={l}
                      active={languageFilter === l}
                      onClick={() => setLanguageFilter(l)}
                    >
                      {l}
                    </FilterPill>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Loading — placeholder mirrors the real cinema-card shape so the
          layout doesn't jump when results land. */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white/60 p-4 md:p-5 animate-pulse"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="h-5 w-2/5 bg-slate-100 rounded mb-2" />
                  <div className="h-3 w-3/5 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div
                    key={j}
                    className="h-[60px] w-[110px] rounded-lg bg-slate-100 border border-slate-200"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cinema list */}
      {!loading && !error && (
        <motion.div
          variants={staggerFactory(0.06)}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {cinemaGroups.length > 0 ? (
            cinemaGroups.map((group) => {
              return (
                <StaggerItem key={group.id} className="block">
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={springSnappy}
                    className="rounded-xl border border-slate-200 bg-white/60 p-4 md:p-5"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base md:text-lg font-semibold tracking-tight text-slate-900">
                            {group.name}
                          </h3>
                          {group.chain && (
                            <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                              {group.chain}
                            </span>
                          )}
                        </div>
                        {(group.address || group.city) && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {group.address || group.city}
                          </p>
                        )}
                      </div>
                      {/* INFO button removed — it had no action wired up and
                          would have dead-ended on click. */}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {group.shows.map((show) => {
                        const showId = show._id?.$oid || show._id;
                        const isActive = activeShowId === showId;
                        return (
                          <button
                            key={showId}
                            onClick={() => handleShowClick(show)}
                            aria-pressed={isActive}
                            className="relative text-left rounded-lg px-3 py-2 border border-slate-200 bg-slate-50 hover:border-red-300 hover:bg-slate-100 text-slate-900 transition-colors min-w-[110px] min-h-[60px]"
                          >
                            {isActive && (
                              <motion.span
                                layoutId="active-showtime"
                                aria-hidden="true"
                                className="absolute inset-0 rounded-lg ring-2 ring-red-500 bg-red-50 pointer-events-none"
                                transition={{
                                  type: "spring",
                                  stiffness: 380,
                                  damping: 30,
                                }}
                              />
                            )}
                            <div className="relative font-bold text-base text-emerald-700">
                              {formatShowTime(show.time)}
                            </div>
                            <div className="relative flex flex-wrap gap-1 mt-1">
                              <span className="text-[9px] font-semibold tracking-wide px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                                {show.format || FORMAT_FALLBACK}
                              </span>
                              {show.language && (
                                <span className="text-[9px] font-semibold tracking-wide px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                  {show.language}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })
          ) : (
            <div className="text-center text-slate-400 py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50">
              No shows in {city} for {selectedDateLabel}
              <div className="text-xs text-slate-500 mt-1">
                — try another day or city.
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.section>
  );
}
