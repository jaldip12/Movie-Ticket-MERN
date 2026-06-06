import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Search, Film, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { inputCls, primaryBtn } from "@/lib/adminStyles";
import PageHeader from "@/components/Admin/PageHeader";
import AdminTable from "@/components/Admin/AdminTable";
import TogglePill from "@/components/Admin/TogglePill";
import StatusBadge from "@/components/Admin/StatusBadge";
import ConfirmDialog from "@/components/Admin/ConfirmDialog";
import { PageTransition } from "@/components/ui/Motion";

const PAGE_SIZE = 20;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2";

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  // Debounce the search term by 250ms
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(id);
  }, [search]);

  const loadMovies = async () => {
    setLoading(true);
    try {
      const res = await api.get("/movies");
      setMovies(res.data?.data ?? []);
    } catch (err) {
      toast.error("Failed to load movies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return movies;
    return movies.filter((m) =>
      [m.title, m.language, m.certification]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [movies, debouncedSearch]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const patchMovie = async (movie, body, successMessage) => {
    setBusyId(movie._id);
    try {
      await api.patch(`/movies/${movie._id}`, body);
      toast.success(successMessage);
      await loadMovies();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update movie");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleNowShowing = (movie) =>
    patchMovie(
      movie,
      { isNowShowing: !movie.isNowShowing },
      movie.isNowShowing ? "Removed from Now Showing" : "Marked as Now Showing"
    );

  const handleToggleFeatured = (movie) =>
    patchMovie(
      movie,
      { isFeatured: !movie.isFeatured },
      movie.isFeatured ? "Unfeatured" : "Featured"
    );

  const performDelete = async (movie) => {
    setBusyId(movie._id);
    try {
      await api.delete(`/movies/${movie._id}`);
      toast.success("Movie deleted");
      await loadMovies();
    } catch (err) {
      toast.error("Failed to delete movie");
    } finally {
      setBusyId(null);
      setConfirmTarget(null);
    }
  };

  const columns = [
    {
      key: "poster",
      header: "Poster",
      render: (m) =>
        m.poster ? (
          <img
            src={m.poster}
            alt={m.title}
            className="w-10 h-14 object-cover rounded ring-1 ring-slate-200"
          />
        ) : (
          <div className="w-10 h-14 bg-slate-50 rounded ring-1 ring-slate-200" />
        ),
    },
    {
      key: "title",
      header: "Title",
      render: (m) => (
        <span className="text-slate-900 font-medium">{m.title}</span>
      ),
    },
    {
      key: "cert",
      header: "Cert",
      render: (m) => (
        <span className="text-slate-700">{m.certification || "—"}</span>
      ),
    },
    {
      key: "language",
      header: "Language",
      render: (m) => (
        <span className="text-slate-700">{m.language || "—"}</span>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      render: (m) => (
        <span className="text-slate-700">
          {m.duration ? `${m.duration}m` : "—"}
        </span>
      ),
    },
    {
      key: "nowShowing",
      header: "Now Showing",
      render: (m) => (
        <TogglePill
          on={m.isNowShowing}
          busy={busyId === m._id}
          onClick={() => handleToggleNowShowing(m)}
          ariaLabel="Toggle now showing"
        />
      ),
    },
    {
      key: "featured",
      header: "Featured",
      render: (m) => (
        <TogglePill
          on={m.isFeatured}
          busy={busyId === m._id}
          onClick={() => handleToggleFeatured(m)}
          ariaLabel="Toggle featured"
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (m) => (
        <StatusBadge variant={m.isActive ? "active" : "inactive"} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (m) => (
        <button
          type="button"
          onClick={() => setConfirmTarget(m)}
          disabled={busyId === m._id || !m.isActive}
          className={`text-rose-600 hover:text-rose-700 text-sm font-medium disabled:opacity-40 transition-colors rounded ${focusRing}`}
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Movies"
          subtitle="Manage catalog, Now Showing flags and featured picks."
          action={
            <>
              <div className="relative">
                <label className="sr-only" htmlFor="movies-search">
                  Search movies
                </label>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="movies-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search movies..."
                  className={`${inputCls} pl-9 w-64 ${focusRing}`}
                />
              </div>
              <Link to="/admin/movies/new" className={`${primaryBtn} ${focusRing}`}>
                <Plus className="w-4 h-4" />
                Add Movie
              </Link>
            </>
          }
        />

        <AdminTable
          rows={paged}
          columns={columns}
          rowKey={(m) => m._id}
          loading={loading}
          emptyIcon={Film}
          emptyTitle={
            movies.length === 0
              ? "No movies yet."
              : "No movies match your search."
          }
          pagination={{
            page: currentPage,
            pageCount,
            total: filtered.length,
            itemLabel: "movies",
            onChange: setPage,
          }}
        />

        <ConfirmDialog
          open={Boolean(confirmTarget)}
          onClose={() => setConfirmTarget(null)}
          onConfirm={() => confirmTarget && performDelete(confirmTarget)}
          title="Delete this movie?"
          message={
            confirmTarget
              ? `Soft-delete movie "${confirmTarget.title}"? This can be undone by restoring it.`
              : ""
          }
          confirmLabel="Delete"
          danger
        />
      </div>
    </PageTransition>
  );
}
