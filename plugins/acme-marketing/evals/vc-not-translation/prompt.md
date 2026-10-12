---
name: vc-not-translation
description: A request to translate a product update. The voice check stays out of the way and Claude translates it.
tags: [smoke, voice-check, should-not-fire]
runs: 1
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Translate this product update into German. Don't stop to ask me anything. (It's a made-up sample.)

## What's new in the scheduler

You can now share a week with another team. Open the week, choose Share, and pick the team. We built this because three of our customers asked for it.
