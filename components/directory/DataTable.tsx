"use client";

import { Fragment } from "react";
import clsx from "clsx";
import { AlertTriangle, ArrowDown, ArrowUp, ChevronDown } from "lucide-react";
import type { Dataset, EquipmentRecord, SortDir, SortKey } from "@/lib/types";
import { RowDetails } from "./RowDetails";

interface Props {
  ds: Dataset;
  rows: EquipmentRecord[];
  selected: string[];
  maxSelected: number;
  onToggleSelect: (id: string) => void;
  expanded: Set<string>;
  onToggleExpand: (id: string) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  hasCapacity: boolean;
}

const NS = <span className="text-muted">Not specified</span>;

export function DataTable({ ds, rows, selected, maxSelected, onToggleSelect, expanded, onToggleExpand, sortKey, sortDir, onSort, hasCapacity }: Props) {
  const extra = ds.tableColumns.map((k) => ds.columns.find((c) => c.key === k)).filter((c): c is NonNullable<typeof c> => !!c);
  const colSpan = 5 + extra.length;

  const SortTh = ({ k, label, disabled }: { k: SortKey; label: string; disabled?: boolean }) => {
    const on = sortKey === k;
    return (
      <th scope="col" aria-sort={on ? (sortDir === "asc" ? "ascending" : "descending") : "none"} className="sticky top-0 z-10 border-b border-line bg-tint px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-navy">
        {disabled ? (
          label
        ) : (
          <button type="button" onClick={() => onSort(k)} className="inline-flex items-center gap-1 rounded uppercase tracking-wide hover:text-brand">
            {label}
            {on && (sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" aria-hidden /> : <ArrowDown className="h-3.5 w-3.5" aria-hidden />)}
          </button>
        )}
      </th>
    );
  };
  const th = "sticky top-0 z-10 border-b border-line bg-tint px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-navy";

  return (
    <div className="relative overflow-x-auto rounded-md border border-line">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <caption className="sr-only">Equipment list</caption>
        <thead>
          <tr>
            <th scope="col" className={clsx(th, "w-10")}><span className="sr-only">Select for comparison</span></th>
            <SortTh k="brand" label="Brand" />
            <SortTh k="model" label="Model Number" />
            <SortTh k="capacity" label="Capacity" disabled={!hasCapacity} />
            {extra.map((c) => <th key={c.key} scope="col" className={th}>{c.label}</th>)}
            <th scope="col" className={clsx(th, "text-right")}><span className="sr-only">Details</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isSel = selected.includes(r.id);
            const isOpen = expanded.has(r.id);
            const locked = !isSel && selected.length >= maxSelected;
            return (
              <Fragment key={r.id}>
                <tr className={clsx("border-b border-line align-top hover:bg-tint/70", isOpen && "bg-tint/70", isSel && "bg-brand/5")}>
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-brand"
                      checked={isSel}
                      disabled={locked}
                      onChange={() => onToggleSelect(r.id)}
                      aria-label={`Compare ${r.brand} ${r.model}`}
                      title={locked ? `You can compare up to ${maxSelected} products` : undefined}
                    />
                  </td>
                  <td className="px-3 py-2.5 font-medium [overflow-wrap:anywhere]">{r.brand || NS}</td>
                  <td className="min-w-[10rem] px-3 py-2.5 font-mono text-[13px] [overflow-wrap:anywhere]">
                    {r.model || NS}
                    {r.flags.length > 0 && (
                      <span title="Flagged for review in the source data" className="ml-1.5 inline-block align-middle text-amber-600">
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                        <span className="sr-only">Flagged for review</span>
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">{r.capacity?.display ?? (r.values[ds.capacityKey ?? ""] || NS)}</td>
                  {extra.map((c) => (
                    <td key={c.key} className="px-3 py-2.5 [overflow-wrap:anywhere]">{r.values[c.key] || NS}</td>
                  ))}
                  <td className="whitespace-nowrap px-3 py-2.5 text-right">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`details-${r.id}`}
                      onClick={() => onToggleExpand(r.id)}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm font-medium text-brand hover:bg-white"
                    >
                      {isOpen ? "Hide" : "View Details"}
                      <ChevronDown className={clsx("h-4 w-4 transition-transform", isOpen && "rotate-180")} aria-hidden />
                      <span className="sr-only"> for {r.brand} {r.model}</span>
                    </button>
                  </td>
                </tr>
                {isOpen && (
                  <tr id={`details-${r.id}`} className="border-b border-line">
                    <td colSpan={colSpan} className="p-0">
                      <RowDetails ds={ds} rec={r} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
