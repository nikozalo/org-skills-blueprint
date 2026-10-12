# A rule they own

For an owner changing their own rule: a line in a team's guide or policy, or an open `[TBD]` slot.
Anyone else who thinks a rule is wrong goes to `fix.md`, where it becomes an issue for the owner.

1. Ask which rule, the new wording or value, and why, in one line. Confirm they own it: "This is
   Marketing's voice guide: are you making this change for Marketing?" If not, go to `fix.md`.
2. Find it (`plugins.md`, "Rules and where they live"). Draft the change: replace a `[TBD]` and
   delete its "until then" default, or change the wording, and nothing else. In the Acme Skills
   docs, change its skill's page if it shows the old value.
3. Show the before and after of each file.
4. Get it into the repo as a small fix (`fix.md`), with branch `rule/<short-name>`, message
   "<Owner>: <what changed>", and in the body "Changed by the owner, <role>".
