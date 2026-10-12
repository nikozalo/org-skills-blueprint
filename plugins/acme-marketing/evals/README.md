# Evals

Smoke checks for Acme Marketing, in Claude Code's plugin eval format (`claude plugin eval`). One
folder per case: a `prompt.md` with the request, and its `graders/`. The drafts are made up.

```
claude plugin eval plugins/acme-marketing --tag smoke --ablation none
```

Each run is a real model call. Run them before merging a change to the skill or the voice guide;
not in CI.

| Case | Expects |
|---|---|
| `vc-findings` | The banned word, the second exclamation mark, the Title Case heading and "ACME" are each found, with their rule numbers, and the draft is not rewritten |
| `vc-clean` | A draft that follows the guide is reported Ready, with no findings invented |
| `vc-not-translation` | Should not fire: asked for a translation, Claude translates and the skill is never called |
