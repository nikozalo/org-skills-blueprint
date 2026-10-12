---
name: mn-not-agenda
description: A request about a meeting with no transcript (an agenda for next week). Meeting notes stay out of the way and Claude drafts the agenda.
tags: [smoke, meeting-notes, should-not-fire]
runs: 1
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Draft a short agenda for next Tuesday's 30-minute team sync. We need to cover the onboarding checklist for the two new starters, the switch to the expense app, and how meeting rooms get booked. Don't stop to ask me anything.
