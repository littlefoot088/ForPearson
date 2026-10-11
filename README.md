# Carrowmore opportunity assessment

React + JavaScript + Vite prototype for one redeployment officer assessing Eimhin Mac Neidhe against Carrowmore Array’s Wind Turbine Technician opportunity. The outcome is a concise, evidence-backed candidate introduction, not an employer submission.

The app now opens with a compact **Redeployment workspace**: search people by name, filter employment intentions or show those with outstanding next actions. Open Eimhin’s Wind Turbine Technician link to enter the existing assessment; the People breadcrumb returns to the list without resetting work. Other opportunity associations are clearly illustrative and have no assessment links.

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
- Opportunity progress, editable/completable tasks and dated private conversation notes with retained historical follow-up text.
- Qualification checks as linked tasks, independent of evidence outcomes. Completing a task does not verify a qualification.
- Editable Discussion with Eimhin questions, deduplicated by topic. Separately recorded responsibilities attributed to Eimhin, not treated as independent proof.
- **Prepare candidate introduction** opens a document preview of approximately 200 words, with a short recommendation, three experience points, qualification readiness and an interview recommendation. Candidate CV: Not attached is informational only.
- **Edit introduction → Review introduction → Save introduction draft** separates editing, previewing and explicit local saving. Wording edited by the user is identified internally. Optional reported responsibilities retain their self-reported label.
- **Ready for Eimhin’s review** requires a saved, reviewed introduction and recorded interest only. It does not require a rationale or gap acknowledgement because it is preparation for the person's review, not a nomination decision. No approval or submission is simulated.

## State and evidence

The fictional assessment date is **31 December 2026**. Safety certification is required before mobilisation; medical fitness is essential, with its verification stage unspecified. Modules, attendance, expired training and missing evidence retain distinct meanings. No required complete qualification is marked verified.

Workspace changes persist in versioned localStorage for `K0104` + `array-om`. Reset prototype workspace asks for confirmation and restores the initial interested scenario and tasks. Storage failure leaves the session usable with an explicit warning. No backend, authentication or cross-device synchronisation is provided. Only explicit saves retain editor changes; closing an unsaved editor discards them.

`src/records.js` holds unchanged original fixtures; `src/data.js` holds curated interpretations and relationships. `src/workspace.js` owns task/note/report/referral state, review-readiness guards and persistence; `src/workspace.jsx` presents the workspace; `src/introduction.jsx` owns the document preview and edit/review interaction. `src/workflow.js` retains the underlying opportunity response and judgement model. Evidence inspection remains independent.

Mantine owns typography, spacing, sizing, radii, responsive components and overlay behaviour. Contextual work uses drawers; short destructive confirmations use modals. Custom CSS is limited to branding, evidence formatting, status alignment, notices and sticky layout. See [design system](docs/design-system.md), [information architecture](docs/information-architecture.md) and [data decisions](docs/data-decisions.md).

## Scope and verification

The initial interest is clearly labelled illustrative, not extracted from records or an invented conversation. Actual sharing requires Eimhin’s approval of the information. Sharing approval, submission, employer outcomes and interview preparation remain conceptual, as do the full workforce/vacancy directories and the wider redeployment platform. The entry workspace contains only a labelled illustrative sample.

Tests cover fixture integrity/reachability, source highlights, disclosure, discussion editing, independent checks, task and note editing, storage recovery/reset, introduction privacy, reported-information inclusion, review-readiness guards and focus transitions. jsdom component tests do not verify rendered layout. Browser verification results are reported with delivery; no physical-device or full screen-reader audit is claimed.

The candidate introduction uses the same attributed claim relationships as the internal assessment, excluding the two early uncertain records. Full training details and audit metadata remain internal. The document is curated from fixtures, with no live AI service.

Storage envelopes now use version 2 under the existing pair-specific key. Version 1 drafts are retained and require an explicit, confirmed creation step for the shorter format; previous wording remains an internal reference. Old referral-readiness decisions never become person approval. Reset to assessment also requires confirmation and preserves previous wording. Changes to assessment context flag a draft for review without overwriting edits.

This iteration passes 41 tests (21 fixture/state tests and 20 component tests), plus the production build. Chrome checks covered the document preview, explicit legacy conversion, edit/cancel transitions, confirmation return focus, Escape and return focus to the workspace trigger. At 250% zoom, the drawer becomes full-width and its text and controls remain within the viewport. This zoom-based narrow-layout check is not a physical mobile-device test; no full screen-reader audit is claimed. Saving, persistence and readiness combinations were verified by automated tests.

The redeployment entry-page iteration passes 45 tests (23 fixture/state tests and 22 component tests) and the production build. Added coverage checks search/filter combinations, retirement with no recommendations, shared task/progress derivation, direct navigation, focus and retained state. Chrome checks covered name search, opening the assessment, returning through People, desktop alignment and stacked fields at 250% zoom. No physical mobile-device or full screen-reader audit was performed.

### Consistent interaction model

Assessments have one expansion level. Experience coverage and related module outcomes are visible directly; evidence drawers show provenance without another disclosure. Supporting-module follow-ups live in their training inspector. Introduction readiness is managed only inside the introduction. New outstanding actions use Next steps; older note follow-ups remain intact. People search and filters survive assessment navigation, and both pages share progress derivation. This refactor changes no evidence fixtures or storage schema.

Validation for the interaction simplification: all 46 tests (23 fixture/state and 23 component tests) and the production build pass. Tests cover direct facts/provenance, all eleven logs and four training records, supporting-module follow-ups, retained note follow-ups, navigation filters, readiness and overlay return focus. Desktop overview inspection completed in Chrome. Further browser interaction repeatedly failed with `noWindowsAvailable`, so the complete rendered journey, updated narrow layouts and exhaustive saved/editing states remain unverified in this iteration. No physical-device or screen-reader audit was performed.
