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

Assessments have one expansion level. Experience coverage and related module outcomes are visible directly; evidence drawers show provenance without another disclosure. Follow-ups are managed in Next steps. Introduction readiness is managed only inside the introduction. New outstanding actions use Next steps; older note follow-ups remain intact. People search and filters survive assessment navigation, and both pages share progress derivation. This refactor changes no evidence fixtures or storage schema.

Validation for the interaction simplification: all 46 tests (23 fixture/state and 23 component tests) and the production build pass. Tests cover direct facts/provenance, all eleven logs and four training records, supporting-module follow-ups, retained note follow-ups, navigation filters, readiness and overlay return focus. Desktop overview inspection completed in Chrome. Further browser interaction repeatedly failed with `noWindowsAvailable`, so the complete rendered journey, updated narrow layouts and exhaustive saved/editing states remain unverified in this iteration. No physical-device or screen-reader audit was performed.

### Evidence and follow-ups

Experience panels distinguish recorded activity, supporting evidence and related training. Evidence limitations are statements, not automatic requests to the person. Questions are prepared from Next steps and saved explicitly. Saved discussion items use the same checkbox-row pattern as other work: they can be completed manually, while a recorded account completes its linked discussion automatically. Specific discussion items replace the corresponding generic maintenance task rather than duplicating it. The working-preferences task also completes from a saved preference record. The route to view the question or record the account stays inside its row. Existing questions, accounts and deduplication identifiers are preserved without a storage migration.

Content conventions: use plain statements about what the records show, without headings that repeat the open requirement. “No certificate was found in the selected records” does not mean the person lacks one. Fire training shows a past listed expiry and attendance; whether attendance satisfies the requirement is unknown, not an assumed failed or incomplete course. Keep the fictional review date internal; display actual expiry dates. Assessment actions use bordered Mantine buttons rather than unbounded text resembling headings. Original source wording remains unchanged.

Assessment sections are read-only summaries with source access. They do not offer per-item task or question actions, or repeat an assessment-date caption. Actual source dates and expiry dates remain visible; the fictional review date remains internal for consistent interpretation. Next steps is the single entry point for adding work and preparing questions. Its discussion drawer offers a topic selector, preserving topic deduplication and existing questions. Previously saved qualification tasks remain editable and removable in the workspace.

The [full supplied-log review](docs/evidence-review.md) explains the 18 pump, 48 electrical and two planning/permit entries now accessible in the inspector. Counts describe recorded work, not how often it was performed in practice. Reproduce the audit with `python3 scripts/audit_logbooks.py '/path/to/carrowmore-data-pack 1.zip'`.

Trust rule: no invented people, interest or opportunity-progress defaults. Eimhin starts Interested following the user-confirmed prior-conversation scenario; scenario context and reviewer-entered responses are labelled separately from historical sources. Legacy example responses are cleared while saved notes and drafts are retained. Only the latest relevant manager appraisal is shown in the assessment and inspector; historical appraisals remain in the audit.

### Final assessment corrections

The default next action is Review suitability until an assessment is recorded. Worth discussing/worth nominating can lead to introduction preparation when interest is recorded; clarification leads to discussion. Early drafts remain available through a secondary action and never grant readiness, qualifications or sharing approval.

Eimhin’s Interested response is an agreed illustrative workflow starting point, not derived from employment records. Historical evidence, manager opinion and user-entered responses remain distinct. This provenance belongs in documentation rather than repeated scenario notices in the product. Screenshot demonstration tasks/notes are created only in isolated browser sessions; no user-created notes or tasks are removed.

The summary uses five attributed pump entries dated 2024–2026 and the relevant AP000013 manager excerpt, all valid within the retained 31 December 2026 assessment context. The two pre-joining pump entries remain available with warnings but do not support the summary. Job-title screening is described as a possibility, not an observed recruitment outcome. Historical activity and manager praise do not establish current competence.

## Populated redeployment workspace

The workspace now presents six illustrative scenarios. These are presentation fixtures in `src/people.js`, separate from immutable employment, logbook and training evidence. They do not write additional assessment state or claim an evidence-based match.

| Person                | Workspace scenario                                                                                  | Identity provenance                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Eimhin Mac Neidhe     | Three potential opportunities; Wind Turbine Technician uses existing saved progress and next action | Existing K0104 identity                                                 |
| Aoife Ní Mhurchú      | Watch Officer interview invitation                                                                  | Existing synthetic K0847 identity, documented from `clean/keepers.json` |
| Coilean Ó Caomhthaigh | Exploring two opportunities                                                                         | Existing synthetic K0147 identity, documented from `clean/keepers.json` |
| Nóra Ní Bhraonáin     | Certificate check and discussion of training support                                                | New illustrative identity, no historical records attached               |
| Fintan Ó Ceallaigh    | Planning retirement; no job recommendations                                                         | Existing illustrative retirement identity from the brief                |
| Cian Ó Dálaigh        | Employment arranged as Marine Electrician                                                           | New illustrative identity, no historical records attached               |

All additional opportunity associations, intentions, interview/employment outcomes and next actions are illustrative prototype data, not findings from historical records. No qualifications, training needs or employment histories are asserted as verified. Eimhin’s overall career intention remains unchanged; his implemented opportunity continues to read the existing saved workspace state. The two extra opportunities do not override that state.

Vacancy titles and employers reuse the existing project references: Carrowmore Array’s Wind Turbine Technician, Port of Cnoc Harbour Trust’s Marine Electrician, Northern Isles Coastguard Service’s Watch Officer and Deepline Offshore Ltd’s Offshore Survey Technician. Only Eimhin’s Wind Turbine Technician opens an assessment. Other entries are plain text. No new detailed pages, messaging, interview, training or placement workflows are implemented.

Prototype and storage explanations have been removed from the default workspace UI; an actionable storage-failure warning remains conditional. The approved central Quiet Authority theme now applies to both pages, their shared navigation and portalled evidence/editor drawers. This supersedes the earlier assessment-only visual rollout and one-person workspace descriptions.

Working preferences can now be recorded or edited from the expanded Working conditions row. The existing workspace drawer captures a required discussion date and response, plus optional concerns. This is explicitly Eimhin-reported information, stored with the existing workspace, separate from historical evidence and general opportunity interest. Old saved workspaces without this field remain compatible. Saving does not complete tasks, verify qualifications, imply consent or copy private wording into the candidate introduction. Changed preferences retain the draft but require its review before readiness can be restored.

The shared Quiet Authority theme now uses locally hosted **IBM Plex Sans** (SIL Open Font License included in `public/fonts/IBM-Plex-LICENSE.txt`). It replaces Inter as the active face. Both pages and all overlays use the same central theme; typography, control states, restrained status badges and source highlighting are documented in `docs/design-system.md`. This visual refinement does not change page structure, evidence wording, saved state or workflows. Before/after and interaction screenshots are in `artifacts/visual-refinement`.

Evidence reviewers can exclude and restore logbook records. Exclusions persist with the candidate/opportunity workspace, update included counts and generated summaries, and clear introduction readiness. Original records and their caveats remain inspectable. Saved introduction prose is retained for explicit review or regeneration; it is never silently overwritten. Source review flags are separate and live in source details.

## Integrated workflow state

`src/workflowState.js` supplies the same derived progress and recommended action to the assessment and Eimhin’s People entry. Negative responses and suitability decisions take priority over introduction preparation. Derived values are not stored. Drafts and private notes remain accessible when progression is paused; no action records sharing consent or employer submission.

Untouched system preparation and qualification checks follow saved introductions and current qualification verification. Editing their wording transfers ownership to the officer, preserving manual completion. Removed tasks are not recreated. “Check existing offshore certificates” guides the officer to each outstanding safety-certificate verification and checks itself only when all four have current document verification. Medical clearance remains separate.

Required qualifications now offer document verification in the existing editor drawer. The officer records issuer/provider, reference, verification date, expiry (or explicit no expiry), and confirms requirement coverage. Medical records contain clearance metadata only. Supporting training modules do not establish a complete certificate. Corrections and withdrawals append provenance records; expired or withdrawn records remain visible but do not satisfy a current requirement. Currentness uses the calendar date in Europe/London, independent of historical training-fixture dates.

Verification changes clear readiness and mark saved introduction wording for review without replacing it. Explicit regeneration uses the current verification and evidence inclusion state. Local storage version 3 adds verification history and task ownership under the existing key. Earlier saved workspaces start without verifications; edited tasks and unexplained completed tasks migrate as manual. Notes, historical follow-ups, questions, source flags, exclusions, preferences and drafts remain intact. Storage-failure handling is unchanged.

## Simulated introduction sending

The officer panel now keeps assessment and interest editing in fixed positions and labels the separate Next action. Introduction preparation continues in its existing drawer. After saving current wording, the officer reviews it with Eimhin, explicitly confirms his agreement to share that version, and can simulate sending it to Carrowmore Array. The simulation makes no network request and does not record employer delivery, acceptance or an interview. Outstanding qualifications remain caveats, not additional sending gates.

Local storage version 4 adds `sentIntroductions`: immutable, dated snapshots of the public introduction with recipient and explicit approval acknowledgement. Private notes, internal source provenance and previous drafts are excluded. Version 6 restores the general offshore-certificate check as a verification-driven task after the interaction model was clarified. Old workspaces start with no send history or assumed approval. Changed wording requires fresh confirmation, while previous snapshots remain available. Identical versions cannot be sent twice. Qualification verification is included consistently in saved introduction signatures.
