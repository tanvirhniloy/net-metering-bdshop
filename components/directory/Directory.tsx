"use client";

import { useCallback, useMemo, useState } from "react";
import { FileWarning, SearchX, X } from "lucide-react";
import { CATEGORIES, CATEGORY_BY_ID } from "@/lib/categories";
import {
  DEFAULT_FILTERS, RANGE_THRESHOLD, activeFilterCount, applyFilters, brandOptions, buildSearchIndex,
  capacityOptions, dominantUnit, type Filters,
} from "@/lib/filter";
import type { CategoryId, Dataset } from "@/lib/types";
import { CategoryTabs } from "./CategoryTabs";
import { CompareBar } from "./CompareBar";
import { CompareModal } from "./CompareModal";
import { DataTable } from "./DataTable";
import { FilterBar } from "./FilterBar";

const PAGE_SIZE = 30;
const MAX_COMPARE = 4;

interface Props {
  datasets: Record<CategoryId, Dataset>;
  initialCategory: CategoryId;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function Directory({ datasets, initialCategory }: Props) {
  const [category, setCategory] = useState<CategoryId>(initialCategory);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [compareOpen, setCompareOpen] = useState(false);

  const ds = datasets[category];
  const meta = CATEGORY_BY_ID[category];

  const counts = useMemo(
    () => Object.fromEntries(CATEGORIES.map((c) => [c.id, datasets[c.id].records.length])) as Record<CategoryId, number>,
    [datasets],
  );

  const index = useMemo(() => buildSearchIndex(ds), [ds]);
  const brands = useMemo(() => brandOptions(ds), [ds]);
  const capacities = useMemo(() => capacityOptions(ds), [ds]);
  const hasCapacity = capacities.length > 0;
  const useRange = capacities.length > RANGE_THRESHOLD;
  const rangeUnit = useMemo(() => dominantUnit(ds), [ds]);

  const filtered = useMemo(() => applyFilters(ds, filters, index, useRange), [ds, filters, index, useRange]);
  const visible = filtered.slice(0, limit);
  const nActive = activeFilterCount(filters);

  const byId = useMemo(() => new Map(ds.records.map((r) => [r.id, r])), [ds]);
  const selectedRecs = useMemo(() => selected.map((id) => byId.get(id)).filter((r): r is NonNullable<typeof r> => !!r), [selected, byId]);

  const set = useCallback((patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setLimit(PAGE_SIZE);
  }, []);

  const clearAll = () => {
    setFilters((f) => ({ ...DEFAULT_FILTERS, sortKey: f.sortKey, sortDir: f.sortDir }));
    setLimit(PAGE_SIZE);
  };

  const switchCategory = (id: CategoryId) => {
    if (id === category) return;
    setCategory(id);
    // brand and capacity belong to one category's data, so they are reset; search text and sorting carry over
    const nextHasCap = capacityOptions(datasets[id]).length > 0;
    setFilters((f) => ({ ...f, brand: "", capacity: "", capMin: "", capMax: "", sortKey: f.sortKey === "capacity" && !nextHasCap ? "brand" : f.sortKey }));
    setSelected([]);
    setExpanded(new Set());
    setLimit(PAGE_SIZE);
    setCompareOpen(false);
    window.history.replaceState(null, "", `/${id}${window.location.hash}`);
  };

  const toggleSelect = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= MAX_COMPARE ? s : [...s, id]));
  const toggleExpand = (id: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const onSort = (k: Filters["sortKey"]) =>
    set(filters.sortKey === k ? { sortDir: filters.sortDir === "asc" ? "desc" : "asc" } : { sortKey: k, sortDir: "asc" });

  const closeCompare = useCallback(() => setCompareOpen(false), []);
  const removeFromCompare = useCallback((id: string) => setSelected((s) => s.filter((x) => x !== id)), []);
  const clearCompare = useCallback(() => { setSelected([]); setCompareOpen(false); }, []);

  const chips: { label: string; clear: () => void }[] = [];
  if (filters.query.trim()) chips.push({ label: `Search: "${filters.query.trim()}"`, clear: () => set({ query: "" }) });
  if (filters.brand) chips.push({ label: `Brand: ${filters.brand}`, clear: () => set({ brand: "" }) });
  if (filters.capacity) chips.push({ label: `Capacity: ${filters.capacity}`, clear: () => set({ capacity: "" }) });
  if (filters.capMin || filters.capMax)
    chips.push({
      label: `Capacity: ${filters.capMin || "any"} – ${filters.capMax || "any"}${rangeUnit ? ` ${rangeUnit}` : ""}`,
      clear: () => set({ capMin: "", capMax: "" }),
    });

  const noData = ds.records.length === 0;
  const imported = formatDate(ds.importedAt);

  return (
    <div>
      <h1 id="page-h1" className="max-w-4xl bg-gradient-to-r from-navy via-brand to-brand-2 bg-clip-text text-xl font-semibold leading-snug text-transparent md:text-2xl">
        {meta.heading}
      </h1>
      <p className="mb-5 mt-2 max-w-3xl text-[15px] leading-relaxed text-muted">
        Explore the listed solar panels and inverters for Bangladesh&apos;s Net Metering Program. Search by brand, capacity, or exact
        model number to find the equipment you need.
      </p>
      <CategoryTabs active={category} counts={counts} onChange={switchCategory} />

      <div id="equipment-panel" role="tabpanel" aria-labelledby={`tab-${category}`} className="mt-4 space-y-4">
        <FilterBar
          filters={filters}
          set={set}
          brands={brands}
          capacities={capacities}
          useRange={useRange}
          rangeUnit={rangeUnit}
          hasCapacity={hasCapacity}
          disabled={noData}
          activeCount={nActive}
          onClear={clearAll}
        />

        <div>
          <div className="min-w-0">
            <p className="text-sm" aria-live="polite" role="status">
              Showing <strong className="tabular-nums">{filtered.length.toLocaleString()}</strong> of{" "}
              <strong className="tabular-nums">{ds.records.length.toLocaleString()}</strong> {meta.label}
            </p>
            {chips.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Active filters">
                {chips.map((c) => (
                  <li key={c.label} className="flex items-center gap-1 rounded border border-line bg-tint py-0.5 pl-2 pr-0.5 text-xs">
                    {c.label}
                    <button type="button" onClick={c.clear} aria-label={`Remove filter ${c.label}`} className="flex h-5 w-5 items-center justify-center rounded hover:bg-white">
                      <X className="h-3 w-3" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div key={category} className="animate-fade">
          {noData ? (
            <div className="rounded-md border border-dashed border-slate-300 px-6 py-14 text-center">
              <FileWarning className="mx-auto h-8 w-8 text-muted" aria-hidden />
              <h3 className="mt-3 text-base font-semibold">No equipment data available yet</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted">The {meta.label.toLowerCase()} list has not been published. Please check back soon.</p>
              {process.env.NODE_ENV !== "production" && (
                <p className="mx-auto mt-3 max-w-md rounded bg-tint p-2 text-xs text-muted">
                  Developer note: put the Excel file in <code>data/source/</code> and run <code>npm run import-data</code>.
                </p>
              )}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-md border border-line px-6 py-14 text-center">
              <SearchX className="mx-auto h-8 w-8 text-muted" aria-hidden />
              <h3 className="mt-3 text-base font-semibold">No matching equipment found.</h3>
              <p className="mt-1 text-sm text-muted">Try changing your search query or removing some filters.</p>
              <button type="button" onClick={clearAll} className="btn btn-primary mt-5">Clear Filters</button>
            </div>
          ) : (
            <>
              <DataTable
                ds={ds}
                rows={visible}
                selected={selected}
                maxSelected={MAX_COMPARE}
                onToggleSelect={toggleSelect}
                expanded={expanded}
                onToggleExpand={toggleExpand}
                sortKey={filters.sortKey}
                sortDir={filters.sortDir}
                onSort={onSort}
                hasCapacity={hasCapacity}
              />
              <div className="mt-3 flex flex-col items-center justify-between gap-2 text-sm text-muted sm:flex-row">
                <p>
                  Displaying 1–{visible.length.toLocaleString()} of {filtered.length.toLocaleString()} matching
                  {selected.length === 1 && " · select at least one more product to compare"}
                </p>
                {visible.length < filtered.length && (
                  <button type="button" className="btn btn-outline" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
                    Show {Math.min(PAGE_SIZE, filtered.length - visible.length)} more
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {!noData && (
          <div className="text-xs text-muted">
            <p>
              {[ds.sourceDateText ? `Source list date: ${ds.sourceDateText}` : null, imported ? `Data last updated: ${imported}` : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {ds.notes.length > 0 && (
              <details className="mt-1">
                <summary className="cursor-pointer text-brand">Notes from the source list</summary>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {ds.notes.map((n, i) => <li key={i} className="whitespace-pre-line">{n}</li>)}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>

      <CompareBar items={selectedRecs} onRemove={removeFromCompare} onClear={clearCompare} onCompare={() => setCompareOpen(true)} />
      {compareOpen && selectedRecs.length >= 2 && (
        <CompareModal ds={ds} items={selectedRecs} categoryLabel={meta.label} onRemove={removeFromCompare} onClear={clearCompare} onClose={closeCompare} />
      )}
      {selected.length >= 2 && <div className="h-24" aria-hidden />}
    </div>
  );
}
