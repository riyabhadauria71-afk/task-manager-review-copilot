# ADR 0001: Use an in-memory store for tasks (for now)

## Status
Accepted

## Context
This project is a small demo/prototype. We don't yet know the real usage
pattern or need for persistence across restarts.

## Decision
Store tasks in a plain in-memory array (see `src/tasks.js`) rather than adding
a database dependency. Task data does not need to survive a process restart at
this stage.

## Consequences
- No database setup/config needed for the demo.
- All task data is lost on restart — this is expected and acceptable for now.
- Any PR that introduces a database, file-based persistence, or an external
  storage dependency for tasks should first revisit this ADR rather than adding
  persistence silently.
