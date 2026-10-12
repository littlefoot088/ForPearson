# Carrowmore design system

This is the current visual and interaction specification for all pages and overlays. Historical experiments are not alternative designs. Pair this with [information architecture](information-architecture.md) for workflow meaning and [CONTRIBUTING.md](../CONTRIBUTING.md) for change validation.

## Ownership and visual foundation

Use the existing Mantine theme in `src/theme.js`, its CSS-variable resolver and shared components. Mantine owns type scale, spacing, radii, breakpoints and control sizes. `src/styles.css` handles application composition and shared pseudo-states. Do not create another token scale, route-specific theme or collection of local colour overrides.

| Element | Current treatment |
| --- | --- |
| Page canvas | Warm ivory `#F7F4EE`, with the original local ivory-and-cream watercolour asset. |
| Content panels / header | Solid white `#FFFFFF`; no texture inside functional surfaces. |
| Officer workspace | Neutral `#F0F0ED`. |
| Primary / body text | Navy `#243951` / charcoal `#273238`. |
| Evidence accents | Maritime blue from the existing theme; exact quotations use pale blue highlighting. |
| Header bottom edge | Straight 1px `#D8DEE0` rule; no wave edge. |
| Semantic states | Existing amber, green and red palettes only where their meaning warrants them. |

The sole background asset is `public/backgrounds/ivory-watercolour.jpg`, applied to the page canvas without repeated tiles or decorative overlays. Keep the approved navy lighthouse and serif wordmark, including its padded bounds. Do not restore the red wave icon or the central Redeployment header label.

Application typography is locally hosted IBM Plex Sans, with system fallbacks and `font-display: swap`. Its SIL Open Font License is in `public/fonts/IBM-Plex-LICENSE.txt`. The logo lettering is an intentional brand exception. Preserve the current Mantine scale and weights; do not introduce decorative fonts. Lucide icons use the shared Icon component and 1.7 stroke.

## Page composition and responsive order

People groups opportunities by person on one white list surface. Keep intention close to the person's name. Opportunity, Progress and Next action align across rows and receive explicit labels on narrow screens. Use links only for implemented destinations.

Profiles use the existing rounded white career-context and opportunity panels. Career context and opportunity selection use drawers; they do not need separate edit pages.

For Not yet decided intentions, use a simple follow-up block across the list's opportunity area: Clarify employment plans, followed by conversation/questionnaire guidance. Do not show job rows or opportunity progress badges. Profiles use the same guidance and keep earlier selections collapsed under Previously considered opportunities.

The assessment separates candidate/opportunity context and Why this could work, relevant experience, and safety/medical requirements into white panels. Name and rationale share a panel. The neutral officer workspace contains progress/status, tasks and conversations. Desktop uses the existing 8/4 Mantine grid and bounded sticky workspace. Below md, progress appears after the summary and before experience through the existing portal; tasks and conversations follow the assessment. Do not duplicate the progress component or change reading order through CSS alone.

## Consistent actions

| Context | Pattern |
| --- | --- |
| Status rows | Label above value, compact text action in a consistent trailing column; reuse StatusRow. |
| Assessment / interest | Record or Change beside the status, with a specific accessible name. No pencil-only alternative. |
| Next action | One navy button for a distinct action; guidance points to fixed assessment/interest controls instead of duplicating them. |
| Completed simulated send | Keep View in the introduction row; omit Next action. |
| Section creation | Text action in the heading row: Add task / Record. Record has accessible name Record conversation. |
| Tasks | Consistent checkbox rows, supporting description/action beneath the title, options menu in the trailing position. |
| Detail access | Existing bordered assessment buttons; consistent quiet actions within the workspace. |

A task's completion control and its route to doing the work remain visually related. System checkboxes derive completion from real saved events; opening verification does not check a requirement. Explain linked progress with concise text such as “0 of 4 safety certificates verified.” Do not replace a task row with an unrelated heading-like link. Prepared conversation questions and account documents belong in Conversations, not the checklist.

Task destinations beneath the title use navy, always-underlined text actions, including certificate progress, working preferences and training actions. They are independently focusable buttons because they open drawers, and sit outside the checkbox label so following a link does not toggle completion. Descriptive text without an action remains muted and unadorned. Retain the same link treatment for completed-task destinations.

Offer introduction preparation only when recommended. Existing drafts remain accessible while work is paused. Avoid duplicate links/buttons opening the same introduction in one state.

## Drawers, confirmations and editing

Use the existing right-hand Mantine drawers for role/source details, career context, opportunity selection, decisions, responses, progress, tasks, conversations, verification and introductions. Desktop size is lg; at or below sm use full width. Keep one contextual drawer visible, changing its content rather than stacking drawers.

Every drawer has a meaningful title and labelled close control. Preserve focus containment, background scroll locking, Escape and return focus to the opening control or its existing fallback. Opening or closing does not save a decision or imply consent. Editors use Cancel and an explicit, specifically labelled save action; unsaved changes are not silently persisted.

Use short confirmation modals only for existing destructive/replacement actions, including workspace reset and Replace wording from assessment. Preserve previous wording on replacement. Do not turn contextual forms into centred modals or add routine confirmation steps.

## Assessment and evidence

The reading sequence is scan → expand one requirement → inspect evidence. Do not nest assessment accordions. Keep outcome, dates and material limitations readable; distinguish requirements from employer preferences and related modules.

Logbook evidence uses one oldest-first timeline with every associated record immediately available. Date, station and Original logbook form a compact shared heading; the exact quotation follows. There is no record selector or “3 of 18” pagination. Each entry has the same Exclude this record checkbox. A relevant attribution concern is its associated description. Explain exclusion scope once. Review flags and raw metadata belong under View source details. The latest relevant manager appraisal remains a separately attributed source.

Preserve exact quotation text and highlight boundaries. Original records are not rewritten to simplify copy. Missing records are described as missing documentation, not missing competence. Qualification details distinguish training outcomes from current “Verified by you” document verification.

Safety qualification details offer Record verification and Assign training in the same action group. The verification drawer also offers the training route when the certificate cannot be verified. Switch content in the existing drawer, retaining its original focus-return target. Medical clearance has no course-assignment action.

Training uses the existing labelled form controls: confirmed reason, course, optional provider/target date, then progress and a required completion date when completed. Save explicitly. The qualification row shows the current training status until the document is verified. The linked checklist row retains a checkbox, descriptive status and Update training action; completion checks it automatically and adds Verify certificate. Cancelled system training tasks leave the checklist while their history remains in Manage training. Do not use verification-success styling for course completion.

## Conversations and introduction

Conversations shows prepared/discussed counts and the latest dated contact, identifying Private note versus Eimhin's account. Use a multi-select for preparing question topics and checkboxes for multiple questions covered by one conversation. Full questions, editing and history live in their existing drawers.

The candidate introduction opens as one white document preview with short paragraphs and existing heading hierarchy, not cards around each field. Editing uses labelled textareas; review returns to the preview; saving is explicit. Current and previous versions reuse the preview component, with historical versions labelled read-only. Internal metadata and private notes stay outside the public document.

The sharing acknowledgement is initially unchecked. Keep “Simulation only — nothing will be sent” next to the simulated-send action. Show recipient, simulated status and date after sending; do not imply employer delivery or acceptance. Readiness and sending rules are specified in the information architecture.

## Accessibility and visual review

Preserve visible keyboard focus, labelled controls, programmatically associated descriptions, semantic headings and status text independent of colour. Normal text should meet 4.5:1 contrast and essential control boundaries 3:1. Existing compact controls have a 24px minimum; do not shrink their targets. Preserve reduced-motion support and font fallbacks.

Review desktop and 390px layouts, zoom/reflow, long content, dropdowns, open drawers, keyboard order, Escape and restored focus. The existing screenshots are a visual baseline, not proof of complete accessibility. Automated contrast/component tests and browser review complement one another; neither is a full assistive-technology audit.
