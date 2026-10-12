# Acme Marketing

Marketing's skills, for the people who write anything Acme publishes or sends outside Acme.

| Skill | What it is for |
|---|---|
| `/acme-marketing:voice-check` | Checks a draft against the voice guide and lists every line that breaks it, with a suggested fix |

**Owner and reviewer:** the Marketing lead.

In Claude Code, if it is not in the `/plugin` search:

```
/plugin install acme-marketing --marketplace acme-org/acme-skills
```

## How this plugin is built

This plugin is the pattern for a team's plugin. The team's rules live in one file,
`references/voice-guide.md`, which the Marketing lead owns. Skills read it through
`${CLAUDE_PLUGIN_ROOT}` and never restate it, so:

- a change of rule is one edit to one file, by its owner, and reaches every skill;
- a skill change and a rule change are reviewed separately, by the right person;
- an open decision is a `[TBD: <role> to ...]` marker with an "until then" default, never a gap.

Evals: `evals/README.md`.
