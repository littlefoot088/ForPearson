# Carrowmore design system

Mantine owns the default typography, spacing, component sizes, radii and breakpoints. The theme in `src/theme.js` defines the existing Carrowmore palette and off-white canvas. Use Mantine primitives and tokens; do not introduce a parallel set of component styles.

## Layout and emphasis

Use aligned Paper sections to group decision-relevant content. The wider left column contains the person, current role, prospective opportunity and assessment. A narrower right column contains Your next step, your assessment and Your notes. Use Mantine Grid spans 8/4 from md, stacking below it. A restrained teal summary panel provides emphasis; white assessment panels keep evidence statuses scannable. Group related controls with their purpose and avoid repeating statuses.

## Overlay convention

**Use a drawer for viewing details or doing contextual work.** This includes source evidence, role details, discussion preparation, question editing, officer assessment, simulated keeper responses and local nomination decisions.

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

Prototype persistence: notes and review state last only until refresh, as explicitly selected. Do not imply browser persistence or recovery of previous sessions.
