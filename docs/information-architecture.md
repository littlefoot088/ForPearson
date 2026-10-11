# Carrowmore redeployment — proposed information architecture

## Objective and chosen moment

The Authority needs to help approximately 340 keepers whose jobs are being automated decide what to do next. Successful employee transitions are the primary business outcome; filling external vacancies is one possible route. Keepers may seek employment, explore different careers or choose retirement. Their agency and the officer’s professional judgement matter alongside technical suitability.

The **redeployment officer is the primary user**. The keeper is a secondary user whose intentions, preferences and opportunity-specific interest inform the officer’s decision. The prototype explores **one officer assessing one keeper against one opportunity**: Eimhin Mac Neidhe and Carrowmore Array’s Wind Turbine Technician role. It does not build a redeployment platform.

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

Eimhin’s selected records do not establish his personal plans or offshore preferences. One section, **Eimhin’s interest in this role**, shows only the opportunity response. Unknown career plans and offshore preferences remain in the underlying data and the optional discussion topic. **Prepare discussion** opens the list of editable topics, including this role and its offshore rota. Saving does not populate preferences or imply that a conversation occurred. The person-level intention and opportunity response remain separate underneath this consolidated presentation.

Conceptually, an explicit retirement intention leaves a keeper visible in People, clearly labelled, but suppresses employment recommendations and automatic vacancy suggestions. The keeper can change the preference later. Age and tenure never trigger this behaviour.

**Illustrative prototype directory example — not derived from employment records:** Fintan Ó Ceallaigh · Planning retirement · No job recommendations. This example is documentation only; it does not change any source fixture or build a directory. How to handle already-active referrals when a keeper changes their intention would require operational research and a conversation with the keeper, rather than automatic assumptions.

## Proposed opportunity workflow

| Stage                  | Meaning                                                                                                                              | Prototype treatment                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Opportunity identified | A system suggestion considers relevant experience, requirements and known preferences; unknowns remain unknown.                      | Existing curated suggestion, with an explanation. No matching algorithm.                                                                               |
| Officer reviews        | The officer inspects requirements, sources, gaps and preferences, deciding whether this is worth discussing.                         | Primary implemented moment.                                                                                                                            |
| Suggested to keeper    | The officer recommends exploring the opportunity; this does not record the keeper’s agreement.                                       | A dialog summarises the role, rota, relevant evidence and open questions. “Record suggestion locally” changes local suggestion state only.             |
| Keeper responds        | Interested, Not interested or Wants more information about this specific opportunity.                                                | Explicitly simulated response, entered by the officer and labelled in the page. It can be revised or reset to Not yet discussed. No automatic consent. |
| Consider nomination    | Interest is necessary but does not establish suitability. The officer weighs experience, qualifications and unresolved requirements. | Interested keepers expose a nomination-decision form: defer to resolve questions, or recommend for employer consideration.                             |
| Candidate nominated    | An actual referral means recommended for employer consideration, not interview confirmed.                                            | Conceptual. The prototype saves only a local decision; employer progression remains Not submitted.                                                     |
| Employer responds      | The employer may invite an interview, ask for more information or decline.                                                           | Conceptual only; the officer cannot set employer hiring outcomes here.                                                                                 |

The user explicitly selected allowing a local recommendation decision with unresolved qualification gaps. Recording it requires **interest, a written rationale and explicit acknowledgement of the remaining requirements**. The dialog names the open experience, safety, medical and working-condition questions. It does not imply eligibility or turn missing evidence into verification.

The Recommended next step section progressively exposes the next decision: Prepare discussion → Awaiting keeper response / Record keeper response → Consider for nomination. Suggest to keeper remains a secondary local action before a response. Wants more information exposes a contextual follow-up draft; Not interested removes nomination actions. Explicit secondary controls update the officer assessment or record a keeper response; response recording is not duplicated when it is the primary action. There are no five equally prominent buttons.

## Distinct status dimensions

| Dimension                  | Proposed values                                                                               | What is implemented                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Person-level intention     | Seeking employment; Exploring career options; Planning retirement; Not yet discussed          | Eimhin starts at Not yet discussed. Discussion draft only; no inferred or simulated personal preference editor. |
| Opportunity-level interest | Not yet discussed; Suggested to keeper; Interested; Not interested; Wants more information    | Local suggestion event plus a separate explicit simulated response. “Suggested” never overwrites a response.    |
| Officer assessment         | Not reviewed; Needs clarification; Worth discussing; Not currently suitable; Worth nominating | Editable judgement. Worth nominating requires the nomination decision flow, not a direct dropdown bypass.       |
| Employer progression       | Not submitted; Nominated; More information requested; Interview invited; Not selected         | Remains Not submitted. Later employer stages are documented only.                                               |

The suggestion event and response are stored separately even though “Suggested to keeper” is useful display language. Marking Worth discussing neither records interest nor sends a suggestion. Not currently suitable suppresses the initial Suggest action until the assessment is reconsidered. Requirement-level evidence states, verification flags and discussion questions remain separate from every workflow dimension.

Changing a keeper response clears a prior local nomination decision; if it had set Worth nominating, the officer assessment returns to Not reviewed. A keeper who later becomes interested requires a fresh decision. Changing the officer assessment also clears a previous nomination decision. These are explicit prototype defaults to avoid stale recommendations; no submission history is deleted because no real submissions exist. Saving a draft changes no workflow status. All local state resets on refresh.

## Implemented assessment and evidence hierarchy

The keeper and opportunity share a compact header with sourced working arrangements and role details. One narrative leads into two essential maintenance evidence rows, five qualification rows, and a separate group for permits and supporting colleagues as employer preferences. Opportunity interest and required offshore working conditions follow, before the officer decision and next step. The underlying nine employer requirements remain distinct. Rows initially show the requirement, evidence status and disclosure control; one requirement expands at a time.

The hierarchy remains **requirement → assessment → source**. Mechanical and electrical maintenance are alternative routes within one requirement, with distinct questions and supporting modules. Experience is not a certificate. Selected-record counts, spans, latest activity and involvement appear when an experience row is expanded. Missing evidence means not established from these records, not confirmed absence. No percentage scores or unsupported competence claims are used.

The inspector retains all eleven logs and four training records: verbatim text, exact highlights, raw dates, document/record identifiers, original fields, interpretation and limitations. The two pre-joining-date records remain counted, with explicit attribution caveats; their attribution remains unresolved. Planning and authorisation are distinguished from performing a task; independence and current competence are not invented. The agreed fictional date of 31 December 2026 governs expiry interpretation.

Mantine remains responsible for standard components, typography, tokens, drawer focus containment, Escape and scroll locking. The source drawer fills narrow screens; the recommendation section stays in normal flow at all widths. Closing an inspector retains the expanded row and restores focus. Career and opportunity questions join the same editable Discussion with Eimhin list as requirement questions. Source fixtures and qualification statuses are unchanged by workflow actions.

## Scope and assumptions

Built: one opportunity assessment, source investigation, requirement and preference discussion drafts, officer judgement, a local suggestion, simulated opportunity responses, and a local nomination decision with rationale. The existing role summary is retained.

Conceptual: the people directory, vacancy dashboard, complete profiles, multiple opportunities, retirement filtering, keeper-facing experience, actual recommendations/messages, employer submissions, employer portal and interview outcomes. No authentication, backend, matching algorithm, training-management system or interview scheduling is added.

The scope assumes that an officer may record a keeper’s response after an offline conversation in a future service. The prototype instead clearly marks every entered response as simulated and does not claim such a conversation occurred. Operational ownership, evidence needed to record real responses, audit history and referral policies would need validation before a production implementation.

## Potential business value — hypotheses, not measured results

Traceable summaries could reduce manual record-reading time and help officers prioritise relevant opportunities without overlooking people with transferable experience. Separating evidence, qualification readiness and keeper interest could reduce unsuitable referrals and make professional decisions more defensible.

Checking existing certificates before recommending training could avoid unnecessary or duplicate courses and direct investment towards genuine gaps. Respecting preferences and retirement intentions could support better employee transitions and redeployment outcomes. These are potential operational and financial benefits, not proven savings: no ROI, cost or performance figures have been measured or invented. They are inputs for a later applicant reflection; that reflection has not been written here.

## Simplified assessment interactions

The compact summary answers what looks promising, what needs checking and what happens next. Experience and qualifications are separate scannable lists; experience and formal qualification readiness never become a combined score. Expanded content states what was found and only the uncertainty that affects a decision. The source inspector leads with date/station, original highlighted text and a short interpretation. View source details retains technical metadata and raw fields on demand.

Add to discussion prepares one editable question per area or topic for Eimhin. The list can be opened empty through Prepare discussion, offering two optional topics without a large empty page section. Saved questions support editing and removal. Add qualification check tracks a reversible local verification task; the officer can optionally add a keeper question, but no request is sent and no training gap is inferred. Flag record for review is an independent internal task, not a question automatically addressed to the keeper. Neither kind of flag verifies evidence or changes the opportunity workflow. Support coordination and actual verification outcomes remain conceptual.

## Narrative and recommendation refinement

The visual starting point is Why consider Eimhin, a curated explanation of the transfer from pump repair and electrical fault-finding to the O&M vacancy. There is no repeated summary strip. Experience rows map to existing requirements: pump and electrical work are alternatives under maintenance, while permits are valued rather than essential. Supporting modules stay with their relevant experience area. The five safety/medical rows are separate from offshore conditions. Supporting colleagues is grouped with permits under employer preferences. One assessment opens at a time across all lists.

Recommended next step combines guidance and its primary action through one state selector. Not currently suitable takes precedence and holds the opportunity without encouraging progression; declined interest does not encourage nomination; a request for information leads to follow-up; unknown interest starts discussion preparation, or response recording after a suggestion. Interested keepers can be considered for nomination with the existing safeguards. Saved nomination decisions expose review, never a submitted or interview-confirmed status.

Prepare discussion opens the existing list with optional role/offshore-interest and safety-certificate prompts. A prompt opens the editable composer and is saved only explicitly, once per topic ID. No preference, suggestion or consent is automatically recorded. Suggested topics disappear once saved and become available again after removal. The section uses normal document flow instead of sticky positioning.

Qualification timing follows the vacancy: valid safety certification is needed before mobilisation. Medical fitness is essential without a stated verification stage. No certificate-verification rule is invented for interview or referral. The approved nomination-with-gaps option still requires recorded interest, rationale and acknowledgement.


## Presentation ownership

Each decision-relevant fact has one home rather than appearing in several status summaries. Interest has one visible status; broader career plans remain unknown until explicitly established. Qualification tasks appear in a compact list below safety/medical requirements, including supporting-module checks if added, with reversible removal. They never resolve evidence gaps. Response recording is contextualised as an action after a conversation, in the next-step section. Officer-assessment editing remains beside the judgement. The next-step section supplies one primary action without repeating the suitability narrative. Mantine continues to own typography, sizing and component behaviour.

The header explicitly labels **Current role** (Lighthouse keeper, Carrowmore Light Authority) and **Opportunity being assessed** (Wind Turbine Technician, Carrowmore Array). The interest section has one status, without a second unknown-preferences sentence or competing question/response buttons. Discussion preparation and response recording have separate, explicit purposes in the next-step section.

Visual grouping uses aligned Mantine Paper sections on the off-white canvas. Candidate/current role and the prospective role share a responsive Grid, with the opportunity in a neutral inset. The full-width suitability summary has a restrained teal background; its former independent 75-character width cap is removed. Assessment sections own their borders, with accordion dividers inside rather than nested bordered boxes. All panel spacing, radii and breakpoints use Mantine tokens. Desktop and 250% zoom stacking were visually checked.

Overlay conventions are defined in [the design system](design-system.md). Details, evidence and editing flows all use right-hand drawers; modals are reserved for brief confirmations.

The review workspace uses a wider assessment column and a narrower right column for Your next step, your assessment and saved editable notes. They stack below Mantine’s md breakpoint. User-facing actions name Eimhin rather than using a generic occupational label, and address the reviewer directly. Notes are independent of evidence, interest and nomination. By explicit product decision, notes and review state use local React state and reset on refresh. Nothing is saved in browser storage; no previous conversation is fabricated.
