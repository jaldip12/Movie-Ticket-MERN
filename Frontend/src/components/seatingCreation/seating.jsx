import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "@/components/Admin/ConfirmDialog";
import {
  PageTransition,
  Stagger,
  StaggerItem,
  HoverLift,
} from "@/components/ui/Motion";

const primaryBtn =
  "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg shadow-sm px-4 py-2 transition-all";

const secondaryBtn =
  "bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 rounded-lg px-4 py-2 transition-colors";

const formatDateTime = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "—";
  }
};

const truncateId = (id) => {
  if (!id) return "";
  const s = String(id);
  return s.length > 6 ? `${s.slice(0, 6)}…` : s;
};

const SeatingPlans = () => {
  const [seatingPlans, setSeatingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    fetchSeatingPlans();
  }, []);

  const fetchSeatingPlans = async () => {
    setLoading(true);
    try {
      const response = await api.get("/seating/seatingplans");
      if (response.data.statusCode === 200) {
        setSeatingPlans(response.data.data);
      } else if (response.data.statusCode === 404) {
        setSeatingPlans([]);
      }
    } catch (error) {
      setSeatingPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // Escape-to-close + initial focus for the Create Plan modal.
  useEffect(() => {
    if (!showPopup) return;
    const id = requestAnimationFrame(() => nameInputRef.current?.focus());
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowPopup(false);
        setNewPlanName("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [showPopup]);

  const handleViewEdit = (id) => {
    navigate(`/admin/seating/edit/${id}`);
  };

  const handleCreateNew = () => {
    setShowPopup(true);
  };

  const handleCreateAndSave = async () => {
    try {
      if (!newPlanName.trim()) {
        toast.error("Please enter a plan name");
        return;
      }

      const newPlan = {
        name: newPlanName.trim(),
        sections: [
          {
            name: "Default Section",
            rows: 10,
            columns: 10,
            price: 100,
            unavailableSeats: [],
          },
        ],
      };

      const response = await api.post("/seating/seatingplans", newPlan);

      if (response.data.statusCode === 201) {
        await fetchSeatingPlans();
        setShowPopup(false);
        setNewPlanName("");
        navigate(`/admin/seating/edit/${response.data.data.id}`);
      } else {
        toast.error(
          response.data.message ||
            "Failed to create seating plan. Please try again."
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create seating plan. Please try again."
      );
    }
  };

  const performDelete = async (plan) => {
    try {
      const response = await api.delete(`/seating/seatingplans/${plan.id}`);
      if (response.data.statusCode === 200) {
        toast.success("Seating plan deleted");
        await fetchSeatingPlans();
      } else {
        toast.error("Failed to delete seating plan");
      }
    } catch (error) {
      toast.error("Failed to delete seating plan");
    } finally {
      setConfirmDelete(null);
    }
  };

  const filteredPlans = seatingPlans.filter((plan) =>
    (plan.name || "").toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const closeCreateModal = () => {
    setShowPopup(false);
    setNewPlanName("");
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Seating Plans
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              Total Plans: {seatingPlans.length}
            </span>
            <Button
              onClick={handleCreateNew}
              className={`${primaryBtn} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2`}
            >
              + Create New Plan
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search plans by name…"
            aria-label="Search plans by name"
            className="w-full h-10 pl-9 pr-3 rounded-md bg-white border border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20"
          />
        </div>

        <AnimatePresence>
          {showPopup && (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={closeCreateModal}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                aria-hidden="true"
              />
              <motion.div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-plan-title"
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl p-6"
              >
                <h2
                  id="create-plan-title"
                  className="text-xl font-semibold mb-4 text-slate-900"
                >
                  Create Seating Plan
                </h2>
                <div className="mb-5">
                  <label
                    htmlFor="new-plan-name"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Plan Name
                  </label>
                  <input
                    id="new-plan-name"
                    ref={nameInputRef}
                    type="text"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    placeholder="Enter seating plan name"
                    className="w-full h-10 px-3 rounded-md bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateAndSave();
                      }
                    }}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={closeCreateModal}
                    className={`${secondaryBtn} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2`}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleCreateAndSave}
                    className={`${primaryBtn} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2`}
                  >
                    Create &amp; Save
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-5 w-48 bg-slate-100 mb-2" />
                  <Skeleton className="h-3 w-64 bg-slate-100" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-28 bg-slate-100 rounded-lg" />
                  <Skeleton className="h-9 w-16 bg-slate-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : seatingPlans.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-10 text-center text-slate-500">
            No seating plans yet. Create your first one.
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-10 text-center text-slate-500">
            No plans match “{searchTerm}”.
          </div>
        ) : (
          <Stagger asScroll gap={0.04} className="space-y-3">
            {filteredPlans.map((plan) => (
              <StaggerItem key={plan.id}>
                <HoverLift
                  whileHover={{
                    y: -2,
                    transition: { type: "spring", stiffness: 380, damping: 30 },
                  }}
                >
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-slate-300 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900 truncate">
                          {plan.name}
                        </h3>
                        <span
                          title={`#${plan.id}`}
                          className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono text-[10px] text-slate-600"
                        >
                          #{truncateId(plan.id)}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-0.5">
                        <span>Created: {formatDateTime(plan.createdAt)}</span>
                        <span>Updated: {formatDateTime(plan.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        onClick={() => handleViewEdit(plan.id)}
                        className={`${primaryBtn} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2`}
                      >
                        View &amp; Edit
                      </Button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(plan)}
                        className="text-rose-600 hover:text-rose-700 px-3 py-2 text-sm font-medium rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </HoverLift>
              </StaggerItem>
            ))}
          </Stagger>
        )}

        <ConfirmDialog
          open={Boolean(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => confirmDelete && performDelete(confirmDelete)}
          title="Delete this seating plan?"
          message={
            confirmDelete
              ? `Permanently remove "${confirmDelete.name}"? Any screen using it will need a new layout.`
              : ""
          }
          confirmLabel="Delete"
          danger
        />
      </div>
    </PageTransition>
  );
};

export default SeatingPlans;
