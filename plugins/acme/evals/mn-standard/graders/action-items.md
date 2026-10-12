---
type: llm
focus: last_message
---

PASS if the record has an Action items section with at least one entry, and every entry names one
person as its owner (such as "Priya Anand") and carries a quote in quotation marks taken from the
transcript.
FAIL if any action item has no owner, has a group ("the team", "we") as its owner, or has no quote.
