"use client";

import clsx from "clsx";
import { CATEGORIES } from "@/lib/categories";
import type { CategoryId } from "@/lib/types";

interface Props {
  active: CategoryId;
  counts: Record<CategoryId, number>;
  onChange: (id: CategoryId) => void;
}

export function CategoryTabs({ active, counts, onChange }: Props) {
  const onKey = (e: React.KeyboardEvent, i: number) => {
    let n = -1;
    if (e.key === "ArrowRight") n = (i + 1) % CATEGORIES.length;
    if (e.key === "ArrowLeft") n = (i - 1 + CATEGORIES.length) % CATEGORIES.length;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = CATEGORIES.length - 1;
    if (n < 0) return;
    e.preventDefault();
    onChange(CATEGORIES[n].id);
    document.getElementById(`tab-${CATEGORIES[n].id}`)?.focus();
  };

  return (
    <div role="tablist" aria-label="Equipment category" className="grid grid-cols-1 gap-1 rounded-md border border-brand/20 bg-gradient-to-r from-tint to-[#DDF1FF] p-1 sm:grid-cols-3">
      {CATEGORIES.map((c, i) => {
        const on = c.id === active;
        return (
          <button
            key={c.id}
            id={`tab-${c.id}`}
            role="tab"
            type="button"
            aria-selected={on}
            aria-controls="equipment-panel"
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(c.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={clsx(
              "flex h-11 items-center justify-center gap-2 rounded px-3 text-sm font-semibold transition-colors",
              on ? "bg-grad text-white shadow-sm" : "text-navy hover:bg-white",
            )}
          >
            {c.label}
            <span
              className={clsx(
                "rounded-sm px-1.5 py-0.5 text-xs font-medium tabular-nums",
                on ? "bg-white/20 text-white" : "bg-white text-muted ring-1 ring-line",
              )}
            >
              {counts[c.id].toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
