# Carrowmore opportunity assessment

React + JavaScript + Vite prototype for one redeployment officer assessing Eimhin Mac Neidhe against Carrowmore Array’s Wind Turbine Technician opportunity. The outcome is a defensible local referral draft, not an employer submission.

## Run

```sh
npm install
npm run dev
npm test
npm run build
```

The development URL is printed by Vite (normally http://127.0.0.1:5173). Keep the dev server running while reviewing the prototype.

## Implemented experience

- A wider candidate assessment and a narrower sticky working area, stacked below Mantine’s md breakpoint.
- Explicit current/prospective roles, a curated suitability narrative, illustrative Interested state and unknown career preferences.
- One expanded assessment at a time; mechanical or electrical maintenance meets the experience requirement. Permits and supporting colleagues remain preferences.
- All eleven original log records and four training records, exact highlights, source navigation, original-field disclosure and independent record-review flags. Two early records retain attribution caveats.
- Opportunity progress, editable/completable tasks and dated private conversation notes with optional follow-up reminders.
- Qualification checks as linked tasks, independent of evidence outcomes. Completing a task does not verify a qualification.
- Editable Discussion with Eimhin questions, deduplicated by topic. Separately recorded responsibilities attributed to Eimhin, not treated as independent proof.
- An editable employer-facing referral, with explicit optional inclusion of reported responsibilities. Private notes and tasks never populate it automatically.
- Separate referral readiness decision: saved and reviewed draft, interest, suitable officer assessment, rationale and explicit acknowledgement of unresolved requirements. Readiness is local and does not imply approval to share, submission or interview.

## State and evidence

The fictional assessment date is **31 December 2026**. Safety certification is required before mobilisation; medical fitness is essential, with its verification stage unspecified. Modules, attendance, expired training and missing evidence retain distinct meanings. No required complete qualification is marked verified.

Workspace changes persist in versioned localStorage for `K0104` + `array-om`. Reset prototype workspace asks for confirmation and restores the initial interested scenario and tasks. Storage failure leaves the session usable with an explicit warning. No backend, authentication or cross-device synchronisation is provided. Only explicit saves retain editor changes; closing an unsaved editor discards them.

`src/records.js` holds unchanged original fixtures; `src/data.js` holds curated interpretations and relationships. `src/workspace.js` owns task/note/report/referral state, guards and persistence; `src/workspace.jsx` presents the workspace and editors. `src/workflow.js` retains the underlying opportunity response and judgement model. Evidence inspection remains independent.

Mantine owns typography, spacing, sizing, radii, responsive components and overlay behaviour. Contextual work uses drawers; short destructive confirmations use modals. Custom CSS is limited to branding, evidence formatting, status alignment, notices and sticky layout. See [design system](docs/design-system.md), [information architecture](docs/information-architecture.md) and [data decisions](docs/data-decisions.md).

## Scope and verification

The initial interest is clearly labelled illustrative, not extracted from records or an invented conversation. Actual sharing requires Eimhin’s approval of the information. Sharing approval, submission, employer outcomes and interview preparation remain conceptual, as do directories and the wider redeployment platform.

Tests cover fixture integrity/reachability, source highlights, disclosure, discussion editing, independent checks, task and note editing, storage recovery/reset, referral privacy, reported-information inclusion, readiness safeguards and focus transitions. jsdom component tests do not verify rendered layout. Browser verification results are reported with delivery; no physical-device or full screen-reader audit is claimed.

Verification for this iteration: 37 tests pass (19 fixture/state tests and 18 component tests), and the production build passes. Chrome checks covered the two-column desktop view, sticky workspace, local referral save, Escape/return focus, stacked controls at 250% zoom and full-width referral drawer. Zoom was restored to 100%. Persistence/remount, task/note editing, reset, reported-account inclusion and readiness combinations have automated coverage. A physical mobile device and full screen-reader audit were not tested.
