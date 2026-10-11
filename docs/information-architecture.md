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

One expanded assessment provides decision context; the evidence drawer provides original records and directly visible provenance. No nested assessment disclosures are used. Supporting-module follow-ups live only in their training inspector. Candidate introduction is the sole readiness interface, requiring a saved draft and recorded interest without implying sharing consent. People and the assessment workspace share progress derivation. People search and filters remain in app state while visiting and returning from the assessment.
