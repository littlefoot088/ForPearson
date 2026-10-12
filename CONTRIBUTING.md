# Contributing to Carrowmore

Read the [README](README.md), [design system](docs/design-system.md) and [workflow contract](docs/information-architecture.md) before changing the application. These describe the current agreed behaviour. Historical screenshots and Git commits explain history; they do not override the current contract.

## Make a scoped change

1. Inspect the existing component, shared selector/reducer and relevant tests. Reuse their patterns rather than implementing a second version.
2. State what behaviour changes and which pages share it. Treat changed product rules as explicit scope decisions, not incidental refactoring.
3. Preserve unrelated work, source records and saved state. Use an isolated browser profile for demonstrations and migration tests.
4. Update the authoritative document in place if behaviour changes. Do not append a contradictory “latest iteration” section. README is an overview; detailed interaction rules belong in the design system and workflow rules in the architecture document.
5. Submit a focused pull request using the template. Include screenshots for UI changes and the actual checks performed, including limitations.

## Rules to preserve

- Keep intention, opportunity interest, suitability, progress and next action distinct; reuse shared derivation across People, profiles and assessment.
- Use the central Mantine theme, shared status rows and existing drawer patterns. Preserve fixed action positions, explicit saves, Escape and return focus. Avoid duplicated calls to action.
- Keep tasks in What needs doing and question preparation/history in Conversations. Manual completion cannot manufacture verification or approval.
- Preserve evidence wording/provenance and additive storage migration. Do not rewrite officer-edited introductions or sent snapshots automatically.
- Require fresh version-specific approval before a simulated send. Private notes never enter the shared document. Keep the simulation local.
- Do not restore earlier labels, fonts, colours or workflow concepts from historical documentation. Ask the project owner when a requested change conflicts with the current contract.

## Validation proportional to the change

For application changes, run `npm test` and `npm run build`. Add meaningful regression coverage for changed behaviour; do not add tests that merely duplicate implementation. CI runs the same commands on pull requests and pushes to main.

For UI changes, inspect desktop and narrow layouts (390px is the current reference), closed/open states, long content, keyboard operation, Escape and restored focus. Capture the affected states with isolated sample data. Do not claim layout validation from jsdom alone or full accessibility conformance from a few screenshots.

For workflow/persistence changes, exercise the affected paths across People → profile → assessment and refresh. Include older-workspace migration, manual/edited tasks, exclusions and verification expiry/withdrawal where relevant. Check introduction changes preserve wording and sent history, clear stale readiness, reject unapproved/duplicate sends and never trigger network sending. Confirm notes, interest and qualifications remain independent.

For documentation-only changes, check statements against current code, relative links and `git diff --check`; application tests are necessary only if code/configuration or behaviour also changes. New CI configuration should be checked against the repository's actual commands and runtime.

## Review and enforcement

`AGENTS.md` gives coding agents the same repository rules. The pull-request template makes contributors state how they followed them. Automated tests/build catch regressions they cover; human review remains necessary for visual quality, terminology and product intent.

For shared development, use branches and pull requests. A repository administrator should configure a main-branch ruleset requiring a pull request, a review and the **Tests and build** status check before merging. This repository includes the workflow but does not itself enable GitHub branch protection. Do not assume Markdown instructions or a checklist prevent direct pushes.
