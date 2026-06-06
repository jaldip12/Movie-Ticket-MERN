import { useMemo, useState } from "react";
import { History } from "lucide-react";
import { inputCls, secondaryBtn } from "@/lib/adminStyles";
import { formatDateTime } from "@/lib/format";
import PageHeader from "@/components/Admin/PageHeader";
import AdminTable from "@/components/Admin/AdminTable";
import { useApiList } from "@/hooks/useApiList";
import { PageTransition } from "@/components/ui/Motion";

const methodBadge = (method) => {
  switch (method) {
    case "POST":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "PATCH":
    case "PUT":
      return "bg-amber-100 text-amber-700 border border-amber-500/25";
    case "DELETE":
      return "bg-rose-100 text-rose-700 border border-rose-200";
    default:
      return "bg-slate-100 text-slate-600 border border-slate-200";
  }
};

const statusBadge = (status) => {
  if (!status) return "bg-slate-100 text-slate-600 border border-slate-200";
  if (status >= 200 && status < 300)
    return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  if (status >= 300 && status < 400)
    return "bg-sky-500/15 text-sky-700 border border-sky-500/25";
  if (status >= 400 && status < 500)
    return "bg-amber-100 text-amber-700 border border-amber-500/25";
  if (status >= 500)
    return "bg-rose-100 text-rose-700 border border-rose-200";
  return "bg-slate-100 text-slate-600 border border-slate-200";
};

export default function AuditLog() {
  const [methodFilter, setMethodFilter] = useState("");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  const params = useMemo(
    () => (methodFilter ? { method: methodFilter } : {}),
    [methodFilter]
  );

  const { items, total, page, pageCount, loading, setPage } = useApiList(
    "/admin/audit",
    { params, pageSize: 50 }
  );

  const handleApplyDateFilter = () => {
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = items;
    if (term) {
      list = list.filter((it) =>
        (it.userId?.email || "").toLowerCase().includes(term)
      );
    }
    if (appliedFrom) {
      const from = new Date(appliedFrom);
      from.setHours(0, 0, 0, 0);
      list = list.filter((it) => new Date(it.createdAt) >= from);
    }
    if (appliedTo) {
      const to = new Date(appliedTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((it) => new Date(it.createdAt) <= to);
    }
    return list;
  }, [items, search, appliedFrom, appliedTo]);

  const columns = [
    { key: "time", header: "Time", render: (it) => <span className="text-sm text-slate-400 whitespace-nowrap">{formatDateTime(it.createdAt)}</span> },
    {
      key: "user",
      header: "User",
      render: (it) =>
        it.userId ? (
          <div className="text-sm">
            <div className="text-slate-800 font-medium">{it.userId.firstname || ""}</div>
            <div className="text-xs text-slate-400">{it.userId.email}</div>
          </div>
        ) : (
          <span className="text-slate-500">—</span>
        ),
    },
    {
      key: "method",
      header: "Method",
      render: (it) => (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${methodBadge(it.method)}`}>
          {it.method}
        </span>
      ),
    },
    {
      key: "path",
      header: "Path",
      render: (it) => <span className="text-slate-700 text-sm font-mono break-all">{it.path}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (it) => (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(it.statusCode)}`}>
          {it.statusCode}
        </span>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      render: (it) => (
        <span className="text-sm text-slate-400 whitespace-nowrap">
          {it.durationMs != null ? `${it.durationMs} ms` : "—"}
        </span>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Audit Log"
          subtitle="Every admin write (POST / PATCH / DELETE) is recorded here."
          action={
            <>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className={`${inputCls} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2`}
              >
                <option value="">All methods</option>
                <option value="POST">POST</option>
                <option value="PATCH">PATCH</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by user email..."
                className={`${inputCls} w-72 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2`}
              />
            </>
          }
        />

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-slate-600 mb-1" htmlFor="audit-from">
              From
            </label>
            <input
              id="audit-from"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={`${inputCls} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2`}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1" htmlFor="audit-to">
              To
            </label>
            <input
              id="audit-to"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={`${inputCls} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2`}
            />
          </div>
          <button
            type="button"
            onClick={handleApplyDateFilter}
            className={`${secondaryBtn} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2`}
          >
            Apply
          </button>
          {(appliedFrom || appliedTo) && (
            <button
              type="button"
              onClick={() => {
                setFromDate("");
                setToDate("");
                setAppliedFrom("");
                setAppliedTo("");
              }}
              className="text-red-600 hover:text-red-700 px-2 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 rounded"
            >
              Clear
            </button>
          )}
        </div>

        <AdminTable
          rows={filtered}
          columns={columns}
          rowKey={(it) => it._id}
          loading={loading}
          emptyIcon={History}
          emptyTitle={items.length === 0 ? "No audit entries yet." : "No entries match your search."}
          pagination={{
            page,
            pageCount,
            total,
            itemLabel: "entries",
            onChange: setPage,
            disabled: loading,
          }}
        />
      </div>
    </PageTransition>
  );
}
