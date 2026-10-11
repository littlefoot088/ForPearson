# Carrowmore · Opportunity assessment

A functional, single-page prototype for a redeployment officer evaluating Carrowmore Array’s Wind Turbine Technician opportunity with Eimhin Mac Neidhe’s redeployment in mind. Built with React, JavaScript/JSX, Mantine and Vite.

## Run locally

Requires Node.js 22.13+ (22.x), 24+ (24.x), or 26+ and npm; Node 24 is recommended. From this repository:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` creates the production bundle in `dist/`; `npm test` runs fixture/state checks and component interaction tests. `npm run test:ui` runs only the Mantine interaction tests.

## What it demonstrates

- People-first context, a compact experience/qualifications/interest summary and explicitly unknown career preferences, followed by nine compact requirement rows.
- Progressive disclosure from requirement to assessment to original evidence. Mechanical or electrical maintenance remains one requirement with two distinct evidence routes.
- Eleven verbatim raw log entries and four training records, with source locations, exact highlights and separate interpretations.
- Evidence-state labels that distinguish experience evidence, recorded modules, attendance and unresolved requirements without scores or unsupported certification claims.
- One editable Discussion with Eimhin list; reversible qualification checks and separate internal record-review flags.
- Separate officer assessment, local opportunity suggestion, explicitly simulated keeper response and local nomination decision. Nomination needs interest, rationale and acknowledgement of unresolved requirements; it does not submit to the employer.

The review date is fixed at **31 December 2026**, an explicitly agreed fictional scenario date. All records are synthetic. Source dates show selected evidence, not the number of times a person performed an activity.

## Boundaries and limitations

All changes use React state and reset on refresh. Nothing is sent, verified externally, or persisted to a server. There is no authentication, matching algorithm, data ingestion, backend or keeper-facing screen. Navigation labels provide context. People/vacancy directories, full profiles, retirement filtering and employer outcomes are conceptual only. Typography uses Mantine’s default system fonts; no font downloads are required.

The fixture is deliberately small and hand-curated. Missing evidence does not establish absence of experience or certification. Personnel attribution uses corroborating source identifiers and postings; it is not a verified identity service. Employer acceptance of safety and height certification needs confirmation. An expiry field on an attendance record does not prove that an award was made.

See [information architecture](docs/information-architecture.md) and [data decisions](docs/data-decisions.md). No personal assessment reflection has been written on the applicant’s behalf.

## Design system

Mantine owns typography, spacing, component sizes, radii, breakpoints and standard interaction behaviour. `src/theme.js` changes only brand/semantic colours and the canvas/text colours. The application stays in light mode. `src/styles.css` contains only branding, skip-link positioning, status-column alignment, verbatim/source wrapping, notification placement and review-bar positioning. Do not recreate button, input, modal or typography scales in CSS.

Requirement assessments, exact substring highlighting and record metadata remain domain-specific compositions. `src/App.jsx` holds local UI state; `src/workflow.js` separates opportunity decisions and their guards, and `src/opportunity.jsx` provides contextual actions; `src/main.jsx` installs the provider and library styles. Mantine Modal/Drawer handle focus containment, Escape and scroll locking; the app restores the original opener after overlay transitions, including removal of the final discussion question.

## Validation

All 19 tests pass (10 fixture/workflow tests and 9 component tests). `npm test` covers source integrity, qualification distinctions, evidence reachability and the proposed workflow rules. Component tests cover single-row disclosure, source navigation/highlighting, source details, discussion questions, verification checks, career discussion, separate suggestion/response stages and nomination gates. The nomination tests check that changed interest invalidates a prior local decision and never submits to an employer. The component suite uses jsdom and does not verify visual layout.

The production build passes. Browser QA for this simplification covered the summary, requirement expansion, evidence navigation, attribution caveat, internal record flag, source disclosure, discussion creation/removal, qualification-task toggling and officer-assessment dialog. Escape restored focus to the evidence opener and the officer-assessment control. Desktop and narrow reflow/full-width evidence were visually checked in Chrome at standard zoom and 250% zoom. Component tests cover final-question focus restoration, editing/deduplication, qualification-check independence and the complete nomination path. Physical mobile devices, a full screen-reader audit and the complete nomination path in a real browser remain unchecked.

The proposed operating process and potential business benefits are documented in [information architecture](docs/information-architecture.md); they are not claimed as existing operations or measured results. Remaining design research includes officer comprehension of the statuses, acceptable referral evidence and keeper understanding of the opportunity suggestion.
