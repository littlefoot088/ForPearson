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

- Three experience areas linked to eleven verbatim raw log entries, with exact highlighted passages, source locations, interpretations and limitations.
- Formal qualification coverage kept separate from practical experience. Individual modules never stand in for complete certificates.
- An evidence drawer with dated record selection, previous/next controls, keyboard support and a narrow-screen layout.
- Editable clarification drafts, qualification verification flags and reversible review decisions.

The review date is fixed at **31 December 2026**, an explicitly agreed fictional scenario date. All records are synthetic. Source dates show selected evidence, not the number of times a person performed an activity.

## Boundaries and limitations

All changes use React state and reset on refresh. Nothing is sent, verified externally, or persisted to a server. There is no authentication, matching algorithm, data ingestion, backend or keeper-facing screen. Navigation labels provide context; only the role-requirements dialog is implemented beyond the review itself. Fonts are bundled locally.

The fixture is deliberately small and hand-curated. Missing evidence does not establish absence of experience or certification. Personnel attribution uses corroborating source identifiers and postings; it is not a verified identity service. Employer acceptance of safety and height certification needs confirmation. An expiry field on an attendance record does not prove that an award was made.

See [information architecture](docs/information-architecture.md) and [data decisions](docs/data-decisions.md). No personal assessment reflection has been written on the applicant’s behalf.

## Validation

Production build and four fixture tests pass. The eleven log entries were compared directly with the supplied ZIP. Desktop Chrome checks covered evidence navigation, highlighted passages, Escape and focus restoration, edited draft saving, qualification flags and progression while keeping outstanding requirements visible.

Responsive CSS includes a single-column narrow-screen layout and a full-width evidence drawer. Mobile visual QA remains unverified: the browser automation connection failed when switching to device preview. No claim of a full accessibility audit is made.
