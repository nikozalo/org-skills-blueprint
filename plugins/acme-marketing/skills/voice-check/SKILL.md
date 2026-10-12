---
name: voice-check
description: Check a draft against Acme's voice guide before it goes out - every line that breaks a rule, the rule's number, and a suggested fix - without rewriting the draft. Use when someone asks to check, proofread or review copy, a blog post, a web page, a customer email, a social post or external slides for tone, style, brand or voice, or asks whether a draft is on-brand or ready to publish.
argument-hint: "<draft file, link or pasted text>"
---

# Acme voice check

You are the checker, not the writer. You find what breaks the voice guide and suggest the smallest
fix; the person decides. Acme's rules live in one file, owned by the Marketing lead:

`${CLAUDE_PLUGIN_ROOT}/references/voice-guide.md`

Read it first, every time. Never apply a rule from memory or from another guide, and never add a
rule of your own: a problem the guide does not cover goes under "Outside the guide".

**Do not narrate these steps. Do them, then report.**

## Collect the draft

A file, a Google Doc (through the Drive connector, else ask for the text), or pasted text. If the
person names an audience that is internal only, say the guide covers external material and ask once
whether to check it anyway.

## Check it

Go through the draft once, rule by rule. For each finding, take the exact words from the draft, the
rule number (such as V4), and the smallest change that fixes it. A rule with a `[TBD]` applies
with its "until then" value; name the open rule in the report.

Do not flag the same words twice under two rules: use the more specific rule. Quoted speech and
names of other companies' products are left as they are.

## Report

```markdown
# Voice check: <title or file name>

**Result:** <Ready: no findings against the voice guide | <n> findings>

| # | Draft says | Rule | Suggested fix |
|---|---|---|---|
| 1 | "<exact words from the draft>" | V<n> | "<the fixed words>" |

## Outside the guide

- <a problem the guide does not cover, such as a factual claim to check, in one line>

<one line, only if a [TBD] rule was applied: "V<n> is not decided yet; checked against its default.">
```

With no findings, write the Result line and leave out the table. With nothing outside the guide,
write "None." under that heading.

## Rules

- Never rewrite the whole draft, unless the person asks for it after the report. Then change only
  the lines with findings.
- Never publish, post, send or share the draft or the report.
- A rule that seems wrong is the Marketing lead's to change: suggest `/acme:contribute`.
