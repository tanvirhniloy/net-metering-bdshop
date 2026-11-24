import type { Dataset, EquipmentRecord, SortDir, SortKey } from "./types";
import { capacityKey, unitFactor } from "./units";

export interface Filters {
  brand: string;
  capacity: string;
  capMin: string;
  capMax: string;
  query: string;
  sortKey: SortKey;
  sortDir: SortDir;
}

export const DEFAULT_FILTERS: Filters = {
  brand: "",
  capacity: "",
  capMin: "",
  capMax: "",
  query: "",
  sortKey: "brand",
  sortDir: "asc",
};

export const RANGE_THRESHOLD = 25;

const collapse = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
const compact = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export interface SearchIndexEntry {
  text: string;
  compact: string;
}

const IDENT_LABEL = /model|type|series|part|sku|name|ref|code|product/i;

export function buildSearchIndex(ds: Dataset): Map<string, SearchIndexEntry> {
  const identKeys = ds.columns.filter((c) => IDENT_LABEL.test(c.label)).map((c) => c.key);
  const map = new Map<string, SearchIndexEntry>();
  for (const r of ds.records) {
    const parts = [r.model, r.brand, ...identKeys.map((k) => r.values[k] ?? "")];
    const text = collapse(parts.join(" "));
    map.set(r.id, { text, compact: compact(text) });
  }
  return map;
}

export interface CapacityOption {
  key: string;
  label: string;
  count: number;
  base: number;
}

export function brandOptions(ds: Dataset): { brand: string; count: number }[] {
  const m = new Map<string, number>();
  for (const r of ds.records) if (r.brand) m.set(r.brand, (m.get(r.brand) ?? 0) + 1);
  return [...m.entries()]
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => a.brand.localeCompare(b.brand, undefined, { sensitivity: "base", numeric: true }));
}

export function capacityOptions(ds: Dataset): CapacityOption[] {
  const m = new Map<string, CapacityOption>();
  for (const r of ds.records) {
    if (!r.capacity) continue;
    const key = capacityKey(r.capacity.value, r.capacity.unit);
    const cur = m.get(key);
    if (cur) cur.count++;
    else m.set(key, { key, label: key, count: 1, base: r.capacity.base });
  }
  return [...m.values()].sort((a, b) => a.base - b.base || a.label.localeCompare(b.label));
}

/** The most frequent unit in the dataset, used as the unit for range inputs. */
export function dominantUnit(ds: Dataset): string {
  const m = new Map<string, number>();
  for (const r of ds.records) if (r.capacity) m.set(r.capacity.unit, (m.get(r.capacity.unit) ?? 0) + 1);
  let best = "";
  let n = -1;
  for (const [u, c] of m) if (c > n) [best, n] = [u, c];
  return best;
}

export function applyFilters(
  ds: Dataset,
  filters: Filters,
  index: Map<string, SearchIndexEntry>,
  useRange: boolean,
): EquipmentRecord[] {
  const tokens = collapse(filters.query).split(" ").filter(Boolean);
  const factor = unitFactor(dominantUnit(ds));
  const min = filters.capMin.trim() !== "" ? Number(filters.capMin) * factor : null;
  const max = filters.capMax.trim() !== "" ? Number(filters.capMax) * factor : null;

  const out = ds.records.filter((r) => {
    if (filters.brand && r.brand !== filters.brand) return false;
    if (useRange) {
      if (min !== null && !Number.isNaN(min)) {
        if (!r.capacity || r.capacity.base < min) return false;
      }
      if (max !== null && !Number.isNaN(max)) {
        if (!r.capacity || r.capacity.base > max) return false;
      }
    } else if (filters.capacity) {
      if (!r.capacity || capacityKey(r.capacity.value, r.capacity.unit) !== filters.capacity) return false;
    }
    if (tokens.length) {
      const e = index.get(r.id);
      if (!e) return false;
      for (const t of tokens) {
        const tc = compact(t);
        if (!e.text.includes(t) && !(tc && e.compact.includes(tc))) return false;
      }
    }
    return true;
  });

  const dir = filters.sortDir === "asc" ? 1 : -1;
  const str = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  out.sort((a, b) => {
    if (filters.sortKey === "capacity") {
      // records without a capacity always go last
      if (!a.capacity && !b.capacity) return str(a.model, b.model);
      if (!a.capacity) return 1;
      if (!b.capacity) return -1;
      const d = a.capacity.base - b.capacity.base;
      if (d) return d * dir;
      return str(a.brand, b.brand) || str(a.model, b.model);
    }
    if (filters.sortKey === "model") {
      return (str(a.model, b.model) || str(a.brand, b.brand)) * dir;
    }
    return (str(a.brand, b.brand) || str(a.model, b.model)) * dir;
  });
  return out;
}

export function activeFilterCount(f: Filters): number {
  return [f.brand, f.capacity, f.capMin, f.capMax, f.query.trim()].filter(Boolean).length;
}
