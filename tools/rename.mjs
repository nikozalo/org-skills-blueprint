// Turn the blueprint into your organization's repository: replaces the placeholder names
// everywhere and renames the folders that carry them. Run it once, from a clean checkout.
//
//   node tools/rename.mjs --name "Northwind" --slug northwind --repo northwind-co/northwind-skills
//   node tools/rename.mjs ... --channel "#ai-help"     the Slack channel for help and handoffs
//   node tools/rename.mjs ... --dry-run                show what would change, change nothing
//
// --name     how people write your organization's name: "Acme" becomes this
// --slug     lowercase letters, digits and hyphens: the core plugin's name and the prefix of
//            every skill (/acme:setup becomes /<slug>:setup); "acme" becomes this
// --repo     the GitHub repository people will add as the marketplace: owner/name
// --channel  optional; without it, "#acme-ai" becomes "#<slug>-ai"
//
// It leaves itself and BLUEPRINT.md as they are; delete both once you are done. No dependencies.
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
process.chdir(root)

const args = process.argv.slice(2)
const opt = (flag) => {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : undefined
}
const name = opt('--name')
const slug = opt('--slug')
const repo = opt('--repo')
const channel = opt('--channel')
const dryRun = args.includes('--dry-run')

function usage(message) {
  console.error(message)
  console.error('usage: node tools/rename.mjs --name "Northwind" --slug northwind --repo northwind-co/northwind-skills [--channel "#ai-help"] [--dry-run]')
  process.exit(2)
}
if (!name || !slug || !repo) usage('--name, --slug and --repo are all needed.')
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) usage(`--slug ${JSON.stringify(slug)}: use lowercase letters, digits and single hyphens.`)
if (/claude|anthropic/.test(slug)) usage('--slug cannot contain "claude" or "anthropic": plugin and skill names may not use them.')
if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) usage(`--repo ${JSON.stringify(repo)}: write it as owner/name.`)
if (channel && !channel.startsWith('#')) usage('--channel starts with #.')
if (!existsSync('plugins/acme')) usage('plugins/acme is not here: has this blueprint been renamed already?')

const KEEP = new Set(['tools/rename.mjs', 'BLUEPRINT.md'])
const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', '.vocs', 'downloads', 'results'])
const BINARY = /\.(png|jpe?g|gif|webp|ico|pdf|xlsx?|pptx?|potx|docx?|zip|gz|woff2?|ttf|mp4|mov|pyc)$/i

// Most specific first, so the repository and the channel are replaced whole.
const REPLACEMENTS = [
  ['acme-org/acme-skills', repo],
  ...(channel ? [['#acme-ai', channel]] : []),
  ['ACME', slug.toUpperCase()],
  ['Acme', name],
  ['acme', slug],
]

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    if (entry === '.DS_Store') continue
    const path = dir === '.' ? entry : join(dir, entry)
    if (statSync(path).isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue
      out.push({ path, dir: true }, ...walk(path))
    } else out.push({ path, dir: false })
  }
  return out
}

const entries = walk('.')

// 1. File contents.
let changedFiles = 0
for (const { path, dir } of entries) {
  if (dir || KEEP.has(path.split('\\').join('/')) || BINARY.test(path)) continue
  const buf = readFileSync(path)
  if (buf.subarray(0, 4096).includes(0)) continue
  const before = buf.toString('utf8')
  // The note at the top of README.md that points visitors to BLUEPRINT.md goes too.
  let after = before.replace(/<!-- BLUEPRINT NOTE[\s\S]*?END BLUEPRINT NOTE -->\n+/, '')
  for (const [from, to] of REPLACEMENTS) after = after.split(from).join(to)
  if (after !== before) {
    changedFiles++
    console.log(`edit    ${path}`)
    if (!dryRun) writeFileSync(path, after)
  }
}

// 2. File and folder names, deepest first so a parent moves after its children.
const toRename = entries
  .filter(({ path }) => basename(path).includes('acme'))
  .sort((a, b) => b.path.split(/[\\/]/).length - a.path.split(/[\\/]/).length)
for (const { path } of toRename) {
  const target = join(dirname(path), basename(path).split('acme').join(slug))
  console.log(`rename  ${path} -> ${relative('.', target)}`)
  if (!dryRun) renameSync(path, target)
}

let git = false
try {
  execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { stdio: 'ignore' })
  git = true
} catch {}

console.log(`\n${dryRun ? 'Would change' : 'Changed'} ${changedFiles} files and ${dryRun ? 'rename' : 'renamed'} ${toRename.length} paths.`)
if (!dryRun) {
  console.log(`
Next:
  1. Look for anything left over:   grep -rni acme --exclude-dir=node_modules --exclude-dir=.git .   (this script and BLUEPRINT.md keep theirs)
  2. Check it:                      npm ci && npm run check:skills && claude plugin validate . --strict
  3. Fill in every [TBD]:           grep -rn "\\[TBD" plugins
  4. Delete BLUEPRINT.md and tools/rename.mjs${git ? '' : '\n  5. git init, commit, and push to ' + repo}`)
}
