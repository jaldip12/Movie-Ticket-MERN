import { useMemo, useState } from "react";
import { Download, Receipt } from "lucide-react";
import { api } from "@/lib/api";
import { inputCls, secondaryBtn } from "@/lib/adminStyles";
import { formatDate, formatDateTime, formatINR } from "@/lib/format";
import PageHeader from "@/components/Admin/PageHeader";
import AdminTable from "@/components/Admin/AdminTable";
import StatusBadge from "@/components/Admin/StatusBadge";
import { useApiList } from "@/hooks/useApiList";
import { PageTransition } from "@/components/ui/Motion";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2";

export default function AdminBookings() {
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const params = useMemo(
    () => (statusFilter ? { status: statusFilter } : {}),
    [statusFilter]
  );

  const { items, total, page, pageCount, loading, setPage } = useApiList(
    "/bookings",
    { params, pageSize: 20 }
  );

  const handleExport = () => {
    const baseURL =
      api.defaults.baseURL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:3100/api/v1";
    const qs = new URLSearchParams();
    if (statusFilter) qs.set("status", statusFilter);
    if (fromDate) qs.set("from", fromDate);
    if (toDate) qs.set("to", toDate);
    const url = `${baseURL}/admin/export/bookings${
      qs.toString() ? `?${qs}` : ""
    }`;
    window.open(url, "_blank");
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = items;
    if (term) {
      list = list.filter((b) => {
        const email = b.userId?.email || "";
        const movie = b.showId?.movieId?.title || "";
        return (
          email.toLowerCase().includes(term) ||
          movie.toLowerCase().includes(term)
        );
      });
    }
    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      list = list.filter((b) => new Date(b.createdAt) >= from);
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      list = list.filter((b) => new Date(b.createdAt) <= to);
    }
    return list;
  }, [items, search, fromDate, toDate]);

  const totalRevenue = useMemo(
    () =>
      filtered.reduce(
        (sum, b) => sum + (Number.isFinite(Number(b.totalAmount)) ? Number(b.totalAmount) : 0),
        0
      ),
    [filtered]
  );

  const columns = [
    { key: "createdAt", header: "Created", render: (b) => <span className="text-sm text-slate-400">{formatDateTime(b.createdAt)}</span> },
    {
      key: "user",
      header: "User",
      render: (b) =>
        b.userId ? (
          <div>
            <div className="text-slate-800 font-medium">
              {b.userId.firstname} {b.userId.lastname || ""}
            </div>
            <div className="text-xs text-slate-400">{b.userId.email}</div>
          </div>
        ) : (
          <span className="text-slate-500">—</span>
        ),
    },
    {
      key: "movie",
      header: "Movie",
      render: (b) => <span className="text-slate-800">{b.showId?.movieId?.title || "—"}</span>,
    },
    {
      key: "show",
      header: "Show",
      render: (b) =>
        b.showId ? (
          <div className="text-sm">
            <div className="text-slate-800">{formatDate(b.showId.date)}</div>
            <div className="text-slate-400">{b.showId.time || ""}</div>
          </div>
        ) : (
          <span>—</span>
        ),
    },
    { key: "seats", header: "Seats", render: (b) => <span className="text-slate-800">{(b.seats || []).join(", ")}</span> },
    { key: "total", header: "Total", render: (b) => <span className="text-slate-800 font-medium">{formatINR(b.totalAmount)}</span> },
    { key: "status", header: "Status", render: (b) => <StatusBadge variant={b.status} /> },
  ];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Bookings"
          action={
            <>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`${inputCls} ${focusRing}`}
              >
                <option value="">All statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={`${inputCls} ${focusRing}`}
                title="From date"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={`${inputCls} ${focusRing}`}
                title="To date"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by user email or movie..."
                className={`${inputCls} w-72 ${focusRing}`}
              />
              <button
                type="button"
                onClick={handleExport}
                className={`${secondaryBtn} ${focusRing}`}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </>
          }
        />

        <div className="mb-4 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">{filtered.length}</span>{" "}
          bookings{" "}
          <span className="text-slate-400">·</span>{" "}
          <span className="font-semibold text-slate-900">{formatINR(totalRevenue)}</span>{" "}
          total revenue
        </div>

        <AdminTable
          rows={filtered}
          columns={columns}
          rowKey={(b) => b._id}
          loading={loading}
          emptyIcon={Receipt}
          emptyTitle={
            items.length === 0 ? "No bookings yet." : "No bookings match your search."
          }
          pagination={{
            page,
            pageCount,
            total,
            itemLabel: "bookings",
            onChange: setPage,
            disabled: loading,
          }}
        />
      </div>
    </PageTransition>
  );
}
