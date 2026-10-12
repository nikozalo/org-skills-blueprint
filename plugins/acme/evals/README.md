# Evals

Light smoke checks for the Acme plugin, in Claude Code's plugin eval format (`claude plugin eval`,
<https://code.claude.com/docs/en/plugin-evals>). One folder per case: a `prompt.md` with the
request, and its `graders/`. Each prompt answers the first-run questions itself ("Don't save a
file: print the record here."), so the skill does not stop to ask. Transcripts are made up.

```
claude plugin eval plugins/acme --tag smoke --ablation none                  # every case, with the plugin only
claude plugin eval plugins/acme --case mn-standard --ablation none
```

Each run is a real model call. Run them before merging a change to one of these skills; not in CI.

| Case | Skill | Expects |
|---|---|---|
| `mn-standard` | meeting-notes | The Decisions, Action items and Open questions headings; the Audience line; every action item with an owner and a quote |
| `mn-no-actions` | meeting-notes | The Action items section says there were none, and nothing is invented |
| `mn-not-agenda` | meeting-notes | Should not fire: asked for an agenda, Claude writes one and the skill is never called |

Every skill has cases where it should fire and at least one where it should not (`should-not-fire`
tag: a near miss, graded with `tool_used` and `min: 0`, `max: 0`), so a description that grows
greedy shows up before it starts taking over other requests. A wrong result reported through
`/acme:contribute` is a good new case: add it, see it fail, then fix the skill.
