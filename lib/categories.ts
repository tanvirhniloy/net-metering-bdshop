import type { CategoryId } from "./types";

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  short: string;
  slug: CategoryId;
  description: string;
  heading: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "solar-modules",
    label: "Solar Panels",
    short: "Panels",
    slug: "solar-modules",
    description: "SREDA-listed solar panels for Bangladesh's Net Metering Program.",
    heading: "List of SREDA Approved Solar Panels for Net Metering Program",
  },
  {
    id: "single-phase-inverters",
    label: "Single Phase Inverters",
    short: "Single Phase",
    slug: "single-phase-inverters",
    description: "SREDA-listed single-phase solar inverters for Bangladesh's Net Metering Program.",
    heading: "List of SREDA Approved Single Phase Solar Inverters for Net Metering Program",
  },
  {
    id: "three-phase-inverters",
    label: "Three Phase Inverters",
    short: "Three Phase",
    slug: "three-phase-inverters",
    description: "SREDA-listed three-phase solar inverters for Bangladesh's Net Metering Program.",
    heading: "List of SREDA Approved Three Phase Solar Inverters for Net Metering Program",
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, CategoryMeta>;

export function isCategoryId(v: string): v is CategoryId {
  return v in CATEGORY_BY_ID;
}
