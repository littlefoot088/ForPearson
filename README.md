# Carrowmore · Candidate review

A functional, single-page prototype for a redeployment officer reviewing Eimhin Mac Neidhe for Carrowmore Array’s Wind Turbine Technician vacancy. Built with React, JavaScript/JSX, Mantine and Vite.

## Run locally

Requires Node.js 22.13+ (22.x), 24+ (24.x), or 26+ and npm; Node 24 is recommended. From this repository:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` creates the production bundle in `dist/`; `npm test` runs fixture/state checks and component interaction tests. `npm run test:ui` runs only the Mantine interaction tests.

## What it demonstrates

- A concise Review focus summary beneath the candidate’s name, followed by nine compact requirement rows.
- Progressive disclosure from requirement to assessment to original evidence. Mechanical or electrical maintenance remains one requirement with two distinct evidence routes.
- Eleven verbatim raw log entries and four training records, with source locations, exact highlights and separate interpretations.
- Evidence-state labels that distinguish experience evidence, recorded modules, attendance and unresolved requirements without scores or unsupported certification claims.
- Editable local clarification drafts, a draft-review dialog shown on demand, qualification flags, and independent Worth progressing / Clarification needed controls.

The review date is fixed at **31 December 2026**, an explicitly agreed fictional scenario date. All records are synthetic. Source dates show selected evidence, not the number of times a person performed an activity.

## Boundaries and limitations

All changes use React state and reset on refresh. Nothing is sent, verified externally, or persisted to a server. There is no authentication, matching algorithm, data ingestion, backend or keeper-facing screen. Navigation labels provide context; only the role-requirements dialog is implemented beyond the review itself. Typography uses Mantine’s default system fonts; no font downloads are required.

The fixture is deliberately small and hand-curated. Missing evidence does not establish absence of experience or certification. Personnel attribution uses corroborating source identifiers and postings; it is not a verified identity service. Employer acceptance of safety and height certification needs confirmation. An expiry field on an attendance record does not prove that an award was made.

See [information architecture](docs/information-architecture.md) and [data decisions](docs/data-decisions.md). No personal assessment reflection has been written on the applicant’s behalf.

## Design system

Mantine owns typography, spacing, component sizes, radii, breakpoints and standard interaction behaviour. `src/theme.js` changes only brand/semantic colours and the canvas/text colours. The application stays in light mode. `src/styles.css` contains only branding, skip-link positioning, status-column alignment, verbatim/source wrapping, notification placement and review-bar positioning. Do not recreate button, input, modal or typography scales in CSS.

Requirement assessments, exact substring highlighting and record metadata remain domain-specific compositions. `src/App.jsx` holds local review state; `src/main.jsx` installs the provider and library styles. Mantine Modal/Drawer handle focus containment, Escape and scroll locking; the app restores the original opener after overlay transitions, including removal of the final draft.

## Validation

Production build and eleven tests pass: six fixture/state checks and five component interaction tests. Coverage includes verbatim highlights, pre-joining-date records, evidence reachability, single-row disclosure, source navigation/original fields, local draft editing/removal, verification flags, all four review-state combinations, keyboard activation, focus containment and return focus. The component suite runs in jsdom and does not verify visual layout.

Desktop Chrome checks covered requirement expansion, evidence navigation, original-field disclosure, clarification drafting/editing, modal Escape and focus return. Shift+Tab at the evidence drawer’s first control wraps to its last control. Narrow reflow and the full-width evidence drawer were visually checked at 200% and 300% browser zoom. The action bar returns to normal flow on narrow or short viewports. Theme text/button contrast was checked numerically; group-label contrast was increased without changing the palette.

This is not physical mobile-device testing or a full accessibility audit. Remaining design review: test comprehension of the evidence-state labels with redeployment officers and validate touch interactions on a physical mobile device. Certificate acceptance and unresolved scope of work remain visible in expanded assessments.
