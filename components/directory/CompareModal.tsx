"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Dataset, EquipmentRecord } from "@/lib/types";

interface Props {
  ds: Dataset;
  items: EquipmentRecord[];
  categoryLabel: string;
  onRemove: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function CompareModal({ ds, items, categoryLabel, onRemove, onClear, onClose }: Props) {
  const [diffOnly, setDiffOnly] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, []);

  // fewer than two products left: nothing to compare
  useEffect(() => {
    if (items.length < 2) onClose();
  }, [items.length, onClose]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.stopPropagation(); onClose(); return; }
    if (e.key !== "Tab" || !dialog.current) return;
    const f = dialog.current.querySelectorAll<HTMLElement>('button, [href], input, select, [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const rows = useMemo(
    () =>
      ds.columns.map((c) => {
        const vals = items.map((r) => r.values[c.key] ?? "");
        return { c, vals, differs: new Set(vals.map((v) => v.replace(/\s+/g, " ").trim().toLowerCase())).size > 1 };
      }),
    [ds.columns, items],
  );
  const shown = diffOnly ? rows.filter((r) => r.differs) : rows;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-title"
        onKeyDown={onKey}
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-lg border border-line bg-white sm:rounded-md"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <h2 id="compare-title" className="text-base font-semibold">Compare {categoryLabel}</h2>
            <p className="text-xs text-muted">{items.length} products · values shown exactly as listed in the source data</p>
          </div>
          <button ref={closeBtn} type="button" onClick={onClose} aria-label="Close comparison" className="flex h-9 w-9 items-center justify-center rounded hover:bg-tint">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-line bg-tint px-4 py-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-brand" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} />
            Show differences only
          </label>
          <button type="button" onClick={onClear} className="text-sm font-medium text-brand hover:underline">Clear all</button>
        </div>
        <div className="relative overflow-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <caption className="sr-only">Side-by-side specification comparison</caption>
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 top-0 z-20 w-36 border-b border-line bg-white px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted sm:w-48">Specification</th>
                {items.map((r) => (
                  <th key={r.id} scope="col" className="sticky top-0 z-10 min-w-[11rem] border-b border-l border-line bg-white px-3 py-3 text-left align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-muted">{r.brand || "Not specified"}</div>
                        <div className="font-mono text-[13px] font-semibold [overflow-wrap:anywhere]">{r.model || "Not specified"}</div>
                      </div>
                      <button type="button" onClick={() => onRemove(r.id)} aria-label={`Remove ${r.brand} ${r.model}`} className="flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-tint">
                        <X className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr><td colSpan={items.length + 1} className="px-3 py-8 text-center text-muted">These products have identical values in every listed field.</td></tr>
              )}
              {shown.map(({ c, vals, differs }) => (
                <tr key={c.key} className={differs ? "bg-brand/5" : undefined}>
                  <th scope="row" className="sticky left-0 z-10 border-b border-line bg-inherit px-3 py-2 text-left align-top font-medium text-muted" style={{ backgroundColor: differs ? "#EEF4FA" : "#fff" }}>{c.label}</th>
                  {vals.map((v, i) => (
                    <td key={i} className={`border-b border-l border-line px-3 py-2 align-top whitespace-pre-line [overflow-wrap:anywhere] ${v ? "" : "text-muted"}`}>{v || "Not specified"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
