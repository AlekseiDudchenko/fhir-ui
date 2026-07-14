# fhir-ui

Web UI for entering clinical data that is converted into **FHIR R4** resources
and posted to any FHIR REST server (HAPI, [fhir-mii-pipeline](https://github.com/AlekseiDudchenko/fhir-mii-pipeline),
public test servers, …).

The server base URL is configurable in the app (Settings tab), so the UI is
not tied to a specific backend.

**Live demo:** https://alekseidudchenko.github.io/fhir-ui/ (deployed from
`main` via GitHub Actions)

## What it does

```
form fields  →  pure mapper fn  →  FHIR R4 resource  →  POST {baseUrl}/{Type}
                                                             │
                              201 → show new resource id     │
                              4xx/5xx → render OperationOutcome issues
```

- **Patient form** — produces a `Patient` conforming to the
  [MII Core Data Set (Kerndatensatz), Person module](https://simplifier.net/medizininformatikinitiative-modulperson):
  `identifier:pid` slice (type MR), optional `identifier:versichertenId_GKV`
  slice (KVNR + insurer IKNR as assigner), German administrative gender
  ("divers"/"unbestimmt" via the `gender-amtlich-de` extension), name,
  birth date, address
- **Observation form** — patient reference, LOINC code, value + UCUM unit,
  effective time → `Observation` (laboratory)
- **Validation errors** returned by the server as `OperationOutcome`
  (e.g. HAPI profile validation, HTTP 422) are rendered as a readable
  issue table — severity, location, diagnostics.

## Tech stack

- React 18 + Vite + TypeScript
- `@types/fhir` for typed FHIR R4 resources — resources are built by small
  pure mapper functions (`src/fhir/mappers/`), no heavyweight FHIR client
- react-hook-form + zod for client-side form validation
- Vitest for unit tests

## Develop

```bash
npm install
npm run dev        # start dev server at http://localhost:5173
npm test           # run unit tests (mappers)
npm run build      # type-check + production build
```

## Point it at a server

Open **Settings** in the app and set the FHIR base URL, e.g.

| Server | Base URL |
| ------ | -------- |
| fhir-mii-pipeline (local) | `http://localhost:8080/fhir` |
| HAPI public test server | `https://hapi.fhir.org/baseR4` |

The target server must allow CORS requests from the UI origin
(for fhir-mii-pipeline: add the origin to `app.cors.allowed-origins`).

Note: profile validation (e.g. MII Kerndatensatz) happens **on the server**.
The UI only enforces basic structural rules and renders whatever
`OperationOutcome` the server returns.

## Project structure

```
src/
├── fhir/
│   ├── client.ts           # thin fetch wrapper: create + OperationOutcome parsing
│   ├── types.ts            # form-level models, CreateResult
│   └── mappers/            # pure formData → FHIR resource functions (+ tests)
├── components/
│   ├── PatientForm.tsx
│   ├── ObservationForm.tsx
│   ├── ResultPanel.tsx     # success / error display
│   ├── OperationOutcomeView.tsx
│   └── SettingsPanel.tsx
├── settings.ts             # localStorage-backed server settings
├── App.tsx                 # tab navigation
└── main.tsx
```
