import { useMemo, useState } from "react";
import { Tag } from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";
import { inputCls, primaryBtn, secondaryBtn } from "@/lib/adminStyles";
import { formatINR } from "@/lib/format";
import PageHeader from "@/components/Admin/PageHeader";
import AdminTable from "@/components/Admin/AdminTable";
import StatusBadge from "@/components/Admin/StatusBadge";
import TogglePill from "@/components/Admin/TogglePill";
import ConfirmDialog from "@/components/Admin/ConfirmDialog";
import { useApiList } from "@/hooks/useApiList";
import { PageTransition, Stagger, StaggerItem } from "@/components/ui/Motion";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2";

const emptyForm = {
  code: "",
  type: "percent",
  value: "",
  minTotal: "",
  maxDiscount: "",
  validFrom: "",
  validUntil: "",
  usageLimit: "",
  firstBookingOnly: false,
  isActive: true,
};

const toDateInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatValue = (c) => (c.type === "percent" ? `${c.value}%` : formatINR(c.value));

const formatRange = (c) => {
  if (!c.validFrom && !c.validUntil) return "Always";
  const f = c.validFrom ? new Date(c.validFrom).toLocaleDateString() : "—";
  const u = c.validUntil ? new Date(c.validUntil).toLocaleDateString() : "—";
  return `${f} → ${u}`;
};

const codePillCls =
  "bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono text-xs";

export default function Coupons() {
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const isEdit = Boolean(editing);

  const params = useMemo(() => {
    const p = {};
    if (submittedSearch) p.search = submittedSearch;
    if (statusFilter === "active") p.isActive = "true";
    if (statusFilter === "inactive") p.isActive = "false";
    return p;
  }, [submittedSearch, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSubmittedSearch(search.trim());
  };

  const list = useApiList("/coupons", { params, pageSize: 20 });
  const { items, total, page, pageCount, loading, busyId, setPage, refetch, patch } = list;

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (c) => {
    setEditing(c);
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value ?? ""),
      minTotal: c.minTotal ? String(c.minTotal) : "",
      maxDiscount: c.maxDiscount == null ? "" : String(c.maxDiscount),
      validFrom: toDateInput(c.validFrom),
      validUntil: toDateInput(c.validUntil),
      usageLimit: c.usageLimit == null ? "" : String(c.usageLimit),
      firstBookingOnly: !!c.firstBookingOnly,
      isActive: !!c.isActive,
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };
      // Clear maxDiscount when switching from percent to flat
      if (name === "type" && value === "flat") {
        next.maxDiscount = "";
      }
      return next;
    });
  };

  const buildPayload = () => {
    const payload = {
      type: form.type,
      value: Number(form.value),
      firstBookingOnly: !!form.firstBookingOnly,
      isActive: !!form.isActive,
    };
    payload.minTotal = form.minTotal === "" ? 0 : Number(form.minTotal);
    payload.maxDiscount = form.maxDiscount === "" ? null : Number(form.maxDiscount);
    payload.validFrom = form.validFrom || null;
    payload.validUntil = form.validUntil || null;
    payload.usageLimit = form.usageLimit === "" ? null : parseInt(form.usageLimit, 10);
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const code = form.code.trim().toUpperCase();
    const value = Number(form.value);

    if (!isEdit && !code) return toast.error("Code is required");
    if (!form.type) return toast.error("Type is required");
    if (Number.isNaN(value)) return toast.error("Value must be a number");
    if (form.type === "percent" && !(value > 0 && value <= 100))
      return toast.error("Percent value must be between 0 and 100");
    if (form.type === "flat" && !(value > 0))
      return toast.error("Flat value must be greater than 0");

    setSubmitting(true);
    try {
      const payload = buildPayload();
      if (!isEdit) {
        await api.post("/coupons", { code, ...payload });
        toast.success("Coupon created");
      } else {
        await api.patch(`/coupons/${editing._id}`, payload);
        toast.success("Coupon updated");
      }
      cancelForm();
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = (c) =>
    patch(c._id, { isActive: !c.isActive }, c.isActive ? "Coupon deactivated" : "Coupon activated");

  const performDelete = async (c) => {
    await list.remove(c._id, "Coupon deleted");
    setConfirmTarget(null);
  };

  const valueSuffix = form.type === "percent" ? "%" : "₹";

  const columns = [
    {
      key: "code",
      header: "Code",
      render: (c) => <span className={`${codePillCls} text-slate-800`}>{c.code}</span>,
    },
    { key: "type", header: "Type", render: (c) => <span className="capitalize text-slate-700">{c.type}</span> },
    { key: "value", header: "Value", render: (c) => <span className="text-slate-800 font-medium">{formatValue(c)}</span> },
    { key: "minTotal", header: "Min Order", render: (c) => <span className="text-slate-700">{c.minTotal ? formatINR(c.minTotal) : "—"}</span> },
    { key: "maxDiscount", header: "Max Cap", render: (c) => <span className="text-slate-700">{c.maxDiscount ? formatINR(c.maxDiscount) : "—"}</span> },
    { key: "range", header: "Valid Range", render: (c) => <span className="text-sm text-slate-700">{formatRange(c)}</span> },
    {
      key: "usage",
      header: "Usage",
      render: (c) => <span className="text-slate-800">{c.usedCount ?? 0}/{c.usageLimit ?? "∞"}</span>,
    },
    {
      key: "fb",
      header: "First-booking",
      render: (c) =>
        c.firstBookingOnly ? (
          <StatusBadge variant="active" label="Yes" />
        ) : (
          <span className="text-slate-500">—</span>
        ),
    },
    {
      key: "active",
      header: "Active",
      render: (c) => (
        <TogglePill
          on={c.isActive}
          busy={busyId === c._id}
          onClick={() => handleToggleActive(c)}
          ariaLabel="Toggle coupon active"
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (c) => (
        <>
          <button
            type="button"
            onClick={() => startEdit(c)}
            disabled={busyId === c._id}
            className={`text-red-600 hover:text-red-700 mr-3 disabled:opacity-60 rounded ${focusRing}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setConfirmTarget(c)}
            disabled={busyId === c._id}
            className={`text-rose-600 hover:text-rose-700 disabled:opacity-40 rounded ${focusRing}`}
          >
            Delete
          </button>
        </>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Promo Codes"
          action={
            <>
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search code..."
                  className={`${inputCls} w-56 ${focusRing}`}
                />
              </form>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`${inputCls} ${focusRing}`}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                type="button"
                onClick={showForm ? cancelForm : startCreate}
                className={`${showForm ? secondaryBtn : primaryBtn} ${focusRing}`}
              >
                {showForm ? "Cancel" : "+ New Code"}
              </button>
            </>
          }
        />

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6 space-y-5">
            <h2 className="text-lg font-semibold text-slate-900">{isEdit ? "Edit Coupon" : "Create Coupon"}</h2>

            <Stagger gap={0.05} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StaggerItem>
                <label className="block mb-1 text-sm text-slate-700">Code</label>
                {isEdit ? (
                  <div className="flex items-center gap-2">
                    <span className={`${codePillCls} text-slate-800`}>{form.code}</span>
                    <span
                      role="note"
                      aria-label="Read only"
                      className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded bg-slate-100 border border-slate-200 text-slate-600"
                    >
                      Read-only
                    </span>
                  </div>
                ) : (
                  <input
                    name="code"
                    value={form.code}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                    }
                    placeholder="WELCOME10"
                    className={`${inputCls} w-full uppercase tracking-wider font-mono ${focusRing}`}
                    required
                  />
                )}
              </StaggerItem>

              <StaggerItem>
                <label className="block mb-1 text-sm text-slate-700">Type</label>
                <select name="type" value={form.type} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`}>
                  <option value="percent">Percent</option>
                  <option value="flat">Flat</option>
                </select>
              </StaggerItem>

              <StaggerItem>
                <label className="block mb-1 text-sm text-slate-700">Value</label>
                <div className="flex">
                  <input
                    type="number"
                    name="value"
                    value={form.value}
                    onChange={handleChange}
                    step={form.type === "percent" ? "0.01" : "1"}
                    min="0"
                    max={form.type === "percent" ? "100" : undefined}
                    placeholder={form.type === "percent" ? "10" : "100"}
                    className={`flex-1 h-10 px-3 rounded-l-md bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20 ${focusRing}`}
                    required
                  />
                  <span className="px-3 inline-flex items-center bg-slate-100 border border-l-0 border-slate-200 text-slate-700 rounded-r-md">
                    {valueSuffix}
                  </span>
                </div>
              </StaggerItem>

              <StaggerItem>
                <label className="block mb-1 text-sm text-slate-700">Min order amount (optional)</label>
                <input type="number" name="minTotal" value={form.minTotal} onChange={handleChange} min="0" placeholder="0" className={`${inputCls} w-full ${focusRing}`} />
              </StaggerItem>

              <StaggerItem>
                <label className="block mb-1 text-sm text-slate-700">Max discount cap (optional, percent only)</label>
                <input
                  type="number"
                  name="maxDiscount"
                  value={form.maxDiscount}
                  onChange={handleChange}
                  min="0"
                  placeholder="No cap"
                  disabled={form.type !== "percent"}
                  className={`${inputCls} w-full disabled:opacity-50 ${focusRing}`}
                />
              </StaggerItem>

              <StaggerItem>
                <label className="block mb-1 text-sm text-slate-700">Usage limit (optional)</label>
                <input type="number" name="usageLimit" value={form.usageLimit} onChange={handleChange} min="1" step="1" placeholder="Unlimited" className={`${inputCls} w-full ${focusRing}`} />
              </StaggerItem>

              <StaggerItem>
                <label className="block mb-1 text-sm text-slate-700">Valid from</label>
                <input type="date" name="validFrom" value={form.validFrom} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`} />
              </StaggerItem>

              <StaggerItem>
                <label className="block mb-1 text-sm text-slate-700">Valid until</label>
                <input type="date" name="validUntil" value={form.validUntil} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`} />
              </StaggerItem>
            </Stagger>

            <div className="flex flex-wrap items-center gap-6">
              <label className="inline-flex items-center gap-2 text-slate-800">
                <input type="checkbox" name="firstBookingOnly" checked={form.firstBookingOnly} onChange={handleChange} className="accent-red-500 h-4 w-4" />
                <span>First-booking only</span>
              </label>
              <label className="inline-flex items-center gap-2 text-slate-800">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="accent-red-500 h-4 w-4" />
                <span>Active</span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={submitting} className={`${primaryBtn} ${focusRing}`}>
                {submitting ? (isEdit ? "Saving..." : "Creating...") : isEdit ? "Save changes" : "Create"}
              </button>
              <button type="button" onClick={cancelForm} className={`${secondaryBtn} ${focusRing}`}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <AdminTable
          rows={items}
          columns={columns}
          rowKey={(c) => c._id}
          loading={loading}
          emptyIcon={Tag}
          emptyTitle="No coupons found."
          pagination={{
            page,
            pageCount,
            total,
            itemLabel: "coupons",
            onChange: setPage,
            disabled: loading,
          }}
        />

        <ConfirmDialog
          open={Boolean(confirmTarget)}
          onClose={() => setConfirmTarget(null)}
          onConfirm={() => confirmTarget && performDelete(confirmTarget)}
          title="Delete this coupon?"
          message={confirmTarget ? `Soft-delete coupon "${confirmTarget.code}"?` : ""}
          confirmLabel="Delete"
          danger
        />
      </div>
    </PageTransition>
  );
}
