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

## Data trust

Do not populate the product with invented career intentions, opportunity associations or candidate responses. Unknown information stays unknown. Source records, dated manager opinions, curated interpretation and reviewer-entered information must remain distinguishable. Describe changes in feedback chronologically: earlier concerns followed by later praise suggest improvement; do not flatten them into a timeless “mixed” label or assert independently verified competence.

Show only the latest relevant manager review in assessment content and the evidence inspector, with its date and source. Preserve historical reviews in the underlying audit. Explicitly agreed scenario facts (the prior conversation confirming interest) must be distinguished from employment-record evidence and must never override later recorded responses.

## Quiet Authority — assessment-only visual proof

The opportunity assessment uses `quietTheme` in `src/theme.js`. The People route retains the existing theme. A stable MantineProvider switches theme with the route without remounting application state; assessment drawers inherit that provider through portals. The document identity attribute scopes surface and focus rules. Do not extend this identity to People until visual approval.

The palette is warm ivory (#FAF9F5), white assessment, stone (#F0F0EB) workspace and charcoal (#273238), with navy (#243951) primary actions and maritime blue (#385577) evidence accents. Amber and green retain their existing meanings. Muted vermilion is reserved for destructive controls and errors. Mantine continues to own typography sizes, spacing, radii, breakpoints and component dimensions. Candidate name uses h2 sizing and section headings h4 sizing; supporting information uses sm. Self-hosted Inter uses `font-display: swap` and system fallbacks. The variable WOFF2 and SIL Open Font License are bundled in `public/fonts`, sourced from the official Inter distribution (https://rsms.me/inter/ and https://github.com/rsms/inter).

The left column is a continuous white surface, with separators rather than repeated outer cards. The sticky workspace is a stone surface with separators between its existing sections. Expanded accordion controls use a restrained blue-neutral background. Existing subsection indentation is retained; the whole panel is not indented or enclosed again. Secondary actions remain bordered; quiet actions have visible hover and keyboard-focus feedback.

Only pump evidence receives the reference treatment: the existing live Record X of Y label, date, exact highlighted passage and interpretation align along a fine rule. The position is not a historical identifier. Source identifiers and provenance remain in their existing location. Other drawers inherit typography and palette without bespoke layouts. No content, evidence fixtures, workspace schema or decision logic changes are part of this proof.

### Proof verification

Automated coverage includes palette contrast (normal text at least 4.5:1; essential borders at least 3:1 on white, ivory and stone), route switching with retained workspace state, exact highlights, record navigation, Escape and focus restoration. Mantine control sizes are retained; compact-xs buttons were raised to xs and workspace checkboxes use md (24px). Reduced-motion styles suppress transitions; Inter has a system-font fallback.

Desktop assessment appearance was inspected in Chrome. Native browser automation intermittently returned `noWindowsAvailable` or failed to activate controls. Consequently narrow-screen rendering, expanded rows, pump-drawer appearance, sticky scrolling, actual rendered target measurements, reduced-motion emulation and blocked-font fallback still require manual browser verification. Automated interaction checks are not a complete accessibility audit. Wider visual rollout remains pending approval.

## Opportunity assessment hierarchy — current iteration

This revision supersedes the earlier six-section assessment composition. The left surface has four sections: compact candidate/opportunity context, Why this could work, relevant experience and qualifications. Permits sit with experience and are explicitly an employer preference. Colleague-support evidence stays in role details; offshore working conditions remain visible as a non-certificate consideration. Existing role details retain location and working pattern.

The right surface owns current progress, What needs doing and Last contact. Interest appears here only, with its scenario/manual provenance. The primary action follows current assessment and interest: review an unsuitable assessment, review a declined response, record an awaited response, prepare discussion, or prepare/review the introduction. Introduction editing itself is unchanged. Saved questions have one discussion editor; their full wording is no longer repeated beside tasks. Existing tasks, questions, notes and reported accounts keep their identifiers and storage.

Qualification scan rows state the documented position and the specific check; unavailable records are not a confirmed absence. Experience expands once, and source inspection is the third level. Evidence opens on the selected record and highlighted passage rather than aggregate year-by-year statistics. Source details remain directly accessible below. Latest manager-review excerpts include only sentences relevant to the selected experience, with their original source reference. Original logbook quotations, highlights and attribution warnings remain intact.

Rendered review covered desktop default/expanded assessment, evidence, a demonstration follow-up and a 390px narrow layout. No horizontal overflow was observed at that width. Screenshots are in `artifacts/redesign`. Qualification scan rows are longer in exchange for making missing information visible without expansion. This is not a screen-reader or complete WCAG conformance audit.

### Final corrections: action priority, evidence and mobile order

The initial primary action is Review suitability. Assessment/interest determine the next prominent action; early introduction preparation remains secondary until appropriate. Scenario and developer explanations are omitted from default product copy; documentation retains provenance.

Use the dated source selector as the sole record-navigation control. Manager appraisal is a separately selectable source type with only the relevant verbatim excerpt. Logbook passages and highlight boundaries are unchanged. Omit interpretations that only paraphrase activity; preserve material authority, attribution and date limitations. Technical provenance sits under View source details, as explicitly requested for this correction.

At the existing md breakpoint, the single progress component is portalled into the assessment immediately after the summary. Its DOM position therefore precedes experience for keyboard and reading order. It is not duplicated and still receives the same workspace state. Desktop retains the existing complete sticky workspace; notes/tasks remain below the assessment on narrow screens. No workflow or storage schema changed.

### Focused craft proof: qualifications and review workspace

This treatment is limited to the qualification list and right-hand workspace, pending visual approval. Qualification names and recorded status share aligned columns; expiry dates are subordinate. Space replaces repeated row rules. Each complete row remains an accessible accordion control with a chevron, hover treatment and keyboard focus. Experience rows retain their existing presentation.

The workspace uses one stone surface and spacing between progress, tasks and last contact. Tasks retain visible completion controls; named options menus contain editing, discussion preparation and removal. Saved discussion questions remain accessible. Empty discussion preparation no longer occupies a standalone button, and internal qualification categories and generic task disclaimers are omitted. Linked qualification-task data and verification semantics are unchanged. Menu-to-drawer transitions explicitly restore focus to the originating task control.

These aligned status rows and task options menus are candidates for reuse, not an approved application-wide rollout. Desktop, expanded qualifications, training inspection, task menus, completion and 390px layout were captured in `artifacts/ui-craft`. Browser keyboard/Escape/focus checks supplement component tests; this is not a full screen-reader or WCAG conformance audit.

### Approved identity rollout: redeployment workspace

Quiet Authority now applies to both routes and their shared navigation/overlays through the existing central `quietTheme` and resolver. The People route no longer selects the legacy teal palette. The assessment composition and interactions are unchanged.

The entry workspace groups opportunities by person on one white surface over ivory. Names and intentions anchor each group; opportunity, progress and next action align in columns on desktop and stack on narrow screens. Small text-labelled semantic badges distinguish progress without depending on colour. Only implemented assessment navigation is styled as a link. Group spacing replaces repeated card borders. Illustration/provenance explanations belong in README, not in the working list.

### Decision-panel cleanup

The workspace leads with a small “Your decision” label and one larger decision value. It no longer repeats the same assessment as both current progress and a separate assessment row. Only one decision-edit action is shown: the primary action where appropriate, otherwise a quiet Change control. Eimhin’s interest has one adjacent pencil-labelled control; if response recording is primary, the interest itself is plain text. Primary buttons use intrinsic width instead of filling the column.

Career/offshore preferences are an editable task, not an unrelated status note. A one-time local migration adds that follow-up to existing workspaces; removal, completion and edits remain respected afterwards. The persistent assessment-change warning is removed from the sidebar. Introduction review requirements remain enforced and explained in the introduction interaction. Evidence and interest are not modified by these presentation changes.

### Working-preferences editing

Working conditions uses the shared expandable assessment row. Its contextual action opens the existing workspace Drawer: Record working preferences initially, Edit working preferences after saving. The editor uses required discussion date and response fields, optional concerns, Cancel and Save preferences. The row reports “Preferences recorded” without claiming acceptance of every working condition; the saved response is visible in the expansion. Mantine contains focus and Escape closes the drawer; explicit restoration returns to the same contextual button.

## Visual language refinement — IBM Plex Sans

This supersedes the earlier Inter typography and assessment-only proof. `src/theme.js` exports one shared theme (the older `quietTheme` name is a compatibility alias). No page composition, content, business logic, evidence data or storage state is changed by this refinement.

- **Type:** self-hosted IBM Plex Sans variable, normal width, weights 100–700, `font-display: swap` and system sans fallback. Headings use 500 weight with modest negative tracking; buttons and form labels use 500. Existing heading proportions and body sizes remain; the smallest metadata token is 13px. Status badges inherit that readable minimum. Numeric dates/reference positions use tabular figures. No decorative monospace was added.
- **Colour:** navy #243951 remains the primary action and heading ink; #385577 identifies evidence, links and supporting interaction. Ivory #FAF9F5, white and stone #F0F0EB retain the approved surfaces. Charcoal #273238 carries body text; secondary text uses the existing AA-tested grey. Warm red is confined to the existing small brand symbol and destructive/error states. Green and amber preserve their semantic roles; labels/icons continue to communicate status without colour.
- **Controls:** Mantine sm radii for buttons, inputs and menus; xs for checkboxes. Existing card radii remain as approved. Filled navy primary, outlined white secondary, and quiet text tertiary treatments retain their existing placements. Hover, focus, disabled and error states form one family. Buttons have a 24px minimum height; icon targets retain Mantine sizes. Loading continues to use Mantine’s existing loader and disabled interaction; no artificial workflow/loading state was introduced.
- **Rows:** existing alignment, labels and disclosure icons are unchanged. Shared pale blue hover/expanded backgrounds and navy focus rings provide affordance without adding row borders. Lucide remains the only icon family, with a consistent 1.7 stroke.
- **Sources:** exact quotation highlighting now consistently uses pale blue with dark text. The existing reference rule/position marker is retained; no new nautical imagery, markers or disclosure layers were added.

Theme component defaults and styles own appearance. The small `ui-*` CSS classes referenced by that theme cover pseudo-states; layout CSS still owns only existing surface composition, alignment, reference rules and positioning. There is no second token scale. The legacy teal theme definition was removed.

Font provenance: Google Fonts’ `ofl/ibmplexsans/IBMPlexSans[wdth,wght].ttf`, distributed under the SIL Open Font License retained at `public/fonts/IBM-Plex-LICENSE.txt`. The application serves the font locally, with no Google Fonts runtime request.

Validation screenshots are in `artifacts/visual-refinement`, with prior screenshots retained under `before`. Browser checks covered both routes, expansion, evidence, menus, focused and disabled controls, 390px layout, focus containment/return, reduced motion and blocked-font fallback. Palette contrast tests cover normal text (4.5:1), essential borders (3:1), and evidence highlights. This is not a full assistive-technology audit or a cross-browser certification; loading/error appearance is based on shared Mantine styling rather than a new app workflow.

### Supporting evidence timeline

Experience evidence opens as one continuous oldest-first timeline containing every associated logbook entry. There is no selected-record state, record-position counter or record selector. Each item groups its date, station and “Original logbook” label above the exact highlighted quotation. Dates and source labels use Mantine sm; quotations use the standard body size. A fine connecting rule and small markers establish chronology without enclosing each item in another card.

Record flags and expandable technical source details remain independent for each entry. Attribution and measurement caveats remain visible. The latest relevant manager appraisal follows the logbook timeline as a separately labelled source. Qualification inspectors retain their existing presentation. This replaces the earlier pump-only reference motif.

### Reviewer-controlled record inclusion

Review flags now live inside each record's source details. Early entries show an optional exclusion checkbox in place of the prominent discrepancy warning; the full attribution caveat remains in source details. Other entries offer the same exclusion control inside source details. Excluded entries show their exclusion state and can be restored directly.

All logbook records start included in the assessment. Inclusion is not verification: the existing attribution safeguard still prevents uncertain early records from being used as confirmed introduction evidence. Reviewer exclusion removes a record from derived counts, affected summaries and generated introduction provenance. Retained originals are still inspectable. Exclusion and restoration clear readiness and mark existing introduction wording for review without destroying the user's edits.

### Consistent exclusion controls

Every logbook timeline item now shows the same “Exclude this record” checkbox immediately below its quotation. Date-attribution concerns are checkbox descriptions, visually grouped and programmatically associated with that choice. The exclusion scope is explained once above the timeline. Review flags remain inside source details. Source details no longer repeat their heading or the date warning; original raw text is labelled and set in supporting text size. This supersedes the earlier placement of ordinary-record exclusion inside source details.

## Neutral visual foundation — current

The page uses a warm ivory #F7F4EE base and one locally hosted, low-contrast ivory-and-cream watercolour texture. The image sits only on the page canvas; content panels and the header remain solid #FFFFFF, and the officer workspace remains #F0F0ED. Primary navy is #243951 and body text is #273238. Surface tokens are centralised in the Mantine CSS-variable resolver. The header has a straight inset 1px #D8DEE0 lower rule to preserve its height. The approved navy lighthouse and serif wordmark are retained in the header; application typography remains IBM Plex Sans.

The background asset is an original texture stored at `public/backgrounds/ivory-watercolour.jpg`. It uses broad, irregular warm washes without recognisable imagery, tiling or decorative overlays. The lighthouse SVG retains padded bounds to prevent clipping. Existing component sizing, typography, focus states, semantic status colours and all assessment/workspace behaviour remain intact.

### Workflow integration (no visual redesign)

Qualification verification reuses the existing editor drawer, labelled inputs, checkbox acknowledgement and Cancel / Save action group. Correction and withdrawal remain within that drawer, with readable provenance history. The qualification row uses the existing semantic positive colour only for current verification, labelled “Verified by you”; training-module and attendance statuses remain distinct. System-managed introduction and qualification-specific checks remain in workflow state but are omitted from the checklist. Qualification verification belongs in the qualification section, while introduction progress belongs in the officer summary. The general offshore-certificate check remains visible with a checkbox and concise “X of 4” progress. Selecting it opens the next outstanding verification; it checks itself only when all four safety certificates have current verification. Manual rows retain direct checkboxes. All existing surfaces, typography, lighthouse branding, dimensions and page composition are retained.

The officer panel uses fixed labelled assessment, interest and introduction positions. Assessment and interest controls stay beside their values. The Next action label distinguishes recommendation from recorded status; a navy button appears only for a separate action. Simulated sending and its history reuse existing drawer, checkbox, button and modal components without changing theme, branding or unrelated surfaces.

Introduction preparation is offered only when it is the recommended next action. Existing drafts remain accessible while progression is paused; before suitability is recorded there is no competing preparation action.
