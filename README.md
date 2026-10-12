# Carrowmore redeployment prototype

A React, JavaScript, Mantine and Vite prototype for redeployment officers. It connects a People workspace, keeper profiles and an evidence-backed opportunity assessment to a locally simulated candidate introduction journey.

This document describes the current application, not its development history. Start with [CONTRIBUTING.md](CONTRIBUTING.md) before making changes.

## Run and validate

```sh
npm ci
npm run dev
npm test
npm run build
```

Vite prints the local development URL. The build output is `dist/`. There is no backend, authentication, cross-device synchronisation or real sending integration. Changes are saved in this browser's localStorage; sharing a deployment does not share an officer's saved workspace.

## Pages and scope

| Page | Current behaviour |
| --- | --- |
| People (`#people`) | Six sample keepers, name search, employment-intention and attention filters, grouped opportunities with individual Progress and Next action. Filters survive in-app navigation. |
| Keeper profile (`#people/eimhin`, or another existing person ID) | Career context, editable employment intention/preferences, curated opportunity selection and opportunity-level progress. |
| Opportunity assessment (`#people/eimhin/wind-turbine-technician`) | Eimhin's Wind Turbine Technician assessment, evidence inspection, qualification verification, tasks, conversations and candidate introduction. |

The direct People → turbine assessment link remains alongside View profile. Other opportunity entries are illustrative and do not open additional assessments. Retirement cases sort last and suppress placement exploration; employment-arranged profiles also suppress further job search. Earlier selections are retained for reference.

The six scenarios are Eimhin Mac Neidhe (implemented assessment), Aoife Ní Mhurchú (interview invitation), Coilean Ó Caomhthaigh (undecided), Nóra Ní Bhraonáin (qualification support), Fintan Ó Ceallaigh (retirement), and Cian Ó Dálaigh (employment arranged). Additional associations and employer outcomes are illustrative fixtures, not findings from source records. Eimhin's initial Interested response is a user-confirmed demonstration scenario; it is not inferred from employment evidence or permission to share.

## Current interaction model

- Employment intention describes the person's wider plans. Your assessment is suitability for one opportunity. Progress describes the officer's work stage. These remain separate.
- The officer panel keeps status-editing controls in consistent positions and gives one recommended Next action. A current simulated send completes the journey: View sent introduction remains available, without another Next action.
- What needs doing contains tasks. Linked system tasks complete from saved workflow events; manual tasks remain manually managed. A checkbox cannot establish certificate verification.
- Conversations owns multi-topic question preparation, dated private notes, questions covered and history. Eimhin's reported accounts are recorded separately and require explicit inclusion in an introduction.
- Evidence opens as a complete dated timeline. Every logbook entry can be excluded or restored. Originals remain available; flags are separate from inclusion and attribution.
- Required qualifications support officer-recorded document verification, corrections and withdrawal. Training modules do not establish complete certificates. Medical verification stores clearance metadata only.
- Introduction preparation follows preview → edit → review → explicit save → review with Eimhin → unchecked sharing acknowledgement → simulated send. Nothing is transmitted. Changed or stale wording requires review; earlier sent snapshots remain immutable.

## State and evidence

`src/workflowState.js` is the shared derivation layer for assessment, People and profiles. `src/workspace.js` owns reducer guards, explicit saves and additive storage migration. The current envelope is version 10 under the existing person/opportunity storage key. Old notes, tasks, questions, exclusions, flags, preferences, introductions and sent snapshots are preserved. Storage failure leaves the session usable with a visible warning. Confirmed workspace reset retains keeper profile context.

Original evidence lives in `src/records.js` and `src/evidence-audit.json`; curated interpretation lives in `src/data.js`. The complete bounded log review exposes 18 pump, 48 electrical and two planning/permit matches before reviewer exclusions. These counts describe recorded entries, not verified competence or actual work frequency. Uncertain early entries remain inspectable but cannot become confirmed introduction evidence merely because they are included.

Historical fixture interpretation uses the agreed fictional review date, 31 December 2026. Newly recorded qualification verification uses the current Europe/London calendar date. Missing documentation is not proof that a qualification was never held. See the source-specific documentation below for provenance and limitations.

## Documentation and handover

| Document | Purpose |
| --- | --- |
| [Design system](docs/design-system.md) | Current palette, components, responsive layout, action placement and accessibility conventions. |
| [Information architecture](docs/information-architecture.md) | Terminology, routes, workflow rules, ownership, privacy and persistence. |
| [Contributor guide](CONTRIBUTING.md) | How to change the application and demonstrate compatibility. |
| [Agent instructions](AGENTS.md) | Repository instructions for coding agents. |
| [Data decisions](docs/data-decisions.md) | Historical source selection, attribution and fixture interpretation. |
| [Evidence review](docs/evidence-review.md) | Bounded log audit, matching rules and limitations. |

The [screenshot gallery](artifacts/app-review/index.html) and [ZIP](artifacts/carrowmore-screenshots.zip) show desktop/mobile pages and principal interaction states captured on 12 October 2026 using an isolated sample workspace. They are a dated reference, not a substitute for checking a changed UI.

Tests cover fixture integrity, workflow guards, migration, introduction privacy, profiles, conversations and component interactions. Browser screenshots and keyboard checks supplement them; jsdom does not verify rendered layout. No full screen-reader, physical-device or WCAG conformance audit is claimed. Real messaging, automated matching, additional assessments, employer decision workflows and interview scheduling are outside the implemented scope.
