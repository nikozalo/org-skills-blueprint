# A blueprint for sharing Claude skills across an organization

This repository is a working template for one way to share Claude skills inside an organization:
one private GitHub repository that is a **Claude plugin marketplace**, synced to everyone through
the organization's Claude settings, with a skill that lets anyone, technical or not, fix or propose
a skill without learning GitHub.

It is cut down from a real rollout. Everything organization-specific was replaced with a made-up
company, **Acme**, so it runs and passes its checks as it is. `tools/rename.mjs` swaps in your
names. Delete this file once you have adopted it.

## The model

```
 someone notices a miss,          /acme:contribute           owner of the       maintainer merges,
 or a prompt they keep reusing -> drafts skill + docs     -> plugin reviews  -> version goes up
                                  opens a PR (or writes a                          |
                                  folder for #acme-ai)                             v
                                                                     Cowork syncs it to the whole org;
                                                                     Claude Code updates on its next start
```

- **One repo, many plugins.** A plugin for everyone (`acme`) and one per team with its own rules
  (`acme-marketing`). People add the plugins they need; each plugin has an owner, named by role.
- **The org syncs it.** An organization owner connects the repo once in the Claude organization
  settings. Members need no GitHub account to use the skills.
- **A version bump or nobody gets it.** Cowork syncs a plugin only when a merged change raises its
  version, and Claude Code pins to the version string. CI enforces the bump, against the live main.
- **Contributing is a skill.** `/acme:contribute` interviews the person, collects redacted
  examples, drafts the skill and its docs page, and opens the pull request through `gh api` (no
  clone, no git, no branches to understand). Without GitHub access it writes a handoff folder to
  post in Slack. It also explains review comments and helps owners review.
- **Shared context is copied, not injected.** `/acme:setup` writes the org's baseline plus the
  person's role into their instructions (Cowork's Global instructions, or `~/.claude/CLAUDE.md`).
  No hooks and nothing running in the background; a change reaches people when they re-run it.

## What is in the box

| Path | What it shows |
|---|---|
| `.claude-plugin/marketplace.json` | The marketplace: two plugins |
| `plugins/acme/skills/setup/` | Shared context + role into each person's instructions, merged between markers, backed up first |
| `plugins/acme/skills/contribute/` | The contribution flow: new skill, fix, rule change, PR follow-up and review |
| `plugins/acme/skills/meeting-notes/` | An example everyday skill: fixed output template, evidence rules, empty results are valid |
| `plugins/acme-marketing/` | An example team plugin: the team's rules in `references/voice-guide.md`, owned by a role, read by the skill |
| `plugins/*/evals/` | Smoke tests in `claude plugin eval` format, run by hand |
| `tools/check_skills.mjs` | Skill frontmatter as Cowork checks it on upload |
| `tools/check_versions.mjs` | Every changed plugin has a higher version than main |
| `tools/scan_data.mjs` | No real e-mail addresses, account numbers, keys or tokens in a plugin |
| `.github/workflows/` | Checks on every PR, the version-bump gate, and `<plugin>-v<version>` release tags |
| `docs/` | A Vocs docs site for non-technical staff: install, one page per skill, contribute; plugin zips for manual install; an optional password gate for Vercel. Colours and the mark: `docs/AUTHORING.md`, "The look" |

## Adopt it

1. **Copy and rename.** Copy this folder, then:

   ```sh
   node tools/rename.mjs --name "Northwind" --slug northwind --repo northwind-co/northwind-skills --channel "#ai-help"
   ```

   `--slug` becomes the core plugin's name and every skill's prefix (`/northwind:setup`). Add
   `--dry-run` first to see what changes. Then search for leftovers:
   `grep -rni acme --exclude-dir=node_modules .`
2. **Fill in the shared context.** `plugins/<slug>/skills/setup/baseline.md` has `[TBD]` markers;
   `/<slug>:setup` refuses to run until they are gone. Keep it short: it loads into every session.
3. **Make the examples yours.** Keep `setup` and `contribute`. Replace or delete `meeting-notes`
   and the marketing plugin, or keep them as a pattern for your first real skills. Update the
   tables in `plugins/<slug>/skills/contribute/plugins.md` (which plugin, who reviews, where rules
   live): `/<slug>:contribute` routes every proposal from it.
4. **Check it.** `npm ci && node tools/check_skills.mjs && node tools/scan_data.mjs`, then
   `claude plugin validate . --strict` and once per plugin, then `cd docs && bun install && bun run build`.
5. **Push to a private GitHub repo.** Private matters: Cowork does not accept a public repository
   as an organization marketplace.
6. **Connect it.** An owner of the Claude organization follows "Install" in `README.md`.
7. **Announce `/<slug>:setup`** and the help channel. Then let people contribute.

Optional: deploy `docs/` (Vercel, Root Directory `docs`, `DOCS_PASSWORD` set), or delete `docs/`,
the `docs` job in `.github/workflows/checks.yml`, and the docs steps in the contribute skill
(section 4 of its `SKILL.md`).

## Choices worth keeping

- **Owners by role, never by name.** "The Marketing lead" survives a reorganization; a name does not.
- **A team's rules live in one file the team owns** (`references/`), and skills read it rather than
  restating it. A rule change is one edit, reviewed by the right person.
- **Open decisions are visible.** `[TBD: <role> to ...]` with an "until then" default, so a skill
  still works and `grep` finds every open item.
- **No examples, no review.** Real, redacted examples are what make a proposal reviewable.
  A reported mistake is a good new eval case.
- **The docs never say more than the skill.** They change in the same pull request.
- **Nothing is sent without approval.** Every skill that shares, posts or sends asks first, and
  never reaches outside the organization.
- **Plugins hold rules and templates, never records.** Anyone who can install a plugin can read
  its files, so no transcripts, minutes or customer data go in.
- **The handoff folder is not a lesser path.** Most people will never get GitHub access, and they
  should still be able to contribute.

## Left out, to keep it small

The original also had these; add them when you need them:

- **Agents.** A role with its own limits and a tool allowlist, in `plugins/<name>/agents/<name>.md`,
  plus a `<name>-agent` skill that starts it, so it can be launched from the `/` menu in Cowork.
- **Scheduled workflows.** Setup files for Cowork scheduled tasks (such as meeting notes after
  every meeting) and a skill that asks the setup questions and creates the task.
- **Plugins adapted from Anthropic's open plugins**, each with an `UPSTREAM.md` saying what changed.
- **Enforced reviews.** On a paid GitHub plan: a ruleset on main and a `CODEOWNERS` file per plugin.
