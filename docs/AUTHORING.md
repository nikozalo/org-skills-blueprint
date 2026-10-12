# Writing pages for the Acme Skills docs

The site is [Vocs](https://vocs.dev) 2.x. Pages are MDX files under `pages/`; the file path is the
URL (`pages/skills/acme/meeting-notes.mdx` is `/skills/acme/meeting-notes`, `pages/install/index.mdx`
is `/install`). Navigation lives in `vocs.config.ts`. The site's one name is "Acme Skills".

## Who reads this

Acme staff, most of them not technical. Many use Claude Cowork and never open a terminal. They
come here to get set up, to see what a skill does before they run it, and to fix or propose a
skill. Write for that person. The docs are for doing; the skill itself holds the detail.

## Voice

- Plain English, second person, short sentences. Say what the thing does, not how clever it is.
- Sentence-case headings ("Run it", not "Run It").
- No em dashes. Use a colon, a comma or a full stop.
- Never marketing words ("seamless", "powerful", "robust").
- Name the apps in full: Claude Cowork (or Cowork after the first mention), Claude Code. When
  instructions cover both, Cowork comes first.
- Skills as typed, in code: `/acme:meeting-notes`, `/acme-marketing:voice-check`.
- Plugins by display name, with the install name in code on first mention: Acme Marketing
  (`acme-marketing`).
- Owners by role, never a person's name.
- Link rather than repeat.

## Accuracy

- Every fact comes from the plugin files in this repository (`SKILL.md`, `references/`,
  `README.md`). Never invent a behaviour, an owner, a recipient, a date or a number.
- A team's rules hold internal positions. Describe what a check looks at; do not copy the rules
  onto a page.

## The page model

The site has three parts, one card each on the home page and one sidebar group each: Getting
started (Start here, Manual install, Tips for using Claude), Skills (the Skills overview table and
a short page per skill), and Contribute. A new skill gets a page, a sidebar line and a row in the
Skills overview table.

- **At most 1,500 words of prose per page.** `bun run check:words` counts them (frontmatter, code
  blocks and import lines left out) and fails a page over the limit.
- **About 200 words per skill page**; 150 is better.
- **No "How it works".** Keep only the one or two facts a person needs to trust the output.
- **These are docs, not working documents.** No "Not decided yet", no open items, no status of
  drafts or approvals. An open item stays in the skill as a `[TBD]` marker; maintainers find them
  with `grep -rn "\[TBD" plugins`.
- **Nothing confidential.** No names of people, vendors or partners, no amounts: roles and generic
  descriptions only. Write as if the site were public.
- **Rare cases** go in a collapsed block: `:::details[Title]` … `:::`.

A skill page (`docs/pages/skills/<plugin>/<skill>.mdx`, with a line in the sidebar):

1. `# <Skill name>`, then one or two sentences: what it is for.
2. `## Run it`: one example command, in a `txt` code block.
3. `## What you get`: a short sample or two to four bullets.
4. `## What it never does`: at most three bullets.
5. `Owner: <role>.`

`/acme:contribute` drafts a new skill's page to this shape (`plugins/acme/skills/contribute/`). If
you change the shape here, change it there too.

## What Vocs gives you

Callouts (`tip`, `note`, `info`, `warning`, `danger`, `success`): `:::tip` … `:::`. Collapsed
blocks: `:::details[Title]` … `:::`. Steps: `::::steps`, one `###` heading per step, `::::`.
Tables are plain Markdown. Code blocks take a language (`txt`, `bash`, `md`, `json`).

## Links

Absolute paths without an extension, from the URL map below. A section is an anchor on its page:
`/install#run-acmesetup`. The build fails on a link to a page that does not exist, but it does not
check anchors: Vocs makes them from headings with github-slugger (`## Run /acme:setup` is
`#run-acmesetup`), so check a new one. Skills and READMEs link to page URLs only, never anchors.

## URL map

| Path | Page | Holds |
|---|---|---|
| `/` | Acme Skills | One card per part of the docs |
| `/install` | Start here | A short introduction, Cowork, Claude Code, the plugins, `/acme:setup`, updates, if something is wrong |
| `/install/manual` | Manual install | The plugin zips to download, uploading them, updates |
| `/claude` | Tips for using Claude | The context window, compact, clear or hand off, files, where instructions go |
| `/skills` | Skills overview | The plugins, and a table of every skill |
| `/skills/acme/setup` | Setup | `/acme:setup` |
| `/skills/acme/meeting-notes` | Meeting notes | `/acme:meeting-notes` |
| `/skills/acme-marketing/voice-check` | Voice check | `/acme-marketing:voice-check` |
| `/contribute` | How contributing works | `/acme:contribute`: what to say, what happens next, the folder route, who reviews |
| `/contribute/github-access` | Get GitHub access | The one-time GitHub setup |
| `/contribute/maintainers` | For maintainers | The one-time organization setup, layout, versions, checks, landing proposals, this site |

## Running it

```bash
bun install
bun run dev          # local preview with hot reload
bun run build        # production build; fails on a dead Markdown link
bun run zips         # only the plugin zips for /install/manual
bun run check:words  # fails on a page over 1,500 words of prose
bun run preview      # serve the production build
```

`dev` and `build` first run `scripts/plugin-zips.mjs`. It zips every plugin in
`.claude-plugin/marketplace.json` into `public/downloads/<plugin>-<version>.zip`, with the files git
would commit, and writes `components/plugin-downloads.gen.json`, which
`<PluginDownload plugin="acme" />` on the Manual install page reads. Neither is committed. A new
plugin gets a row on that page; a build that skipped the script fails on the missing JSON rather
than linking to zips that are not there.

`waku` is pinned to `1.0.0-rc.1`: `rc.2` imports a virtual module that Vocs 2.10 does not provide,
and the build fails. Move both together when Vocs releases a version built against the newer Waku.

## The look

- **Colours and fonts.** The tokens are at the top of `styles/theme.css` (the palette, the glass,
  the text colours, `--site-team-label` beside the site name); the accent colour is `accentColor`
  in `vocs.config.ts`, and the fonts are loaded there too. The hero's gradient and art colours are
  in `styles/site.css`. The mark is `public/icon.svg` (the favicon and the sidebar logo) and
  `Mark` in `components/Hero.tsx`.
- **The chrome** (`styles/theme.css`): no top bar on desktop; the logo, the search
  (`pages/_slots.tsx`) and one sidebar with a rail sit in the left column, the outline is pinned
  right. Phones keep a slim floating bar. It targets Vocs 2.10's `data-v-*` attributes: re-check
  them when upgrading Vocs.
- **The pieces on pages** (`styles/site.css`): the home hero (`components/Hero.tsx`), cards, steps,
  callouts, tables, code and figures. Diagrams live in `components/figures.tsx` (wrap one in
  `<Figure caption="...">` for the frame and click-to-enlarge); any Markdown image opens full size
  when clicked (`components/ImageLightbox.tsx`).
- `middleware.ts` runs on Vercel only: the optional password gate. Its sign-in page redraws the
  home hero, art included: change one, change the other.
