// Check every skill, agent and command against the rules Cowork applies when a
// plugin is uploaded: a skill name in lowercase letters, digits and hyphens that
// matches its folder, a description of at most 1024 characters with no
// <angle-bracket> tags, frontmatter that strict YAML can parse, and no command
// with the same name as a skill in the same plugin, and a plugin description of at
// most 500 characters.
//
// Run from anywhere: `npm ci` (or `bun install`) at the repo root once, then
// `node tools/check_skills.mjs` or `npm run check:skills`. Needs Node 22 or later.
import { globSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'

// Every path below is relative to the repo root, whatever the working directory.
process.chdir(fileURLToPath(new URL('..', import.meta.url)))

const files = [...globSync('plugins/*/skills/*/SKILL.md'), ...globSync('plugins/*/agents/*.md'), ...globSync('plugins/*/commands/*.md')].sort()
const probs = []
for (const f of files) {
  const s = readFileSync(f, 'utf8')
  const m = s.match(/^---\n([\s\S]*?)\n---\n/)
  if (!m) { probs.push([f, 'no frontmatter']); continue }
  let fm
  try { fm = YAML.parse(m[1]) } catch (e) { probs.push([f, 'yaml error: ' + e.message.split('\n')[0]]); continue }
  const name = String(fm.name ?? ''), desc = String(fm.description ?? '')
  const kind = f.includes('/skills/') ? 'skill' : f.includes('/agents/') ? 'agent' : 'command'
  if (kind === 'skill') {
    if (!/^[a-z0-9-]{1,64}$/.test(name)) probs.push([f, `name format: ${JSON.stringify(name)}`])
    if (/anthropic|claude/.test(name)) probs.push([f, 'reserved word in name'])
    if (name !== f.split('/').at(-2)) probs.push([f, `name ${name} != folder`])
  }
  if (!desc) probs.push([f, 'no description'])
  if (desc.length > 1024) probs.push([f, `description ${desc.length} chars`])
  const tags = desc.match(/<[^>]*>/g)
  if (tags) probs.push([f, 'angle brackets in description: ' + tags.join(' ')])
}
for (const f of globSync('plugins/*/.claude-plugin/plugin.json')) {
  const desc = JSON.parse(readFileSync(f, 'utf8')).description ?? ''
  if (desc.length > 500) probs.push([f, `plugin description ${desc.length} chars (max 500)`])
}
for (const plugin of globSync('plugins/*')) {
  const skills = new Set(globSync(`${plugin}/skills/*`).map((d) => d.split('/').at(-1)))
  for (const c of globSync(`${plugin}/commands/*.md`)) {
    const n = c.split('/').at(-1).replace(/\.md$/, '')
    if (skills.has(n)) probs.push([c, `command and skill share the name ${n}`])
  }
}
for (const p of probs) console.log(p.join('  |  '))
console.log(`${probs.length} problems in ${files.length} files`)
if (files.length === 0) { console.log('no skills found: is this a skills marketplace repo?'); process.exit(1) }
process.exit(probs.length ? 1 : 0)
