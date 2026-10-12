---
name: setup
description: Install the shared Acme context plus the person's own role where their Claude reads it every session. In Cowork it is handed back as a block to paste into Global instructions; in Claude Code it is merged into the global CLAUDE.md. Use when someone joins Acme, sets up a new machine, changes role, or asks to get set up or updated with the Acme baseline.
disable-model-invocation: true
allowed-tools: Read(*), Write(*), AskUserQuestion, Bash(cat *), Bash(cp *), Bash(mkdir *), Bash(test *), Bash(ls *), Bash(echo *)
---

# Acme setup

Puts the shared Acme context and the person's role where their Claude will read it in every
session. Same skill in Cowork and Claude Code; only the destination differs.

**Do not announce the steps. Run them, then report what changed.**

## Source of truth

The shared block is `baseline.md` in this skill's directory. Read it from there; never
reconstruct it from memory.

<!-- Maintainers: baseline.md is the only copy of the shared Acme context in the repo. Edit
     it and commit; nothing is generated from it. People pick up a change by re-running
     /acme:setup, so announce edits. Never add a "## My role" section to the baseline; that is
     personal and is written only into each person's own instructions. Fill in every [TBD] in
     baseline.md before announcing /acme:setup: a placeholder copied into someone's instructions
     becomes a fact to Claude. Keep it short: every line costs context in every session. -->

If `baseline.md` still contains a `[TBD` marker, stop and say: "The shared Acme context is not
filled in yet. Ask the AI team." Install nothing.

## 1. Which runtime

```bash
test -d /mnt/user-data && echo COWORK || echo CODE
```

`/mnt/user-data` is where Cowork's VM mounts connected folders; if it exists, this is Cowork.
Otherwise assume Claude Code. If the result says CODE but anything about the session suggests
Cowork, ask which app the person is in before writing any file.

Why it matters: Cowork does not read `~/.claude/CLAUDE.md`. Its per-user standing context is
**Settings → Cowork → Global instructions**, an app setting no skill can write. Claude Code reads
the user-scope `CLAUDE.md`.

Shell variables do not carry over from one command to the next, so every code block below sets
the ones it uses on its first line.

## 2. Read the current state

- **COWORK:** ask whether their Global instructions already contain the Acme block or a "My role"
  section. If so, this is an update: ask them to paste their current `## My role` section, rebuild
  the whole block, and tell them to replace the old one.
- **CODE:** resolve the target. The config directory is relocatable, and the Read and Write tools
  need the full path this prints:

  ```bash
  CFG="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
  echo "$CFG/CLAUDE.md"; test -f "$CFG/CLAUDE.md" && cat "$CFG/CLAUDE.md"
  ```

  Note whether the file exists, whether it contains the marker `<!-- BEGIN ACME SHARED CONTEXT`,
  and whether it already states the person's role anywhere.

## 3. Interview, unless the role is already known

If a filled-in role is already on record, show it and ask only whether to change it.

Otherwise ask in one plain-text message. "skip" omits the line; never write a placeholder:

- Team: name the teams on the Teams list in `baseline.md`, or they name another
- Role title
- What they are accountable for
- Who they work with most, and on what
- How they want output (optional: for instance Markdown drafts, numbers in tables, always cite
  sources)

Ask nothing a skill asks for itself the first time it runs, such as where to save meeting records.

## 4. Build the block

```markdown
<!-- BEGIN ACME SHARED CONTEXT (managed by /acme:setup) -->

<contents of baseline.md>

## My role

- **My role:** …
- **My team:** …
- **What I'm accountable for:** …
- **People I work with most, and on what:** …
- **How I want output:** …
- <every other line already in their `## My role` section, kept as it is>

<!-- END ACME SHARED CONTEXT -->
```

Omit skipped lines. Skills add lines of their own to `## My role` the first time they run, such
as **My meeting records** from `/acme:meeting-notes`, and any other `**My ...:**` line. Carry every
such line over unchanged, so a re-run never loses them. In Claude Code the HTML-comment markers
are stripped before the text reaches Claude, so they cost nothing; in both runtimes they mark what
a re-run replaces.

## 5. Deliver it

### COWORK

You cannot write Global instructions. Print the block, then say, in this order:

1. Copy the block above.
2. Open **Settings → Cowork**, click **Edit** next to **Global instructions**, paste it, save.
3. It applies from the next session.

If they already have Global instructions, tell them to paste below what is there, or, if an
older Acme block is present, to replace that block and nothing else.

### CODE

**Back up, show, confirm, then write.** This file loads into every future session:

```bash
CFG="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
test -f "$CFG/CLAUDE.md" && cp "$CFG/CLAUDE.md" "$CFG/CLAUDE.md.bak-$(date +%Y%m%d-%H%M%S)"
```

| State | Action |
|---|---|
| No file | Run `mkdir -p "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"`, then write the block as the whole file |
| File exists, no markers | Append after the existing content, separated by a blank line. **Leave everything already there untouched.** |
| Markers present | Replace only the text between `BEGIN` and `END` |

Read the file, build the full new contents, and Write it to the path printed under Read the
current state. Never `sed` in place: a bad pattern silently mangles the file.

The path is correct on macOS, Linux, WSL and Windows under Git Bash. Tell the person two things:
WSL and Windows are separate installs with separate `$HOME`, so someone who uses both runs setup
in both; and if `$HOME` does not resolve, the path is `%USERPROFILE%\.claude\CLAUDE.md`, written
with the Read and Write tools rather than shell redirection.

## 6. Report

Three lines: what was written or handed over, and where; in Cowork, that it applies from the next
session; in Claude Code, that `/context` should now list the file under **Memory files**.

## Rules

- **Never overwrite an existing `CLAUDE.md`.** Merge between markers only. Someone's personal
  instructions are theirs.
- **Never write a placeholder into a skipped field.** A `TODO` in a memory file becomes fact.
- **Don't guess the role.** If the interview is declined, install the shared block alone and say
  the role section is empty and how to fill it later.
- **Don't touch a project's own `CLAUDE.md`.** User scope only.
