# Carrowmore design system

Mantine owns the default typography, spacing, component sizes, radii and breakpoints. The theme in `src/theme.js` defines the existing Carrowmore palette and off-white canvas. Use Mantine primitives and tokens; do not introduce a parallel set of component styles.

## Layout and emphasis

Use aligned Paper sections to group decision-relevant content. The wider left column contains the person, current role, prospective opportunity and assessment. A narrower right column contains Opportunity progress, Next steps and Recent conversation. Use Mantine Grid spans 8/4 from md, stacking below it. A restrained teal summary panel provides emphasis; white assessment panels keep evidence statuses scannable. Group related controls with their purpose and avoid repeating statuses.

## Overlay convention

**Use a drawer for viewing details or doing contextual work.** This includes source evidence, role details, discussion preparation, question editing, officer assessment, simulated keeper responses and referral drafts, reported responsibilities, dated notes, tasks and readiness decisions.

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

Expanded experience uses a neutral evidence panel (recorded activity, role relevance, selected-record count with attribution caveat, source inspection) and a separate amber clarification panel with its own discussion action. Date range, latest selected activity and involvement are disclosed through Record coverage and involvement. Related training stays secondary, with compact module details and optional follow-up actions behind a disclosure. Expiry context stays with the module. Source fixtures and qualification semantics are unchanged.

## Candidate introduction

Prepare candidate introduction opens a professional document preview, not a form. Use one white Paper for the whole document, with compact candidate/opportunity context, heading hierarchy and short paragraphs; do not put cards around individual sections. The generated introduction is about 200 words. Existing Mantine typography and spacing apply.

Editing is explicit through Edit introduction. Basic labelled textareas appear only in edit mode; Review introduction returns to the complete preview, and Save introduction draft is a separate explicit action. Candidate CV: Not attached is informational, with no upload or required field. Internal status and authorship messages sit outside the employer-facing document.

Only Draft and Ready for Eimhin’s review are actionable states. The latter requires a saved introduction and recorded interest; it is not approval, nomination or submission. Do not show a fake send button. Reported responsibilities are opt-in and retain visible self-reported provenance.

Reset to assessment uses a short confirmation modal because it replaces working text. Restore focus to the document after replacement, or the trigger after cancellation. Retain previous wording behind an internal disclosure, outside the employer-facing preview. Source records remain accessible through the unchanged main assessment.

The workspace retains its task and conversation layout. Only introduction-related controls/status labels change in this iteration. Task completion does not use qualification-success styling. Recent conversation remains a dated preview, with editing in a drawer.

Current and previous introduction drafts share one document-preview component: the same paper surface, section headings, typography and spacing. Previous versions are labelled read-only. Older saved fields retain their wording under explicit section headings; no recommendation is invented where the previous format stored questions instead. Internal state metadata is never rendered as document text.

The redeployment entry page uses one compact list surface. Person headings establish the primary grouping; a Mantine Grid aligns opportunity, progress and next action beneath each name, stacking with explicit field labels on narrow screens. Only implemented destinations use links. Mantine TextInput, NativeSelect and Checkbox provide search and filtering. The shared application header is unchanged.
