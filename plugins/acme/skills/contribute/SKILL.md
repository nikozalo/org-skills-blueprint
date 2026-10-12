---
name: contribute
description: Propose or share a skill for Acme or a rule change, or fix a skill that got something wrong, without knowing GitHub. Interviews the person, drafts the files and the docs, collects redacted examples, then opens the pull request with gh in Claude Code, or writes a handoff folder for #acme-ai. Also explains the review of their pull request and makes the changes asked for, and helps an owner review one. Use when someone wants to propose or contribute a skill, share a skill, fix a skill, asks about their pull request, or is asked to review one.
argument-hint: "[what to propose or share | a skill that got something wrong | check or review <pull request link>]"
allowed-tools: Read(*), Write(*), Edit(*), AskUserQuestion, Bash(gh auth status*), Bash(gh repo view *), Bash(gh pr create *), Bash(gh pr view *), Bash(gh pr diff *), Bash(gh pr list *), Bash(gh pr checks *), Bash(gh pr comment *), Bash(gh pr review *), Bash(gh issue create *), Bash(test *), Bash(command -v *), Bash(base64 *), Bash(cat *), Bash(mkdir *), Bash(ls *)
---

# Contribute to the Acme skills

Anyone at Acme can propose a skill. The person brings the task and the examples; you draft it,
open the pull request and explain each GitHub step in plain words. Many contributors have never
used GitHub, and they need neither git nor branches. Nothing here changes the installed plugin.

**Ask one question at a time, in plain language. Do not narrate these steps.**

## Before anything: Claude Code, signed in to GitHub

Every contribution reaches GitHub through the GitHub command-line tool, `gh`, in Claude Code (the
terminal, a code editor, or the **Code** tab of the Claude desktop app). Claude Cowork cannot open
or read a pull request. Check both of these first.

**1. Which app.**

```bash
test -d /mnt/user-data && echo COWORK || echo CODE
```

`/mnt/user-data` is where Cowork mounts connected folders. If this says COWORK, or anything about
the session suggests Cowork, stop and say:

> Contributing runs in Claude Code, because Cowork can't send changes to GitHub. Open the Claude
> desktop app, click the **Code** tab, pick any folder, and run `/acme:contribute` there with the
> same request. The first time, it helps you sign in to GitHub. The Acme Skills docs have the
> steps on the page /contribute/github-access.

If they cannot use Claude Code, offer once to carry on here and write a handoff folder (route
**b**, below). Checking or reviewing a pull request has no Cowork route.

**2. Signed in, with access.**

```bash
command -v gh >/dev/null 2>&1 && echo "gh installed" || echo "no gh"
gh auth status >/dev/null 2>&1 && echo "signed in" || echo "not signed in"
gh repo view acme-org/acme-skills --json name >/dev/null 2>&1 && echo "access ok" || echo "no access"
```

If anything is missing, fix it one step at a time as "Set up gh" in `github.md` says. Until then,
route **b** works today.

Tell them in one line how their proposal will reach GitHub, then start. Never work around missing
access.

## Which case

| They want | Follow |
|---|---|
| **A new skill**, a prompt they keep reusing, or a skill they made for themselves | Sections 1 to 7 below |
| **A fix**: one of the Acme skills got something wrong, or its docs say something wrong | `fix.md` |
| **A rule they own**: the owner changing their own guide, policy or open `[TBD]` slot | `own-rule.md` |
| **Their pull request**, or a reviewer asked for changes; or **a review** of someone else's | `pull-requests.md` |

These files are in this skill's folder: read only the one for the case. Every case picks its
plugin, its rules and its reviewer from `plugins.md`, and on route **a** runs the GitHub steps in
`github.md`.

## 1. Interview

**If they already use a skill of their own for this,** start from it. In Claude Code it is
`~/.claude/skills/<name>/SKILL.md`, which you can read; otherwise ask them to paste it. It is the
first draft: keep what works, ask only what it leaves open, and bring it into the house
conventions (section 3).

Ask in this order, one at a time, and stop as soon as you can answer all seven yourself:

1. What is the task, in one sentence, and how often do you do it?
2. What goes in? Documents, a transcript, a spreadsheet, an email, a question.
3. What does a good result look like? Ask for the last one they were happy with.
4. What does a bad result look like? What do AI tools get wrong on this today?
5. Who else does this task? A shared skill needs at least two people; one person is still a
   valid proposal, marked as such.
6. What must never happen? Sending outside Acme, inventing a number, naming a client, and so on.
7. Does the task touch confidential, legal, personal or financial material?

## 2. Collect examples

A skill without examples cannot be reviewed. Ask for two or three real past instances: the input
and the output the person would sign off. Before saving any, redact names of external parties,
amounts, account details and personal data. If one cannot be redacted, save a one-paragraph
description instead, or write a made-up example with invented names and lines. With no examples
yet, write the proposal anyway, mark it "needs examples", and say it will not be reviewed until
they exist.

**Confidential records never go in.** Nothing from a meeting tagged `[confidential]` or
`[no-notes]`, or a record whose Audience is Restricted, goes into a pull request, an issue or a
folder, redacted or not. Write a made-up example instead.

## 3. Draft the skill

Pick the plugin first (`plugins.md`); its extra rules are there. The house conventions:

- Self-contained: the `SKILL.md`, and only files in its own folder (a template, a reference).
  Rules a team owns live in that plugin's `references/`, read through `${CLAUDE_PLUGIN_ROOT}`.
- The description uses the words people actually say when they want this, so the skill fires
  on its own in Cowork.
- One fixed output template, with exact phrases for empty sections. An empty result is valid.
- "Do not narrate these steps. Do them, then report in three lines."
- Every rule is concrete. "Be careful" is not a rule; "never record a due date that was not
  spoken" is.
- Nothing is sent, shared, posted or uploaded unless the person approves that action, and never
  to anyone outside Acme.
- Under about 800 words.

Draft it, show it to the person, and adjust once. The reviewer does the rest.

## 4. Draft its docs

Every skill has a short page in the Acme Skills docs (`docs/` in the repo), written for the person
who runs it, at `docs/pages/skills/<plugin>/<name>.mdx`. Write it from the skill you drafted: it
never says more than the skill does. With repo access, read the docs rules first; they win where
they say more than this:

```bash
gh api -H "Accept: application/vnd.github.raw+json" repos/acme-org/acme-skills/contents/docs/AUTHORING.md
```

In short, about 200 words: `# <Skill name>`, then what it is for in one or two sentences;
`## Run it` with one example command in a `txt` code block; `## What you get`, a short sample or
two to four bullets; `## What it never does`, at most three bullets; and `Owner: <role>.` Plus a
line in the sidebar (`docs/vocs.config.ts`) and a row in the table on the Skills overview
(`docs/pages/skills/index.mdx`). Plain English, second person, no em dashes. No open items, names
of people, vendors or partners, or amounts: an open item stays in the skill as a `[TBD]`. Show it
all with the skill.

## 5. Where the files go

| File | Path in the repo |
|---|---|
| The skill | `plugins/<plugin>/skills/<name>/SKILL.md` |
| Each example | `plugins/<plugin>/skills/<name>/examples/<short-name>.md` |
| Its docs | `docs/pages/skills/<plugin>/<name>.mdx`, its sidebar line in `docs/vocs.config.ts`, its row in `docs/pages/skills/index.mdx` |

Write them in the working folder first, at the same paths. `<name>` is lowercase and hyphenated,
matching the skill's `name:` field.

## 6. Get it into the repo

| The checks before the interview | Route |
|---|---|
| "access ok" | **a. gh**: you open the pull request |
| Anything else, or in Cowork | **b. handoff**: a maintainer opens it for them |

**a. gh.** Follow `github.md` with branch `skill/<name>`: make the branch, write each new file to
it, copy, change and write back the sidebar and the Skills overview, raise the plugin's version,
and open the pull request with the body from section 7.

**b. handoff.** Write a folder the person can send as it is:

```
proposals/<name>/
├── SKILL.md              the skill, final
├── examples/*.md         the redacted examples
├── docs.md               the docs page, its sidebar line and its overview row
├── PROPOSAL.md           the pull request body from section 7
└── MESSAGE.md            three lines, below
```

`MESSAGE.md`:

```
Proposing a shared skill: <name>. <one sentence>
Folder attached; examples are redacted. Touches confidential material: <yes/no>.
Drafted with /acme:contribute; happy to walk through it.
```

Tell them to post the folder in **#acme-ai** on Slack. A maintainer opens the pull request, names
them in it and raises the version. **This is not a lesser path.**

## 7. The pull request body

```
## What this skill does
<one sentence>

## Who does this task
<roles, and how often>

## Examples
<one line per example file, saying what it shows>

## Redaction
<what was removed from the examples, or "nothing confidential in these">

## Touches confidential, legal, personal or financial material
<yes/no, and what>

## Docs
<the page, its sidebar line and its overview row>

## Reviewer
<from "Who reviews" in plugins.md>

**What people will notice:** <one plain line for CHANGELOG.md>

Proposed by <person>, drafted with /acme:contribute.
```

## Report

Three lines: what was proposed, reviewed or changed; the pull request, issue or folder; and what
happens next: the pull request asks for review from the plugin's reviewer ("Who reviews" in
`plugins.md`), and a maintainer merges.

## Rules

- **Show it first.** Never open a pull request or an issue, post a comment or review, or write a
  folder until the person has seen its exact text and said yes. It goes out under their name.
- **Redact before anything leaves the machine.** A pull request or issue is permanent and visible
  to everyone with repo access; a folder gets forwarded.
- **Never commit to the default branch, never force-push.** Always a new branch, always a pull
  request.
- **Do not modify a skill someone else owns** as part of a new-skill proposal. A fix to it goes
  through `fix.md`.
- **The docs follow the skill.** A change that alters what the docs say changes them in the same
  pull request. The docs never say more than the skill does.
- **No examples, no review.** With none yet, mark the title or `MESSAGE.md` "needs examples".
- **Never merge, close or approve for the person.** Merging is a maintainer's job.
- **No access is not a blocker.** Route **b** works today, for everyone. For Claude to open pull
  requests for them later, point them to /contribute/github-access in the Acme Skills docs.
