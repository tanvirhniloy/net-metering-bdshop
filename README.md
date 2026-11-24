# Net Metering by BDSHOP

A searchable, filterable directory of SREDA-approved solar modules, single-phase inverters and three-phase inverters for
Bangladesh's Net Metering Program. Built with Next.js (App Router), TypeScript and Tailwind CSS.

**Features:** category tabs with live counts · instant model search (case-insensitive, partial, tolerant of spaces/hyphens) ·
searchable brand dropdown · capacity filter (dropdown, or min/max range when a category has more than 25 distinct values) ·
sorting · expandable specification rows · side-by-side comparison (up to 4 products, same category only) ·
filtered Excel/CSV export · SEO metadata, sitemap, robots, Open Graph image · keyboard and screen-reader friendly.

## 1. Run locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev          # http://localhost:3000
```

## 2. Import your Excel data (required before the lists show anything)

The project ships with **empty** datasets so no data is ever invented. Import your three official files:

1. Copy the files into `data/source/` (see `data/source/README.md` for accepted names), e.g.
   `Solar Modules.xlsx`, `Single Phase Inverters.xlsx`, `Three Phase Inverters.xlsx`.
2. Preview and publish:

```bash
npm run import-data              # shows a preview, then asks "Publish these changes? (y/N)"
npm run import-data -- --dry-run # preview only
npm run import-data -- --yes     # publish without prompt
npm run verify-data              # re-reads the Excel files and checks every row is in the published JSON
```

The importer:

- detects the header row on each worksheet and imports **every worksheet and every column** (nothing is dropped);
- keeps text exactly as displayed in Excel (model numbers, brand names, units, percentages);
- keeps text above the header and any single-cell note rows as "Notes from the source list" and detects a date line if present;
- fills only genuinely **merged** cells (e.g. a brand merged over several rows), never guesses blanks;
- removes only rows that are **exact** duplicates (same brand + model + identical data) and lists them;
  same brand + model with *different* data is kept and **flagged for review**;
- flags: empty model/brand, capacity that is a range or unreadable, capacity without a unit, brand spelled in several ways,
  multiple capacity units. Flags appear in the row details (and as a warning icon in the table). Nothing is auto-corrected;
- checks that `source rows = imported + exact duplicates removed` and refuses to publish otherwise;
- prints added / updated / removed counts against the currently published data and appends to `data/import-history.json`.

Output is written to `data/generated/*.json`, which is what the website reads. **Commit these JSON files** so Vercel can build
without the Excel files.

### If a column is detected wrongly
Edit `data/import-config.json` (remove the leading `_` from the category key) and set the exact header names:

```json
{
  "three-phase-inverters": {
    "brand": "Manufacturer",
    "model": "Model No",
    "capacity": "Rated AC Output Power (kW)",
    "tableColumns": ["Max PV Input Power (kW)", "Max PV Input Voltage (V)", "MPPT", "Phase"]
  }
}
```

Brand, model and capacity are always the first columns of the table; `tableColumns` chooses the additional ones.
All columns always appear in the expanded details, the comparison and the export.

### About units
Capacity values are shown and filtered exactly as written (`50 kW`, `550 Wp`). If a category mixes units, each unit is a separate
filter option. Conversion to watts is used **only** to order the sort and the min/max range; it is never displayed.

## 3. Configuration

| What | Where |
| --- | --- |
| Banner (1200 x 160) | Replace `public/banner.svg` or change `bannerSrc` in `lib/site-config.ts` |
| External links (BDSHOP.com, SREDA guidelines, Contact) | `lib/site-config.ts` -> `links` (these are **placeholders**, please confirm) |
| Public site URL (canonical, sitemap, Open Graph) | `NEXT_PUBLIC_SITE_URL` (see `.env.example`) |
| Colors | `tailwind.config.ts` |
| Favicon | `app/icon.svg` |

## 4. Deploy: GitHub + Vercel

```bash
git init
git add .
git commit -m "Net Metering by BDSHOP"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

1. In Vercel choose **Add New -> Project**, import the repository (Next.js is auto-detected; no build settings needed).
2. Add the environment variable `NEXT_PUBLIC_SITE_URL` = your production URL (e.g. `https://netmetering.bdshop.com`).
3. Deploy. To publish new equipment lists later: run `npm run import-data` locally, commit `data/generated/` and push.

Check before pushing: `npm run typecheck && npm run build`.

## 5. Project structure

```
app/                      routes: / and /[category] (solar-modules, single-phase-inverters, three-phase-inverters), SEO files
components/directory/     tabs, filters, table, details, compare bar/modal, export menu
components/site/          header, banner, footer, information sections
components/ui/            combobox, skeleton
lib/                      types, filtering/sorting, export, data access (lib/data.ts), site config
scripts/                  Excel importer (import-data.mjs), verifier (verify-data.mjs), shared parser (lib.mjs)
data/source/              your Excel files (input)
data/generated/           normalised JSON read by the site (output, committed)
```

## 6. Notes and scope

- **Not included in this version:** a Supabase-backed admin dashboard with login. The importer already implements the preview,
  validation, change counts, confirmation and import history as a command-line workflow; `lib/data.ts` is the single place to swap
  to a database later. Public visitors cannot modify any data (it is static JSON baked into the build).
- **UI components:** to keep dependencies minimal, buttons, tabs, dialog and the searchable combobox are hand-built with Tailwind
  (shadcn-style) instead of installing the shadcn CLI and Radix packages. They are keyboard accessible with visible focus states.
- **`xlsx` (SheetJS) 0.18.5** from npm has published advisories that concern *parsing untrusted files*. Here it only parses your own
  trusted Excel files locally, and in the browser it only *writes* exports. Do not expose the import script to user uploads.
- Fonts (Geist) are bundled through the `geist` package, so no network access is needed at build time.
- Approval status is never inferred: a product appears only if its exact row exists in your source file. The page also states that
  net-metering listing does not imply hybrid or battery support.
