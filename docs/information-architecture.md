# Information architecture

## Officer workflow

My assigned vacancies → vacancy workspace → suggested candidates → candidate review → clarification and review decision.

The vacancy workspace conceptually includes employer/job details, requirements, suggested candidates and review statuses. An officer is responsible for several vacancies and reviews each person in the context of a particular role.

## Implemented moment

Only the candidate review for Carrowmore Array’s Wind Turbine Technician vacancy is built. Breadcrumbs are contextual text, not links to unbuilt pages. The role-requirements dialog is a summary of the supplied O&M vacancy.

The review puts information in this order:

1. Vacancy and candidate context, recorded review status and the reason for the suggestion.
2. Three potential experience areas. Each connects a job requirement to selected source dates, involvement, limitations and evidence inspection.
3. Formal qualification coverage in a separate column. Additional relevant modules are disclosed on request.
4. Local clarification drafts and the officer’s next decision.

Evidence opens in a side drawer on wider screens and fills the viewport on narrow screens. Source text and metadata come before interpretation and limitations. Native modal behaviour contains keyboard focus; Escape closes the view and focus returns to the opener. The original raw fields remain available through a disclosure.

Questions are linked to the experience area or qualification that prompted them. Officers can edit, save and remove drafts. Saving never sends a message or changes review status. Qualification verification flags are reversible. “Clarification required” and “Worth progressing” record the officer’s judgement; neither verifies a certificate or removes unresolved requirements. A decision can be cleared.

## Conceptual keeper experience

Suggested job opportunities → role-specific transferable experience → formal requirements → evidence to clarify or correct → eligibility actions.

A keeper could provide missing certificates, correct attribution, explain their involvement or clarify how regularly work occurred. These actions make existing experience visible; they do not confer competence. Training would address a confirmed qualification need after existing evidence and employer acceptance have been checked.

No keeper screen, assigned-vacancies dashboard, candidate search, full vacancy workspace or messaging service is implemented.
