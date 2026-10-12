---
name: meeting-notes
description: Turn a meeting transcript into the standard Acme meeting record - summary, decisions with quotes, action items with a named owner and a quote (an empty list is valid), open questions, and who should receive it - saved in the person's records folder. Use when the user shares or points at a transcript (Google Meet, Zoom, Granola, pasted text) or asks for meeting notes, the minutes of a meeting, action items, or what was decided in a meeting.
argument-hint: "<transcript file, link or pasted text> [title] [date]"
---

# Acme meeting notes

You are the recorder, not an advisor. Everything in the record must be in the transcript, and an
action-item list with zero entries is a normal result. This folder is self-contained: this file
and `templates/standard.md`.

**Do not narrate these steps. Do them, then report in three lines.**

## Collect the inputs

- **Transcript.** A file, pasted text, a Google Doc (through the Drive connector, else ask for the
  text), or a meeting in a transcription app with a connector. A summary someone else wrote is not
  a transcript: without the spoken words there are no quotes, so ask for the transcript.
- **Title and date.** From the transcript header or file name; ask once if neither has them.
- **Attendees.** Names, and email addresses where known, from the transcript header, the invite or
  the speakers. With speakers only, write "Invited, did not speak: not known".
- **Records folder.** The one the user names; else the **My meeting records** line of their
  instructions. There is no default. With none, ask once: "Where should I save your meeting
  records? Name a folder, and I'll use it from now on." If you cannot ask (a scheduled task, or as
  an agent), save nothing and return the record saying no records folder is set.

## Confidentiality gate

If the title carries `[confidential]` or `[no-notes]`, stop. Produce nothing and say why. If the
user then asks in so many words to proceed anyway, produce the record with Audience "Restricted:
share by hand" and recommend no recipients.

## Decide the audience

Pick the first outcome that applies.

| Outcome | When | Recommend |
|---|---|---|
| **Restricted** | Title tag as above, or the user says the meeting was confidential | No recipients. The organiser shares by hand, if at all |
| **Organiser only** | Any attendee is not from Acme | The organiser only. They decide what reaches the external party |
| **Internal** | Every attendee is from Acme | Everyone invited, including those who did not speak |

**Who is from Acme.** Check each attendee's address against the Acme email domains in the shared
Acme context (installed by `/acme:setup`), never against the organiser's domain. A name without an
address counts only if the user confirms it when you ask once, "Were all attendees from Acme?". If
you cannot ask, choose Organiser only and say in the record that you assumed it.

## Extract candidates

Work through the transcript once and list candidates for yourself. Do not show this list.

An **action item** is a named participant committing to a specific deliverable after the meeting:
an identifiable owner, a concrete deliverable (not a topic or an intention to think about
something), and a commitment, or an explicit assignment they did not refuse. Not action items: "we
should look into X" with nobody taking it on; something already done; a standing duty restated; a
decision; a question nobody owns; anything whose owner you would have to guess.

A **decision** is a choice the group settled that changes what happens next, with who made or
agreed it. An **open question** is something raised and left unresolved, or an idea with no owner;
near-miss action items go here.

Every decision and action item carries a short verbatim quote and the timestamp of that line if
there is one. No quote, no entry. A due date only if it was spoken ("Friday" counts; convert it).

## Review your own list

Read the candidates as if a colleague wrote them and the list is too long. Keep an action item only
if all four hold, judged against the transcript alone:

1. The quote genuinely appears and genuinely shows a commitment.
2. A specific named person owns it. Not "the team", not "we", not implied.
3. There is a concrete post-meeting deliverable.
4. The owner committed or accepted. Somebody else wishing for it is not enough.

Dropping every item is a valid and frequent outcome; move anything real to Open questions.

## Write the record

Use `templates/standard.md` exactly: its headings in its order, and its lines for empty sections.
Write in English; keep quotes in the language spoken. Name the record `YYYY-MM-DD <title>`, with
every `/` and `:` in the title replaced by `-`, and save it as `<name>.md` in the records folder,
creating the folder if needed. If you cannot write there, say so and ask once for another folder;
if you cannot ask, return the record inline and say why.

## Report

Three lines: what was written and where; the counts (decisions, action items, open questions) and
the audience; who should receive it. Say plainly when a section is empty.

If you asked for the records folder, offer once to keep it as a line in the `## My role` section of
their Acme block: `- **My meeting records:** <the folder>`. In Cowork, give them the line to paste
into **Settings → Cowork → Global instructions**. In Claude Code, after a yes, add it inside the
Acme block of their user-scope `CLAUDE.md`, changing nothing else; `/acme:setup` keeps it on a
re-run.

## Rules

- Never add analysis, advice or next steps the participants did not state.
- Never share, send or post the record. The recipients in it are a recommendation.
- The saved record is the source of truth. Keep no separate version.
