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
- **Every change raises the version.** Cowork syncs the marketplace on every merge to main, but
  Claude Code updates an installed plugin only when its version changes, so a change without a
  bump never reaches people there. The version also names each change in the changelog and the
  release tags. CI enforces the bump, against the live main.
- **Contributing is a skill.** `/acme:contribute` interviews the person, collects redacted
  examples, drafts the skill and its docs page, and opens the pull request through `gh api` (no
  clone, no git, no branches to understand). Without GitHub access it writes a handoff folder to
  post in Slack. It also explains review comments and helps owners review.
- **Shared context is copied, not injected.** `/acme:setup` writes the org's baseline plus the
  person's role into their instructions (Cowork's Global instructions, or `~/.claude/CLAUDE.md`).
  No hooks and nothing running in the background; a change reaches people when they re-run it.

## Is this the right setup for you?

Checked against Anthropic's docs in October 2026. A private repository synced in Organization
settings, plus Claude Code managed settings for developers who don't sign in with the
organization's account, is the route Anthropic documents for rolling out plugins an organization
builds itself ([Roll out a plugin to your whole organization](https://claude.com/docs/plugins/org-rollout)).
It earns its keep once several people write skills and you want review, history and tests. Other
routes are simpler in other cases:

| Situation | Simpler route |
|---|---|
| A handful of skills, written by one or two people | An Owner uploads each skill as a zip in **Organization settings > Plugins & skills** (Team and Enterprise). It reaches every member at once, on by default and in Claude Code too, with no GitHub ([Provision and manage skills](https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization)) |
| People want to pass a skill to colleagues | Share it with named colleagues from **Customize**, or publish it to the organization's library, where an Owner can require review first ([Share a plugin with teammates](https://claude.com/docs/plugins/share)) |
| A skill that only makes sense in one codebase | Commit it to that repository's `.claude/skills/`; it arrives with `git pull` ([Skills in Claude Code](https://code.claude.com/docs/en/skills)) |
| Agents you build on the Claude API | Upload skills to the API workspace (`/v1/skills`); they don't sync with claude.ai ([Skills guide](https://platform.claude.com/docs/en/build-with-claude/skills-guide)) |

Facts this design rests on, from those docs:

- **The repository must be private** (or internal) for organization sync on github.com.
- **Organization sync runs on every push to the default branch**, or when an Owner selects
  **Re-sync**, and reads no tags. Some of Anthropic's support pages still say it waits for a
  merged version bump; raising the version on every change covers both.
- **Claude Code updates an installed plugin only when its version changes.** Members signed in
  with the organization's claude.ai account (Claude Code 2.1.273 or later) get the organization's
  plugins synced; anyone else needs the marketplace registered, which `managed-settings.example.json`
  does. Auto-update is off by default for marketplaces that aren't Anthropic's.
- **Release tags are `<plugin>--v<version>`**, the format Claude Code resolves version ranges in
  plugin dependencies against.
- **The skills themselves are portable.** A `SKILL.md` folder follows the open Agent Skills format
  ([agentskills.io](https://agentskills.io)), which other tools read too; the plugin and
  marketplace around it are Claude's.
- **Review is yours to set up.** Anthropic's guidance for organizations ([Skills for
  enterprise](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise))
  asks for an owner per skill, a reviewer who isn't the author, git as the source of truth, and
  evals that check a skill fires when it should and stays quiet when it shouldn't. This repository
  does all four. On Enterprise, Anthropic also scans skills and plugins for security issues.

## What is in the box

| Path | What it shows |
|---|---|
| `.claude-plugin/marketplace.json` | The marketplace: two plugins |
| `plugins/acme/skills/setup/` | Shared context + role into each person's instructions, merged between markers, backed up first |
| `plugins/acme/skills/contribute/` | The contribution flow: new skill, fix, rule change, PR follow-up and review |
| `plugins/acme/skills/meeting-notes/` | An example everyday skill: fixed output template, evidence rules, empty results are valid |
| `plugins/acme-marketing/` | An example team plugin: the team's rules in `references/voice-guide.md`, owned by a role, read by the skill |
| `plugins/*/evals/` | Smoke tests in `claude plugin eval` format, run by hand: each skill fires when it should and stays quiet on a near miss |
| `tools/check_skills.mjs` | Skill frontmatter as Cowork checks it on upload |
| `tools/check_versions.mjs` | Every changed plugin has a higher version than main |
| `tools/scan_data.mjs` | No real e-mail addresses, account numbers, keys or tokens in a plugin |
| `.github/workflows/` | Checks on every PR, the version-bump gate, and `<plugin>--v<version>` release tags |
| `managed-settings.example.json` | Claude Code managed settings for developers who don't sign in with the organization's account: registers the marketplace, turns on auto-update, installs the core plugin |
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
6. **Connect it.** An owner of the Claude organization follows "Install" in `README.md`. For
   developers whose Claude Code isn't signed in with the organization's account, also deliver
   `managed-settings.example.json` as Claude Code managed settings; they need read access to the
   repository.
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
