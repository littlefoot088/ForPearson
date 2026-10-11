# Carrowmore redeployment — proposed information architecture

## Objective and chosen moment

The Authority needs to help approximately 340 keepers whose jobs are being automated decide what to do next. Successful employee transitions are the primary business outcome; filling external vacancies is one possible route. Keepers may seek employment, explore different careers or choose retirement. Their agency and the officer’s professional judgement matter alongside technical suitability.

The **redeployment officer is the primary user**. The keeper is a secondary user whose intentions, preferences and opportunity-specific interest inform the officer’s decision. The prototype explores **one officer assessing an interested person’s referral readiness against one opportunity**: Eimhin Mac Neidhe and Carrowmore Array’s Wind Turbine Technician role. It does not build a redeployment platform.

Pearson’s brief asks which **40 potential interview candidates** from the Authority’s workforce should be considered next month and on what evidence. Forty is not presented as a count of available job openings. The Authority employs the officer and keeper; Carrowmore Array is the external recruiting employer.

The workflow below is a **design proposal**, not a description of an established Carrowmore operating process. The brief establishes the assessment need but does not prescribe these stages or statuses.

## Two entry points, one assessment

**People-first is the primary workflow:** People → keeper profile → suggested opportunities → opportunity assessment. The question is “What suitable opportunities are available for this person?” A profile would bring together career intentions, preferences, relevant opportunities, opportunities already pursued and redeployment progress.

**Vacancy-first is complementary:** Vacancies → vacancy details → suggested keepers → the same opportunity assessment. The question is “Which of our keepers should we recommend for this vacancy?” This supports comparison of evidence, readiness, interest and outstanding questions before employer referrals.

One keeper can have several opportunities; one vacancy can suit several keepers. The assessment belongs to a **keeper–vacancy pair** (here `K0104` + `array-om`). The two routes would open the same assessment and actions, not duplicate logic or conflicting statuses. Person-level preferences would be shared across all of that keeper’s assessments. Interest and officer decisions apply only to the specific opportunity.

## Wider structure — conceptual except where marked

```text
CARROWMORE REDEPLOYMENT
├── People
│   ├── All keepers
│   │   ├── Seeking employment
│   │   ├── Exploring options
│   │   ├── Planning retirement
│   │   └── Preferences unknown
│   └── Keeper profile
│       ├── Career intentions and preferences
│       ├── Suggested opportunities
│       │   └── Opportunity assessment [IMPLEMENTED FOR ONE PAIR]
│       │       ├── Job requirements
│       │       ├── Experience evidence
│       │       ├── Qualifications
│       │       ├── Supporting source records
│       │       ├── Outstanding questions
│       │       ├── Keeper interest
│       │       └── Next actions
│       ├── Opportunities being pursued
│       └── Redeployment status
└── Vacancies
    ├── Employer vacancies
    └── Vacancy details
        ├── Job requirements
        ├── Suggested keepers
        ├── Interested keepers
        ├── Candidates under review
        ├── Candidates nominated
        └── Interview outcomes
```

The current breadcrumb is People → Eimhin Mac Neidhe → Wind Turbine Technician. These labels provide context; directories and profiles are not implemented navigation destinations.

## Intentions, preferences and retirement

Three questions remain distinct: does the work suit the keeper’s experience; can they meet formal requirements; and do they want to pursue this particular opportunity?

Person-level intention can be **Seeking employment**, **Exploring career options**, **Planning retirement**, or **Not yet discussed**. It must be explicitly provided by the keeper, never inferred from age, tenure, previous jobs or appraisals. Known preferences could cover work type, environment, location, travel, offshore willingness and further training. Unknown preferences are not agreement.

Eimhin’s selected records do not establish his personal plans or offshore preferences. The current prototype starts with Interested as explicitly illustrative workflow state, displayed once in the candidate context. It is not an inferred preference, fabricated historical conversation or permission to share information. Responses can be revised through Edit response. Discussion questions remain preparation, not a record that a conversation occurred.

Conceptually, an explicit retirement intention leaves a keeper visible in People, clearly labelled, but suppresses employment recommendations and automatic vacancy suggestions. The keeper can change the preference later. Age and tenure never trigger this behaviour.

**Illustrative prototype directory example — not derived from employment records:** Fintan Ó Ceallaigh · Planning retirement · No job recommendations. This example is documentation only; it does not change any source fixture or build a directory. How to handle already-active referrals when a keeper changes their intention would require operational research and a conversation with the keeper, rather than automatic assumptions.

## Implemented moment: assessment to referral

The left column explains suitability: compact current/prospective role context and interest, a grounded Why consider Eimhin narrative, relevant experience, formal qualifications, employer preferences and offshore conditions. The right column is a sticky workspace for one person/opportunity: progress, next steps and recent conversation. It stacks below the assessment on smaller screens. The two entry points would share this same pair-level workspace.

Opportunity progress starts at **Assessing referral readiness**, with **Prepare referral** as the primary action. Interest appears only in the candidate context. Your assessment is editable beside its status. There is no full progress tracker for stages outside the implemented moment.

| Proposed stage                     | Meaning and implementation                                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Opportunity identified / suggested | Conceptual upstream recommendation; no matching or messaging.                                                       |
| Interested                         | Illustrative initial state; editable manual prototype response. Does not establish suitability or sharing approval. |
| Assessment                         | Implemented investigation of evidence and gaps; prepare questions, tasks, notes and a referral draft.               |
| Ready for referral                 | Implemented local judgement after explicit safeguards; not a submission.                                            |
| Submitted for consideration        | Conceptual external referral, only after the person approves the information to share.                              |
| Interview invited                  | Conceptual employer decision; never inferred from readiness or nomination.                                          |
| Interview completed                | Conceptual event; future support could record preparation and interview date.                                       |
| Outcome recorded                   | Conceptual employer outcome and employee transition, including requests for information or declined referrals.      |

Saving an editable referral does not mark it ready. Readiness requires interest, a saved/reviewed draft, a rationale, acknowledgement of unresolved requirements and an assessment other than Not currently suitable. Changed response, assessment, saved wording or included reported information invalidates readiness while retaining the draft. The officer can also return a ready draft to assessment. Declined/unknown interest or an unsuitable assessment holds progression; a draft can still be reviewed without enabling readiness.

This is a design proposal for operational validation, not a claimed existing business process. A production service would need policies for consent, access, record retention, approval, audit history and employer submissions.

## Workspace actions and information boundaries

The initial three tasks concern existing offshore certificates, independent maintenance responsibilities and preparing a referral. Officers may add, edit, complete, reopen or remove tasks. Individual qualification checks appear as linked tasks; completing one records work done, not qualification verification. No task is generated automatically for every uncertain source. Task completion never alters evidence attribution or career interest.

Recent conversation starts empty. Add note opens a drawer for a required date and text plus an optional follow-up reminder. The latest note is previewed in the sidebar; earlier notes and editing are available in the drawer. Notes are private working context, not historical evidence. Follow-up text does not silently create a task.

Discussion with Eimhin retains one editable question per topic. Mechanical and electrical questions remain separate. Questions and notes are not automatically included in referrals.

Record Eimhin’s account is the single implemented new-information example. Dated responsibilities are labelled Reported by Eimhin; recorded by you. They supplement source evidence without replacing it and can be explicitly included as self-reported content in the referral. No certificate upload or verification-outcome editor is introduced.

The referral is initialised from curated, attributed experience and accurate qualification interpretations. It is editable for the receiving employer and separates historical experience, qualification readiness, material questions and optional reported responsibilities. Private notes, tasks, discussion questions and irrelevant personnel information never enter it automatically. Changes to source context do not overwrite saved edits; the reviewer is prompted to review and save again.

## Evidence and qualification timing

The hierarchy remains requirement → assessment → source. Mechanical OR electrical maintenance is essential; permits and supporting colleagues are preferences. One row expands at a time. Coverage, recency and involvement describe selected records, not all work performed. The eleven original logs and four training records retain exact text and highlights, with filenames, identity links and original fields available on demand.

Two records predating the joining date remain counted with attribution caveats. They are excluded from the referral recommendation, not deleted. Record-review flags do not resolve them. The fictional date 31 December 2026 governs expiry interpretation. Safety certification is required before mobilisation; medical fitness is essential with timing unspecified. Missing documentation is not a confirmed qualification gap or an automatic bar to employer consideration.

## Persistence and presentation ownership

Workspace state persists in versioned browser localStorage for this person/opportunity pair. Reset requires confirmation and returns to the illustrative interested scenario. Storage failure is disclosed while session work remains usable. This replaces the earlier reset-on-refresh decision. Evidence fixtures stay immutable; there is no backend, account system or cross-device sync.

Mantine owns typography, spacing, sizing and accessible controls. Right-hand drawers handle evidence, roles and editors; modals handle short destructive confirmations only. The desktop workspace has bounded internal scrolling so it stays usable alongside the assessment. Closing drawers restores focus; source inspection from a referral returns to the same draft and source control without losing edits. See [design system](design-system.md).

## Conceptual features and potential business value

Not built: people/vacancy directories, full profiles, automatic retirement filtering, multiple-opportunity navigation, person-facing portal, real messages, approval to share, employer submissions, employer portal, authentication, backend, matching, training management or interview scheduling.

Once an actual interview invitation exists, a future workspace could support selecting career examples, reviewing requirements, preparing employer questions and tracking the date/outcome. No interview-preparation tasks or preview are shown in this prototype’s earlier referral stage.

Potential benefits include less manual record reading, better opportunity prioritisation, fewer unsuitable referrals, reduced risk of overlooking transferable experience, more defensible decisions and better redeployment outcomes. Checking existing certificates could avoid duplicate training and direct investment towards genuine gaps. These are hypotheses, not measured cost savings, ROI or performance results. The applicant’s reflection is not written by this prototype.
