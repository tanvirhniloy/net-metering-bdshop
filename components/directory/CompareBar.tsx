"use client";

import { GitCompare, X } from "lucide-react";
import type { EquipmentRecord } from "@/lib/types";

interface Props {
  items: EquipmentRecord[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
}

export function CompareBar({ items, onRemove, onClear, onCompare }: Props) {
  if (items.length < 2) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white shadow-[0_-2px_8px_rgba(18,59,101,0.08)]" role="region" aria-label="Comparison">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-3 md:flex-row md:items-center">
        <p className="shrink-0 text-sm font-semibold text-navy">{items.length} selected</p>
        <ul className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 md:pb-0">
          {items.map((r) => (
            <li key={r.id} className="flex shrink-0 items-center gap-1 rounded border border-line bg-tint py-1 pl-2 pr-1 text-xs">
              <span className="max-w-[10rem] truncate font-mono">{r.model || r.brand}</span>
              <button type="button" onClick={() => onRemove(r.id)} aria-label={`Remove ${r.brand} ${r.model} from comparison`} className="flex h-6 w-6 items-center justify-center rounded hover:bg-white">
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={onClear} className="btn btn-outline flex-1 md:flex-none">Clear</button>
          <button type="button" onClick={onCompare} className="btn btn-primary flex-1 md:flex-none">
            <GitCompare className="h-4 w-4" aria-hidden /> Compare
          </button>
        </div>
      </div>
    </div>
  );
}
