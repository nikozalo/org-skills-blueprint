# Acme

The plugin for everyone at Acme.

| Skill | What it is for |
|---|---|
| `/acme:setup` | Puts the shared Acme context and your role into your instructions. Everyone runs it first |
| `/acme:meeting-notes` | Turns a transcript into the standard Acme meeting record |
| `/acme:contribute` | Fixes a skill or proposes a new one, without knowing GitHub. Runs in Claude Code |

**Owner and reviewer:** the AI team.

In Claude Code, if it is not in the `/plugin` search:

```
/plugin install acme --marketplace acme-org/acme-skills
```

The shared context is `skills/setup/baseline.md`. It reaches a person only when they run
`/acme:setup`, so announce every change to it.

Evals: `evals/README.md`.
