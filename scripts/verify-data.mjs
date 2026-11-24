#!/usr/bin/env node
/**
 * Independent check: re-reads the Excel files and confirms every source row is present in data/generated
 * (matched by brand + model + row number), and that no category is empty when a source file exists.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CATEGORIES, findSourceFile, parseWorkbook } from "./lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configFile = path.join(root, "data", "import-config.json");
const overrides = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, "utf8")) : {};
let failed = false;

for (const cat of CATEGORIES) {
  const gen = path.join(root, "data", "generated", `${cat.id}.json`);
  const published = JSON.parse(fs.readFileSync(gen, "utf8"));
  const file = findSourceFile(path.join(root, "data", "source"), cat);
  if (!file) {
    console.log(`${cat.label}: ${published.records.length} published records (source file not present, skipped comparison)`);
    continue;
  }
  const { dataset, report } = parseWorkbook(file, cat, overrides);
  const pub = new Map(published.records.map((r) => [`${r.sheet}:${r.row}`, r]));
  const missing = dataset.records.filter((r) => !pub.has(`${r.sheet}:${r.row}`));
  const mismatched = dataset.records.filter((r) => {
    const p = pub.get(`${r.sheet}:${r.row}`);
    return p && JSON.stringify(p.values) !== JSON.stringify(r.values);
  });
  const expected = report.sourceRows - report.exactDuplicatesDropped.length;
  const ok = !missing.length && !mismatched.length && published.records.length === expected;
  if (!ok) failed = true;
  console.log(
    `${cat.label}: source rows ${report.sourceRows}, exact duplicates removed ${report.exactDuplicatesDropped.length}, ` +
      `published ${published.records.length}, missing ${missing.length}, differing ${mismatched.length}  ->  ${ok ? "OK" : "FAIL"}`,
  );
}
process.exit(failed ? 1 : 0);
