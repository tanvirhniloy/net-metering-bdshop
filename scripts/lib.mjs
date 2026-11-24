// Shared Excel parsing logic used by import-data.mjs and verify-data.mjs
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

export const CATEGORIES = [
  { id: "solar-modules", label: "Solar Panels", match: /module|panel|pv/i, inverter: false },
  { id: "single-phase-inverters", label: "Single Phase Inverters", match: /single/i, inverter: true },
  { id: "three-phase-inverters", label: "Three Phase Inverters", match: /three|3[\s_-]?ph/i, inverter: true },
];

const SERIAL_RE = /^(sl|sr|s\.?\s?no|s\.?\s?n|serial|no|#|sl\.?\s?no|sr\.?\s?no)\.?$/i;
export const isSerialLabel = (l) => SERIAL_RE.test(l.trim());

const clean = (v) => (v === null || v === undefined ? "" : String(v).replace(/\r\n?/g, "\n").trim());
const collapse = (s) => s.replace(/\s+/g, " ").trim().toLowerCase();
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function findSourceFile(dir, cat) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => /\.(xlsx|xlsm|xls)$/i.test(f) && !f.startsWith("~$"));
  const exact = files.find((f) => f.replace(/\.[^.]+$/, "").toLowerCase() === cat.id);
  if (exact) return path.join(dir, exact);
  // tolerant matching on file name; check three/single first so "inverter" files are not mistaken for modules
  const order = [...CATEGORIES].sort((a, b) => Number(b.inverter) - Number(a.inverter));
  for (const f of files) {
    const hit = order.find((c) => c.match.test(f));
    if (hit && hit.id === cat.id) return path.join(dir, f);
  }
  return null;
}

function uniqueKeys(labels) {
  const seen = new Map();
  return labels.map((l) => {
    let base =
      l.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60) || "column";
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}_${n}`;
  });
}

function pickColumn(columns, prefs, exclude) {
  const cands = columns.filter((c) => !exclude || !exclude.test(c.label));
  for (const p of prefs) {
    const hit = cands.find((c) => norm(c.label).includes(p));
    if (hit) return hit;
  }
  return null;
}

const BRAND_PREFS = ["brand", "manufacturer", "manufacturing company", "make", "company", "supplier", "vendor"];
const MODEL_PREFS = ["model number", "model no", "model name", "model", "type no", "part number", "product name", "type"];
const CAP_PREFS_MODULE = ["rated power", "nominal power", "maximum power", "power wp", "power w", "wp", "pmax", "capacity", "wattage", "power"];
const CAP_PREFS_INVERTER = [
  "rated ac output power", "rated ac power", "ac output power", "rated output power", "nominal ac power",
  "nominal output power", "rated power", "output power", "capacity", "kw", "kva",
];
const CAP_EXCLUDE_INVERTER = /pv|dc|input|battery|max.*apparent/i;

const EXTRA_PREFS_MODULE = ["technology", "efficiency", "cell type", "cell", "type", "dimension", "voltage", "current"];
const EXTRA_PREFS_INVERTER = [
  "ac output", "rated output", "max pv input power", "pv input power", "max pv power", "max pv input voltage",
  "pv input voltage", "input voltage", "mppt", "phase", "efficiency", "voltage",
];

function parseCapacity(cell, headerLabel) {
  const text = clean(cell);
  if (!text) return { cap: null, flag: null };
  const m = text.replace(/,/g, "").match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]{0,4})$/);
  const hdrUnit = (headerLabel.match(/\(\s*(k?w[ph]?|mwp?|kva|va)\s*\)/i) ??
    headerLabel.match(/\b(kwp|wp|kw|mwp|mw|kva)\b/i))?.[1] ?? "";
  if (!m) return { cap: null, flag: `Capacity "${text}" could not be read as a single number; not used for capacity filtering` };
  const value = Number(m[1]);
  const unit = m[2] || hdrUnit;
  const factors = { w: 1, wp: 1, va: 1, kw: 1e3, kwp: 1e3, kva: 1e3, mw: 1e6, mwp: 1e6 };
  const base = value * (factors[unit.toLowerCase()] ?? 1);
  const display = m[2] ? text : unit ? `${text} ${unit}` : text;
  return { cap: { value, unit, display, base }, flag: unit ? null : `Capacity "${text}" has no unit in the cell or column header` };
}

/** Parse one workbook into a normalised dataset. Nothing is dropped silently: every skipped row is reported. */
export function parseWorkbook(file, cat, overrides = {}) {
  const wb = XLSX.read(fs.readFileSync(file), { type: "buffer", cellDates: false });
  const report = { sourceRows: 0, exactDuplicatesDropped: [], exactDuplicatesKept: [], noteRows: [], warnings: [], sheets: [], skippedSheets: [] };
  const notes = [];
  const colMap = new Map(); // normalised label -> Column
  const columns = [];
  const rawRecords = [];

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws || !ws["!ref"]) { report.skippedSheets.push(`${sheetName} (empty)`); continue; }
    const range = XLSX.utils.decode_range(ws["!ref"]);
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "", blankrows: true });
    // header row = row with the most distinct non-empty cells among the first 25 rows
    let hIdx = -1, best = 1;
    for (let i = 0; i < Math.min(rows.length - 1, 25); i++) {
      const distinct = new Set(rows[i].map(clean).filter(Boolean)).size;
      if (distinct > best) { best = distinct; hIdx = i; }
    }
    if (hIdx < 0) { report.skippedSheets.push(`${sheetName} (no header row found)`); continue; }

    // fill genuinely merged cells in the data area (e.g. a brand cell merged over several rows)
    for (const m of ws["!merges"] ?? []) {
      const r0 = m.s.r - range.s.r, c0 = m.s.c - range.s.c;
      const val = rows[r0]?.[c0];
      if (val === undefined || clean(val) === "") continue;
      for (let r = Math.max(r0, hIdx + 1); r <= m.e.r - range.s.r; r++)
        for (let c = c0; c <= m.e.c - range.s.c; c++)
          if (rows[r] && clean(rows[r][c]) === "") rows[r][c] = val;
    }

    for (let i = 0; i < hIdx; i++) {
      const t = rows[i].map(clean).filter(Boolean);
      if (t.length) notes.push([...new Set(t)].join(" | "));
    }

    const width = Math.max(...rows.slice(hIdx).map((r) => r.length));
    const headers = Array.from({ length: width }, (_, c) => clean(rows[hIdx][c]));
    const used = headers.map((h, c) => ({ h, c })).filter(({ h, c }) => h || rows.slice(hIdx + 1).some((r) => clean(r[c])));
    const colIdx = [];
    for (const { h, c } of used) {
      const label = h || `Column ${XLSX.utils.encode_col(c + range.s.c)}`;
      if (!h) report.warnings.push(`${sheetName}: column ${XLSX.utils.encode_col(c + range.s.c)} has no header; labelled "${label}"`);
      let col = colMap.get(norm(label));
      if (!col) { col = { label, key: "" }; colMap.set(norm(label), col); columns.push(col); }
      colIdx.push({ c, col });
    }
    report.sheets.push(sheetName);

    for (let i = hIdx + 1; i < rows.length; i++) {
      const cells = rows[i];
      const filled = colIdx.filter(({ c }) => clean(cells[c]) !== "");
      if (!filled.length) continue;
      const rowNo = i + range.s.r + 1;
      const vals = new Map();
      for (const { c, col } of colIdx) vals.set(col, clean(cells[c]));
      // a row with a single filled cell is only a note if that cell is NOT the model number (decided below)
      const maybeNote = filled.length === 1 && colIdx.length > 3 ? { col: filled[0].col, text: clean(cells[filled[0].c]) } : null;
      rawRecords.push({ sheet: sheetName, row: rowNo, vals, maybeNote });
    }
  }

  const keys = uniqueKeys(columns.map((c) => c.label));
  columns.forEach((c, i) => (c.key = keys[i]));
  const byLabel = (label) => columns.find((c) => c.label === label) ?? null;

  const ov = overrides[cat.id] ?? {};
  const brandCol = (ov.brand && byLabel(ov.brand)) || pickColumn(columns, BRAND_PREFS, /country|origin/i);
  const modelCol = (ov.model && byLabel(ov.model)) || pickColumn(columns, MODEL_PREFS, /^(sl|sr|s\.?\s?no)/i);
  const capCol =
    (ov.capacity && byLabel(ov.capacity)) ||
    pickColumn(columns, cat.inverter ? CAP_PREFS_INVERTER : CAP_PREFS_MODULE, cat.inverter ? CAP_EXCLUDE_INVERTER : /voltage|current|efficiency|temp|coefficient/i);
  if (!brandCol) report.warnings.push("No brand/manufacturer column detected. Set it in data/import-config.json.");
  if (!modelCol) report.warnings.push("No model column detected. Set it in data/import-config.json.");
  if (!capCol) report.warnings.push("No capacity column detected. Capacity filter/sort will be unavailable. Set it in data/import-config.json.");
  if (capCol) report.capacityColumn = capCol.label;
  if (brandCol) report.brandColumn = brandCol.label;
  if (modelCol) report.modelColumn = modelCol.label;

  // single-cell rows: keep as a record when the cell is the model number, otherwise store as a source note
  for (let i = rawRecords.length - 1; i >= 0; i--) {
    const r = rawRecords[i];
    if (r.maybeNote && r.maybeNote.col !== modelCol) {
      notes.push(r.maybeNote.text);
      report.noteRows.push({ sheet: r.sheet, row: r.row, text: r.maybeNote.text });
      rawRecords.splice(i, 1);
    }
  }

  // table columns
  const core = new Set([brandCol, modelCol, capCol].filter(Boolean));
  const fill = (col) => rawRecords.filter((r) => r.vals.get(col)).length / Math.max(1, rawRecords.length);
  const avgLen = (col) => {
    const v = rawRecords.map((r) => r.vals.get(col)).filter(Boolean);
    return v.reduce((a, s) => a + s.length, 0) / Math.max(1, v.length);
  };
  let tableCols = [];
  if (Array.isArray(ov.tableColumns) && ov.tableColumns.length) {
    tableCols = ov.tableColumns.map(byLabel).filter(Boolean);
  } else {
    const cands = columns.filter((c) => !core.has(c) && !isSerialLabel(c.label) && fill(c) >= 0.3 && avgLen(c) <= 40);
    for (const p of cat.inverter ? EXTRA_PREFS_INVERTER : EXTRA_PREFS_MODULE)
      for (const c of cands) if (norm(c.label).includes(p) && !tableCols.includes(c)) tableCols.push(c);
    for (const c of cands) if (!tableCols.includes(c)) tableCols.push(c);
    tableCols = tableCols.slice(0, 6);
  }

  // build records, de-duplicate
  const recs = [];
  const seen = new Map();
  const dataCols = columns.filter((c) => !isSerialLabel(c.label));
  rawRecords.forEach((r) => {
    report.sourceRows++;
    const values = {};
    for (const c of columns) values[c.key] = r.vals.get(c) ?? "";
    const brand = brandCol ? values[brandCol.key] : "";
    const model = modelCol ? values[modelCol.key] : "";
    const flags = [];
    if (!model) flags.push("Model number is empty in the source");
    if (!brand) flags.push("Brand / manufacturer is empty in the source");
    let capacity = null;
    if (capCol) {
      const { cap, flag } = parseCapacity(values[capCol.key], capCol.label);
      capacity = cap;
      if (flag) flags.push(flag);
    }
    const rec = { id: `${cat.id}:${r.sheet.replace(/[^a-z0-9]+/gi, "-")}:${r.row}`, brand, model, capacity, values, sheet: r.sheet, row: r.row, flags };
    if (model) {
      const dk = `${collapse(brand)}|${collapse(model)}`;
      const prev = seen.get(dk);
      if (prev) {
        const sig = (x) => JSON.stringify(dataCols.map((c) => collapse(x.values[c.key] ?? "")));
        if (sig(prev) === sig(rec)) {
          // identical row: kept (so counts match the Excel file) and listed in the import report
          report.exactDuplicatesKept.push({ sheet: r.sheet, row: r.row, duplicateOfRow: prev.row, brand, model });
          recs.push(rec);
          return;
        }
        const msg = `Same brand and model also appears at row ${prev.row} (sheet "${prev.sheet}") with different data`;
        rec.flags.push(msg);
        if (!prev.flags.some((f) => f.startsWith("Same brand and model"))) prev.flags.push(`Same brand and model also appears at row ${r.row} (sheet "${r.sheet}") with different data`);
      } else seen.set(dk, rec);
    }
    recs.push(rec);
  });

  // dataset-level consistency checks (reported, never auto-corrected)
  const brandCase = new Map();
  for (const r of recs) if (r.brand) { const k = r.brand.toLowerCase().replace(/\s+/g, " "); (brandCase.get(k) ?? brandCase.set(k, new Set()).get(k)).add(r.brand); }
  for (const set of brandCase.values()) if (set.size > 1) report.warnings.push(`Brand written in different ways (not merged): ${[...set].map((s) => `"${s}"`).join(", ")}`);
  const units = new Set(recs.filter((r) => r.capacity).map((r) => r.capacity.unit));
  if (units.size > 1) report.warnings.push(`Capacity uses multiple units (${[...units].map((u) => u || "(none)").join(", ")}); values are kept as written and filtered per unit`);
  const flagged = recs.filter((r) => r.flags.length).length;
  if (flagged) report.warnings.push(`${flagged} record(s) flagged for review (see "flags" in the generated JSON)`);

  const dateRe = /(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})|\b(19|20)\d{2}\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i;
  const sourceDateText = notes.find((n) => dateRe.test(n)) ?? null;

  const dataset = {
    category: cat.id,
    sourceFile: path.basename(file),
    importedAt: new Date().toISOString(),
    sheets: report.sheets,
    notes,
    sourceDateText,
    columns,
    tableColumns: tableCols.map((c) => c.key),
    brandKey: brandCol?.key ?? null,
    modelKey: modelCol?.key ?? null,
    capacityKey: capCol?.key ?? null,
    records: recs,
  };
  return { dataset, report };
}

export function recordKey(r) {
  return `${collapse(r.brand)}|${collapse(r.model)}`;
}
export function recordSig(r) {
  return JSON.stringify(Object.entries(r.values).map(([k, v]) => [k, collapse(v)]));
}
