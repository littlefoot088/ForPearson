# Carrowmore information architecture and workflow contract

This document describes current implemented behaviour. Use [design-system.md](design-system.md) for presentation and [data-decisions.md](data-decisions.md) / [evidence-review.md](evidence-review.md) for historical evidence provenance. Do not restore earlier workflow wording from old screenshots or Git history.

## Navigation and scope

People → keeper profile → opportunity assessment is the principal journey. The People → Eimhin turbine assessment shortcut is available when his intention permits showing opportunities. Assessment breadcrumbs link to both People and Eimhin's profile. Navigation preserves workspace state and in-app People filters.

All six existing keepers share the profile component. Only Eimhin's Wind Turbine Technician opportunity has a full assessment; other opportunities and interview/employment outcomes are illustrative directory scenarios. Curated vacancy selection adds an opportunity under consideration, not a new assessment or an algorithmic match. No aggregate person-level Progress is calculated.

## Vocabulary and ownership

The starting directory uses Eimhin as a Seeking employment example with three opportunities under consideration. Aoife has Watch Officer (Interview invited) and Offshore Survey Technician (To do) under consideration. Coilean is the only Not yet decided example. These are illustrative intentions; explicitly saved profile choices continue to take precedence.

| Label | Meaning and values |
| --- | --- |
| Employment intention | Person-level plans: Not yet decided, Seeking employment, Employment arranged, Planning retirement. |
| Career preferences | Person-level stated work preferences; separate from dated offshore working preferences. |
| Opportunities under consideration | Opportunities selected for further consideration. |
| Your assessment | Opportunity-specific suitability: Not yet decided, Potential match, Not a current match. |
| Eimhin's interest | Opportunity-specific response: Not yet discussed, Interested, Not interested, Wants more information. |
| Progress | Officer work: To do, Reviewing documents, Discussing with keeper, Preparing introduction; document-derived Reviewing introduction, Reviewing with Eimhin, Introduction sent; negative decisions/responses show On hold. |
| Next action | A recommendation derived from the current state, not another stored status. |
| What needs doing | Actual tasks, with explicit manual/system ownership. |
| Conversations | Prepared questions, dated private notes, questions covered, reported accounts and history. |

Early work stages are explicitly editable. A first introduction save normally moves work to preparation, preserving an explicit discussing stage. Readiness, staleness and simulated sending provide document stages. Legacy storage keys such as worth-discussing and needs-clarification remain compatible; they are not the current assessment choices.

Retirement cases sort after active cases and suppress placement exploration. Employment-arranged profiles suppress further job search. Changes of intention retain earlier selections for reference. A sent introduction resolves an earlier undecided intention to Seeking employment for display; a later explicit intention takes precedence. It does not imply approval for another referral. Profile edits do not rewrite dated offshore preferences or opportunity interest.

## Shared derivation and action priority

Not yet decided intentions suppress job rows in People and disable opportunity exploration/addition in the profile and reducer. People instead prompts a discussion of employment plans or a questionnaire reminder; these cases remain in Needs attention. This is person-level follow-up, not an opportunity Progress stage. Previously considered opportunities remain available in a collapsed profile reference section without next actions. Recording Seeking employment enables exploration and restores retained selections. Questionnaire guidance does not send a message or assume a questionnaire response.

`src/workflowState.js` is authoritative for `workflowView`, verification currentness and linked task completion. People/profile projections use that shared state rather than deriving their own version of the implemented opportunity's progress. Persist inputs and events, not derived progress or recommendations.

The current selector applies this priority:

1. Not interested → review the recorded response.
2. Not a current match → reconsider suitability.
3. A current sent version with no review outstanding → no next action.
4. Explicit discussion stage, legacy clarification, or a request for more information → prepare follow-up discussion.
5. Unreviewed assessment → review suitability.
6. Interest is not Interested → record the response.
7. Introduction outdated → review it.
8. No introduction → prepare it.
9. Introduction ready → review with Eimhin.
10. Otherwise → review the saved introduction.

Fixed editing controls remain available. Draft and note access survives a paused progression. A sent introduction completes this simulated journey; View sent introduction is reference access, not an outstanding action. No employer outcome is inferred.

## Tasks and conversations

Tasks retain identifiers and qualification-based deduplication. Untouched linked system tasks derive completion from saved events: an introduction for preparation, current verification for qualification checks, all four safety verifications for the general offshore task, and saved working preferences for that task. Medical clearance is separate. Introduction preparation and qualification-specific system checks remain in state but are omitted from the visible checklist to avoid duplicated workflow controls.

Manual tasks retain manual completion. Editing a system task's wording transfers it to manual ownership. Older edited tasks and completed tasks with no corresponding event migrate conservatively as manual. Do not recreate removed tasks or generate one for every evidence uncertainty. Completing a task never verifies a qualification or establishes consent.

Prepared questions are deduplicated by topic and support multiple selection. Saving a dated private note can mark multiple questions covered; the note retains snapshots of the selected prompts. Editing/removing a prepared question does not rewrite note history. Discussed state derives from covered topics, separately recorded accounts or retained legacy completion markers. Questions are not task rows.

Conversations shows the most recent contact by conversation date, then recorded timestamp, combining private notes and reported accounts while labelling their source. Existing historical follow-up text remains intact. Do not parse notes into tasks, interest, qualifications or approval. Eimhin's reported responsibilities use a separate explicit editor and remain self-reported. Only explicitly selected accounts may enter an introduction.

## Evidence and qualification boundaries

Original fixtures, curated interpretation, dated manager opinion, officer decisions, reported accounts and private notes remain distinct. Mechanical OR electrical maintenance can satisfy the experience requirement; permit experience is a preference. Recorded frequency is not verified competence. The agreed initial Interested scenario is separate from documentary evidence and never overrides later recorded responses.

All logbook entries start included. Exclusion changes derived counts, affected summaries and generated provenance while preserving the original record. Inclusion is not verified attribution: disputed early entries retain their existing safeguards. Review flags are independent. Exclusion/restoration invalidates introduction readiness and flags saved wording for review without rewriting prose.

Verification requires issuer/provider, document reference, verification date, expiry or explicit no-expiry confirmation, and acknowledgement of coverage for the specific requirement. Medical entries store clearance metadata only. Supporting modules and attendance cannot establish a full certificate. Corrections and withdrawals append provenance history; only the latest current, non-withdrawn verification satisfies a requirement. Currentness uses today's Europe/London date, not the historical fixture date.

Qualification rows, explanations, outstanding checks, summary caveats and generated introductions read the same verification data. Expired/withdrawn evidence stays recorded but no longer satisfies the requirement. Task completion is never a substitute. Changes and time-based expiry invalidate readiness without silently regenerating officer prose.

## Training support for job search

The officer can explicitly assign training against one of the four safety requirements after confirming a certificate is not held, needs renewal, or requires training for the full certificate. Missing evidence alone does not establish that need. Course name and reason are required; provider and target date may be added when arranged. There is no invented course catalogue, provider booking, enrolment, funding approval or message to the keeper. Medical clearance remains separate.

Assignments progress through Assigned, In progress, Completed (with a completion date) or Cancelled. Updates retain the previous record in `training[requirementId]`. One linked system task is created on first assignment. Completion closes that task only; verification checks remain open until a current certificate is explicitly verified. Task wording edits transfer ownership to the officer; removal is respected by later training updates. Cancellation removes the automatic task from the visible checklist without deleting its history. Existing verified certificates do not offer a new assignment; existing training records remain manageable.

Qualification rows and generated qualification caveats share the training state. Assignment, progress changes and cancellation invalidate saved introduction readiness and require wording review while preserving edited prose and all sent snapshots. Only requirement-level training status enters generated introduction wording; course/provider administration stays internal. Editor save and regeneration use the same signature, including training. None of these actions infers interest, consent or a new employer outcome.

## Introduction and simulated sending

The document flow is preview → explicit editing → review → save → review with Eimhin → sharing acknowledgement → simulated send. Ready for Eimhin's review is preparation, not consent. The editor and reducer must use the same assessment signature, including verification and exclusions, so a fresh save does not appear stale.

Sending requires Potential match, Interested, a current saved introduction, no unsaved changes and explicit acknowledgement that Eimhin reviewed and agreed to share this version with Carrowmore Array. The reducer validates version and current context; a UI-only disabled button is not sufficient protection. Outstanding qualifications remain visible caveats, not extra sending blockers.

Each local send stores recipient, timestamp, approval acknowledgement and an immutable snapshot of the exact public introduction. There is no network send, delivery confirmation, employer acceptance or interview inference. An unchanged version cannot be sent twice. Changed wording requires fresh acknowledgement; later changes retain previous sent snapshots. No automatic resend is permitted.

Assessment, interest, relevant preferences, evidence, verification and included-account changes retain saved prose but invalidate applicable readiness/review state. Replace wording from assessment is explicit and confirmed, retaining previous wording. Private notes, task details, questions and the full internal evidence record never populate the public snapshot. Legacy introduction formats remain available and require explicit conversion rather than silent replacement.

## Persistence and module responsibilities

| Module | Responsibility |
| --- | --- |
| `src/workspace.js` | Reducer, validation, document signatures, storage load/save and migration. |
| `src/workflowState.js` | Shared workflow, verification and task derivation; public document/version projection. |
| `src/workflow.js` | Underlying opportunity states and labels. |
| `src/people.js` | Directory fixtures, career-context projection and curated opportunity associations. |
| `src/evidenceSelection.js` | Included evidence and affected summaries. |
| `src/introduction.jsx` | Preview/edit/review, explicit saving, approval and historical document presentation. |
| `src/workspace.jsx` | Status rows, task presentation and workspace editors. |
| `src/TrainingEditor.jsx` | Explicit course assignment, updates, completion and retained training history. |
| `src/App.jsx` | Routes, shared state and overlay orchestration. |

The current storage envelope is version 11. Migrations are additive under the existing key: `carrowmore:workspace:v1:K0104:array-om`. The v1 in the key is not the envelope version. Preserve tasks, notes, historical follow-ups, questions, flags, exclusions, preferences, verifications, drafts, profile context and sent snapshots. Version 10 gains an empty training history without invalidating unchanged documents. Earlier workspaces gain no assumed verification, approval or sending history. Old intention values migrate to the four current choices.

Storage failure is visible and session work remains usable. Reset requires confirmation and preserves keeper profile context while resetting the pair workspace. Local browser persistence is not a backend or cross-device recovery mechanism. Never use a user's saved workspace as disposable test data.

## Boundaries

The prototype has no real communications, uploads, authentication, backend, automated matching, additional detailed assessments, employer portal, interview scheduling, course booking or learning-management integration. Training assignment and tracking are local officer records. Directory outcomes are illustrative; they are not implemented employer transitions. Production consent, retention and access policies remain outside this demonstration. Do not expand these boundaries incidentally while editing the UI.
