import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Utensils } from "lucide-react";
import { api } from "@/lib/api";
import { inputCls, primaryBtn, secondaryBtn } from "@/lib/adminStyles";
import { formatINR } from "@/lib/format";
import PageHeader from "@/components/Admin/PageHeader";
import AdminTable from "@/components/Admin/AdminTable";
import TogglePill from "@/components/Admin/TogglePill";
import ConfirmDialog from "@/components/Admin/ConfirmDialog";
import { PageTransition, Stagger, StaggerItem } from "@/components/ui/Motion";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2";

const CATEGORIES = ["popcorn", "drinks", "snacks", "combo"];
const CATEGORY_LABEL = {
  popcorn: "Popcorn",
  drinks: "Drinks",
  snacks: "Snacks",
  combo: "Combo",
};

const TABS = [
  { key: "all", label: "All" },
  { key: "popcorn", label: "Popcorn" },
  { key: "drinks", label: "Drinks" },
  { key: "snacks", label: "Snacks" },
  { key: "combo", label: "Combos" },
];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "popcorn",
  veg: true,
  cinemaId: "",
  image: "",
  isAvailable: true,
};

export default function Fnb() {
  const [items, setItems] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [imageErrorIds, setImageErrorIds] = useState(() => new Set());

  const loadAll = async () => {
    setLoading(true);
    try {
      const [itemsRes, cinemasRes] = await Promise.all([
        api.get("/fnb?cinemaScope=all&includeInactive=1"),
        api.get("/cinemas"),
      ]);
      setItems(itemsRes.data?.data ?? []);
      setCinemas(cinemasRes.data?.data ?? []);
    } catch (err) {
      toast.error("Failed to load F&B data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const cinemaNameById = useMemo(() => {
    const m = new Map();
    for (const c of cinemas) m.set(String(c._id), c.name);
    return m;
  }, [cinemas]);

  const filtered = useMemo(() => {
    let list = items;
    if (tab !== "all") list = list.filter((it) => it.category === tab);
    const term = search.trim().toLowerCase();
    if (term) {
      list = list.filter((it) => (it.name || "").toLowerCase().includes(term));
    }
    return list;
  }, [items, tab, search]);

  const markImageError = (id) => {
    setImageErrorIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name || "",
      description: item.description || "",
      price: item.price ?? "",
      category: item.category || "popcorn",
      veg: !!item.veg,
      cinemaId: item.cinemaId ? String(item.cinemaId) : "",
      image: item.image || "",
      isAvailable: !!item.isAvailable,
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const name = form.name.trim();
    const priceNum = Number(form.price);
    if (!name) return toast.error("Name is required");
    if (!form.category || !CATEGORIES.includes(form.category))
      return toast.error("Valid category is required");
    if (form.price === "" || Number.isNaN(priceNum) || priceNum < 0)
      return toast.error("Price must be a number >= 0");

    const payload = {
      name,
      description: form.description.trim(),
      price: priceNum,
      category: form.category,
      veg: !!form.veg,
      image: form.image.trim(),
      isAvailable: !!form.isAvailable,
      cinemaId: form.cinemaId || null,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await api.patch(`/fnb/${editingId}`, payload);
        toast.success("Item updated");
      } else {
        await api.post("/fnb", payload);
        toast.success("Item created");
      }
      cancelForm();
      await loadAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailable = async (item) => {
    setBusyId(item._id);
    try {
      await api.patch(`/fnb/${item._id}`, { isAvailable: !item.isAvailable });
      toast.success(item.isAvailable ? "Item hidden" : "Item activated");
      await loadAll();
    } catch (err) {
      toast.error("Failed to update item");
    } finally {
      setBusyId(null);
    }
  };

  const performDelete = async (item) => {
    setBusyId(item._id);
    try {
      await api.delete(`/fnb/${item._id}`);
      toast.success("Item deleted");
      await loadAll();
    } catch (err) {
      toast.error("Failed to delete item");
    } finally {
      setBusyId(null);
      setConfirmTarget(null);
    }
  };

  const columns = [
    {
      key: "image",
      header: "Image",
      render: (it) => {
        const failed = imageErrorIds.has(it._id);
        if (!it.image || failed) {
          return (
            <div
              className="h-12 w-12 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center"
              aria-label="No image"
            >
              <Utensils className="w-5 h-5 text-slate-400" />
            </div>
          );
        }
        return (
          <div className="h-12 w-12 rounded-md overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
            <img
              src={it.image}
              alt={it.name}
              className="h-full w-full object-cover"
              onError={() => markImageError(it._id)}
            />
          </div>
        );
      },
    },
    {
      key: "name",
      header: "Name",
      render: (it) => (
        <div>
          <div className="text-slate-800 font-medium">{it.name}</div>
          {it.description ? (
            <div className="text-xs text-slate-500 truncate max-w-xs">
              {it.description}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (it) => <span className="capitalize text-slate-700">{CATEGORY_LABEL[it.category] || it.category}</span>,
    },
    {
      key: "price",
      header: "Price",
      render: (it) => <span className="text-slate-800 font-medium">{formatINR(it.price)}</span>,
    },
    {
      key: "veg",
      header: "Veg",
      render: (it) => (
        <span
          aria-label={it.veg ? "Vegetarian" : "Non-vegetarian"}
          className={`inline-block h-3 w-3 rounded-sm border ${
            it.veg ? "border-green-600 bg-green-500" : "border-red-600 bg-red-500"
          }`}
        />
      ),
    },
    {
      key: "cinema",
      header: "Cinema",
      render: (it) => (
        <span className="text-slate-700">
          {it.cinemaId ? cinemaNameById.get(String(it.cinemaId)) || "Unknown cinema" : "Chain-wide"}
        </span>
      ),
    },
    {
      key: "active",
      header: "Active",
      render: (it) => (
        <TogglePill
          on={it.isAvailable}
          busy={busyId === it._id}
          onClick={() => handleToggleAvailable(it)}
          onLabel="Active"
          offLabel="Inactive"
          ariaLabel="Toggle availability"
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (it) => (
        <>
          <button
            type="button"
            onClick={() => startEdit(it)}
            disabled={busyId === it._id}
            className={`text-red-600 hover:text-red-700 mr-3 disabled:opacity-60 rounded ${focusRing}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setConfirmTarget(it)}
            disabled={busyId === it._id}
            className={`text-rose-600 hover:text-rose-700 disabled:opacity-60 rounded ${focusRing}`}
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
          title="F&B Menu"
          action={
            <>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items..."
                className={`${inputCls} w-64 ${focusRing}`}
                aria-label="Search F&B items"
              />
              <button
                type="button"
                onClick={() => (showForm ? cancelForm() : startCreate())}
                className={`${showForm ? secondaryBtn : primaryBtn} ${focusRing}`}
              >
                {showForm ? "Cancel" : "+ New Item"}
              </button>
            </>
          }
        />

        {/* Tabs */}
        <div role="tablist" aria-label="F&B categories" className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => {
            const selected = tab === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                id={`fnb-tab-${t.key}`}
                type="button"
                aria-selected={selected}
                aria-controls={`fnb-tabpanel-${t.key}`}
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

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">{editingId ? "Edit Item" : "Create Item"}</h2>

            <Stagger gap={0.05} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StaggerItem>
                <label className="block mb-1 text-sm text-slate-700">Name</label>
                <input name="name" value={form.name} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`} required />
              </StaggerItem>
              <StaggerItem>
                <label className="block mb-1 text-sm text-slate-700">Price (₹)</label>
                <input name="price" type="number" min="0" step="1" value={form.price} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`} required />
              </StaggerItem>
              <StaggerItem>
                <label className="block mb-1 text-sm text-slate-700">Category</label>
                <select name="category" value={form.category} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
                  ))}
                </select>
              </StaggerItem>
              <StaggerItem>
                <label className="block mb-1 text-sm text-slate-700">Cinema</label>
                <select name="cinemaId" value={form.cinemaId} onChange={handleChange} className={`${inputCls} w-full ${focusRing}`}>
                  <option value="">Chain-wide</option>
                  {cinemas.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} — {c.city}</option>
                  ))}
                </select>
              </StaggerItem>
              <StaggerItem className="md:col-span-2">
                <label className="block mb-1 text-sm text-slate-700">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={`w-full px-3 py-2 rounded-md bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20 ${focusRing}`} />
              </StaggerItem>
              <StaggerItem className="md:col-span-2">
                <label className="block mb-1 text-sm text-slate-700">Image URL <span className="text-slate-500">(optional)</span></label>
                <input name="image" value={form.image} onChange={handleChange} placeholder="https://..." className={`${inputCls} w-full ${focusRing}`} />
              </StaggerItem>
              <StaggerItem>
                <div className="flex items-center gap-2">
                  <input id="veg" name="veg" type="checkbox" checked={form.veg} onChange={handleChange} className="h-4 w-4 accent-red-500" />
                  <label htmlFor="veg" className="text-slate-700">Vegetarian</label>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="flex items-center gap-2">
                  <input id="isAvailable" name="isAvailable" type="checkbox" checked={form.isAvailable} onChange={handleChange} className="h-4 w-4 accent-red-500" />
                  <label htmlFor="isAvailable" className="text-slate-700">Available</label>
                </div>
              </StaggerItem>
            </Stagger>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className={`${primaryBtn} ${focusRing}`}>
                {submitting ? (editingId ? "Saving..." : "Creating...") : editingId ? "Save Changes" : "Create"}
              </button>
              <button type="button" onClick={cancelForm} className={`${secondaryBtn} ${focusRing}`}>Cancel</button>
            </div>
          </form>
        )}

        <div
          role="tabpanel"
          id={`fnb-tabpanel-${tab}`}
          aria-labelledby={`fnb-tab-${tab}`}
        >
          <AdminTable
            rows={filtered}
            columns={columns}
            rowKey={(it) => it._id}
            loading={loading}
            emptyIcon={Utensils}
            emptyTitle="No items in this category."
          />
        </div>

        <ConfirmDialog
          open={Boolean(confirmTarget)}
          onClose={() => setConfirmTarget(null)}
          onConfirm={() => confirmTarget && performDelete(confirmTarget)}
          title="Delete this F&B item?"
          message={confirmTarget ? `Soft-delete "${confirmTarget.name}"?` : ""}
          confirmLabel="Delete"
          danger
        />
      </div>
    </PageTransition>
  );
}
