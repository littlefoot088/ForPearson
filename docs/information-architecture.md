# Information architecture

## Officer workflow

My assigned vacancies → vacancy workspace → suggested candidates → candidate review → clarification and review decision.

The vacancy workspace conceptually includes employer/job details, requirements, suggested candidates and review statuses. An officer is responsible for several vacancies and reviews each person in the context of a particular role.

## Implemented moment

Only the candidate review for Carrowmore Array’s Wind Turbine Technician vacancy is built. Breadcrumbs are contextual text, not links to unbuilt pages. The role-requirements dialog is a summary of the supplied O&M vacancy.

The review puts information in this order:

1. Candidate name and background, with a short Review focus summary describing relevant experience and the main verification questions. The Authority is the redeploying organisation; Carrowmore Array is the external employer.
2. One compact requirements assessment, grouped into essential experience/working conditions, required safety coverage/clearance, and additional employer preferences. Rows show only a requirement, status icon/text and expansion control by default.
3. A compact review action bar. Worth progressing and Clarification needed are independent, reversible states; both may apply. A Review draft control appears only when questions exist.

There are three disclosure levels: requirement → assessment → supporting evidence. One requirement expands at a time. Mechanical or electrical maintenance is a single essential requirement with two alternative evidence routes. Its expanded view retains separate claim summaries, selected-record counts and dates, involvement, limitations and related training. Safety coverage remains separate from practical experience even though both use the same list. Comfort offshore and mentoring are not inferred from other evidence.

Evidence opens in a side drawer on wider screens and fills the viewport on narrow screens. The parent requirement remains named in the drawer. Exact source text and metadata are separate from interpretation and limitations; original raw fields remain available. Closing retains the expanded requirement and restores focus to its originating control. Native dialogs contain focus and support Escape. At short viewport heights the review bar returns to normal flow so it does not obstruct the assessment.

Questions originate in the relevant assessment. The officer can edit a suggested question, save a local draft, review all draft questions, revise them and remove them. Mechanical and electrical questions remain distinct. Saving a question never sends it or changes either review state. Qualification verification flags are also reversible and do not change the evidence status or establish eligibility.

## Conceptual keeper experience

Suggested job opportunities → role-specific transferable experience → formal requirements → evidence to clarify or correct → eligibility actions.

A keeper could provide missing certificates, correct attribution, explain their involvement or clarify how regularly work occurred. These actions make existing experience visible; they do not confer competence. Training would address a confirmed qualification need after existing evidence and employer acceptance have been checked.

No keeper screen, assigned-vacancies dashboard, candidate search, full vacancy workspace or messaging service is implemented.
