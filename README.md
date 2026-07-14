# fhir-ui

Web UI for entering clinical data that is converted into **FHIR R4**
resources and downloaded as a JSON file — no server required.

**Live demo:** https://alekseidudchenko.github.io/fhir-ui/ (deployed from
`main` via GitHub Actions)

## What it does

```
form fields  →  pure mapper fn  →  FHIR R4 resource  →  download as {type}-{id}.json
```

- **Patient form** — produces a `Patient` conforming to the
  [MII Core Data Set (Kerndatensatz), Person module](https://simplifier.net/medizininformatikinitiative-modulperson):
  `identifier:pid` slice (type MR), optional `identifier:versichertenId_GKV`
  slice (KVNR + insurer IKNR as assigner), German administrative gender
  ("divers"/"unbestimmt" via the `gender-amtlich-de` extension), name,
  birth date, address
- **Encounter form** — produces an `Encounter` conforming to the
  [MII Core Data Set (Kerndatensatz), Fall module](https://github.com/medizininformatik-initiative/kerndatensatzmodul-fall)
  ("KontaktGesundheitseinrichtung" profile): optional `identifier:Aufnahmenummer`
  slice (type VN), status, class (`EncounterClassDE`), optional
  `type:Kontaktebene` / `type:KontaktArt` slices, period, department
  (DKG Fachabteilungsschlüssel) and admission source (DKG Aufnahmeanlass)
  as free-text codes, treating institution
- **Observation form** — patient reference, LOINC code, value + UCUM unit,
  effective time → `Observation` (laboratory)
- Each form has a **Fill random data** helper (Patient) and, after submit, a
  **Download panel** with a JSON preview of the generated resource.

## Tech stack

- React 18 + Vite + TypeScript
- `@types/fhir` for typed FHIR R4 resources — resources are built by small
  pure mapper functions (`src/fhir/mappers/`)
- react-hook-form + zod for client-side form validation
- Vitest for unit tests

## Develop

```bash
npm install
npm run dev        # start dev server at http://localhost:5173
npm test           # run unit tests (mappers)
npm run build      # type-check + production build
```

## Using the downloaded resources

The generated JSON files are standalone FHIR R4 resources. Post them to any
FHIR server yourself, e.g.:

```bash
curl -X POST http://localhost:8080/fhir/Patient \
  -H 'Content-Type: application/fhir+json' \
  -d @patient-pid-12345.json
```

## MII Kerndatensatz coverage

The MII Core Data Set is split into several modules, each its own FHIR
profile package. This UI currently covers:

| Module | Resource | Status |
| ------ | -------- | ------ |
| Person | `Patient` | ✅ |
| Fall | `Encounter` | ✅ |
| Labor | `Observation` | partial (generic, not yet the official Laborbefund profile) |
| Diagnose, Prozedur, Medikation, … | — | not yet implemented |

Note: profile validation (e.g. MII Kerndatensatz) happens **on the FHIR
server**, not in this UI — the UI only enforces basic structural rules
client-side.

## Project structure

```
src/
├── fhir/
│   ├── types.ts             # form-level models
│   └── mappers/              # pure formData → FHIR resource functions (+ tests)
├── components/
│   ├── PatientForm.tsx
│   ├── EncounterForm.tsx
│   ├── ObservationForm.tsx
│   └── DownloadPanel.tsx     # post-submit filename + JSON preview
├── demoData.ts                # "Fill random data" generator
├── download.ts                # browser download helper
├── App.tsx                    # tab navigation
└── main.tsx
```
