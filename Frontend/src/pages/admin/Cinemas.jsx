import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Building2, Plus, X, Pencil } from "lucide-react";
import { api } from "@/lib/api";
import { inputCls, labelCls, primaryBtn, secondaryBtn } from "@/lib/adminStyles";
import PageHeader from "@/components/Admin/PageHeader";
import AdminTable from "@/components/Admin/AdminTable";
import StatusBadge from "@/components/Admin/StatusBadge";
import ConfirmDialog from "@/components/Admin/ConfirmDialog";
import { PageTransition, Stagger, StaggerItem } from "@/components/ui/Motion";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2";

const emptyForm = {
  name: "",
  city: "",
  address: "",
  chain: "",
  logo: "",
  themeColor: "#dc2626",
};

export default function Cinemas() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const formRef = useRef(null);

  const loadCinemas = async () => {
    setLoading(true);
    try {
      const res = await api.get("/cinemas");
      setCinemas(res.data?.data ?? []);
    } catch (err) {
      toast.error("Failed to load cinemas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCinemas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (cinema) => {
    setForm({
      name: cinema.name || "",
      city: cinema.city || "",
      address: cinema.address || "",
      chain: cinema.chain || "",
      logo: cinema.logo || "",
      themeColor: cinema.themeColor || "#dc2626",
    });
    setEditingId(cinema._id);
    setShowForm(true);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const name = form.name.trim();
    const city = form.city.trim();
    const address = form.address.trim();

    if (!name || !city || !address) {
      toast.error("Name, city and address are required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        city,
        address,
        chain: form.chain.trim(),
        logo: form.logo.trim(),
        themeColor: form.themeColor.trim(),
      };
      if (editingId) {
        await api.patch(`/cinemas/${editingId}`, payload);
        toast.success("Cinema updated");
      } else {
        await api.post("/cinemas", payload);
        toast.success("Cinema created");
      }
      resetForm();
      await loadCinemas();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save cinema");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (cinema) => {
    setBusyId(cinema._id);
    try {
      await api.patch(`/cinemas/${cinema._id}`, { isActive: !cinema.isActive });
      toast.success(cinema.isActive ? "Cinema deactivated" : "Cinema activated");
      await loadCinemas();
    } catch (err) {
      toast.error("Failed to update cinema");
    } finally {
      setBusyId(null);
    }
  };

  const performDelete = async (cinema) => {
    setBusyId(cinema._id);
    try {
      await api.delete(`/cinemas/${cinema._id}`);
      toast.success("Cinema deleted");
      await loadCinemas();
    } catch (err) {
      toast.error("Failed to delete cinema");
    } finally {
      setBusyId(null);
      setConfirmTarget(null);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (c) => <span className="text-slate-900 font-medium">{c.name}</span>,
    },
    {
      key: "chain",
      header: "Chain",
      render: (c) => (
        <div className="flex items-center gap-2">
          {c.logo ? (
            <img
              src={c.logo}
              alt={c.chain || c.name}
              className="w-6 h-6 rounded object-cover ring-1 ring-slate-200 bg-slate-50"
            />
          ) : (
            <div className="w-6 h-6 rounded bg-slate-50 ring-1 ring-slate-200" />
          )}
          <span className="text-slate-700 text-sm flex items-center gap-2">
            {c.chain || "—"}
            {c.themeColor ? (
              <span
                className="inline-block w-3 h-3 rounded-full ring-1 ring-slate-200"
                style={{ backgroundColor: c.themeColor }}
                title={c.themeColor}
              />
            ) : null}
          </span>
        </div>
      ),
    },
    { key: "city", header: "City", render: (c) => <span className="text-slate-700">{c.city}</span> },
    {
      key: "address",
      header: "Address",
      render: (c) => <span className="text-slate-500">{c.address}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (c) => <StatusBadge variant={c.isActive ? "active" : "inactive"} />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (c) => (
        <>
          <button
            type="button"
            onClick={() => handleEdit(c)}
            disabled={busyId === c._id}
            className={`inline-flex items-center gap-1 text-slate-700 hover:text-red-600 mr-4 text-sm font-medium disabled:opacity-60 transition-colors rounded ${focusRing}`}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleToggleActive(c)}
            disabled={busyId === c._id}
            className={`text-slate-700 hover:text-red-600 mr-4 text-sm font-medium disabled:opacity-60 transition-colors rounded ${focusRing}`}
          >
            {c.isActive ? "Deactivate" : "Activate"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmTarget(c)}
            disabled={busyId === c._id}
            className={`text-rose-600 hover:text-rose-700 text-sm font-medium disabled:opacity-60 transition-colors rounded ${focusRing}`}
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
          title="Cinemas"
          subtitle="Locations where movies are screened."
          action={
            <button
              type="button"
              onClick={() => (showForm ? resetForm() : setShowForm(true))}
              className={`${showForm ? secondaryBtn : primaryBtn} ${focusRing}`}
            >
              {showForm ? (
                <>
                  <X className="w-4 h-4" /> Cancel
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> New Cinema
                </>
              )}
            </button>
          }
        />

        {showForm && (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6 space-y-5"
          >
            <Stagger gap={0.05} className="space-y-5">
              <StaggerItem>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Name</label>
                    <input name="name" value={form.name} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`} placeholder="e.g., MovieVista Central" required />
                  </div>
                  <div>
                    <label className={labelCls}>City</label>
                    <input name="city" value={form.city} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`} placeholder="e.g., Mumbai" required />
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <label className={labelCls}>Address</label>
                <input name="address" value={form.address} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`} placeholder="Street, area, pincode" required />
              </StaggerItem>

              <StaggerItem>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Chain</label>
                    <input name="chain" value={form.chain} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`} placeholder="e.g., Cinépolis, PVR, INOX" />
                  </div>
                  <div>
                    <label className={labelCls}>Logo URL</label>
                    <input name="logo" value={form.logo} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`} placeholder="https://..." />
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <label className={labelCls}>Theme color</label>
                <div className="flex items-center gap-3">
                  <input type="color" name="themeColor" value={form.themeColor || "#dc2626"} onChange={handleChange} className={`h-10 w-14 rounded-md border border-slate-200 bg-slate-50 cursor-pointer ${focusRing}`} />
                  <input type="text" name="themeColor" value={form.themeColor} onChange={handleChange} className={`${inputCls} w-full font-mono ${focusRing}`} placeholder="#dc2626" />
                </div>
              </StaggerItem>
            </Stagger>

            <button type="submit" disabled={submitting} className={`${primaryBtn} ${focusRing}`}>
              {submitting ? (editingId ? "Saving..." : "Creating...") : editingId ? "Save changes" : "Create"}
            </button>
          </form>
        )}

        <AdminTable
          rows={cinemas}
          columns={columns}
          rowKey={(c) => c._id}
          loading={loading}
          emptyIcon={Building2}
          emptyTitle="No cinemas yet."
        />

        <ConfirmDialog
          open={Boolean(confirmTarget)}
          onClose={() => setConfirmTarget(null)}
          onConfirm={() => confirmTarget && performDelete(confirmTarget)}
          title="Delete this cinema?"
          message={
            confirmTarget
              ? `Soft-delete cinema "${confirmTarget.name}"?`
              : ""
          }
          confirmLabel="Delete"
          danger
        />
      </div>
    </PageTransition>
  );
}
