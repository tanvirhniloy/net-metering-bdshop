#!/usr/bin/env node
/**
 * Import the three official Excel lists into data/generated/*.json.
 *
 *   npm run import-data              preview changes, then ask for confirmation
 *   npm run import-data -- --dry-run preview only, write nothing
 *   npm run import-data -- --yes     skip the confirmation prompt (CI / scripts)
 *
 * Put the files in data/source/ (see data/source/README.md). Nothing is published until you confirm.
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { CATEGORIES, findSourceFile, parseWorkbook, recordKey, recordSig } from "./lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "data", "source");
const outDir = path.join(root, "data", "generated");
const historyFile = path.join(root, "data", "import-history.json");
const configFile = path.join(root, "data", "import-config.json");
const args = new Set(process.argv.slice(2));

const overrides = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, "utf8")) : {};
const results = [];

for (const cat of CATEGORIES) {
  const file = findSourceFile(srcDir, cat);
  if (!file) {
    console.log(`\n[${cat.label}] no Excel file found in data/source/ - keeping the current data.`);
    continue;
  }
  const { dataset, report } = parseWorkbook(file, cat, overrides);
  const outFile = path.join(outDir, `${cat.id}.json`);
  const prev = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, "utf8")) : { records: [] };

  // diff against the published data
  const withIdx = (arr) => { const seen = new Map(); return new Map(arr.map((r) => { const k = recordKey(r); const n = seen.get(k) ?? 0; seen.set(k, n + 1); return [`${k}#${n}`, r]; })); };
  const a = withIdx(prev.records), b = withIdx(dataset.records);
  let added = 0, removed = 0, updated = 0;
  for (const [k, r] of b) { if (!a.has(k)) added++; else if (recordSig(a.get(k)) !== recordSig(r)) updated++; }
  for (const k of a.keys()) if (!b.has(k)) removed++;

  const verified = report.sourceRows === dataset.records.length + report.exactDuplicatesDropped.length;

  console.log(`\n=== ${cat.label} ===`);
  console.log(`File:            ${path.basename(file)}  (sheets: ${report.sheets.join(", ") || "none"})`);
  if (report.skippedSheets.length) console.log(`Skipped sheets:  ${report.skippedSheets.join("; ")}`);
  console.log(`Columns:         ${dataset.columns.length}  ->  ${dataset.columns.map((c) => c.label).join(" | ")}`);
  console.log(`Detected:        brand="${report.brandColumn ?? "?"}"  model="${report.modelColumn ?? "?"}"  capacity="${report.capacityColumn ?? "?"}"`);
  console.log(`Table columns:   ${dataset.tableColumns.map((k) => dataset.columns.find((c) => c.key === k)?.label).join(" | ") || "(none)"}`);
  console.log(`Source rows:     ${report.sourceRows} data rows`);
  console.log(`Imported:        ${dataset.records.length} records`);
  console.log(`Identical repeated rows (kept): ${report.exactDuplicatesKept.length}`);
  for (const d of report.exactDuplicatesKept.slice(0, 30)) console.log(`   - row ${d.row} repeats row ${d.duplicateOfRow}: ${d.brand} ${d.model}`);
  console.log(`Note rows kept as source notes: ${report.noteRows.length}`);
  console.log(`Verification:    ${verified ? "OK - every source row is accounted for" : "MISMATCH - investigate before publishing"}`);
  console.log(`Change preview:  +${added} added, ~${updated} updated, -${removed} removed  (currently published: ${prev.records.length})`);
  for (const w of report.warnings) console.log(`   ! ${w}`);
  results.push({ cat, dataset, report, outFile, added, updated, removed, verified });
}

if (!results.length) {
  console.log("\nNothing to import. Place your three Excel files in data/source/ (see data/source/README.md).");
  process.exit(0);
}
if (results.some((r) => !r.verified)) {
  console.error("\nVerification failed. Nothing was written.");
  process.exit(1);
}
if (args.has("--dry-run")) {
  console.log("\nDry run: nothing was written.");
  process.exit(0);
}

let ok = args.has("--yes");
if (!ok) {
  if (!process.stdin.isTTY) {
    console.error("\nNon-interactive shell: re-run with --yes to publish, or --dry-run to preview.");
    process.exit(1);
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  ok = /^y(es)?$/i.test((await rl.question("\nPublish these changes? (y/N) ")).trim());
  rl.close();
}
if (!ok) {
  console.log("Cancelled. Nothing was written.");
  process.exit(0);
}

fs.mkdirSync(outDir, { recursive: true });
const history = fs.existsSync(historyFile) ? JSON.parse(fs.readFileSync(historyFile, "utf8")) : [];
const entry = { at: new Date().toISOString(), categories: {} };
for (const r of results) {
  fs.writeFileSync(r.outFile, JSON.stringify(r.dataset));
  entry.categories[r.cat.id] = {
    file: r.dataset.sourceFile, records: r.dataset.records.length, added: r.added, updated: r.updated, removed: r.removed,
    identicalRowsKept: r.report.exactDuplicatesKept.length, noteRows: r.report.noteRows.length, warnings: r.report.warnings,
  };
}
history.push(entry);
fs.writeFileSync(historyFile, JSON.stringify(history, null, 2) + "\n");
console.log("\nPublished. Run `npm run verify-data`, then `npm run dev` to check the site.");
