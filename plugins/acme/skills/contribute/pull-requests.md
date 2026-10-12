# After the pull request: follow up, and review

For a person's own pull request, and for reviewing someone else's. Both need Claude Code with `gh`
signed in and repository access (SKILL.md, "Before anything"); in Cowork, send the person to Claude
Code. The person may never have used GitHub: say what you see in plain words, and name no command
or GitHub term without saying what it means. Say in one plain sentence what each command does
before running it.

## Find the pull request

A link or a number the person gives. Otherwise list the open ones they opened, or, to review, the
ones waiting for them, and ask which, by title:

```bash
gh pr list --repo acme-org/acme-skills --author @me
gh pr list --repo acme-org/acme-skills --search "review-requested:@me"
gh pr list --repo acme-org/acme-skills
```

## Read it

| What | Command |
|---|---|
| Title, description, state, branch | `gh pr view <n> --repo acme-org/acme-skills` |
| The change itself | `gh pr diff <n> --repo acme-org/acme-skills` |
| Reviews and comments | `gh pr view <n> --repo acme-org/acme-skills --comments`, and for comments on single lines `gh api repos/acme-org/acme-skills/pulls/<n>/comments` |
| Checks | `gh pr checks <n> --repo acme-org/acme-skills` |

## Explain it

In at most five lines: where it stands (waiting for review, changes requested, approved, merged,
closed); what each reviewer asked for, one line each, in plain words; which checks failed and
whether that is theirs to fix. A failed version check is not: `/acme:contribute` raises the version
when it opens a pull request, and a maintainer sorts out the rest before merging. A "conflict" is
not theirs either: a maintainer resolves it.

The pull request's page is `https://github.com/acme-org/acme-skills/pull/<n>`. If they open it: the
**Conversation** tab has the description, reviews and comments, and **Files changed** has the
change, red for lines taken out and green for lines added.

## Make a requested change

1. Draft the change and show the person the before and after.
2. After a yes, write it to the **same branch** the pull request came from, so the pull request
   updates itself: `github.md` steps 2 and 3, with the branch from
   `gh pr view <n> --repo acme-org/acme-skills --json headRefName -q .headRefName`.
   Do not raise the version again.
3. Draft a one-line reply saying what changed, show it, and after a yes post it:
   `gh pr comment <n> --repo acme-org/acme-skills --body "..."`. For a comment on a single line,
   reply under it:
   `gh api repos/acme-org/acme-skills/pulls/<n>/comments/<comment id>/replies -f body="..."`.

A request they disagree with: draft a reply that says why, show it, and post it after a yes. Never
resolve a reviewer's comment for them, never close the pull request unless they ask in so many
words, and never merge it.

## Review someone else's pull request

1. Read it as above. Then tell the reviewer, in plain words and at most ten lines: what changes for
   the people who run the skill; which files change; and what to look at closely.
2. Check it against the rules for its plugin in `plugins.md` and the house conventions in SKILL.md
   ("Draft the skill"). Flag, with the line: a real name, amount or client that should have been
   redacted; anything quoted from a confidential record; a team's rule written into a skill
   instead of the team's reference file; anything that sends, shares or posts without approval,
   or reaches outside Acme; docs that say more than the skill does.
3. Ask what they want to do: **approve**, **request changes**, or **comment** only. Draft the text,
   one point per change, show it, and submit only after a yes:

   ```bash
   gh pr review <n> --repo acme-org/acme-skills --approve --body "..."           # or --request-changes, or --comment
   ```

An approval from someone who cannot merge still counts as the owner's sign-off: the maintainer
reads it and merges. Never merge, and never approve without the reviewer's yes to the exact text.

## Tell them what happens next

After opening a pull request, or after a follow-up, say it in three plain lines: who is asked to
review it ("Who reviews" in `plugins.md`); that GitHub emails them when someone comments or
approves; that they can run `/acme:contribute` in Claude Code with "check my pull request" at any
time and you will read it for them. Offer a two-line Slack message for the reviewer, with the link,
for the person to send:

```
I've proposed a change to <skill or rule> for Acme: <one line>.
Could you review it? <link>. In Claude Code, /acme:contribute "review <link>" walks you through it.
```
