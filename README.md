# Carrowmore — Redeployment

Carrowmore Light Authority is preparing to redeploy 340 lighthouse keepers as its stations are automated. Their fragmented historical records contain potentially transferable experience, but do not necessarily establish current competence or formal qualifications. This prototype explores how a redeployment officer can assess that evidence against an employment opportunity and decide what to investigate or do next.

## Run locally

Use Node.js 22 (22.13+) or 24, with npm. From the repository directory:

```sh
npm ci
npm run dev
```

Open the URL printed by Vite, normally `http://127.0.0.1:5173`. No account or API key is needed. For the initial scenario, use a fresh browser profile or private window; previously saved work otherwise resumes.

## Start here

A short route through the main experience, taking approximately 2–3 minutes: **People workspace → Eimhin's Wind Turbine Technician assessment**. The People workspace provides illustrative context for the wider redeployment journey; this assessment is the primary developed experience. Conceptual keeper profiles remain available by their existing routes but are outside the normal reviewer journey.

1. **Begin in the Redeployment workspace.** Scan Employment intention, Progress and Next action. Eimhin has three opportunities under consideration; Coilean's undecided example prompts a conversation or questionnaire follow-up, and retirement cases remain visible without placement suggestions.
2. **Open Eimhin's assessment.** Choose **Wind Turbine Technician** at Carrowmore Array in Eimhin's row. This takes you directly to the detailed assessment. The breadcrumb retains his name as context and provides a **People** link back to the workspace.
3. **Investigate why the role could fit.** Read **Why this could work**, expand **Pump maintenance & repair**, then choose **View evidence**. Original logbook passages support the maintenance assessment; **View source details** exposes provenance. Notice the early records' date-attribution concerns alongside their exclusion controls.
4. **Compare qualification evidence.** Expand **Sea survival** and **First aid**: one has a module pass, the other has no certificate in the selected records. **Record verification** captures a document the officer has checked. **Assign training** supports an established training need.
5. **Make a decision and prepare an introduction.** Beside **Your assessment**, choose **Record**, select **Potential match**, then **Save assessment**. Eimhin starts **Interested** as a demonstration scenario, so Next action offers **Prepare candidate introduction**. Try **Edit introduction → Review introduction → Save introduction draft**. Close the drawer and use **People** in the breadcrumb: this opportunity now shows **Preparing introduction**. Reopening the assessment retains the same draft and progress.

To explore the final step, reopen the introduction and choose **Review with Eimhin**. An initially unchecked acknowledgement precedes **Send to Carrowmore Array**. This is entirely simulated: no employer is contacted and no real keeper's consent is established.

## What this prototype explores

**Judgement with visible uncertainty.** Relevant experience is not verified independent competence; attendance is not a completed qualification; missing documentation does not prove a qualification is absent. The officer remains responsible for suitability. Your assessment, the keeper's interest and work Progress have separate meanings.

**Additional information with a clear source.** In **Conversations**, **Prepare questions** supports several topics; **Record** saves a dated private note against questions covered. **View conversation history** also lets you record Eimhin's account separately. These accounts require explicit inclusion in an introduction and remain labelled as reported information; private notes never enter it.

**Connected work.** As with the introduction's shared Progress, completing an assigned course checks its training task automatically; the certificate still requires verification. Changed assessment information flags saved wording for review, preserving the officer's edits and earlier sent versions.

## Scope and limitations

| Scope | What to expect |
| --- | --- |
| Implemented | Eimhin's assessment, evidence inspection and supporting workflow, including local training assignments and introductions. Career-context editing persists; existing opportunity selections are retained. |
| Illustrative | The profile's conceptual career-planning view, wider journey, six-person directory's sample intentions and associations, other opportunities and interview/employment outcomes. Only Eimhin's turbine role opens a detailed assessment. |
| Not implemented | Live matching, live AI inference, automatic ingestion of all personnel records, external qualification verification, course booking, real employer communication, authentication, backend or production integrations. |

Evidence is curated from Pearson's synthetic data pack. The bounded audit contains 18 pump, 48 electrical and two planning/permit matches before exclusions: recorded entries, not actual work frequency. Historical fixture interpretation uses 31 December 2026; new verification uses today's Europe/London date. Source attribution and date limitations are documented below.

Explicitly saved changes persist in this browser's localStorage. Sharing the application does not share that workspace, and there is no cross-device recovery. Storage failure is disclosed. **Reset workspace** requires confirmation and resets the assessment workspace while retaining keeper profile context.

## Development and documentation

Built with React, JavaScript, Vite and Mantine, with locally hosted IBM Plex Sans, a central theme and shared workflow derivation. Storage migrations preserve earlier saved work. Read [CONTRIBUTING.md](CONTRIBUTING.md) before making changes.

```sh
npm test
npm run build
npm run preview
```

The build output is `dist/`; preview serves that build locally. Tests cover source integrity, workflow and migration, profiles, conversations, training, introduction privacy and component interactions. Browser checks supplement these tests; no full screen-reader, physical-device or WCAG conformance audit is claimed.

| Document | Purpose |
| --- | --- |
| [Design system](docs/design-system.md) | Current palette, components, responsive layout, action placement and accessibility conventions. |
| [Information architecture](docs/information-architecture.md) | Terminology, routes, workflow rules, ownership, privacy and persistence. |
| [Contributor guide](CONTRIBUTING.md) | How to change the application and demonstrate compatibility. |
| [Agent instructions](AGENTS.md) | Repository instructions for coding agents. |
| [Data decisions](docs/data-decisions.md) | Historical source selection, attribution and fixture interpretation. |
| [Evidence review](docs/evidence-review.md) | Bounded log audit, matching rules and limitations. |

The [screenshot gallery](artifacts/app-review/index.html) and [ZIP](artifacts/carrowmore-screenshots.zip) cover desktop/mobile interactions from 12 October 2026, before the [training addition](artifacts/training-support/). Open the gallery locally after cloning or extracting the ZIP. These use isolated sample data; the running application is the current reference.
