import { CheckCircle, AlertTriangle, XCircle, Circle, Lock } from "lucide-react";

const VARIANT_CLS = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
  cancelled: "bg-rose-100 text-rose-700 border-rose-200",
  pending: "bg-amber-100 text-amber-700 border-amber-500/25",
  locked: "bg-amber-100 text-amber-700 border-amber-500/25",
};

const VARIANT_LABEL = {
  active: "Active",
  inactive: "Inactive",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  pending: "Pending",
  locked: "Locked",
};

const VARIANT_ICON = {
  active: CheckCircle,
  confirmed: CheckCircle,
  inactive: Circle,
  cancelled: XCircle,
  pending: AlertTriangle,
  locked: Lock,
};

export default function StatusBadge({ variant, label, className = "" }) {
  const cls = VARIANT_CLS[variant] || VARIANT_CLS.inactive;
  const text = label ?? VARIANT_LABEL[variant] ?? variant ?? "—";
  const Icon = VARIANT_ICON[variant] || Circle;
  const srPrefix = VARIANT_LABEL[variant] || variant || "Status";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${cls} ${className}`.trim()}
    >
      <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />
      <span className="sr-only">{srPrefix}: </span>
      <span>{text}</span>
    </span>
  );
}
