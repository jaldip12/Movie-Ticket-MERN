import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { CalendarClock, ArrowUp, ArrowDown } from "lucide-react";
import { api } from "@/lib/api";
import { inputCls, primaryBtn } from "@/lib/adminStyles";
import { formatDate } from "@/lib/format";
import PageHeader from "@/components/Admin/PageHeader";
import AdminTable from "@/components/Admin/AdminTable";
import TogglePill from "@/components/Admin/TogglePill";
import ConfirmDialog from "@/components/Admin/ConfirmDialog";
import { PageTransition } from "@/components/ui/Motion";

const PAGE_SIZE = 10;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2";

export default function AdminShows() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movieFilter, setMovieFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [timeSort, setTimeSort] = useState(null); // null | "asc" | "desc"
  const [page, setPage] = useState(1);

  const loadShows = async () => {
    setLoading(true);
    try {
      const res = await api.get("/shows");
      setShows(res.data?.data ?? []);
    } catch (err) {
      toast.error("Failed to load shows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShows();
  }, []);

  const movieOptions = useMemo(() => {
    const seen = new Map();
    for (const s of shows) {
      const m = s.movieId;
      if (m?._id && !seen.has(m._id)) seen.set(m._id, m.title || "Untitled");
    }
    return Array.from(seen, ([id, title]) => ({ id, title }));
  }, [shows]);

  const filtered = useMemo(() => {
    let list = shows;
    if (movieFilter) list = list.filter((s) => s.movieId?._id === movieFilter);
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      list = list.filter((s) => new Date(s.date) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((s) => new Date(s.date) <= to);
    }
    const sorted = list.slice().sort(
      (a, b) =>
        new Date(a.date) - new Date(b.date) ||
        (a.time || "").localeCompare(b.time || "")
    );
    if (timeSort === "asc") {
      sorted.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    } else if (timeSort === "desc") {
      sorted.sort((a, b) => (b.time || "").localeCompare(a.time || ""));
    }
    return sorted;
  }, [shows, movieFilter, dateFrom, dateTo, timeSort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  // Reset to first page whenever filters or sort change
  useEffect(() => {
    setPage(1);
  }, [movieFilter, dateFrom, dateTo, timeSort]);

  const cycleTimeSort = () => {
    setTimeSort((prev) => {
      if (prev === null) return "asc";
      if (prev === "asc") return "desc";
      return null;
    });
  };

  const handleToggleActive = async (show) => {
    setBusyId(show._id);
    try {
      await api.patch(`/shows/${show._id}`, { isActive: !show.isActive });
      toast.success(show.isActive ? "Show deactivated" : "Show activated");
      await loadShows();
    } catch (err) {
      toast.error("Failed to update show");
    } finally {
      setBusyId(null);
    }
  };

  const performDelete = async (show) => {
    setBusyId(show._id);
    try {
      await api.delete(`/shows/${show._id}`);
      toast.success("Show deleted");
      await loadShows();
    } catch (err) {
      toast.error("Failed to delete show");
    } finally {
      setBusyId(null);
      setConfirmTarget(null);
    }
  };

  const columns = [
    {
      key: "movie",
      header: "Movie",
      render: (s) => (
        <span className="text-slate-800 font-medium">
          {s.movieId?.title || "—"}
        </span>
      ),
    },
    {
      key: "cinema",
      header: "Cinema",
      render: (s) => {
        const cinema = s.screenId?.cinemaId;
        return (
          <span className="text-slate-800">
            {cinema?.name || "—"}
            {cinema?.city ? <span className="text-slate-400"> ({cinema.city})</span> : null}
          </span>
        );
      },
    },
    { key: "screen", header: "Screen", render: (s) => <span className="text-slate-800">{s.screenId?.name || "—"}</span> },
    { key: "date", header: "Date", render: (s) => <span className="text-slate-800">{formatDate(s.date)}</span> },
    {
      key: "time",
      header: (
        <button
          type="button"
          onClick={cycleTimeSort}
          aria-label={`Sort by time ${
            timeSort === "asc" ? "(ascending)" : timeSort === "desc" ? "(descending)" : ""
          }`}
          className={`inline-flex items-center gap-1 text-inherit hover:text-slate-900 rounded ${focusRing}`}
        >
          Time
          {timeSort === "asc" && <ArrowUp className="w-3 h-3" />}
          {timeSort === "desc" && <ArrowDown className="w-3 h-3" />}
        </button>
      ),
      render: (s) => <span className="text-slate-800">{s.time || "—"}</span>,
    },
    {
      key: "format",
      header: "Format",
      render: (s) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-600 border border-red-200">
          {s.format || "2D"}
        </span>
      ),
    },
    {
      key: "lang",
      header: "Lang",
      render: (s) => (
        <span className="text-slate-700 text-xs">
          {s.language || "—"}
          {s.subtitles ? <span className="text-slate-500"> · {s.subtitles} sub</span> : null}
        </span>
      ),
    },
    { key: "booked", header: "Booked", render: (s) => <span className="text-slate-800">{s.bookedSeats?.length || 0}</span> },
    {
      key: "active",
      header: "Active",
      render: (s) => (
        <TogglePill
          on={s.isActive}
          busy={busyId === s._id}
          onClick={() => handleToggleActive(s)}
          onLabel="Active"
          offLabel="Inactive"
          ariaLabel="Toggle show active"
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (s) => (
        <button
          type="button"
          onClick={() => setConfirmTarget(s)}
          disabled={busyId === s._id}
          className={`text-rose-600 hover:text-rose-700 disabled:opacity-60 rounded ${focusRing}`}
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Shows"
          action={
            <Link to="/admin/shows/new" className={`${primaryBtn} ${focusRing}`}>
              + New Show
            </Link>
          }
        />

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Movie</label>
            <select
              value={movieFilter}
              onChange={(e) => setMovieFilter(e.target.value)}
              className={`${inputCls} ${focusRing}`}
            >
              <option value="">All movies</option>
              {movieOptions.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={`${inputCls} ${focusRing}`} />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={`${inputCls} ${focusRing}`} />
          </div>
          {(movieFilter || dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                setMovieFilter("");
                setDateFrom("");
                setDateTo("");
              }}
              className={`text-red-600 hover:text-red-700 px-2 py-2 text-sm rounded ${focusRing}`}
            >
              Clear
            </button>
          )}
        </div>

        <AdminTable
          rows={paged}
          columns={columns}
          rowKey={(s) => s._id}
          loading={loading}
          emptyIcon={CalendarClock}
          emptyTitle={shows.length === 0 ? "No shows yet." : "No shows match these filters."}
          pagination={{
            page: currentPage,
            pageCount,
            total: filtered.length,
            itemLabel: "shows",
            onChange: setPage,
            disabled: loading,
          }}
        />

        <ConfirmDialog
          open={Boolean(confirmTarget)}
          onClose={() => setConfirmTarget(null)}
          onConfirm={() => confirmTarget && performDelete(confirmTarget)}
          title="Delete this show?"
          message="This is a soft delete; bookings remain visible in the audit log."
          confirmLabel="Delete"
          danger
        />
      </div>
    </PageTransition>
  );
}
