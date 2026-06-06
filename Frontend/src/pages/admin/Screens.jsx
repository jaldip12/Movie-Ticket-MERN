import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { MonitorPlay, Plus, X, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { inputCls, labelCls, primaryBtn, secondaryBtn } from "@/lib/adminStyles";
import PageHeader from "@/components/Admin/PageHeader";
import AdminTable from "@/components/Admin/AdminTable";
import ConfirmDialog from "@/components/Admin/ConfirmDialog";
import { PageTransition, Stagger, StaggerItem } from "@/components/ui/Motion";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2";

const emptyForm = { cinemaId: "", name: "", seatingPlanId: "" };

export default function Screens() {
  const [screens, setScreens] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [seatingPlans, setSeatingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [screensRes, cinemasRes, plansRes] = await Promise.all([
        api.get("/screens"),
        api.get("/cinemas"),
        api.get("/seating/seatingplans"),
      ]);
      setScreens(screensRes.data?.data ?? []);
      setCinemas(cinemasRes.data?.data ?? []);
      setSeatingPlans(plansRes.data?.data ?? []);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const { cinemaId, name, seatingPlanId } = form;
    if (!cinemaId || !name.trim() || !seatingPlanId) {
      toast.error("Cinema, name and seating plan are required");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/screens", { cinemaId, name: name.trim(), seatingPlanId });
      toast.success("Screen created");
      setForm(emptyForm);
      setShowForm(false);
      await loadAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create screen");
    } finally {
      setSubmitting(false);
    }
  };

  const performDelete = async (screen) => {
    setBusyId(screen._id);
    try {
      await api.delete(`/screens/${screen._id}`);
      toast.success("Screen deleted");
      await loadAll();
    } catch (err) {
      toast.error("Failed to delete screen");
    } finally {
      setBusyId(null);
      setConfirmTarget(null);
    }
  };

  const columns = [
    { key: "name", header: "Screen", render: (s) => <span className="text-slate-900 font-medium">{s.name}</span> },
    {
      key: "cinema",
      header: "Cinema",
      render: (s) => {
        const c = s.cinemaId;
        if (!c?.name) return <span className="text-slate-500">—</span>;
        return (
          <span className="text-slate-700">
            {c.name}
            {c.city ? <span className="text-slate-500"> ({c.city})</span> : null}
          </span>
        );
      },
    },
    {
      key: "plan",
      header: "Seating Plan",
      render: (s) => (
        <span className="text-slate-700">
          {s.seatingPlanId?.name || <span className="text-slate-500">—</span>}
        </span>
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
          className={`text-rose-600 hover:text-rose-700 text-sm font-medium disabled:opacity-60 transition-colors rounded ${focusRing}`}
        >
          Delete
        </button>
      ),
    },
  ];

  const noSeatingPlans = !loading && seatingPlans.length === 0;

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Screens"
          subtitle="Auditoriums inside each cinema, mapped to a seating plan."
          action={
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className={`${showForm ? secondaryBtn : primaryBtn} ${focusRing}`}
            >
              {showForm ? (
                <>
                  <X className="w-4 h-4" /> Cancel
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> New Screen
                </>
              )}
            </button>
          }
        />

        {showForm && noSeatingPlans && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6 flex flex-col items-start gap-3">
            <div>
              <h3 className="text-base font-semibold text-amber-900">
                No seating plans yet.
              </h3>
              <p className="text-sm text-amber-800 mt-1">
                You need at least one seating plan before you can create a screen.
              </p>
            </div>
            <Link
              to="/admin/seating"
              className={`inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 rounded ${focusRing}`}
            >
              Create one first
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {showForm && !noSeatingPlans && (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6 space-y-5">
            <Stagger gap={0.05} className="space-y-5">
              <StaggerItem>
                <label className={labelCls}>Cinema</label>
                <select name="cinemaId" value={form.cinemaId} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`} required>
                  <option value="">Select a cinema</option>
                  {cinemas.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} — {c.city}
                    </option>
                  ))}
                </select>
              </StaggerItem>
              <StaggerItem>
                <label className={labelCls}>Name</label>
                <input name="name" value={form.name} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`} placeholder="e.g., Audi 1" required />
              </StaggerItem>
              <StaggerItem>
                <label className={labelCls}>Seating Plan</label>
                <select name="seatingPlanId" value={form.seatingPlanId} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`} required>
                  <option value="">Select a seating plan</option>
                  {seatingPlans.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </StaggerItem>
            </Stagger>
            <button type="submit" disabled={submitting} className={`${primaryBtn} ${focusRing}`}>
              {submitting ? "Creating..." : "Create"}
            </button>
          </form>
        )}

        <AdminTable
          rows={screens}
          columns={columns}
          rowKey={(s) => s._id}
          loading={loading}
          emptyIcon={MonitorPlay}
          emptyTitle="No screens yet."
        />

        <ConfirmDialog
          open={Boolean(confirmTarget)}
          onClose={() => setConfirmTarget(null)}
          onConfirm={() => confirmTarget && performDelete(confirmTarget)}
          title="Delete this screen?"
          message={confirmTarget ? `Delete screen "${confirmTarget.name}"?` : ""}
          confirmLabel="Delete"
          danger
        />
      </div>
    </PageTransition>
  );
}
