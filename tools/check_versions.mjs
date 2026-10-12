// Every plugin whose files changed must carry a higher version than the base.
//
// Cowork's organization marketplace only syncs a plugin when its version goes up
// on main, and Claude Code pins to the same string, so a change without a higher
// version never reaches anyone.
//
//   node tools/check_versions.mjs <base> [<head>] [--on-main]
//
// <base>  the commit to compare against. For a pull request that is the live
//         main (fetch it first), not the base the pull request recorded when it
//         was opened: two open pull requests that both raise 0.7.0 to 0.7.1 pass
//         against their recorded base, and the second one to merge ships nothing.
// <head>  the commit to check. Leave it out to check the working tree, untracked
//         files included (for trying it on a branch before committing).
// --on-main  wording for the check that runs after a push to main.
//
// A plugin counts as changed when a file under plugins/<name>/ differs between
// the merge base of <base> and <head>, and <head>: only what this branch changed,
// not what main changed since. Its version at <head> must then be higher than its
// version at <base>, by semver. A plugin new at <head> needs a valid version; a
// plugin removed at <head> needs nothing. Exit 1 on any failure. No dependencies.
import { execFileSync } from 'node:child_process'
import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

process.chdir(fileURLToPath(new URL('..', import.meta.url)))

const args = process.argv.slice(2)
const onMain = args.includes('--on-main')
const [base, head] = args.filter((a) => !a.startsWith('--'))
if (!base) {
  console.error('usage: node tools/check_versions.mjs <base> [<head>] [--on-main]')
  process.exit(2)
}
const inActions = process.env.GITHUB_ACTIONS === 'true'

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
const lines = (s) => s.split('\n').filter(Boolean)

function resolve(ref) {
  try { return git('rev-parse', '--verify', `${ref}^{commit}`) } catch {
    console.error(`Cannot find commit ${ref}. Fetch it first (for main: git fetch origin main).`)
    process.exit(2)
  }
}
const baseSha = resolve(base)
const headSha = head ? resolve(head) : null
const mergeBase = git('merge-base', baseSha, headSha ?? 'HEAD')

// Files this branch changed under plugins/, since it left <base>.
const changed = headSha
  ? lines(git('diff', '--no-renames', '--name-only', mergeBase, headSha, '--', 'plugins/'))
  : [
      ...lines(git('diff', '--no-renames', '--name-only', mergeBase, '--', 'plugins/')),
      ...lines(git('ls-files', '--others', '--exclude-standard', '--', 'plugins/')),
    ]
const dirs = [...new Set(changed.map((f) => f.split('/')).filter((p) => p.length > 2).map((p) => `${p[0]}/${p[1]}`))].sort()

// A full commit id (as the workflows pass) prints short; a branch name prints as is.
const baseName = /^[0-9a-f]{40}$/.test(base) ? baseSha.slice(0, 7) : base
const headLabel = headSha ? headSha.slice(0, 7) : 'working tree'
const baseLabel = baseName === base ? `${base} ${baseSha.slice(0, 7)}` : baseName
if (dirs.length === 0) {
  console.log(`No plugin changed between ${baseLabel} and ${headLabel}; nothing to check.`)
  process.exit(0)
}

// Semantic versioning precedence: MAJOR.MINOR.PATCH, then a pre-release sorts
// below the release. Build metadata is ignored.
const SEMVER = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/
function compare(a, b) {
  const [, ...pa] = a.match(SEMVER)
  const [, ...pb] = b.match(SEMVER)
  for (let i = 0; i < 3; i++) {
    const d = Number(pa[i]) - Number(pb[i])
    if (d) return Math.sign(d)
  }
  if (!pa[3] || !pb[3]) return pa[3] === pb[3] ? 0 : pa[3] ? -1 : 1
  const xa = pa[3].split('.'), xb = pb[3].split('.')
  for (let i = 0; i < Math.max(xa.length, xb.length); i++) {
    if (xa[i] === undefined) return -1
    if (xb[i] === undefined) return 1
    const na = /^\d+$/.test(xa[i]), nb = /^\d+$/.test(xb[i])
    if (na && nb) { const d = Number(xa[i]) - Number(xb[i]); if (d) return Math.sign(d); continue }
    if (na !== nb) return na ? -1 : 1
    if (xa[i] !== xb[i]) return xa[i] < xb[i] ? -1 : 1
  }
  return 0
}

function readManifest(ref, file) {
  let text
  if (ref) {
    try { text = git('show', `${ref}:${file}`) } catch { return { missing: true } }
  } else {
    if (!existsSync(file)) return { missing: true }
    text = readFileSync(file, 'utf8')
  }
  try { return { version: JSON.parse(text).version ?? '' } } catch { return { invalid: true } }
}

function pluginExists(ref, dir) {
  if (!ref) return existsSync(dir)
  try { git('cat-file', '-e', `${ref}:${dir}`); return true } catch { return false }
}

const failures = []
function fail(file, message) {
  failures.push(`${file}: ${message}`)
  console.log(inActions ? `::error file=${file}::${message}` : `FAIL ${file}: ${message}`)
}

console.log(`Comparing ${headLabel} with ${baseLabel} (changes since ${mergeBase.slice(0, 7)})`)
for (const dir of dirs) {
  const file = `${dir}/.claude-plugin/plugin.json`
  if (!pluginExists(headSha, dir)) { console.log(`${dir}: removed; nothing to bump`); continue }
  const now = readManifest(headSha, file)
  const was = readManifest(baseSha, file)
  const nowV = now.version, wasV = was.version
  console.log(`${dir}: ${baseName} ${wasV || '(none)'}, ${headSha ? 'head' : 'working tree'} ${nowV || '(none)'}`)
  if (now.missing || now.invalid || !nowV) { fail(file, 'plugin.json is missing, unreadable or has no version. Cowork will never sync this plugin.'); continue }
  if (!SEMVER.test(nowV)) { fail(file, `version ${JSON.stringify(nowV)} is not MAJOR.MINOR.PATCH.`); continue }
  if (!wasV) { console.log(`  ok: new plugin at ${nowV}`); continue }
  if (!SEMVER.test(wasV)) { console.log(`  ok: ${baseName} has a version that is not semver (${wasV}); ${nowV} replaces it`); continue }
  if (compare(nowV, wasV) > 0) { console.log(`  ok: ${wasV} -> ${nowV}`); continue }
  fail(file, onMain
    ? `Files under ${dir}/ changed on main but the version went from ${wasV} to ${nowV}, not up. Cowork will not sync this change and Claude Code will not update to it. Open a pull request now that raises the version above ${wasV}.`
    : `Files under ${dir}/ changed but the version is ${nowV}, and ${baseName} already has ${wasV}. Raise it above ${wasV} so installed copies receive this change.`)
}

if (failures.length && process.env.GITHUB_STEP_SUMMARY) {
  const title = onMain ? '## A change reached main without a version bump' : '## A plugin needs a version bump'
  const body = failures.map((f) => `- ${f}`).join('\n')
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${title}\n\n${body}\n`)
}
process.exit(failures.length ? 1 : 0)
