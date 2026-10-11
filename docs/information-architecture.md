# Carrowmore redeployment — proposed information architecture

## Objective and chosen moment

The Authority needs to help approximately 340 keepers whose jobs are being automated decide what to do next. Successful employee transitions are the primary business outcome; filling external vacancies is one possible route. Keepers may seek employment, explore different careers or choose retirement. Their agency and the officer’s professional judgement matter alongside technical suitability.

The **redeployment officer is the primary user**. The keeper is a secondary user whose intentions, preferences and opportunity-specific interest inform the officer’s decision. The prototype explores **one officer assessing an interested person’s referral readiness against one opportunity**: Eimhin Mac Neidhe and Carrowmore Array’s Wind Turbine Technician role. It does not build a redeployment platform.

Pearson’s brief asks which **40 potential interview candidates** from the Authority’s workforce should be considered next month and on what evidence. Forty is not presented as a count of available job openings. The Authority employs the officer and keeper; Carrowmore Array is the external recruiting employer.

The workflow below is a **design proposal**, not a description of an established Carrowmore operating process. The brief establishes the assessment need but does not prescribe these stages or statuses.

## Two entry points, one assessment

**People-first is the primary workflow:** Redeployment workspace → a person’s opportunities → individual opportunity assessment. The question is “What suitable opportunities are available for this person?” The implemented entry page groups opportunities directly beneath each person; there is no separate profile or CV page between the list and assessment.

**Vacancy-first is complementary:** Vacancies → vacancy details → suggested keepers → the same opportunity assessment. The question is “Which of our keepers should we recommend for this vacancy?” This supports comparison of evidence, readiness, interest and outstanding questions before employer referrals.

One keeper can have several opportunities; one vacancy can suit several keepers. The assessment belongs to a **keeper–vacancy pair** (here `K0104` + `array-om`). The two routes would open the same assessment and actions, not duplicate logic or conflicting statuses. Person-level preferences would be shared across all of that keeper’s assessments. Interest and officer decisions apply only to the specific opportunity.

## Implemented navigation and wider context

```text
REDEPLOYMENT WORKSPACE [ENTRY PAGE]
├── Eimhin Mac Neidhe
│   ├── Wind Turbine Technician → existing opportunity assessment [IMPLEMENTED]
│   ├── Marine Electrician [illustrative association; no assessment]
│   └── Watch Officer [illustrative association; no assessment]
├── Aoife Ní Mhurchú
│   ├── Watch Officer [illustrative association; no assessment]
│   └── Offshore Survey Technician [illustrative association; no assessment]
├── Coilean Ó Caomhthaigh
│   └── Marine Electrician [illustrative association; no assessment]
└── Fintan Ó Ceallaigh [illustrative person and stated retirement choice]
    └── No employment recommendations
```

The breadcrumb is People → Eimhin Mac Neidhe → Wind Turbine Technician. People returns to the workspace; the opportunity link opens the assessment directly. A small hash route supports browser Back/Forward and direct assessment links, without a new router dependency. App-level workspace state stays mounted across navigation; persisted notes, tasks, questions, flags and drafts use the existing person/opportunity key. No copy of the pair’s progress or tasks is created for the list.

The list offers accent-insensitive name search, a single employment-intention filter and a Needs attention checkbox. Attention means at least one opportunity has an outstanding next action; it is not a risk score or a claim of urgency. All opportunities remain grouped under a matching person. Empty results offer Clear filters. Eimhin’s implemented row derives its next action from the first incomplete task, unless an introduction needs review or is ready for Eimhin’s review. A declined opportunity or a not-suitable assessment does not prompt referral work. Other rows are non-interactive and explicitly outside the prototype.

`src/people.js` keeps illustrative associations separate from evidence fixtures. Aoife (K0847) and Coilean (K0147) names come from `clean/keepers.json`. Marine Electrician, Watch Officer and Offshore Survey Technician titles/employers come from the corresponding employer vacancy files. No additional personal, training or employment evidence is imported. Associations, sample intentions and statuses are illustrative, not historical findings. No submitted application or interview outcome is invented. Fintan is the wholly illustrative retirement example specified in the design brief. The list is a four-person sample, not a claimed directory of all 340 employees.

Vacancy-first remains conceptual: a future employer vacancy list could lead to the same pair-level assessment. It does not require separate assessment logic.

## Intentions, preferences and retirement

Three questions remain distinct: does the work suit the keeper’s experience; can they meet formal requirements; and do they want to pursue this particular opportunity?

Person-level intention can be **Seeking employment**, **Exploring options**, **Planning retirement**, **Employment arranged**, or **Not yet discussed**. It must be explicitly provided by the keeper, never inferred from age, tenure, previous jobs or appraisals. Known preferences could cover work type, environment, location, travel, offshore willingness and further training. Unknown preferences are not agreement.

Eimhin’s selected records do not establish his personal plans or offshore preferences. The current prototype starts with Interested as explicitly illustrative workflow state, displayed once in the candidate context. It is not an inferred preference, fabricated historical conversation or permission to share information. Responses can be revised through Edit response. Discussion questions remain preparation, not a record that a conversation occurred.

Conceptually, an explicit retirement intention leaves a keeper visible in People, clearly labelled, but suppresses employment recommendations and automatic vacancy suggestions. The keeper can change the preference later. Age and tenure never trigger this behaviour.

**Illustrative prototype directory example — not derived from employment records:** Fintan Ó Ceallaigh · Planning retirement · No job recommendations. This example is displayed in the entry workspace without changing any source fixture. Intention changes remain conceptual; no retirement management workflow is implemented. How to handle already-active referrals when a keeper changes their intention would require operational research and a conversation with the keeper, rather than automatic assumptions.

## Implemented moment: assessment to referral

The left column explains suitability: compact current/prospective role context and interest, a grounded Why consider Eimhin narrative, relevant experience, formal qualifications, employer preferences and offshore conditions. The right column is a sticky workspace for one person/opportunity: progress, next steps and recent conversation. It stacks below the assessment on smaller screens. The two entry points would share this same pair-level workspace.

Opportunity progress starts at **Preparing candidate introduction**, with **Prepare candidate introduction** as the primary action. Interest appears only in the candidate context. Your assessment is editable beside its status. There is no full progress tracker for stages outside the implemented moment.

| Proposed stage                     | Meaning and implementation                                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Opportunity identified / suggested | Conceptual upstream recommendation; no matching or messaging.                                                       |
| Interested                         | Illustrative initial state; editable manual prototype response. Does not establish suitability or sharing approval. |
| Assessment                         | Implemented investigation of evidence and gaps; prepare questions, tasks, notes and a referral draft.               |
| Ready for Eimhin’s review          | Implemented preparation status for the saved introduction; no approval or submission.                               |
| Submitted for consideration        | Conceptual external referral, only after the person approves the information to share.                              |
| Interview invited                  | Conceptual employer decision; never inferred from readiness or nomination.                                          |
| Interview completed                | Conceptual event; future support could record preparation and interview date.                                       |
| Outcome recorded                   | Conceptual employer outcome and employee transition, including requests for information or declined referrals.      |

The candidate introduction has two implemented states: Draft and Ready for Eimhin’s review. Marking it ready requires a reviewed saved introduction and recorded interest only. The previous nomination-style rationale and acknowledgement gate has been removed for this document-preparation action. Approval for sharing and actual employer submission remain separate conceptual events. Neither a saved draft nor Eimhin’s opportunity interest provides sharing consent.

Changed response, assessment, saved wording or included reported information clears readiness while retaining the draft. The user can return it to Draft. The introduction remains editable regardless of interest; readiness for Eimhin’s review requires Interested. This does not alter the internal officer assessment or any qualification status.

This is a design proposal for operational validation, not a claimed existing business process. A production service would need policies for consent, access, record retention, approval, audit history and employer submissions.

## Workspace actions and information boundaries

The initial three tasks concern existing offshore certificates, independent maintenance responsibilities and preparing a referral. Officers may add, edit, complete, reopen or remove tasks. Individual qualification checks appear as linked tasks; completing one records work done, not qualification verification. No task is generated automatically for every uncertain source. Task completion never alters evidence attribution or career interest.

Recent conversation starts empty. Add note opens a drawer for a required date and text. The latest note is previewed in the sidebar; earlier notes and editing are available in the drawer. Notes are private working context, not historical evidence. Existing follow-up text remains readable and survives note edits. New outstanding actions use Next steps; no automatic conversion occurs.

Discussion with Eimhin retains one editable question per topic. Mechanical and electrical questions remain separate. Questions and notes are not automatically included in referrals.

Record Eimhin’s account is the single implemented new-information example. Dated responsibilities are labelled Reported by Eimhin; recorded by you. They supplement source evidence without replacing it and can be explicitly included as self-reported content in the referral. No certificate upload or verification-outcome editor is introduced.

The candidate introduction opens as a concise document preview: identity/opportunity, a short recommendation, three experience points, significant qualification checks and a recommendation for an initial technical interview. Editing is behind one Edit introduction action. Review introduction returns to the complete preview; Save introduction draft persists explicitly. User-edited fields remain identifiable internally. Candidate CV: Not attached is a non-blocking indicator.

Historical detail and source records stay in the main assessment, not the document. Optional Eimhin-reported responsibilities require explicit inclusion and remain labelled as his account. Private notes, tasks and discussion questions never populate the introduction. Material limitations remain concise: independent responsibility, current permit authority and unverified offshore certification/medical fitness. Version 1 referrals are retained rather than silently rewritten; explicit creation or Reset to assessment confirms replacement and keeps earlier wording available internally.

## Evidence and qualification timing

The hierarchy remains requirement → assessment → source. Mechanical OR electrical maintenance is essential; permits and supporting colleagues are preferences. One row expands at a time. Coverage, recency and involvement describe selected records, not all work performed. The eleven original logs and four training records retain exact text and highlights, with filenames, identity links and original fields available on demand.

Two records predating the joining date remain counted with attribution caveats. They are excluded from the referral recommendation, not deleted. Record-review flags do not resolve them. The fictional date 31 December 2026 governs expiry interpretation. Safety certification is required before mobilisation; medical fitness is essential with timing unspecified. Missing documentation is not a confirmed qualification gap or an automatic bar to employer consideration.

## Persistence and presentation ownership

Workspace state persists in versioned browser localStorage for this person/opportunity pair. Reset requires confirmation and returns to the illustrative interested scenario. Storage failure is disclosed while session work remains usable. This replaces the earlier reset-on-refresh decision. Evidence fixtures stay immutable; there is no backend, account system or cross-device sync.

Mantine owns typography, spacing, sizing and accessible controls. Right-hand drawers handle evidence, roles and editors; modals handle short destructive confirmations only. The desktop workspace has bounded internal scrolling so it stays usable alongside the assessment. Closing drawers restores focus. The introduction uses a preview/edit flow within its drawer; evidence inspection remains in the main assessment. See [design system](design-system.md).

## Conceptual features and potential business value

Not built: a full workforce directory, vacancy directory, additional assessments, full profiles, intention editing, matching or automatic suggestions, person-facing portal, real messages, approval to share, employer submissions, employer portal, authentication, backend, matching, training management or interview scheduling.

Once an actual interview invitation exists, a future workspace could support selecting career examples, reviewing requirements, preparing employer questions and tracking the date/outcome. No interview-preparation tasks or preview are shown in this prototype’s earlier referral stage.

Potential benefits include less manual record reading, better opportunity prioritisation, fewer unsuitable referrals, reduced risk of overlooking transferable experience, more defensible decisions and better redeployment outcomes. Checking existing certificates could avoid duplicate training and direct investment towards genuine gaps. These are hypotheses, not measured cost savings, ROI or performance results. The applicant’s reflection is not written by this prototype.

## Simplified interaction model

One expanded assessment provides decision context; the evidence drawer provides original records and directly visible provenance. No nested assessment disclosures are used. Follow-ups are managed in Next steps. Candidate introduction is the sole readiness interface, requiring a saved draft and recorded interest without implying sharing consent. People and the assessment workspace share progress derivation. People search and filters remain in app state while visiting and returning from the assessment.

### Evidence and follow-ups

Experience panels distinguish recorded activity, supporting evidence and related training. Evidence limitations are statements, not automatic requests to the person. Questions are prepared from Next steps and saved explicitly. Saved discussion items use the same checkbox-row pattern as other work: they can be completed manually, while a recorded account completes its linked discussion automatically. Specific discussion items replace the corresponding generic maintenance task rather than duplicating it. The working-preferences task also completes from a saved preference record. The route to view the question or record the account stays inside its row. Existing questions, accounts and deduplication identifiers are preserved without a storage migration.

Assessment sections are read-only summaries with source access. They do not offer per-item task or question actions, or repeat an assessment-date caption. Actual source dates and expiry dates remain visible; the fictional review date remains internal for consistent interpretation. Next steps is the single entry point for adding work and preparing questions. Its discussion drawer offers a topic selector, preserving topic deduplication and existing questions. Previously saved qualification tasks remain editable and removable in the workspace.

The evidence inspector now exposes the complete set of matches from the bounded raw-log review (18 pump, 48 electrical and two planning/permit entries), with yearly distribution and mixed manager feedback. This replaces drawing frequency conclusions from eleven featured examples. Source inspection remains the investigation level; no new page or workflow is introduced. See [evidence-review.md](evidence-review.md) for matching rules and limitations.

The implemented workspace no longer contains illustrative people or invented career/opportunity states. It contains the one supported person/opportunity assessment. Retirement and wider-directory scenarios described earlier remain conceptual only. Interest starts unknown and can be explicitly recorded by the reviewer; neither a system suggestion nor an introduction draft supplies a response.

## Assessment simplification

The existing opportunity assessment now separates judgement (left) from action (right). Four left-hand sections establish the candidate/opportunity, why the transfer could work, documented experience, and qualification readiness. Permit experience is visibly optional; colleague-support evidence remains in role details, and unknown offshore comfort remains visible beneath qualifications.

The opportunity workspace owns interest/progress, existing tasks and discussion preparation, and the latest private note. It does not repeat full saved questions. Its primary action respects an unsuitable assessment or declined interest before encouraging introduction preparation. No new status, persistence schema, workflow or employer action was introduced. People navigation, source relationships and the candidate introduction are unchanged.

## Current workspace population

The entry list now includes six scenarios: Eimhin (three opportunities), Aoife (interview invitation), Coilean (exploring options), Nóra (qualification-support follow-up), Fintan (retirement without recommendations), and Cian (employment arranged). This supersedes earlier one-person/four-person population descriptions above. The README records which identities and associations are illustrative. These are list fixtures, not additional functional workflows or historical evidence. Only Eimhin’s Wind Turbine Technician assessment is navigable; its progress and next action still derive from the existing saved workspace. Search, intention and attention filters apply to all groups and survive navigation.

Record inclusion is person/opportunity workspace state (`excludedRecordIds`, optional for older saved workspaces and empty by default). It is separate from review flags. `evidenceSelection.js` derives included records and recomputes affected summaries from retained evidence. Evidence fixtures remain immutable. Record inclusion changes invalidate introduction readiness; existing prose is retained with a review notice, while excluded source IDs are removed immediately. Regeneration uses retained evidence only. Restoring a record restores its availability, not a prior readiness decision.

## Shared workflow and document verification

`workflowState.js` owns the read-only workflow selector used by both implemented pages. It returns assessment, interest, introduction status, progress, primary action and derived task completion. Priority is: negative response; negative suitability; unreviewed suitability; clarification/more information; missing response; outdated introduction; missing introduction; ready introduction; saved draft. Historical illustrative People scenarios do not enter this derivation.

Task ownership is explicit (`origin: system | manual`). Linked, untouched introduction and qualification tasks resolve from saved workflow state. The general “Check existing offshore certificates” row opens the next outstanding safety-certificate verification and checks itself only after all four have current document verification. The checkbox cannot manufacture verification. Changing system task wording makes it manually managed. Qualification identifiers retain deduplication. The reducer does not generate tasks for uncertainties or restore removed work. Notes retain their existing date-based last-contact calculation and never establish response, consent or verification.

`verifications[requirementId]` is an append-only history of officer-recorded document metadata, including correction/withdrawal events. Current verification requires coverage acknowledgement and an unexpired document (or explicit no expiry). The four safety requirements jointly resolve the general certificate task; medical clearance remains independent. Qualification rows, details, source-inspector qualification context, generated introduction wording and summary caveats use this same source. Original training records remain unchanged. Saved prose is never silently regenerated.

The version-3 envelope migrates additively from the previous versions at the existing storage key. It conservatively assigns manual ownership to edited tasks and completed tasks lacking a corresponding workflow event, and starts older workspaces with no document verification. Introduction signatures include verification history and currentness, so a refresh after expiry requests review as well as updating derived qualification checks. Existing evidence exclusions, source flags, private notes, preferences, discussion questions and draft recovery remain separate.

## Simulated send boundary

The shared workflow selector now exposes a local simulated-send outcome to both People and the assessment. Negative assessment/interest and stale information still take priority. Fixed assessment/interest editing controls remain beside their statuses; Next action uses guidance instead of duplicating them.

Sending requires a positive suitability decision, recorded interest, a current saved introduction and explicit confirmation that Eimhin reviewed and approved that version. The reducer validates the submitted version against the saved document and current assessment signature. `sentIntroductions` stores recipient, timestamp, approval acknowledgement and a cloned public-document snapshot; the existing employer progression remains `not-submitted`. Version-4 migration creates an empty history, never inferred consent. Editing or changing evidence cannot mutate previous snapshots or trigger sending. An unchanged version cannot be sent twice; a revised version requires new confirmation.

“Replace wording from assessment” remains an explicit, confirmed draft-generation action; it does not reset workflow or send history. Historical documents are read-only in the introduction drawer’s history viewer. No network sending capability exists.
