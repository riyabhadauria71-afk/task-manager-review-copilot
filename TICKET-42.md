# TICKET-42: Add priority filtering to task list

## Description
Users want to filter their task list by priority level (e.g. "show only high
priority tasks") when calling `listTasks`.

## Acceptance criteria
- [ ] `listTasks` accepts an optional `priority` filter and returns only tasks
      matching that priority.
- [ ] Existing behavior (no filter = all tasks, `includeDone` filter) keeps
      working unchanged.
- [ ] New behavior is covered by tests.

## Out of scope
- Persistence / storage changes are not part of this ticket.
