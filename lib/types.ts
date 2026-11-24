export type CategoryId = "solar-modules" | "single-phase-inverters" | "three-phase-inverters";

export interface Capacity {
  /** Numeric value exactly as parsed from the source cell. */
  value: number;
  /** Unit exactly as written in the source (cell or column header), e.g. "kW", "Wp". May be empty. */
  unit: string;
  /** Text shown in the table (original cell text, plus the header unit if the cell had none). */
  display: string;
  /** Value converted to watts. Used for sorting and range filtering only, never displayed. */
  base: number;
}

export interface Column {
  key: string;
  /** Original header text from the Excel file. */
  label: string;
}

export interface EquipmentRecord {
  id: string;
  brand: string;
  model: string;
  capacity: Capacity | null;
  /** Every source column, keyed by Column.key. Empty string = empty cell in the source. */
  values: Record<string, string>;
  sheet: string;
  /** Row number in the source worksheet (1-based). */
  row: number;
  /** Data-quality notes raised during import. Shown to users as "flagged for review". */
  flags: string[];
}

export interface Dataset {
  category: CategoryId;
  sourceFile: string | null;
  importedAt: string | null;
  sheets: string[];
  /** Text found above the header row (titles, publication dates, reference numbers) and note rows inside the data. */
  notes: string[];
  /** A date-like line found in `notes`, if any. */
  sourceDateText: string | null;
  columns: Column[];
  /** Keys of the extra columns shown in the main table (besides brand, model and capacity). */
  tableColumns: string[];
  brandKey: string | null;
  modelKey: string | null;
  capacityKey: string | null;
  records: EquipmentRecord[];
}

export type SortKey = "brand" | "capacity" | "model";
export type SortDir = "asc" | "desc";
