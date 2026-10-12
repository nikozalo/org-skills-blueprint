# A shared skill got something wrong

For a skill that gave a wrong result, or docs that say something wrong about a skill.

1. Ask what they asked for, what it produced and what it should have produced. Redact as
   "Collect examples" in SKILL.md says.
2. **Keep confidential records out.** Quote nothing from a meeting tagged `[confidential]` or
   `[no-notes]`, or a record whose Audience is Restricted, redacted or not. Describe the problem
   with made-up text: an invented line of input and what the skill made of it.
3. Decide which kind of fix it is.

## A small, obvious fix is a pull request

A wording change, a missing rule, a wrong phrase in a template. It changes that skill's
`SKILL.md` (`plugins/<plugin>/skills/<skill>/SKILL.md`) and, when the change alters what the docs
say, the skill's page in the Acme Skills docs (`plugins.md` names it); nothing else. Docs that are
wrong about a skill that is right are the same kind of fix, with the page as the only file.

Draft the change and show the person the before and after. Then:

- **Route a (gh):** follow `github.md` with branch `fix/<skill>`: copy the current file (step 2),
  change the copy, write it back (step 3), raise the plugin's version unless only the docs
  changed (step 4), and open the pull request with the fix body below (step 5).
- **Route b (handoff):** write the fix body, with the exact lines before and after, to
  `proposals/fix-<skill>.md`, and hand it over as SKILL.md's handoff says.

Fix body:

```
## Skill
<plugin>:<skill>

## Symptom
<what it got wrong, redacted, or in made-up text>

## Fix
<what changes in SKILL.md, in one or two lines>

## Docs
<what changes in the docs, or "not affected">

**What people will notice:** <one plain line for CHANGELOG.md>

Reported by <person>, drafted with /acme:contribute.
```

## Anything larger is an issue

An issue is a request to whoever maintains the skill: more than a phrase or a rule, more files
than the skill and its docs, or a change to a rule a team owns (`plugins.md`, "Rules and where they
live"). One exception: a rule change its owner is making themselves (`own-rule.md`) goes as a pull
request through the same routes, with the rule's file and the owner as reviewer.

Write the issue body to `proposals/fix-<skill>.md`. Show the person the exact title and body, and
wait for a yes before creating it:

```bash
gh issue create --repo acme-org/acme-skills --title "Fix <skill>: <symptom>" --body-file proposals/fix-<skill>.md
```

Without access, hand the file over as SKILL.md's handoff says.

Issue body:

```
## Skill
<plugin>:<skill>

## What I asked for
<the prompt or input, redacted, or in made-up text>

## What it produced
<the wrong part, redacted, or in made-up text>

## What it should have produced
<the correct result>

## How often
<once / every time / occasionally>
```
