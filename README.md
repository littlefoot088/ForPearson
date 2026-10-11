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

- One concise narrative explains why Eimhin is worth considering. A compact header identifies the keeper, opportunity, employer and sourced working arrangements.
- Two essential maintenance evidence rows lead to their assessment and original evidence. Five safety/medical rows follow; permits and supporting colleagues are grouped as additional employer preferences. Offshore working conditions sit with opportunity interest. Mechanical or electrical maintenance remains one underlying requirement with two alternative evidence routes.
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

Mantine owns typography, spacing, component sizes, radii, breakpoints and standard interaction behaviour. `src/theme.js` changes only brand/semantic colours and the canvas/text colours. The application stays in light mode. `src/styles.css` contains only branding, skip-link positioning, status-column alignment, verbatim/source wrapping, notification placement. Do not recreate button, input, modal or typography scales in CSS.

Requirement assessments, exact substring highlighting and record metadata remain domain-specific compositions. `src/App.jsx` holds local UI state; `src/workflow.js` separates opportunity decisions and their guards, and `src/opportunity.jsx` presents the shared state-based recommendation and contextual actions; `src/main.jsx` installs the provider and library styles. Mantine Modal/Drawer handle focus containment, Escape and scroll locking; the app restores the original opener after overlay transitions, including removal of the final discussion question.

## Validation

All 25 tests pass (13 fixture/workflow tests and 12 component tests). `npm test` covers source integrity, qualification distinctions, evidence reachability and the proposed workflow rules. Component tests cover single-row disclosure, source navigation/highlighting, source details, discussion questions, verification checks, career discussion, separate suggestion/response stages and nomination gates. The nomination tests check that changed interest invalidates a prior local decision and never submits to an employer. The component suite uses jsdom and does not verify visual layout.

The production build passes. Component tests cover the restructured experience/qualification lists, all eleven exact log highlights, all four training records, optional discussion topics and state-based recommendation precedence, in addition to the existing focus, discussion, check and nomination safeguards. They run in jsdom and do not verify visual layout.

Browser QA covered the desktop narrative, separate experience/qualification lists, optional discussion topics and explicit saving/deduplication. Narrow reflow and recommendation-control wrapping were checked in Chrome at 250% zoom, together with the full-width highlighted source drawer and Escape/return focus. Browser access briefly failed but recovered before these checks. Physical mobile testing, a full screen-reader audit and a complete browser walkthrough of every nomination state remain outstanding; state combinations and nomination safeguards are covered by automated tests.

The proposed operating process and potential business benefits are documented in [information architecture](docs/information-architecture.md); they are not claimed as existing operations or measured results. Remaining design research includes officer comprehension of the statuses, acceptable referral evidence and keeper understanding of the opportunity suggestion.

## Candidate-focused assessment

The Why consider Eimhin narrative is curated copy in `src/data.js`, with explicit claim, source and vacancy links. It connects repeated pump repairs and electrical fault-finding to the employer’s acceptance of maintenance experience from other plant and lack of a prior-wind requirement. The rationale does not depend on the two disputed 2009 records and does not certify current competence. Interest has its own section and is not repeated in the narrative.

Officer decision and next step is a normal-flow section, not a sticky bar. `nextRecommendation` supplies both its guidance and primary action. Initial Prepare discussion opens the existing question list with two optional topics; nothing is saved until the officer edits/saves a question. Subsequent states prioritise recording a response, following up information, reconsidering an unsuitable assessment or considering/reviewing nomination. Interest, checks and nomination remain separate.

Safety certification is expressly required before mobilisation. The vacancy states medical fitness as essential without specifying a verification stage; it does not establish certificate verification as an interview gate.


## Intentional hierarchy

Each fact has one home: candidate/opportunity context → suitability narrative → essential experience → safety certificates and medical fitness → additional employer preferences → keeper interest and required working conditions → officer decision and next step. The former three-column summary and repeated career-intention/preference labels are removed. Unknown personal plans stay distinct from opportunity-specific responses in the data.

Prepare discussion offers an editable role/offshore discussion prompt. Add qualification check creates a task, not a verification result; added checks are listed below qualifications and can be removed without reopening a row. Interest is read-only. Response recording is in the next-step section, introduced by “Already spoken with Eimhin?”; officer assessment editing sits beside the judgement. An unsuitable assessment can remain on hold. Evidence opens on the first post-joining selected record, while every early record and attribution caveat remains accessible in chronological navigation.

Latest hierarchy review: desktop rendering and narrow layout at 250% browser zoom were inspected. Controls wrapped without visible horizontal overflow. Physical-mobile and screen-reader testing were not performed; modal behaviour and focus restoration are covered by the component suite. The local preview is left running.

The header explicitly labels **Current role** (Lighthouse keeper, Carrowmore Light Authority) and **Opportunity being assessed** (Wind Turbine Technician, Carrowmore Array). The interest section has one status, without a second unknown-preferences sentence or competing question/response buttons. Discussion preparation and response recording have separate, explicit purposes in the next-step section.
