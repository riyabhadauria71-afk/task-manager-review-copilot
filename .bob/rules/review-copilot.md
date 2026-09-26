# Review Copilot — PR review workflow

This rule only applies when the user is asking Bob to review a pull request or a
diff (e.g. "review this PR", "review PR #123", "review these changes before I
merge"). Ignore this rule for all other tasks.

When reviewing a PR, follow this workflow instead of reviewing the diff directly
yourself:

1. Read the full diff and the PR description, including any linked ticket ID.
2. Decide which of the following personas are relevant to this diff — do not spawn
   a subagent whose inputs are untouched by the change:
   - spec-compliance   (spawn if a ticket is linked)
   - convention        (always spawn)
   - test-coverage     (spawn if any non-test source file changed)
   - security          (spawn if dependency manifests, auth code, or
                         input-handling code changed)
   - architecture-fit  (spawn if changes touch a module covered by an existing ADR)
3. Spawn the relevant subagents in parallel, each using its matching persona from
   .bob/agents/. Do not run them sequentially, and do not review the code yourself
   in addition to them — delegate fully.
4. Wait for all dispatched subagents to return their findings. Do not edit or
   rewrite their findings — pass them through to the aggregation step below so each
   subagent's reasoning stays traceable.
5. Aggregate the findings into one PR review comment:
   - Deduplicate: if two personas flag the same underlying issue, merge into one
     item and keep both tags (e.g. [SPEC][ARCHITECTURE]).
   - Rank by severity: all blockers first, then notes.
   - Write each item as a human reviewer would — one sentence on what's wrong, one
     on why it matters, and a concrete suggestion — not a raw dump of subagent
     output.
   - For mechanical fixes (formatting, missing test stub) with a ready draft, list
     them separately under "Auto-fixable — pending approval."
6. Never auto-apply a fix. Present proposed auto-fix commits and wait for explicit
   approval before creating them.
