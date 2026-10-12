<!-- BLUEPRINT NOTE: tools/rename.mjs removes this block -->
> **This is a blueprint** for sharing Claude skills across an organization, filled in for a
> made-up company, Acme. Start with [BLUEPRINT.md](BLUEPRINT.md).
<!-- END BLUEPRINT NOTE -->

# Acme Skills

Claude plugins for Acme: the shared Acme context, and skills that do Acme's repeatable work the
same way every time, in Claude Cowork and Claude Code. This repository is the plugin marketplace
`acme-skills`.

Docs: built from `docs/` (see "Docs" below). Help: **#acme-ai** on Slack.

## Plugins

| Plugin | For whom | Owner and reviewer | Install default |
|---|---|---|---|
| `acme` | Everyone: `/acme:setup`, meeting notes, contributing | AI team | Available to install |
| `acme-marketing` | Anyone who writes for Marketing: the voice check | Marketing lead | Available to install |

Skills are named after their plugin, such as `/acme:meeting-notes` or
`/acme-marketing:voice-check`. After installing, everyone runs `/acme:setup` once: it asks for
their role and installs the shared Acme context into their instructions.

## Install (for the organization owner)

Done once, for everyone. Members need no GitHub account.

1. In **Organization settings → Plugins & skills → Marketplaces**, click **Add plugins**, then
   **Sync from GitHub**, and enter `acme-org/acme-skills`. Cowork and Skills must be enabled for
   the organization, and the repository must stay private: Cowork does not accept a public
   repository as an organization marketplace.
2. Set every plugin to **Available to install**. People add the ones they need: they search for
   Acme in **Customize → Plugins** in Cowork, or in `/plugin` in Claude Code.
3. Turn on automatic sync.
4. In **Organization settings → Connectors**, add the connectors the skills use (Google Drive,
   for transcripts and drafts kept there).

**"Failed to add marketplace".** A marketplace with the same name, `acme-skills`, already exists,
for example someone's personal copy. Remove it first, then add this one.

**Claude Code.** Type `/plugin`, search for Acme and install the plugins you need, choosing user
scope. If they are not listed, sign in to GitHub with read access to this repository, then run
`/plugin marketplace add acme-org/acme-skills`, then `/plugin install <plugin>@acme-skills` for
each plugin you need.

## Contributing

Run `/acme:contribute` in Claude Code, with the GitHub command-line tool `gh` signed in. It
interviews you, drafts the skill or the fix and its docs page, collects two or three redacted
examples, and opens the pull request. Claude Cowork cannot send changes to GitHub, so there the
skill sends you to Claude Code. Without GitHub access, it writes a handoff folder: post it in
**#acme-ai** on Slack, and a maintainer opens the pull request and credits you.

Every pull request asks for review from the plugin's owner in the table above. On GitHub Free with
a private repository, reviews are requested, not enforced; enforcing them needs a paid plan, a
ruleset on main and a `CODEOWNERS` file.

## Maintainers

`.claude-plugin/marketplace.json` lists the plugins; each is `plugins/<name>/` with its
`.claude-plugin/plugin.json`, `skills/<skill>/SKILL.md`, and where it has them `references/` (a
team's rules, owned by the team) and `evals/`. The shared context is
`plugins/acme/skills/setup/baseline.md`.

### Checks

`.github/workflows/checks.yml` runs on every pull request and every push to main. The same checks
locally, from the repo root (evals cost model calls and are run by hand):

```sh
claude plugin validate . --strict                            # the marketplace
for p in plugins/*/; do claude plugin validate "$p" --strict; done
npm ci && node tools/check_skills.mjs                        # frontmatter as Cowork checks it
node tools/scan_data.mjs                                     # no real data or secrets in a plugin
(cd docs && bun install --frozen-lockfile && bun run build) && node docs/scripts/check-words.mjs
git fetch origin main && node tools/check_versions.mjs origin/main   # the version bump
```

Evals, before merging a change to a skill: `claude plugin eval plugins/<name> --tag smoke --ablation none`.

### Versions and releases

- **Every change under `plugins/<name>/` raises that plugin's `version`** in its `plugin.json`,
  in the same pull request, above the version on main. `version-bump.yml` compares with the live
  main by semver. A pull request's check does not re-run when main moves, so after each push to
  main it checks again and fails with an error on the commit when a change got through without a
  higher version, for example two pull requests that both raised 0.1.0 to 0.1.1.
- Add the pull request's "What people will notice" line under the new version in `CHANGELOG.md`.
- After a push to main, `release.yml` tags each plugin whose version changed as
  `<plugin>-v<version>`, for example `acme-v0.2.0`.

### How updates reach people

- **Cowork**, with automatic sync on: the organization marketplace follows main, and syncs a
  plugin only after a merged change raises its version. An owner can also click **Update** in the
  marketplace settings.
- **Claude Code** pins to the version string. People with auto-update on get it when Claude Code
  starts; others run `/plugin marketplace update acme-skills`.
- A change to `baseline.md` reaches a person only when they re-run `/acme:setup`, so announce it.

To try a branch first, add the checkout as a local marketplace in Claude Code
(`/plugin marketplace add /path/to/acme-skills`) and remove it before adding the GitHub one.

### Docs

The docs are a [Vocs](https://vocs.dev) site in `docs/` (`cd docs && bun install && bun run dev`;
`docs/AUTHORING.md` has the voice and the URL map). Each build zips every plugin for the Manual
install page. To host them privately on Vercel: Root Directory `docs`, and a `DOCS_PASSWORD`
environment variable for the password gate in `docs/middleware.ts`.

### Open decisions

Every value an owner still has to decide is marked `[TBD: <role> to ...]` next to the default
used until then: `grep -rn "\[TBD" plugins`.
