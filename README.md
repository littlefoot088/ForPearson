# Carrowmore · Candidate review

A functional, single-page prototype for a redeployment officer reviewing Eimhin Mac Neidhe for Carrowmore Array’s Wind Turbine Technician vacancy. Built with React, JavaScript/JSX and Vite.

## Run locally

Requires Node.js 20.19+ or 22.12+ and npm. From this repository:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` creates the production bundle in `dist/`; `npm test` checks fixture integrity and qualification distinctions.

## What it demonstrates

- A concise Review focus summary beneath the candidate’s name, followed by nine compact requirement rows.
- Progressive disclosure from requirement to assessment to original evidence. Mechanical or electrical maintenance remains one requirement with two distinct evidence routes.
- Eleven verbatim raw log entries and four training records, with source locations, exact highlights and separate interpretations.
- Evidence-state labels that distinguish experience evidence, recorded modules, attendance and unresolved requirements without scores or unsupported certification claims.
- Editable local clarification drafts, a draft-review dialog shown on demand, qualification flags, and independent Worth progressing / Clarification needed controls.

The review date is fixed at **31 December 2026**, an explicitly agreed fictional scenario date. All records are synthetic. Source dates show selected evidence, not the number of times a person performed an activity.

## Boundaries and limitations

All changes use React state and reset on refresh. Nothing is sent, verified externally, or persisted to a server. There is no authentication, matching algorithm, data ingestion, backend or keeper-facing screen. Navigation labels provide context; only the role-requirements dialog is implemented beyond the review itself. Fonts are bundled locally.

The fixture is deliberately small and hand-curated. Missing evidence does not establish absence of experience or certification. Personnel attribution uses corroborating source identifiers and postings; it is not a verified identity service. Employer acceptance of safety and height certification needs confirmation. An expiry field on an attendance record does not prove that an award was made.

See [information architecture](docs/information-architecture.md) and [data decisions](docs/data-decisions.md). No personal assessment reflection has been written on the applicant’s behalf.

## Validation

Production build and six focused data/state tests pass. Tests cover verbatim source integrity, the retained pre-joining-date records, qualification distinctions, requirement-to-evidence reachability and every combination of the independent review states.

Desktop Chrome checks covered row expansion, source inspection, Escape/focus return, editing and removing drafts, qualification flags and simultaneous progression/clarification. Narrow-width reflow and the full-width evidence drawer were visually checked at 250% and 300% browser zoom. The action bar returns to normal flow in short viewports. This is a responsive/reflow check, not testing on physical mobile devices or a full accessibility audit.

Remaining design review: test comprehension of the evidence-state labels with redeployment officers and validate touch interactions on a physical mobile device. Data limitations, including certificate acceptance and unresolved scope of work, remain visible in expanded assessments.
