# Task Manager (Review Copilot demo project)

A tiny, dependency-free task manager used to demo the Review Copilot workflow in
IBM Bob 2.0.

## Run the tests

```
node test/tasks.test.js
```

## Project structure

```
src/tasks.js              core logic
test/tasks.test.js        tests
CONTRIBUTING.md           team conventions
docs/adr/0001-*.md        architecture decision record
.bob/agents/*.md          Review Copilot subagent personas
.bob/rules/review-copilot.md   orchestrator rule
```

## Demoing Review Copilot

1. Open this folder in the Bob IDE.
2. Check out the `feature/task-priority-filter` branch (already created) — it
   contains a real diff against `main` with a few intentional issues: a missing
   test, a convention violation, and a change that brushes up against ADR 0001.
3. In Agent mode, ask Bob: "Review the changes on this branch against main."
4. The `review-copilot` rule should spawn the relevant personas in parallel and
   return one aggregated, prioritized review.
