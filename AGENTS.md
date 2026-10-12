# Repository instructions

Applies throughout this repository. Read README.md, CONTRIBUTING.md, docs/design-system.md and docs/information-architecture.md before making application changes. These describe the current product; older screenshots and history are not competing specifications.

- Preserve unrelated work and existing saved state. Never reset the repository or use the user's browser storage as test data.
- Reuse the central Mantine theme and existing components. Keep consistent status actions, contextual drawers, explicit saves, keyboard access, Escape and restored focus. Do not introduce a new design system.
- Keep employment intention, opportunity interest, suitability, progress and next action separate. Use workflowState.js for shared derivation and workspace.js for reducer guards/migration; do not duplicate workflow rules in page components.
- Keep questions, notes and accounts in Conversations, tasks in What needs doing. Task completion must not establish qualification verification, interest or consent.
- Preserve original evidence and provenance. Changes to saved context must not silently overwrite officer prose or immutable sent snapshots. Migrate storage additively.
- Simulated sends require current saved wording and version-specific approval; never send real communications or include private notes in the public introduction.
- Follow the four current employment-intention choices and current labels documented in the workflow contract. Do not restore superseded wording from history.
- Run relevant regression tests and the production build for application changes. For visible changes, also inspect desktop/mobile and open/closed interaction states in an isolated browser. Report checks and limitations honestly.
- Update documentation in place when approved behaviour changes. Do not append contradictory iteration notes. If the request changes an existing contract, identify the change explicitly rather than silently redesigning adjacent behaviour.

Do not commit or push unless requested. Use CONTRIBUTING.md and the pull-request template for handover evidence. Agent instructions guide work; tests and human review are still required.
