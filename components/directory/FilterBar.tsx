"use client";

import { ArrowDownAZ, ArrowUpAZ, Search, X } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import type { CapacityOption } from "@/lib/filter";
import type { Filters } from "@/lib/filter";
import type { SortKey } from "@/lib/types";

interface Props {
  filters: Filters;
  set: (patch: Partial<Filters>) => void;
  brands: { brand: string; count: number }[];
  capacities: CapacityOption[];
  useRange: boolean;
  rangeUnit: string;
  hasCapacity: boolean;
  disabled: boolean;
  activeCount: number;
  onClear: () => void;
}

export function FilterBar({ filters, set, brands, capacities, useRange, rangeUnit, hasCapacity, disabled, activeCount, onClear }: Props) {
  return (
    <div className="rounded-md border border-line bg-white p-3 md:p-4" role="search" aria-label="Filter equipment">
      <div className="grid gap-3 md:grid-cols-6 lg:grid-cols-12">
        <div className="md:col-span-6 lg:col-span-4">
          <label htmlFor="model-search" className="label">Search</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              id="model-search"
              type="search"
              inputMode="search"
              autoComplete="off"
              spellCheck={false}
              disabled={disabled}
              value={filters.query}
              onChange={(e) => set({ query: e.target.value })}
              placeholder="Search by model number..."
              className="field pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
            />
            {filters.query && (
              <button
                type="button"
                onClick={() => set({ query: "" })}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-muted hover:bg-tint hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </div>

        <div className="md:col-span-3 lg:col-span-2">
          <Combobox
            label="Brand"
            allLabel="All Brands"
            value={filters.brand}
            onChange={(v) => set({ brand: v })}
            disabled={disabled}
            searchPlaceholder="Search brands..."
            options={brands.map((b) => ({ value: b.brand, label: b.brand, hint: String(b.count) }))}
          />
        </div>

        <div className="md:col-span-3 lg:col-span-2">
          {useRange ? (
            <fieldset disabled={disabled || !hasCapacity}>
              <legend className="label">Capacity{rangeUnit ? ` (${rangeUnit})` : ""}</legend>
              <div className="flex items-center gap-1.5">
                <input
                  type="number" inputMode="decimal" min={0} aria-label={`Minimum capacity${rangeUnit ? ` in ${rangeUnit}` : ""}`}
                  placeholder="Min" value={filters.capMin} onChange={(e) => set({ capMin: e.target.value })} className="field px-2"
                />
                <span aria-hidden className="text-muted">–</span>
                <input
                  type="number" inputMode="decimal" min={0} aria-label={`Maximum capacity${rangeUnit ? ` in ${rangeUnit}` : ""}`}
                  placeholder="Max" value={filters.capMax} onChange={(e) => set({ capMax: e.target.value })} className="field px-2"
                />
              </div>
            </fieldset>
          ) : (
            <>
              <label htmlFor="capacity-filter" className="label">Capacity</label>
              <select
                id="capacity-filter"
                className="field"
                disabled={disabled || !hasCapacity}
                value={filters.capacity}
                onChange={(e) => set({ capacity: e.target.value })}
              >
                <option value="">All Capacities</option>
                {capacities.map((c) => (
                  <option key={c.key} value={c.key}>{c.label} ({c.count})</option>
                ))}
              </select>
            </>
          )}
        </div>

        <div className="md:col-span-4 lg:col-span-2">
          <label htmlFor="sort-key" className="label">Sort by</label>
          <select
            id="sort-key"
            className="field"
            disabled={disabled}
            value={filters.sortKey}
            onChange={(e) => set({ sortKey: e.target.value as SortKey })}
          >
            <option value="brand">Brand</option>
            <option value="capacity" disabled={!hasCapacity}>Capacity</option>
            <option value="model">Model Number</option>
          </select>
        </div>

        <div className="flex items-end gap-2 md:col-span-2 lg:col-span-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => set({ sortDir: filters.sortDir === "asc" ? "desc" : "asc" })}
            className="btn btn-outline flex-1 px-3"
            aria-label={`Sort order: ${filters.sortDir === "asc" ? "ascending" : "descending"}. Click to reverse.`}
          >
            {filters.sortDir === "asc" ? <ArrowDownAZ className="h-4 w-4" aria-hidden /> : <ArrowUpAZ className="h-4 w-4" aria-hidden />}
            <span className="sr-only sm:not-sr-only">{filters.sortDir === "asc" ? "Asc" : "Desc"}</span>
          </button>
        </div>
      </div>
      {activeCount > 0 && (
        <div className="mt-3 flex justify-end">
          <button type="button" onClick={onClear} className="text-sm font-medium text-brand underline-offset-2 hover:underline">
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
