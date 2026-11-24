# Source Excel files

Place the three official SREDA list files in this folder, then run `npm run import-data`.

| Category | Accepted file names (any of) |
| --- | --- |
| Solar Modules | `solar-modules.xlsx`, or any file name containing "module" / "panel" |
| Single Phase Inverters | `single-phase-inverters.xlsx`, or any file name containing "single" |
| Three Phase Inverters | `three-phase-inverters.xlsx`, or any file name containing "three" / "3-phase" |

`.xlsx`, `.xlsm` and `.xls` are supported. Every worksheet in a file is imported.

These files are not required for deployment: the site reads the generated JSON in `data/generated/`.
You may keep the Excel files in the repository (as an audit trail) or add `data/source/*.xls*` to `.gitignore`.
