# The GitHub steps

Route **a** of every case, after the checks in SKILL.md say "access ok". There is no clone to keep
and no git: each step is one `gh` command. Say in one plain sentence what each block does, and show
it, before running it. Shell variables do not carry over from one command to the next, so every
block sets its own on its first line: fill in the `<...>` values there.

## Set up gh

When the checks in SKILL.md found something missing, fix it one step at a time, saying first in
one plain sentence what each step does:

| Result | Do |
|---|---|
| no gh | Install it. macOS: `brew install gh`; if Homebrew is missing too, stop and point them to /contribute/github-access in the Acme Skills docs. Windows: `winget install --id GitHub.cli --source winget`, then ask them to close Claude Code, open it again and rerun `/acme:contribute` |
| not signed in | They sign in themselves: ask them to type `! gh auth login --web --hostname github.com --git-protocol https` in the prompt box (the `!` runs it in this session), copy the code it shows, and finish in the browser that opens. Then run `gh auth setup-git`. Never run `gh auth login` yourself: it waits for their answers |
| no access | They need a GitHub account (github.com/signup, with their Acme email and two-factor authentication on) that an admin has added to the repository. Show the message for **#acme-ai**, with their username from `gh api user -q .login` filled in: "Hi, please add my GitHub account <username> as a contributor to acme-org/acme-skills, without merge rights. I want to propose changes to the Acme skills." Until then, route **b** (the handoff folder) works today |

## 1. Make a branch

One branch per pull request, named for the case: `skill/<name>`, `fix/<skill>` or
`rule/<short-name>`.

```bash
REPO=acme-org/acme-skills; BRANCH=<branch>
BASE=$(gh api "repos/$REPO" -q .default_branch)
SHA=$(gh api "repos/$REPO/git/ref/heads/$BASE" -q .object.sha)
gh api "repos/$REPO/git/refs" -f ref="refs/heads/$BRANCH" -f sha="$SHA" >/dev/null && echo "branch ready"
```

## 2. Copy a file that already exists

To change a file, copy it from the branch into the working folder, change the copy, and show the
person the before and after:

```bash
REPO=acme-org/acme-skills; BRANCH=<branch>; FILE=<path in the repo>; LOCAL=proposals/<folder>/<file name>
mkdir -p "$(dirname "$LOCAL")"
gh api -H "Accept: application/vnd.github.raw+json" "repos/$REPO/contents/$FILE?ref=$BRANCH" > "$LOCAL"
```

## 3. Write a file to the branch

One block per file, new or changed. A changed file is written with its current `sha`; a new file
has none.

```bash
REPO=acme-org/acme-skills; BRANCH=<branch>; FILE=<path in the repo>; LOCAL=<the local file>
OLD=$(gh api "repos/$REPO/contents/$FILE?ref=$BRANCH" -q .sha 2>/dev/null) || OLD=""
B64=$(base64 -w0 < "$LOCAL" 2>/dev/null || base64 < "$LOCAL" | tr -d '\n')
gh api --method PUT "repos/$REPO/contents/$FILE" -f message="<what changed>" -f branch="$BRANCH" \
  -f content="$B64" ${OLD:+-f} ${OLD:+sha=$OLD} >/dev/null && echo written
```

A 403 or 404 here, after the access check passed, means read-only access: switch to route **b**.

## 4. Raise the plugin's version

Cowork only picks up a change when the plugin's version goes up, and a check on the pull request
fails until it does. So once per pull request, for each plugin it changes (any file under
`plugins/<plugin>/`), raise that plugin's patch version. A change to the docs alone needs none.

Copy `plugins/<plugin>/.claude-plugin/plugin.json` (step 2), raise the last number of `version`
by one (0.1.0 becomes 0.1.1), change nothing else, and write it back (step 3). Tell the person:
"I raised <plugin>'s version from <old> to <new> so installed copies get the change. A maintainer
may adjust it before merging." A later change to the same pull request does not raise it again.

## 5. Open the pull request

Write the body to `proposals/<folder>/PROPOSAL.md`, show it with the title, and after a yes:

```bash
gh pr create --repo acme-org/acme-skills --head <branch> --title "<title>" --body-file proposals/<folder>/PROPOSAL.md
```

Then tell them what happens next, as the end of `pull-requests.md` says, and offer the message for
the reviewer.
