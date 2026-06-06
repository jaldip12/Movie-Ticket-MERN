import { useMemo, useState } from "react";
import { Star, Eye, EyeOff, Loader2, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";
import { inputCls } from "@/lib/adminStyles";
import { formatDateTime } from "@/lib/format";
import PageHeader from "@/components/Admin/PageHeader";
import AdminTable from "@/components/Admin/AdminTable";
import StatusBadge from "@/components/Admin/StatusBadge";
import { useApiList } from "@/hooks/useApiList";
import { PageTransition } from "@/components/ui/Motion";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2";

function StarRow({ value }) {
  const filled = Math.round(value || 0);
  return (
    <div
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${filled} of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`w-4 h-4 ${
            i <= filled ? "text-amber-500 fill-amber-500" : "text-slate-400"
          }`}
        />
      ))}
    </div>
  );
}

function TruncatedText({ text }) {
  const [open, setOpen] = useState(false);
  if (!text) return <span className="text-slate-500">—</span>;
  if (text.length <= 140) return <span className="text-slate-800">{text}</span>;
  return (
    <div className="text-slate-800">
      {open ? text : `${text.slice(0, 140)}…`}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="ml-2 text-xs text-red-600 hover:text-red-700 hover:underline"
      >
        {open ? "Show less" : "Show full"}
      </button>
    </div>
  );
}

export default function AdminReviews() {
  const [tab, setTab] = useState("all"); // all | visible | hidden
  const [search, setSearch] = useState("");

  const params = useMemo(() => {
    if (tab === "visible") return { isHidden: "false" };
    if (tab === "hidden") return { isHidden: "true" };
    return {};
  }, [tab]);

  const list = useApiList("/reviews/admin", { params, pageSize: 20 });
  const { items, page, pageCount, total, loading, busyId, setBusyId, refetch, setItems } = list;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((r) => {
      const movie = r.movieId?.title || "";
      const email = r.userId?.email || "";
      const name = r.userId?.firstname || "";
      return (
        movie.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        name.toLowerCase().includes(term)
      );
    });
  }, [items, search]);

  const handleToggleHide = async (review) => {
    setBusyId(review._id);
    try {
      const res = await api.patch(`/reviews/admin/${review._id}/hide`, {
        isHidden: !review.isHidden,
      });
      const updated = res.data?.data;
      toast.success(updated?.isHidden ? "Review hidden" : "Review made visible");
      if (tab === "all") {
        setItems((prev) => prev.map((r) => (r._id === review._id ? updated || r : r)));
      } else {
        refetch();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update review");
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    { key: "date", header: "Date", render: (r) => <span className="text-sm text-slate-400 whitespace-nowrap">{formatDateTime(r.createdAt)}</span> },
    {
      key: "user",
      header: "User",
      render: (r) =>
        r.userId ? (
          <div className="whitespace-nowrap">
            <div className="text-slate-800 font-medium">
              {r.userId.firstname || "—"}
            </div>
            <div className="text-xs text-slate-400">{r.userId.email}</div>
          </div>
        ) : (
          <span className="text-slate-500">—</span>
        ),
    },
    {
      key: "movie",
      header: "Movie",
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.movieId?.poster ? (
            <img
              src={r.movieId.poster}
              alt={r.movieId.title}
              className="w-10 h-14 object-cover rounded border border-slate-200"
            />
          ) : (
            <div className="w-10 h-14 rounded bg-slate-100 border border-slate-200" />
          )}
          <div className="text-sm text-slate-800">{r.movieId?.title || "—"}</div>
        </div>
      ),
    },
    { key: "rating", header: "Rating", render: (r) => <StarRow value={r.rating} /> },
    {
      key: "text",
      header: "Text",
      className: "max-w-md",
      render: (r) => <TruncatedText text={r.text} />,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusBadge
          variant={r.isHidden ? "cancelled" : "active"}
          label={r.isHidden ? "Hidden" : "Visible"}
        />
      ),
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: (r) => {
        const isBusy = busyId === r._id;
        return (
          <button
            type="button"
            onClick={() => handleToggleHide(r)}
            disabled={isBusy}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${focusRing} ${
              r.isHidden
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-500/20"
                : "bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-500/20"
            }`}
          >
            {isBusy ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : r.isHidden ? (
              <Eye className="w-3 h-3" />
            ) : (
              <EyeOff className="w-3 h-3" />
            )}
            {r.isHidden ? "Unhide" : "Hide"}
          </button>
        );
      },
    },
  ];

  const TABS = [
    { key: "all", label: "All" },
    { key: "visible", label: "Visible" },
    { key: "hidden", label: "Hidden" },
  ];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Reviews moderation"
          action={
            <>
              <div role="tablist" aria-label="Review visibility" className="flex flex-wrap gap-2">
                {TABS.map((t) => {
                  const selected = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      role="tab"
                      type="button"
                      aria-selected={selected}
                      aria-controls={`reviews-tabpanel-${t.key}`}
                      id={`reviews-tab-${t.key}`}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => setTab(t.key)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${focusRing} ${
                        selected
                          ? "bg-red-100 text-red-600 border-red-200"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by movie, user name or email..."
                className={`${inputCls} w-72 ${focusRing}`}
              />
            </>
          }
        />

        <div
          role="tabpanel"
          id={`reviews-tabpanel-${tab}`}
          aria-labelledby={`reviews-tab-${tab}`}
        >
          <AdminTable
            rows={filtered}
            columns={columns}
            rowKey={(r) => r._id}
            loading={loading}
            emptyIcon={MessageSquare}
            emptyTitle={items.length === 0 ? "No reviews to moderate." : "No reviews match your search."}
            rowClassName="align-top"
            pagination={{
              page,
              pageCount,
              total,
              itemLabel: "reviews",
              onChange: list.setPage,
              disabled: loading,
            }}
          />
        </div>
      </div>
    </PageTransition>
  );
}
