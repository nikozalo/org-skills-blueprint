#!/usr/bin/env node
// Counts the prose words on every page in docs/pages and fails when a page is
// over the limit (docs/AUTHORING.md: at most 1,500 words of prose per page).
//
// Prose means what a reader reads: the frontmatter, fenced code blocks, import
// and export lines, link targets and JSX or HTML tags are left out. Table cells,
// callouts, collapsed blocks and inline code count.
//
//   node docs/scripts/check-words.mjs          from the repository root
//   bun run check:words                         from docs/
//   node docs/scripts/check-words.mjs --all     every page, not only those over the limit

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const LIMIT = 1500
const pagesDir = fileURLToPath(new URL('../pages', import.meta.url))
const showAll = process.argv.includes('--all')

function listPages(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) out.push(...listPages(path))
    else if (/\.mdx?$/.test(name)) out.push(path)
  }
  return out
}

export function countWords(source) {
  let text = source.replace(/\r\n/g, '\n')

  // Frontmatter at the top of the file.
  text = text.replace(/^---\n[\s\S]*?\n---\n/, '')

  // Fenced code blocks, ``` or ~~~, any length of fence.
  const kept = []
  let fence = null
  for (const line of text.split('\n')) {
    const open = line.match(/^\s*(`{3,}|~{3,})/)
    if (fence) {
      if (open && open[1][0] === fence[0] && open[1].length >= fence.length && line.trim() === open[1]) fence = null
      continue
    }
    if (open) {
      fence = open[1]
      continue
    }
    kept.push(line)
  }

  text = kept
    // import and export lines (MDX ESM)
    .filter((line) => !/^\s*(import|export)\s/.test(line))
    // table separator rows
    .filter((line) => !/^\s*\|?\s*:?-{3,}/.test(line))
    .join('\n')

  text = text
    .replace(/<!--[\s\S]*?-->/g, ' ') // comments
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ') // MDX comments
    .replace(/<\/?[A-Za-z][^>]*>/g, ' ') // JSX and HTML tags
    .replace(/\]\([^)]*\)/g, ']') // link targets
    .replace(/^\s*:{3,}\s*[a-z-]*/gm, ' ') // :::tip, ::::steps, closing :::

  return text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length
}

const rows = listPages(pagesDir)
  .map((file) => ({ page: relative(pagesDir, file), words: countWords(readFileSync(file, 'utf8')) }))
  .sort((a, b) => b.words - a.words)

const over = rows.filter((r) => r.words > LIMIT)
const total = rows.reduce((sum, r) => sum + r.words, 0)

for (const r of showAll ? rows : over) {
  console.log(`${String(r.words).padStart(6)}  ${r.page}${r.words > LIMIT ? `  (over ${LIMIT})` : ''}`)
}
console.log(`${rows.length} pages, ${total} words of prose. Limit ${LIMIT} per page.`)

if (over.length > 0) {
  console.error(`${over.length} page${over.length === 1 ? ' is' : 's are'} over ${LIMIT} words.`)
  process.exit(1)
}
