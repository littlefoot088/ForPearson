# Carrowmore design system

Mantine owns the default typography, spacing, component sizes, radii and breakpoints. The theme in `src/theme.js` defines the existing Carrowmore palette and off-white canvas. Use Mantine primitives and tokens; do not introduce a parallel set of component styles.

## Layout and emphasis

Use aligned Paper sections to group decision-relevant content. The wider left column contains the person, current role, prospective opportunity and assessment. A narrower right column contains Opportunity progress, Next steps and Recent conversation. Use Mantine Grid spans 8/4 from md, stacking below it. A restrained teal summary panel provides emphasis; white assessment panels keep evidence statuses scannable. Group related controls with their purpose and avoid repeating statuses.

## Overlay convention

**Use a drawer for viewing details or doing contextual work.** This includes source evidence, role details, discussion preparation, question editing, officer assessment, simulated keeper responses and referral drafts, reported responsibilities, dated notes, tasks. Readiness is managed only within the candidate introduction.

- Drawers open from the right, using Mantine’s `lg` size on desktop and full width at or below its `sm` breakpoint.
- Use the same title/context pattern and a labelled close control throughout.
- Keep one overlay visible. Moving between discussion questions and the saved list changes the drawer content rather than stacking overlays.
- Mantine owns focus containment, background scroll locking and Escape handling. Restore focus to the opening control after closing; use the existing fallback when that control no longer exists.
- Saving a question or recording a decision retains its existing explicit save semantics. Merely opening or closing a drawer changes no assessment or consent state.

**Reserve a modal for a short confirmation.** For example, a future destructive deletion confirmation may state what will be removed and offer Cancel and a specifically labelled confirmation action. Do not use modals for details, navigation or forms. No new confirmation step is introduced for the existing local question-removal action in this change.

Drawers expose the accessible `dialog` role: that role describes their interaction semantics, not a centred modal presentation. Tests may therefore continue to query dialogs.

## Evidence and action semantics

Experience evidence is not verified competence. Training modules and attendance are not complete certificates. Unknown information remains unknown. Qualification tasks, discussion questions and record-review flags are separate local actions. Suggestion, keeper interest and nomination decisions remain distinct, with no real messaging or employer submission.

Use the person’s name in actions and prompts (for example, Suggest to Eimhin and Record Eimhin’s response). Address the signed-in user as “you” or “your”; do not label their own controls “Officer”. Keep authentic job titles and original source-field labels unchanged. Notes are editable reminders, never evidence or an inferred record of a previous conversation.

Prototype persistence: explicitly saved notes, tasks and review state survive refresh in browser localStorage. Display storage failures. Reset prototype workspace uses a short confirmation modal and restores the illustrative scenario. Never imply server storage or cross-device recovery.

From Mantine’s md breakpoint, the right-hand review workspace stays visible with sticky positioning while the assessment scrolls. Its height is limited to the viewport, with keyboard-accessible internal scrolling when needed so notes and controls remain reachable. Below md it returns to normal document flow. Positioning uses Mantine spacing variables; no fixed overlay covers assessment content.

## Three information levels

Scan the page, expand one assessment to understand it, then open the evidence drawer to investigate. Never nest accordions. Experience details show activity and relevance, count/year range/involvement, attribution caveats, related module outcome, and one next step. Detailed dates and latest activity belong in the inspector.

Supporting modules and required qualifications use the same record summary and direct source access. Task creation and management belong only in Next steps; task completion never means verified.

Source passage, interpretation, uncertainty and provenance are visible in the same drawer, without another disclosure. Keep sequential navigation and direct dated selection. Use one discussion mechanism, one qualification-task mechanism and separate source-review flags.

Editors use Cancel and a specifically labelled save action. Introduction readiness is available only in its preview; optional reported-account inclusion is directly visible while editing. Next steps owns outstanding actions. Notes retain existing follow-up text as history, without a new follow-up field.


## Candidate introduction

Prepare candidate introduction opens a professional document preview, not a form. Use one white Paper for the whole document, with compact candidate/opportunity context, heading hierarchy and short paragraphs; do not put cards around individual sections. The generated introduction is about 200 words. Existing Mantine typography and spacing apply.

Editing is explicit through Edit introduction. Basic labelled textareas appear only in edit mode; Review introduction returns to the complete preview, and Save introduction draft is a separate explicit action. Candidate CV: Not attached is informational, with no upload or required field. Internal status and authorship messages sit outside the employer-facing document.

Only Draft and Ready for Eimhin’s review are actionable states. The latter requires a saved introduction and recorded interest; it is not approval, nomination or submission. Do not show a fake send button. Reported responsibilities are opt-in and retain visible self-reported provenance.

Reset to assessment uses a short confirmation modal because it replaces working text. Restore focus to the document after replacement, or the trigger after cancellation. Retain previous wording behind an internal disclosure, outside the employer-facing preview. Source records remain accessible through the unchanged main assessment.

The workspace retains its task and conversation layout. Only introduction-related controls/status labels change in this iteration. Task completion does not use qualification-success styling. Recent conversation remains a dated preview, with editing in a drawer.

Current and previous introduction drafts share one document-preview component: the same paper surface, section headings, typography and spacing. Previous versions are labelled read-only. Older saved fields retain their wording under explicit section headings; no recommendation is invented where the previous format stored questions instead. Internal state metadata is never rendered as document text.

The redeployment entry page uses one compact list surface. Person headings establish the primary grouping; a Mantine Grid aligns opportunity, progress and next action beneath each name, stacking with explicit field labels on narrow screens. Only implemented destinations use links. Mantine TextInput, NativeSelect and Checkbox provide search and filtering. The shared application header is unchanged.

### Evidence and follow-ups

Experience panels distinguish recorded activity, supporting evidence and related training. Evidence limitations are statements, not automatic requests to the person. Questions are prepared from Next steps and saved explicitly. All saved questions and their management control now live in Next steps alongside tasks and qualification checks. Reported-account editing is available there, associated with its question (or retained account). Existing questions, accounts and deduplication identifiers are preserved without a storage migration.


Content conventions: use plain statements about what the records show, without headings that repeat the open requirement. “No certificate was found in the selected records” does not mean the person lacks one. Fire training shows a past listed expiry and attendance; whether attendance satisfies the requirement is unknown, not an assumed failed or incomplete course. Keep the fictional review date internal; display actual expiry dates. Assessment actions use bordered Mantine buttons rather than unbounded text resembling headings. Original source wording remains unchanged.

Assessment sections are read-only summaries with source access. They do not offer per-item task or question actions, or repeat an assessment-date caption. Actual source dates and expiry dates remain visible; the fictional review date remains internal for consistent interpretation. Next steps is the single entry point for adding work and preparing questions. Its discussion drawer offers a topic selector, preserving topic deduplication and existing questions. Previously saved qualification tasks remain editable and removable in the workspace.

Expanded assessment subheadings remain left-aligned. Their body text and controls sit one Mantine spacing step inward, reducing on narrow screens. There is no outer inset or vertical rule. Body text uses the same small size and default text colour throughout; weight distinguishes subheadings. Evidence caveats must name the observed discrepancy rather than imply an unsupported identity error.

Keep assessment language concrete: name the work, outcome and expiry date. Do not repeat that listed experience is relevant, stack labels such as “module expired · supporting module”, or imply supervision details are a prerequisite to recognising recorded work. Retain material certificate and authority gaps. Related training uses a sentence such as “Passed. Training record expired 14 July 2022”; its source detail explains the scope of the award. Existing saved user wording remains unchanged.

Experience content answers “What Eimhin did” and “When it is recorded”, followed by the selected logbook count and source access. Distinguish repeated recent examples from isolated older records through concrete dates, not a competence score. Keep record-administration discrepancies inside the inspector. Qualifications instead show the training outcome and dates or the absence of documentation; do not force a work-frequency narrative onto them.

For larger evidence sets, use a labelled record selector alongside previous/next controls instead of a growing grid of date buttons. Keep aggregate counts distinct from actual work frequency. Manager observations belong in investigation detail and remain distinct from original task logs.
