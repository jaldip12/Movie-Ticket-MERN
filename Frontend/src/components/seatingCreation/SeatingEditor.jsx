import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Armchair,
  Accessibility,
  Heart,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Undo2,
  Redo2,
  Plus,
  Eye,
  EyeOff,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import ConfirmDialog from "@/components/Admin/ConfirmDialog";
import AuditoriumGrid from "@/components/seating/AuditoriumGrid";
import {
  expandSection,
  planStats,
  sectionStats,
} from "@/lib/seatLayout";

const inputCls =
  "w-full h-10 px-3 rounded-md bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20";

const primaryBtn =
  "inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg shadow-sm px-4 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed";

const ghostBtn =
  "inline-flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 rounded-lg px-3 py-2 transition-colors disabled:opacity-50";

const sidebarCardCls =
  "bg-white border border-slate-200 rounded-xl shadow-sm p-5";

// ---------- Templates ----------

const TEMPLATES = [
  {
    key: "single",
    label: "Single block",
    section: { name: "Standard", rows: 10, columns: 12, price: 200, aisles: [6] },
  },
  {
    key: "two-block",
    label: "Two-block hall",
    sections: [
      { name: "Silver", rows: 8, columns: 14, price: 150, aisles: [4, 10] },
      { name: "Gold", rows: 4, columns: 14, price: 250, aisles: [4, 10] },
    ],
  },
  {
    key: "three-block",
    label: "Three-block multiplex (IMAX-style)",
    sections: [
      { name: "EXECUTIVE", rows: 8, columns: 22, price: 170, aisles: [4, 13] },
      { name: "ROYAL", rows: 4, columns: 13, price: 160, aisles: [4] },
      { name: "MARVEL", rows: 2, columns: 13, price: 140, aisles: [4] },
    ],
  },
  {
    key: "recliner",
    label: "Recliner lounge",
    section: {
      name: "Recliner",
      rows: 5,
      columns: 8,
      price: 600,
      aisles: [4],
      seatTypes: Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 8 }, (_, c) => ({
          row: String.fromCharCode(65 + r),
          seat: c + 1,
          type: "recliner",
        }))
      ).flat(),
    },
  },
];

// ---------- Paint modes ----------

const PAINT_MODES = [
  { key: "seat", label: "Seat", color: "emerald", description: "Default bookable seat" },
  { key: "blocked", label: "Blocked", color: "slate", description: "Visible but not bookable (sold-out look)" },
  { key: "unavailable", label: "Unavailable", color: "rose", description: "Physically absent / out of order" },
  { key: "recliner", label: "Recliner", color: "amber", icon: Armchair },
  { key: "wheelchair", label: "Wheelchair", color: "amber", icon: Accessibility },
  { key: "loveseat", label: "Loveseat", color: "amber", icon: Heart },
];

// ---------- Helpers ----------

const cloneSection = (section) => JSON.parse(JSON.stringify(section));
const clonePlan = (sections) => JSON.parse(JSON.stringify(sections));

function emptySection(name = "Section A", rows = 8, columns = 12, price = 200) {
  return {
    name,
    rows,
    columns,
    price,
    aisles: [],
    unavailableSeats: [],
    blockedSeats: [],
    seatTypes: [],
    rowOverrides: [],
    unavailableStyle: "hidden",
    rowLabels: [],
  };
}

// Normalise section after edits — sort + dedupe + drop out-of-range entries
// so the saved doc reflects the current rows × columns bounds. Without this
// clip, shrinking a section (e.g. 8 → 5 rows) would leave orphan F/G/H seat
// types lingering in storage that reappear if the user later grew the
// section back.
function normaliseSection(s) {
  const rowCount = Number.isInteger(s.rows) && s.rows > 0 ? s.rows : 1;
  const colCount = Number.isInteger(s.columns) && s.columns > 0 ? s.columns : 1;
  const validRowLabels = new Set(
    Array.from({ length: rowCount }, (_, i) => {
      // mirror seatLayout.rowLabelFor without importing (avoid cycle).
      let n = i;
      let label = "";
      do {
        label = String.fromCharCode(65 + (n % 26)) + label;
        n = Math.floor(n / 26) - 1;
      } while (n >= 0);
      return label;
    })
  );

  const cleanSeatRefs = (list) =>
    (Array.isArray(list) ? list : [])
      .filter((e) => e?.row && validRowLabels.has(String(e.row)))
      .map((e) => ({
        row: String(e.row),
        seats: Array.from(
          new Set(
            (e.seats || []).filter(
              (n) => Number.isInteger(n) && n >= 1 && n <= colCount
            )
          )
        ).sort((a, b) => a - b),
      }))
      .filter((e) => e.seats.length > 0);

  return {
    ...s,
    aisles: Array.from(
      new Set((s.aisles || []).filter((n) => Number.isInteger(n) && n >= 0 && n < colCount))
    ).sort((a, b) => a - b),
    unavailableSeats: cleanSeatRefs(s.unavailableSeats),
    blockedSeats: cleanSeatRefs(s.blockedSeats),
    seatTypes: (s.seatTypes || []).filter(
      (t) =>
        t?.row &&
        validRowLabels.has(String(t.row)) &&
        Number.isInteger(t.seat) &&
        t.seat >= 1 &&
        t.seat <= colCount
    ),
    rowOverrides: (s.rowOverrides || []).filter(
      (o) => o?.row && validRowLabels.has(String(o.row))
    ),
  };
}

// ---------- Editor ----------

export default function SeatingEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [sections, setSections] = useState([emptySection()]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [paintMode, setPaintMode] = useState("seat");
  const [previewMode, setPreviewMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // section index
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [saving, setSaving] = useState(false);

  // History stack — keep ~50 entries.
  const historyRef = useRef([]);
  const historyIdxRef = useRef(-1);
  const [, forceTick] = useState(0);
  const tick = () => forceTick((n) => n + 1);

  const dirtyRef = useRef(false);

  // ---- Initial load ----
  useEffect(() => {
    if (!id) {
      // Fresh plan — push initial state into history.
      historyRef.current = [{ name: "", sections: clonePlan([emptySection()]) }];
      historyIdxRef.current = 0;
      return;
    }
    (async () => {
      try {
        const { data } = await api.get(`/seating/seatingplans/${id}`);
        const plan = data?.data;
        if (!plan) throw new Error("missing");
        const loadedSections =
          Array.isArray(plan.sections) && plan.sections.length
            ? plan.sections.map((s) => ({ ...emptySection(), ...s }))
            : [emptySection()];
        setName(plan.name || "");
        setSections(loadedSections);
        historyRef.current = [
          { name: plan.name || "", sections: clonePlan(loadedSections) },
        ];
        historyIdxRef.current = 0;
      } catch (err) {
        toast.error("Failed to load seating plan");
      }
    })();
  }, [id]);

  // ---- Browser unsaved-changes guard ----
  useEffect(() => {
    const before = (e) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, []);

  // ---- History ----
  const pushHistory = useCallback((nextName, nextSections) => {
    const snapshot = { name: nextName, sections: clonePlan(nextSections) };
    const trimmed = historyRef.current.slice(0, historyIdxRef.current + 1);
    trimmed.push(snapshot);
    if (trimmed.length > 50) trimmed.shift();
    historyRef.current = trimmed;
    historyIdxRef.current = trimmed.length - 1;
    dirtyRef.current = true;
    tick();
  }, []);

  const undo = () => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current -= 1;
    const snap = historyRef.current[historyIdxRef.current];
    setName(snap.name);
    setSections(clonePlan(snap.sections));
    dirtyRef.current = true;
    tick();
  };

  const redo = () => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current += 1;
    const snap = historyRef.current[historyIdxRef.current];
    setName(snap.name);
    setSections(clonePlan(snap.sections));
    dirtyRef.current = true;
    tick();
  };

  const canUndo = historyIdxRef.current > 0;
  const canRedo = historyIdxRef.current < historyRef.current.length - 1;

  // ---- Mutations ----

  const commit = (nextSections, opts = {}) => {
    setSections(nextSections);
    if (!opts.skipHistory) pushHistory(name, nextSections);
  };

  const renameSection = (idx, value) => {
    const next = sections.map((s, i) => (i === idx ? { ...s, name: value } : s));
    setSections(next); // typing — don't push to history per keystroke
    dirtyRef.current = true;
  };
  const commitSectionRename = () => {
    pushHistory(name, sections);
  };

  const setSectionField = (idx, field, value) => {
    const next = sections.map((s, i) => (i === idx ? { ...s, [field]: value } : s));
    commit(next);
  };

  const addSection = (template) => {
    const base = template
      ? { ...emptySection(), ...cloneSection(template) }
      : emptySection(`Section ${String.fromCharCode(65 + sections.length)}`);
    const next = [...sections, base];
    commit(next);
    setActiveIdx(next.length - 1);
  };

  const applyTemplate = (templateKey) => {
    const tpl = TEMPLATES.find((t) => t.key === templateKey);
    if (!tpl) return;
    const next = (
      tpl.sections
        ? tpl.sections.map((s) => ({ ...emptySection(), ...cloneSection(s) }))
        : [{ ...emptySection(), ...cloneSection(tpl.section) }]
    );
    commit(next);
    setActiveIdx(0);
  };

  const removeSection = (idx) => {
    if (sections.length <= 1) {
      toast.error("Layout must have at least one section");
      return;
    }
    const next = sections.filter((_, i) => i !== idx);
    commit(next);
    setActiveIdx((cur) => Math.min(cur, next.length - 1));
    setConfirmDelete(null);
  };

  const duplicateSection = (idx) => {
    const copy = cloneSection(sections[idx]);
    copy.name = `${copy.name} copy`;
    const next = [...sections.slice(0, idx + 1), copy, ...sections.slice(idx + 1)];
    commit(next);
    setActiveIdx(idx + 1);
  };

  const moveSection = (idx, delta) => {
    const target = idx + delta;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[idx], next[target]] = [next[target], next[idx]];
    commit(next);
    setActiveIdx(target);
  };

  // ---- Aisle column toggle (paint = "aisle"-like; clicking column header toggles) ----
  const toggleAisle = (idx, columnIdx) => {
    const next = sections.map((s, i) => {
      if (i !== idx) return s;
      const set = new Set(s.aisles || []);
      if (set.has(columnIdx)) set.delete(columnIdx);
      else set.add(columnIdx);
      return { ...s, aisles: Array.from(set).sort((a, b) => a - b) };
    });
    commit(next);
  };

  // ---- Paint a single seat with current mode ----
  const paintSeat = (idx, rowLabel, seatNum) => {
    const next = sections.map((s, i) => {
      if (i !== idx) return s;
      const updated = { ...s };
      const rmFromRefs = (key) => {
        const list = (updated[key] || []).map((e) => ({
          row: e.row,
          seats: e.seats?.filter((n) => !(e.row === rowLabel && n === seatNum)),
        }));
        // Remove seats matching (rowLabel,seatNum)
        updated[key] = list
          .map((e) =>
            e.row === rowLabel
              ? { row: e.row, seats: (e.seats || []).filter((n) => n !== seatNum) }
              : e
          )
          .filter((e) => (e.seats || []).length > 0);
      };
      const addToRefs = (key) => {
        const list = updated[key] ? [...updated[key]] : [];
        const existing = list.find((e) => e.row === rowLabel);
        if (existing) {
          if (!existing.seats.includes(seatNum)) {
            existing.seats = [...existing.seats, seatNum].sort((a, b) => a - b);
          }
        } else {
          list.push({ row: rowLabel, seats: [seatNum] });
        }
        updated[key] = list;
      };
      const setSeatType = (typeOrNull) => {
        const list = (updated.seatTypes || []).filter(
          (t) => !(t.row === rowLabel && t.seat === seatNum)
        );
        if (typeOrNull) {
          list.push({ row: rowLabel, seat: seatNum, type: typeOrNull });
        }
        updated.seatTypes = list;
      };

      if (paintMode === "seat") {
        rmFromRefs("blockedSeats");
        rmFromRefs("unavailableSeats");
        setSeatType(null);
      } else if (paintMode === "blocked") {
        rmFromRefs("unavailableSeats");
        setSeatType(null);
        addToRefs("blockedSeats");
      } else if (paintMode === "unavailable") {
        rmFromRefs("blockedSeats");
        setSeatType(null);
        addToRefs("unavailableSeats");
      } else if (
        paintMode === "recliner" ||
        paintMode === "wheelchair" ||
        paintMode === "loveseat"
      ) {
        rmFromRefs("blockedSeats");
        rmFromRefs("unavailableSeats");
        setSeatType(paintMode);
      }
      return updated;
    });
    commit(next);
  };

  // ---- Save / discard ----
  const handleSave = async () => {
    if (!name.trim()) return toast.error("Plan name is required");
    if (!sections.length) return toast.error("At least one section is required");
    if (saving) return;
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        sections: sections.map(normaliseSection),
      };
      if (id) {
        const res = await api.put(`/seating/seatingplans/${id}`, payload);
        toast.success(res.data?.message || "Layout updated");
      } else {
        const res = await api.post("/seating/seatingplans", payload);
        toast.success(res.data?.message || "Layout created");
        const newId = res.data?.data?.id;
        if (newId) navigate(`/admin/seating/edit/${newId}`, { replace: true });
      }
      dirtyRef.current = false;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save layout");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (!dirtyRef.current) {
      navigate("/admin/seating");
      return;
    }
    setConfirmDiscard(true);
  };
  const reallyDiscard = () => {
    setConfirmDiscard(false);
    navigate("/admin/seating");
  };

  // ---- Derived ----
  const stats = useMemo(() => planStats({ sections }), [sections]);
  const activeSection = sections[activeIdx];
  const activeStats = useMemo(
    () => (activeSection ? sectionStats(activeSection) : { seats: 0, gross: 0 }),
    [activeSection]
  );
  // Build the shape AuditoriumGrid wants: [{ section, rows, ... }]. We force
  // unavailable cells to render in editor mode (admin needs to click them to
  // restore); the customer renderer leaves the section's own setting alone.
  const sectionsForGrid = useMemo(
    () =>
      sections.map((s) => ({
        section: s,
        ...expandSection(s, { forceUnavailableVisible: !previewMode }),
      })),
    [sections, previewMode]
  );

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const onKey = (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (meta && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Render ----

  return (
    <div className="max-w-[1400px] mx-auto pb-12">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            {id ? "Edit Seating Plan" : "New Seating Plan"}
          </h1>
          <p className="text-slate-500 text-sm">
            {stats.sectionCount} section{stats.sectionCount === 1 ? "" : "s"}
            {" · "}
            {stats.seats} seats
            {" · "}
            ₹{stats.gross.toLocaleString("en-IN")} max gross
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className={ghostBtn}
            title="Undo (⌘Z)"
            aria-label="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className={ghostBtn}
            title="Redo (⌘⇧Z)"
            aria-label="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode((p) => !p)}
            className={ghostBtn}
            title="Toggle preview mode"
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? "Exit preview" : "Preview"}
          </button>
          <button type="button" onClick={handleDiscard} className={ghostBtn}>
            Cancel
          </button>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim() || !sections.length}
            className={primaryBtn}
          >
            {saving ? "Saving…" : id ? "Save changes" : "Create layout"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        {/* ===== Sidebar ===== */}
        <div className="space-y-4">
          <div className={sidebarCardCls}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Plan
            </h3>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                dirtyRef.current = true;
              }}
              onBlur={() => pushHistory(name, sections)}
              placeholder="e.g. Audi 3 — IMAX"
              className={inputCls}
            />
          </div>

          {/* Templates — only on a fresh new plan, before the user has touched
              anything. Hidden when editing an existing layout (otherwise a
              one-section saved hall like Recliner Lounge would offer to wipe
              itself). */}
          {!id && !dirtyRef.current && sections.length === 1 && (
            <div className={sidebarCardCls}>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" /> Start from a template
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => applyTemplate(t.key)}
                    className="text-left px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:border-red-300 hover:bg-red-500/[0.05] text-slate-900 text-sm transition-colors"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sections list */}
          <div className={sidebarCardCls}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sections
              </h3>
              <button
                type="button"
                onClick={() => addSection()}
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                title="Add section"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {sections.map((s, i) => {
                const ss = sectionStats(s);
                return (
                  <div
                    key={i}
                    className={`rounded-lg border ${
                      i === activeIdx
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200 bg-slate-50"
                    } p-3`}
                  >
                    <button
                      type="button"
                      className="block w-full text-left"
                      onClick={() => setActiveIdx(i)}
                    >
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {s.name || "(unnamed)"}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {s.rows}×{s.columns} · ₹{s.price} · {ss.seats} seats
                      </div>
                    </button>
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        type="button"
                        onClick={() => moveSection(i, -1)}
                        disabled={i === 0}
                        className={ghostBtn + " px-2 py-1"}
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(i, 1)}
                        disabled={i === sections.length - 1}
                        className={ghostBtn + " px-2 py-1"}
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateSection(i)}
                        className={ghostBtn + " px-2 py-1"}
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(i)}
                        disabled={sections.length <= 1}
                        className="ml-auto text-rose-600 hover:text-rose-700 px-2 py-1 disabled:opacity-40"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active-section properties */}
          {activeSection && (
            <div className={sidebarCardCls}>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Section properties
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 mb-1 block">
                    Name
                  </label>
                  <input
                    type="text"
                    value={activeSection.name}
                    onChange={(e) => renameSection(activeIdx, e.target.value)}
                    onBlur={commitSectionRename}
                    className={inputCls}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 mb-1 block">
                      Rows
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={activeSection.rows}
                      onChange={(e) =>
                        setSectionField(
                          activeIdx,
                          "rows",
                          Math.max(1, Number(e.target.value) || 1)
                        )
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 mb-1 block">
                      Columns
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={activeSection.columns}
                      onChange={(e) =>
                        setSectionField(
                          activeIdx,
                          "columns",
                          Math.max(1, Number(e.target.value) || 1)
                        )
                      }
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 mb-1 block">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={activeSection.price}
                    onChange={(e) =>
                      setSectionField(
                        activeIdx,
                        "price",
                        Math.max(0, Number(e.target.value) || 0)
                      )
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 mb-1 block">
                    Aisles after columns (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={(activeSection.aisles || []).join(", ")}
                    onChange={(e) => {
                      const cols = e.target.value
                        .split(/[,\s]+/)
                        .map((s) => Number(s.trim()))
                        .filter((n) => Number.isInteger(n) && n >= 0);
                      setSectionField(activeIdx, "aisles", cols);
                    }}
                    placeholder="e.g. 4, 13"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 mb-1 block">
                    Unavailable style
                  </label>
                  <select
                    value={activeSection.unavailableStyle || "hidden"}
                    onChange={(e) =>
                      setSectionField(activeIdx, "unavailableStyle", e.target.value)
                    }
                    className={inputCls}
                  >
                    <option value="hidden">Hidden (gap)</option>
                    <option value="broken">Broken (faded cell)</option>
                  </select>
                </div>
                <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2">
                  Section: <span className="text-slate-900 font-semibold">{activeStats.seats}</span> seats ·{" "}
                  ₹<span className="text-slate-900 font-semibold">{activeStats.gross.toLocaleString("en-IN")}</span> max
                </div>
              </div>
            </div>
          )}

          {/* Paint toolbar */}
          {!previewMode && (
            <div className={sidebarCardCls}>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Click-to-paint
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {PAINT_MODES.map((m) => {
                  const Icon = m.icon;
                  const active = paintMode === m.key;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setPaintMode(m.key)}
                      className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        active
                          ? "border-red-500/50 bg-red-100 text-red-700"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                      }`}
                      title={m.description || m.label}
                    >
                      {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
                      {m.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-3">
                Click a seat to apply. Click the column number above the grid to toggle an aisle.
              </p>
            </div>
          )}
        </div>

        {/* ===== Canvas ===== */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-hidden">
          {!sections.length ? (
            <div className="text-center text-slate-500 py-16">No sections.</div>
          ) : (
            <div className="overflow-x-auto">
              <AuditoriumGrid
                sections={sectionsForGrid}
                theme="light"
                activeIdx={activeIdx}
                previewMode={previewMode}
                showColumnHeaders={!previewMode}
                onSectionClick={(idx) => setActiveIdx(idx)}
                onAisleToggleClick={(idx, col) => {
                  if (idx !== activeIdx) setActiveIdx(idx);
                  toggleAisle(idx, col);
                }}
                renderCell={({ sectionIdx, cell }) => (
                  <EditorCell
                    cell={cell}
                    previewMode={previewMode}
                    onClick={
                      previewMode || cell.kind === "aisle" || cell.kind === "empty"
                        ? undefined
                        : () => {
                            if (sectionIdx !== activeIdx) setActiveIdx(sectionIdx);
                            paintSeat(sectionIdx, cell.row, cell.num);
                          }
                    }
                  />
                )}
              />
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => removeSection(confirmDelete)}
        title="Delete this section?"
        message={
          confirmDelete !== null
            ? `Remove "${sections[confirmDelete]?.name}" — ${
                sectionStats(sections[confirmDelete] || {}).seats
              } seats?`
            : ""
        }
        confirmLabel="Delete"
        danger
      />
      <ConfirmDialog
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        onConfirm={reallyDiscard}
        title="Discard unsaved changes?"
        message="You'll lose any edits since the last save."
        confirmLabel="Discard"
        danger
      />
    </div>
  );
}

// ---------- Cell renderer ----------

function EditorCell({ cell, previewMode, onClick }) {
  if (cell.kind === "aisle") return <div className="w-4 sm:w-5 shrink-0" />;
  if (cell.kind === "empty") return <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" />;
  if (cell.kind === "broken") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={previewMode}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center shrink-0"
        title={`${cell.row}${cell.num} - out of order (click to restore)`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      </button>
    );
  }
  if (cell.kind === "blocked") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={previewMode}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-slate-100 border border-slate-300 text-slate-500 text-[11px] font-semibold tabular-nums shrink-0"
        title={`${cell.row}${cell.num} - blocked (click to restore)`}
      >
        {cell.num}
      </button>
    );
  }

  // seat
  const Icon =
    cell.type === "recliner"
      ? Armchair
      : cell.type === "wheelchair"
      ? Accessibility
      : cell.type === "loveseat" || cell.type === "companion"
      ? Heart
      : null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={previewMode}
      className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-white border border-emerald-500 hover:border-red-500 hover:bg-red-50 text-emerald-700 hover:text-red-700 text-[11px] font-bold tabular-nums shrink-0 transition-colors"
      title={`${cell.row}${cell.num} · ₹${cell.price}${cell.type !== "regular" ? ` · ${cell.type}` : ""}`}
    >
      {Icon ? (
        <Icon
          className="w-3.5 h-3.5 absolute -top-1 -right-1 text-amber-500"
          strokeWidth={2.5}
        />
      ) : null}
      {cell.num}
    </button>
  );
}

