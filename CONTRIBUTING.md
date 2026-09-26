# Contributing

## Code style

- Use `const`/`let`, never `var`.
- Functions are `camelCase`. Files are `kebab-case` or a single lowercase word.
- Every exported function must validate its inputs and throw a descriptive
  `Error` on invalid input — do not fail silently or return `null` on bad input.
- No inline magic numbers for status/priority values; use plain string literals
  consistently with what's already in `src/tasks.js` (`"normal"`, `"high"`,
  `"low"`).

## Tests

- Every new exported function needs at least one test in `test/`.
- Every new error path (a `throw`) needs a test asserting it throws.

## Pull requests

- Every PR must link a ticket (`Fixes #123` or similar) describing what it does
  and why.
- Keep PRs scoped to what the linked ticket describes. Unrelated cleanup should
  be a separate PR.
