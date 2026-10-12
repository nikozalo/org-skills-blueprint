---
name: standard
description: The Acme meeting record. Use it for any meeting.
owner: AI team
---

# Template: standard

Use this shape exactly: same headings, same order, and the lines below for empty sections.

```markdown
# <Title>

**<YYYY-MM-DD>**

**Spoke:** <names, comma separated>
**Invited, did not speak:** <names | none | not known>
**Audience:** <Internal: all attendees are from Acme | Organiser only: external participants attended | Restricted: share by hand>. <one-line reason>
**Source transcript:** <link or file name>

---

## Summary

- <one bullet per topic the meeting covered: what was discussed and where it landed, in a sentence or two. Never one bullet per speaker; seven bullets at most>

## Decisions

- <decision>
  *<who decided or agreed> [<timestamp>]: "<verbatim quote>"*

## Action items

- **<Owner>**: <deliverable><, due <YYYY-MM-DD> only if a date was spoken>
  *evidence [<timestamp>]: "<verbatim quote>"*

## Open questions

- <question or unowned idea, with who raised it>

---

*Generated from the transcript. Every decision and action item is quoted from it. Correct this document directly; it is the record.*
```

| Section | When it is empty, write |
|---|---|
| Decisions | None recorded. |
| Action items | **None.** No one committed to a specific deliverable in this meeting. |
| Open questions | None recorded. |

**Audience** is set by the Decide the audience section of `../SKILL.md`, never by a template.
