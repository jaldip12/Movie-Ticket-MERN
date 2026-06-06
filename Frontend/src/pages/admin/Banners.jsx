import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Megaphone, Plus, X, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { inputCls, labelCls, primaryBtn, secondaryBtn } from "@/lib/adminStyles";
import PageHeader from "@/components/Admin/PageHeader";
import AdminTable from "@/components/Admin/AdminTable";
import TogglePill from "@/components/Admin/TogglePill";
import StatusBadge from "@/components/Admin/StatusBadge";
import ConfirmDialog from "@/components/Admin/ConfirmDialog";
import R2Uploader from "@/components/cloud/R2Uploader";
import { PageTransition, Stagger, StaggerItem } from "@/components/ui/Motion";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2";

const emptyForm = {
  title: "",
  image: "",
  ctaText: "",
  ctaUrl: "",
  position: "strip",
  sortOrder: 0,
  validFrom: "",
  validUntil: "",
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

const formatRange = (b) => {
  if (!b.validFrom && !b.validUntil) return "Always";
  const f = b.validFrom ? new Date(b.validFrom).toLocaleDateString() : "—";
  const u = b.validUntil ? new Date(b.validUntil).toLocaleDateString() : "—";
  return `${f} → ${u}`;
};

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const isEdit = Boolean(editing);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await api.get("/banners/admin");
      setBanners(res.data?.data ?? []);
    } catch (err) {
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (b) => {
    setEditing(b);
    setForm({
      title: b.title ?? "",
      image: b.image ?? "",
      ctaText: b.ctaText ?? "",
      ctaUrl: b.ctaUrl ?? "",
      position: b.position ?? "strip",
      sortOrder: b.sortOrder ?? 0,
      validFrom: toDateInput(b.validFrom),
      validUntil: toDateInput(b.validUntil),
      isActive: !!b.isActive,
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
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageUploaded = (url) => {
    setForm((prev) => ({ ...prev, image: url || "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const title = form.title.trim();
    const image = form.image.trim();
    if (!title) return toast.error("Title is required");
    if (!image) return toast.error("Image URL is required");

    const payload = {
      title,
      image,
      ctaText: form.ctaText.trim(),
      ctaUrl: form.ctaUrl.trim(),
      position: form.position,
      sortOrder: Number.isFinite(Number(form.sortOrder)) ? Number(form.sortOrder) : 0,
      validFrom: form.validFrom || null,
      validUntil: form.validUntil || null,
      isActive: !!form.isActive,
    };

    setSubmitting(true);
    try {
      if (!isEdit) {
        await api.post("/banners/admin", payload);
        toast.success("Banner created");
      } else {
        await api.patch(`/banners/admin/${editing._id}`, payload);
        toast.success("Banner updated");
      }
      cancelForm();
      await loadBanners();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (b) => {
    setBusyId(b._id);
    const previous = banners;
    const nextActive = !b.isActive;
    // Optimistic update
    setBanners((prev) =>
      prev.map((it) => (it._id === b._id ? { ...it, isActive: nextActive } : it))
    );
    try {
      await api.patch(`/banners/admin/${b._id}`, { isActive: nextActive });
      toast.success(b.isActive ? "Banner deactivated" : "Banner activated");
    } catch (err) {
      // Rollback
      setBanners(previous);
      toast.error("Failed to update banner");
    } finally {
      setBusyId(null);
    }
  };

  const performDelete = async (b) => {
    setBusyId(b._id);
    try {
      await api.delete(`/banners/admin/${b._id}`);
      toast.success("Banner deleted");
      await loadBanners();
    } catch (err) {
      toast.error("Failed to delete banner");
    } finally {
      setBusyId(null);
      setConfirmTarget(null);
    }
  };

  const columns = [
    {
      key: "image",
      header: "Image",
      render: (b) => (
        <img
          src={b.image}
          alt={b.title}
          className="w-20 aspect-[5/2] object-cover rounded-md border border-slate-200 bg-slate-50"
        />
      ),
    },
    { key: "title", header: "Title", render: (b) => <span className="text-slate-900 font-medium">{b.title}</span> },
    {
      key: "position",
      header: "Position",
      render: (b) => (
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium border capitalize ${
            b.position === "hero"
              ? "bg-red-100 text-red-600 border-red-200"
              : "bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          {b.position}
        </span>
      ),
    },
    {
      key: "cta",
      header: "CTA",
      render: (b) =>
        b.ctaText ? (
          <span className="inline-flex items-center gap-1 text-sm text-slate-700">
            {b.ctaText}
            {b.ctaUrl && <ExternalLink className="w-3 h-3 text-slate-500" />}
          </span>
        ) : (
          <span className="text-slate-500">—</span>
        ),
    },
    { key: "validity", header: "Validity", render: (b) => <span className="text-sm text-slate-700">{formatRange(b)}</span> },
    { key: "sort", header: "Sort", render: (b) => <span className="text-slate-700">{b.sortOrder ?? 0}</span> },
    {
      key: "active",
      header: "Active",
      render: (b) => (
        <TogglePill
          on={b.isActive}
          busy={busyId === b._id}
          onClick={() => handleToggleActive(b)}
          ariaLabel="Toggle banner active"
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (b) => (
        <>
          <button
            type="button"
            onClick={() => startEdit(b)}
            disabled={busyId === b._id}
            className={`text-red-600 hover:text-red-700 mr-3 text-sm font-medium disabled:opacity-60 transition-colors rounded ${focusRing}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setConfirmTarget(b)}
            disabled={busyId === b._id}
            className={`text-rose-600 hover:text-rose-700 text-sm font-medium disabled:opacity-40 transition-colors rounded ${focusRing}`}
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
          title="Banners"
          subtitle="Promotional banners shown on the landing page."
          action={
            <button
              type="button"
              onClick={showForm ? cancelForm : startCreate}
              className={`${showForm ? secondaryBtn : primaryBtn} ${focusRing}`}
            >
              {showForm ? (
                <>
                  <X className="w-4 h-4" /> Cancel
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> New Banner
                </>
              )}
            </button>
          }
        />

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6 space-y-5">
            <h2 className="text-lg font-semibold text-slate-900">{isEdit ? "Edit Banner" : "Create Banner"}</h2>

            <Stagger gap={0.05} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StaggerItem className="md:col-span-2">
                <label className={labelCls}>Title</label>
                <input name="title" value={form.title} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`} placeholder="e.g., Big release this Friday" required />
              </StaggerItem>
              <StaggerItem className="md:col-span-2">
                <label className={labelCls}>Image URL</label>
                <input name="image" value={form.image} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`} placeholder="Paste R2 URL — or upload below" required />
                <div className="mt-3">
                  <R2Uploader onImageUpload={handleImageUploaded} />
                </div>
                {form.image && (
                  <div className="mt-3">
                    <img src={form.image} alt="Banner preview" className="max-h-40 rounded-lg border border-slate-200 object-cover" />
                  </div>
                )}
              </StaggerItem>
              <StaggerItem>
                <label className={labelCls}>CTA Text</label>
                <input name="ctaText" value={form.ctaText} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`} placeholder="Book now" />
              </StaggerItem>
              <StaggerItem>
                <label className={labelCls}>CTA URL</label>
                <input name="ctaUrl" value={form.ctaUrl} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`} placeholder="/movies/abc123 or https://..." />
              </StaggerItem>
              <StaggerItem>
                <label className={labelCls}>Position</label>
                <select name="position" value={form.position} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`}>
                  <option value="strip">Strip</option>
                  <option value="hero">Hero</option>
                </select>
              </StaggerItem>
              <StaggerItem>
                <label className={labelCls}>Sort Order</label>
                <input type="number" name="sortOrder" value={form.sortOrder} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`} placeholder="0" />
              </StaggerItem>
              <StaggerItem>
                <label className={labelCls}>Valid From</label>
                <input type="date" name="validFrom" value={form.validFrom} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`} />
              </StaggerItem>
              <StaggerItem>
                <label className={labelCls}>Valid Until</label>
                <input type="date" name="validUntil" value={form.validUntil} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`} />
              </StaggerItem>
            </Stagger>

            <label className="inline-flex items-center gap-2 text-slate-800">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="accent-red-500 h-4 w-4" />
              <span>Active</span>
            </label>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={submitting} className={`${primaryBtn} ${focusRing}`}>
                {submitting ? (isEdit ? "Saving..." : "Creating...") : isEdit ? "Save changes" : "Create"}
              </button>
              <button type="button" onClick={cancelForm} className={`${secondaryBtn} ${focusRing}`}>Cancel</button>
            </div>
          </form>
        )}

        <AdminTable
          rows={banners}
          columns={columns}
          rowKey={(b) => b._id}
          loading={loading}
          emptyIcon={Megaphone}
          emptyTitle="No banners yet."
        />

        <ConfirmDialog
          open={Boolean(confirmTarget)}
          onClose={() => setConfirmTarget(null)}
          onConfirm={() => confirmTarget && performDelete(confirmTarget)}
          title="Delete this banner?"
          message={confirmTarget ? `Soft-delete banner "${confirmTarget.title}"?` : ""}
          confirmLabel="Delete"
          danger
        />
      </div>
    </PageTransition>
  );
}
