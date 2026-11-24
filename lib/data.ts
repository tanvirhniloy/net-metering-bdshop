import type { CategoryId, Dataset } from "./types";
import modules from "@/data/generated/solar-modules.json";
import single from "@/data/generated/single-phase-inverters.json";
import three from "@/data/generated/three-phase-inverters.json";

/**
 * Single access point for equipment data.
 * The JSON files in data/generated are produced from the official Excel lists by `npm run import-data`.
 * To move to a database (e.g. Supabase) later, replace this function only; the UI consumes `Dataset` objects.
 */
export function getDatasets(): Record<CategoryId, Dataset> {
  return {
    "solar-modules": modules as unknown as Dataset,
    "single-phase-inverters": single as unknown as Dataset,
    "three-phase-inverters": three as unknown as Dataset,
  };
}

export function getLastUpdated(datasets: Record<CategoryId, Dataset>): string | null {
  const dates = Object.values(datasets)
    .map((d) => d.importedAt)
    .filter((d): d is string => !!d)
    .sort();
  return dates.length ? dates[dates.length - 1] : null;
}
