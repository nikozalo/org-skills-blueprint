# Which plugin, its rules, and who reviews

Read this before drafting a skill or a rule change.

## Pick the plugin

The plugin whose people do the task. A task anyone at Acme does goes in `acme`. If it is not clear,
ask once: "Is this for everyone at Acme, or for one team?"

| Plugin | For | A skill | Its docs page |
|---|---|---|---|
| `acme` | Everyone at Acme | `plugins/acme/skills/<name>/SKILL.md` | `/skills/acme/<name>` |
| `acme-marketing` | Marketing's work | `plugins/acme-marketing/skills/<name>/SKILL.md` | `/skills/acme-marketing/<name>` |

A page's file is under `docs/pages/`, at the path of its URL. Open items stay in the skill as
`[TBD]` markers, never in the docs. With repository access, read the plugin's `README.md` first: it
says more than this file where the two differ.

**A team with no plugin yet.** Propose the skill in `acme` and say in the pull request body which
team it is for. A maintainer decides whether the team gets its own plugin.

## Who reviews

A pull request asks for review from the plugin's reviewer. Name the reviewer in the pull request
body.

| Plugin | Reviewer |
|---|---|
| acme | AI team |
| acme-marketing | Marketing lead |

## acme

The house conventions in SKILL.md ("Draft the skill") apply as written.

## acme-marketing

- Every skill reads `${CLAUDE_PLUGIN_ROOT}/references/voice-guide.md` first. Acme's voice rules
  live there, never in a skill. A proposal that needs a new rule is also a guide change, which the
  Marketing lead makes (`own-rule.md`).
- Every output is a draft for the person. Nothing is published, posted or sent.

## Rules and where they live

For `own-rule.md`, a rule an owner changes. A decided one may show on its skill's page in the Acme
Skills docs; change the docs in the same pull request.

| Owner | Rule | File |
|---|---|---|
| Marketing lead | Acme's voice: tone, words to use and avoid, names, formatting | `plugins/acme-marketing/references/voice-guide.md` |
| AI team | The shared Acme context | `plugins/acme/skills/setup/baseline.md` |
