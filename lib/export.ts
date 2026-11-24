import type { Dataset, EquipmentRecord } from "./types";

function fileBase(label: string) {
  return `Net-Metering-${label.trim().replace(/\s+/g, "-")}`;
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function toMatrix(ds: Dataset, records: EquipmentRecord[]): string[][] {
  const header = ds.columns.map((c) => c.label);
  const rows = records.map((r) => ds.columns.map((c) => r.values[c.key] ?? ""));
  return [header, ...rows];
}

/** Exports every original source column for the records passed in (i.e. the current filtered, sorted result). */
export async function exportRecords(
  format: "xlsx" | "csv",
  ds: Dataset,
  records: EquipmentRecord[],
  label: string,
): Promise<void> {
  const matrix = toMatrix(ds, records);
  const name = `${fileBase(label)}.${format}`;

  if (format === "csv") {
    const esc = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
    const csv = matrix.map((row) => row.map(esc).join(",")).join("\r\n");
    // BOM so Excel opens UTF-8 correctly
    download(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }), name);
    return;
  }

  const XLSX = await import("xlsx");
  const ws = XLSX.utils.aoa_to_sheet(matrix);
  ws["!cols"] = matrix[0].map((_, i) => ({
    wch: Math.min(40, Math.max(8, ...matrix.slice(0, 200).map((r) => (r[i] ?? "").length)) + 2),
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, label.slice(0, 31));
  XLSX.writeFile(wb, name);
}
