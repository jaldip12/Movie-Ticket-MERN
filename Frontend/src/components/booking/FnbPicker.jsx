import { useEffect, useId, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  UtensilsCrossed,
} from "lucide-react";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { Stagger, StaggerItem } from "@/components/ui/Motion";
import { easeOutExpo } from "@/lib/motion";

const CATEGORY_LABELS = {
  popcorn: "Popcorn",
  drinks: "Drinks",
  snacks: "Snacks",
  combo: "Combos",
};

const CATEGORY_ORDER = ["combo", "popcorn", "drinks", "snacks"];

const formatPrice = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const cardShell =
  "rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl";

export default function FnbPicker({ cinemaId, onChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({}); // itemId -> quantity
  const [openCategories, setOpenCategories] = useState({});
  const [imgErrors, setImgErrors] = useState({}); // itemId -> true if image failed
  const [liveMessage, setLiveMessage] = useState("");
  const livePrevQtys = useRef({});

  // Fetch items on mount / cinemaId change
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = cinemaId ? `/fnb?cinemaId=${cinemaId}` : "/fnb";
        const res = await api.get(url);
        if (cancelled) return;
        const list = res.data?.data ?? [];
        setItems(list);
        // Auto-open categories that contain items so users can see options
        const categoriesPresent = {};
        for (const it of list) {
          categoriesPresent[it.category] = true;
        }
        setOpenCategories(categoriesPresent);
      } catch (err) {
        if (cancelled) return;
        setError("Failed to load add-ons");
        toast.error("Failed to load add-ons");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [cinemaId]);

  // Group items by category
  const grouped = useMemo(() => {
    const map = {};
    for (const it of items) {
      const key = it.category || "snacks";
      if (!map[key]) map[key] = [];
      map[key].push(it);
    }
    return map;
  }, [items]);

  const orderedCategories = useMemo(() => {
    const present = Object.keys(grouped);
    const ordered = CATEGORY_ORDER.filter((c) => present.includes(c));
    // Append any unknown categories at the end (defensive)
    for (const c of present) {
      if (!ordered.includes(c)) ordered.push(c);
    }
    return ordered;
  }, [grouped]);

  // Emit changes upward whenever quantities change. Also produce a
  // screen-reader-friendly "Added X to cart" announcement on increments.
  useEffect(() => {
    if (!onChange) return;
    const selected = items
      .filter((it) => (quantities[it._id] || 0) > 0)
      .map((it) => ({
        itemId: it._id,
        name: it.name,
        price: it.price,
        quantity: quantities[it._id],
      }));
    onChange(selected);

    // Announce the most recent quantity change (one item per tick).
    const prev = livePrevQtys.current;
    for (const it of items) {
      const before = prev[it._id] || 0;
      const after = quantities[it._id] || 0;
      if (after > before) {
        setLiveMessage(`Added ${it.name} to cart`);
        break;
      }
      if (after < before && after === 0) {
        setLiveMessage(`Removed ${it.name} from cart`);
        break;
      }
    }
    const snapshot = {};
    for (const it of items) snapshot[it._id] = quantities[it._id] || 0;
    livePrevQtys.current = snapshot;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantities, items]);

  const setQty = (itemId, next) => {
    setQuantities((prev) => {
      const clamped = Math.max(0, Math.min(99, next));
      const out = { ...prev };
      if (clamped === 0) {
        delete out[itemId];
      } else {
        out[itemId] = clamped;
      }
      return out;
    });
  };

  const inc = (itemId) => setQty(itemId, (quantities[itemId] || 0) + 1);
  const dec = (itemId) => setQty(itemId, (quantities[itemId] || 0) - 1);

  const toggleCategory = (cat) =>
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));

  if (loading) {
    return (
      <div className={`${cardShell} p-6 flex items-center justify-center`}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${cardShell} p-6 text-slate-400 text-sm`}>{error}</div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className={`${cardShell} p-6 text-center`}>
        <UtensilsCrossed className="h-6 w-6 text-slate-500 mx-auto mb-2" />
        <p className="text-slate-400 text-sm">No add-ons available</p>
      </div>
    );
  }

  return (
    <div className={`${cardShell} overflow-hidden`}>
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            Add Food &amp; Beverages
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pick up at the counter using your booking PIN
          </p>
        </div>
      </div>

      {/* Screen-reader-only live region for cart change announcements */}
      <div className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </div>

      <div className="divide-y divide-slate-200">
        {orderedCategories.map((cat) => {
          const list = grouped[cat] || [];
          const open = !!openCategories[cat];
          const selectedInCat = list.reduce(
            (sum, it) => sum + (quantities[it._id] || 0),
            0,
          );

          return (
            <CategoryBlock
              key={cat}
              cat={cat}
              list={list}
              open={open}
              selectedInCat={selectedInCat}
              quantities={quantities}
              imgErrors={imgErrors}
              onToggle={() => toggleCategory(cat)}
              onInc={inc}
              onDec={dec}
              onImageError={(id) =>
                setImgErrors((prev) =>
                  prev[id] ? prev : { ...prev, [id]: true },
                )
              }
            />
          );
        })}
      </div>
    </div>
  );
}

function CategoryBlock({
  cat,
  list,
  open,
  selectedInCat,
  quantities,
  imgErrors,
  onToggle,
  onInc,
  onDec,
  onImageError,
}) {
  const panelId = useId();
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-slate-900 font-medium">
            {CATEGORY_LABELS[cat] || cat}
          </span>
          <span className="text-xs text-slate-500">({list.length})</span>
          {selectedInCat > 0 && (
            <span className="bg-red-100 text-red-700 border border-red-200 text-[11px] font-semibold px-2 py-0.5 rounded-full">
              {selectedInCat} selected
            </span>
          )}
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: easeOutExpo }}
          className="inline-flex"
          aria-hidden="true"
        >
          {/* Single chevron rotates between states for smoother motion */}
          {open ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: easeOutExpo }}
            className="overflow-hidden"
          >
            <Stagger
              gap={0.04}
              className="px-5 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {list.map((item) => {
                const qty = quantities[item._id] || 0;
                const isSelected = qty > 0;
                const showImage = item.image && !imgErrors[item._id];
                return (
                  <StaggerItem key={item._id} y={8}>
                    <div
                      className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                        isSelected
                          ? "bg-red-50 border-red-200 hover:bg-red-100/60"
                          : "bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300"
                      }`}
                    >
                      {/* Image / fallback */}
                      <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                        {showImage ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            onError={() => onImageError(item._id)}
                          />
                        ) : (
                          <div
                            role="img"
                            aria-label={item.name}
                            className="h-full w-full flex items-center justify-center"
                          >
                            <UtensilsCrossed className="h-6 w-6 text-slate-600" />
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {/* Veg / non-veg dot — green/red kept as a real semantic */}
                          <span
                            aria-label={
                              item.veg ? "Vegetarian" : "Non-vegetarian"
                            }
                            title={item.veg ? "Vegetarian" : "Non-vegetarian"}
                            className={`inline-block h-3 w-3 rounded-sm border ${
                              item.veg ? "border-green-500" : "border-red-500"
                            }`}
                          >
                            <span
                              className={`block h-full w-full rounded-sm m-0 ${
                                item.veg ? "bg-green-500" : "bg-red-500"
                              }`}
                              style={{ transform: "scale(0.55)" }}
                            />
                          </span>
                          <span className="text-slate-900 font-medium truncate">
                            {item.name}
                          </span>
                        </div>
                        {item.description ? (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        ) : null}
                        <div className="text-slate-900 font-semibold mt-1 text-sm">
                          {formatPrice(item.price)}
                        </div>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center gap-2 shrink-0">
                        <motion.button
                          type="button"
                          onClick={() => onDec(item._id)}
                          disabled={qty === 0}
                          whileTap={{ scale: 0.92 }}
                          aria-label={`Decrease ${item.name}`}
                          className="h-8 w-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-800 bg-slate-50 hover:bg-red-100 hover:text-red-700 hover:border-red-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-50 disabled:hover:text-slate-800 disabled:hover:border-slate-200 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </motion.button>
                        <span className="w-7 text-center font-semibold text-slate-900 tabular-nums overflow-hidden inline-block">
                          <AnimatePresence mode="popLayout" initial={false}>
                            <motion.span
                              key={qty}
                              initial={{ y: 8, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -8, opacity: 0 }}
                              transition={{
                                duration: 0.2,
                                ease: easeOutExpo,
                              }}
                              className="inline-block"
                            >
                              {qty}
                            </motion.span>
                          </AnimatePresence>
                        </span>
                        <motion.button
                          type="button"
                          onClick={() => onInc(item._id)}
                          whileTap={{ scale: 0.92 }}
                          aria-label={`Increase ${item.name}`}
                          className="h-8 w-8 flex items-center justify-center rounded-md text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-lg transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
