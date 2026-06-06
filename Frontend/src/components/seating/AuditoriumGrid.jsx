/**
 * Shared centered-auditorium renderer used by both the customer booking page
 * (light theme) and the admin seating editor (dark theme).
 *
 * Rendering convention (matches BookMyShow / Distrik / PVR):
 *   ┌──────────────── auditorium card ────────────────┐
 *   │  ─────── ₹500 VIP ──────────                     │  ← header divider
 *   │  M       1 2 3 4 5 6 7 8 9 10 11 12       (pad)  │  ← centered seats
 *   │                                                   │
 *   │  ─────── ₹290 PREMIUM ──────                     │
 *   │  L       1 2 3 4 5 . . . 16                       │
 *   │  K       1 2 3 4 5 . . . 16                       │
 *   │  ...                                              │
 *   └───────────────────────────────────────────────────┘
 *                          ▼ SCREEN ▼
 *
 * The grid is a 3-column layout per row: [label | seats | spacer]. The seats
 * column is `1fr` and uses `justify-center` so narrower sections center within
 * the auditorium width. The spacer mirrors the label column so the seats
 * column is truly centred (not biased by an asymmetric label column).
 *
 * The auditorium width auto-sizes to the widest section via `w-fit` on the
 * outer container; narrower sections all stretch to that width via block-level
 * children, keeping their seats centred.
 */

import { Fragment } from "react";

const LABEL_COL_PX = 28;

const THEMES = {
  dark: {
    divider: "bg-white/[0.08]",
    sectionTitle: "text-slate-800",
    price: "text-red-600",
    rowLabel: "text-red-600/80",
    activeRing: "ring-red-500/40",
    activeBg: "bg-red-50",
    activeShadow: "shadow-[0_0_30px_rgba(239,68,68,0.15)]",
    inactiveOpacity: "opacity-60 hover:opacity-90",
    columnHeader: "text-slate-400 hover:text-red-700",
    columnHeaderDisabled: "text-slate-500",
    screenBorder: "border-sky-400/40",
    screenGradient:
      "bg-gradient-to-b from-sky-300/15 via-sky-300/8 to-transparent",
    screenCaption: "text-slate-500",
  },
  light: {
    divider: "bg-slate-200",
    sectionTitle: "text-slate-800",
    price: "text-slate-800",
    rowLabel: "text-slate-700",
    activeRing: "ring-emerald-500/50",
    activeBg: "bg-emerald-50",
    activeShadow: "shadow-[0_0_30px_rgba(16,185,129,0.1)]",
    inactiveOpacity: "opacity-50 hover:opacity-80",
    columnHeader: "text-slate-500 hover:text-emerald-600",
    columnHeaderDisabled: "text-slate-400",
    screenBorder: "border-sky-300",
    screenGradient: "bg-gradient-to-b from-sky-100 via-sky-50 to-transparent",
    screenCaption: "text-slate-400",
  },
};

export default function AuditoriumGrid({
  sections,
  renderCell,
  activeIdx = null,
  onSectionClick,
  onAisleToggleClick,
  showColumnHeaders = false,
  previewMode = false,
  showScreen = true,
  theme = "dark",
}) {
  const t = THEMES[theme] || THEMES.dark;
  return (
    <div className="w-fit mx-auto">
      <div className="flex flex-col gap-5">
        {sections.map(({ section, rows }, sectionIdx) => {
          const isActive = activeIdx === sectionIdx;
          const otherActive = activeIdx !== null && !isActive;

          const sectionTone = previewMode
            ? ""
            : isActive
            ? `ring-2 ${t.activeRing} ${t.activeBg} ${t.activeShadow}`
            : otherActive
            ? `${t.inactiveOpacity} cursor-pointer`
            : "";

          const handleSectionClick =
            !previewMode && onSectionClick && !isActive
              ? () => onSectionClick(sectionIdx)
              : undefined;

          return (
            <div
              key={sectionIdx}
              onClick={handleSectionClick}
              className={`rounded-xl px-2 py-3 transition-all ${sectionTone}`}
            >
              <SectionHeader
                name={section.name}
                price={section.price}
                tokens={t}
              />

              {showColumnHeaders && (
                <ColumnHeader
                  totalCols={section.columns}
                  aisles={section.aisles}
                  previewMode={previewMode}
                  tokens={t}
                  onAisleToggleClick={
                    onAisleToggleClick
                      ? (col) => onAisleToggleClick(sectionIdx, col)
                      : undefined
                  }
                />
              )}

              <div className="flex flex-col gap-1.5 mt-2">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="grid items-center gap-x-2"
                    style={{
                      gridTemplateColumns: `${LABEL_COL_PX}px 1fr ${LABEL_COL_PX}px`,
                    }}
                  >
                    <RowLabel label={row.label} tokens={t} />
                    <div className="flex items-center justify-center gap-1">
                      {row.cells.map((cell, ci) => (
                        <Fragment key={`${row.label}-${ci}`}>
                          {renderCell({
                            sectionIdx,
                            cell,
                            rowLabel: row.label,
                            ci,
                          })}
                        </Fragment>
                      ))}
                    </div>
                    <div aria-hidden="true" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showScreen && <ScreenGraphic tokens={t} />}
    </div>
  );
}

function SectionHeader({ name, price, tokens }) {
  return (
    <div className="flex items-center gap-3 px-1 mb-1">
      <div className={`flex-1 h-px ${tokens.divider}`} />
      <span
        className={`text-[12px] sm:text-sm font-semibold whitespace-nowrap ${tokens.sectionTitle} tracking-wide`}
      >
        <span className={tokens.price}>₹{price}</span>
        <span className="ml-2">{name}</span>
      </span>
      <div className={`flex-1 h-px ${tokens.divider}`} />
    </div>
  );
}

function RowLabel({ label, tokens }) {
  return (
    <div
      className={`flex items-center justify-center text-[11px] font-semibold ${tokens.rowLabel} select-none`}
    >
      {label}
    </div>
  );
}

function ColumnHeader({
  totalCols,
  aisles,
  previewMode,
  tokens,
  onAisleToggleClick,
}) {
  const aisleSet = new Set(Array.isArray(aisles) ? aisles : []);
  const items = [];
  for (let c = 1; c <= totalCols; c += 1) {
    if (aisleSet.has(c - 1)) {
      items.push(<div key={`gap-${c}`} className="w-3 shrink-0" />);
    }
    items.push(
      <button
        key={`hdr-${c}`}
        type="button"
        disabled={previewMode || !onAisleToggleClick}
        onClick={onAisleToggleClick ? () => onAisleToggleClick(c) : undefined}
        className={`w-7 sm:w-8 text-[10px] tabular-nums shrink-0 text-center ${
          previewMode || !onAisleToggleClick
            ? `${tokens.columnHeaderDisabled} cursor-default`
            : `${tokens.columnHeader} cursor-pointer`
        }`}
        title={
          onAisleToggleClick && !previewMode
            ? `Click to toggle aisle after column ${c}`
            : `Column ${c}`
        }
      >
        {c}
      </button>
    );
  }
  return (
    <div
      className="grid items-center gap-x-2"
      style={{
        gridTemplateColumns: `${LABEL_COL_PX}px 1fr ${LABEL_COL_PX}px`,
      }}
    >
      <div aria-hidden="true" />
      <div className="flex items-center justify-center gap-1">{items}</div>
      <div aria-hidden="true" />
    </div>
  );
}

function ScreenGraphic({ tokens }) {
  return (
    <div className="mt-10 mb-2 flex flex-col items-center">
      <div
        className={`w-3/4 max-w-md h-10 ${tokens.screenGradient} border-t ${tokens.screenBorder}`}
        style={{ borderRadius: "60% 60% 0 0 / 100% 100% 0 0" }}
        aria-hidden="true"
      />
      <p className={`text-[11px] ${tokens.screenCaption} mt-2 tracking-wider`}>
        All eyes this way please
      </p>
    </div>
  );
}
