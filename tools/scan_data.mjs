// Scan the plugins for things that must never be committed: e-mail addresses outside the
// allowed domains, IBAN-like account numbers, private keys and API tokens. A plugin is
// readable by everyone who can install it, so examples and evals use made-up data only.
//
//   node tools/scan_data.mjs                 every plugin under plugins/
//   node tools/scan_data.mjs <dir> [...]     only these folders
//
// ALLOWED_EMAIL_DOMAINS: add your organization's own domains, so a role address such as
// help@<your domain> in a skill passes. ALLOW lists known false positives, each by file and
// exact text; keep it narrow. Exit 1 on any finding. No dependencies.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

process.chdir(fileURLToPath(new URL('..', import.meta.url)))

const ALLOWED_EMAIL_DOMAINS = ['example.com', 'example.org', 'example.net']

// [path suffix, label, exact match], e.g. ['skills/x/SKILL.md', 'e-mail', 'pkg@1.2.3']
const ALLOW = []

const domains = ALLOWED_EMAIL_DOMAINS.map((d) => d.replace(/\./g, '\\.')).join('|')
const PATTERNS = {
  'e-mail': new RegExp(`\\b[\\w.+-]+@(?!(?:${domains})(?![\\w.-]*[\\w-]))[\\w-]+\\.[\\w.-]*[A-Za-z]{2,}\\b`, 'g'),
  'IBAN-like': /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g,
  'private key': /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  'API token': /\b(?:sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|xox[abprs]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16})\b/g,
}

const SKIP_DIRS = new Set(['.git', 'node_modules', 'results', '__pycache__'])
const BINARY = /\.(png|jpe?g|gif|webp|ico|pdf|xlsx?|pptx?|potx|docx?|zip|gz|woff2?|ttf|mp4|mov|pyc)$/i

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) {
      if (!SKIP_DIRS.has(name)) out.push(...walk(path))
    } else if (!BINARY.test(name)) out.push(path)
  }
  return out
}

const dirs = process.argv.slice(2)
const findings = []
let count = 0
for (const base of dirs.length ? dirs : ['plugins']) {
  for (const file of walk(base)) {
    const text = readFileSync(file)
    if (text.subarray(0, 4096).includes(0)) continue // binary
    count++
    const s = text.toString('utf8')
    for (const [label, rx] of Object.entries(PATTERNS)) {
      for (const m of s.matchAll(rx)) {
        const rel = relative('.', file).split('\\').join('/')
        if (ALLOW.some(([suffix, l, exact]) => rel.endsWith(suffix) && l === label && m[0] === exact)) continue
        const line = s.slice(0, m.index).split('\n').length
        findings.push(`${rel}:${line}: ${label}: ${m[0].slice(0, 48)}`)
      }
    }
  }
}
for (const f of findings) console.log(f)
console.log(`${findings.length} findings in ${count} files`)
process.exit(findings.length ? 1 : 0)
