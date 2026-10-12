#!/usr/bin/env node
// Builds one zip per plugin for the Manual install page (/install/manual), so the downloads
// are always the plugins on the branch the site was built from. `bun run dev` and
// `bun run build` run it first; nothing it writes is committed.
//
//   public/downloads/<plugin>-<version>.zip      what the page links to
//   components/plugin-downloads.gen.json         name, version, file and size per plugin, for
//                                                components/PluginDownload.tsx
//
// The plugins and their order come from .claude-plugin/marketplace.json, each version from the
// plugin's own .claude-plugin/plugin.json. A zip holds the plugin's files at its root, with
// .claude-plugin/plugin.json at the top: the layout Cowork's Upload plugin takes.
//
// Files are the ones git would commit (tracked, plus untracked files git does not ignore), so an
// ignored file such as .env never reaches a download. Where git is not
// available, such as a build without the .git folder, every file in the checkout is taken: a
// checkout holds tracked files only.
//
// Node built-ins only (zlib for deflate), so the build needs no extra dependency.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateRawSync } from 'node:zlib'

const repo = fileURLToPath(new URL('../../', import.meta.url))
const docs = join(repo, 'docs')
const outDir = join(docs, 'public', 'downloads')
const manifestOut = join(docs, 'components', 'plugin-downloads.gen.json')

const marketplace = JSON.parse(readFileSync(join(repo, '.claude-plugin', 'marketplace.json'), 'utf8'))

// ── which files ───────────────────────────────────────────────────────────

function gitFiles(dir) {
  try {
    const out = execFileSync(
      'git',
      ['-C', repo, 'ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', relative(repo, dir)],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    )
    // --cached also lists files deleted from the working tree but not yet from the index.
    return out.split('\0').filter(Boolean).map((f) => join(repo, f)).filter((f) => existsSync(f))
  } catch {
    return null
  }
}

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    if (name === '.DS_Store') continue
    const path = join(dir, name)
    if (statSync(path).isDirectory()) out.push(...walk(path))
    else out.push(path)
  }
  return out
}

// ── zip writer ────────────────────────────────────────────────────────────

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function dosDateTime(date) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  return { time, day }
}

// entries: [{ name, data?: Buffer, mode }]; a name ending in "/" is a folder.
function zip(entries, date) {
  const { time, day } = dosDateTime(date)
  const locals = []
  const centrals = []
  let offset = 0
  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8')
    const isDir = entry.name.endsWith('/')
    const raw = isDir ? Buffer.alloc(0) : entry.data
    const deflated = isDir ? raw : deflateRawSync(raw, { level: 9 })
    const stored = isDir || deflated.length >= raw.length
    const body = stored ? raw : deflated
    const crc = isDir ? 0 : crc32(raw)
    const method = stored ? 0 : 8

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4) // version needed
    local.writeUInt16LE(0x0800, 6) // UTF-8 names
    local.writeUInt16LE(method, 8)
    local.writeUInt16LE(time, 10)
    local.writeUInt16LE(day, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(body.length, 18)
    local.writeUInt32LE(raw.length, 22)
    local.writeUInt16LE(name.length, 26)
    local.writeUInt16LE(0, 28)
    locals.push(local, name, body)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE((3 << 8) | 20, 4) // made by Unix, so the mode below is read
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x0800, 8)
    central.writeUInt16LE(method, 10)
    central.writeUInt16LE(time, 12)
    central.writeUInt16LE(day, 14)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(body.length, 20)
    central.writeUInt32LE(raw.length, 24)
    central.writeUInt16LE(name.length, 28)
    central.writeUInt16LE(0, 30) // extra
    central.writeUInt16LE(0, 32) // comment
    central.writeUInt16LE(0, 34) // disk
    central.writeUInt16LE(0, 36) // internal attributes
    central.writeUInt32LE(((isDir ? 0o040755 : entry.mode) << 16) >>> 0, 38)
    central.writeUInt32LE(offset, 42)
    centrals.push(central, name)

    offset += local.length + name.length + body.length
  }
  const centralSize = centrals.reduce((n, b) => n + b.length, 0)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(centralSize, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, ...centrals, end])
}

// ── build ─────────────────────────────────────────────────────────────────

rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

const now = new Date()
const downloads = {}
for (const entry of marketplace.plugins) {
  const dir = join(repo, entry.source)
  const manifest = JSON.parse(readFileSync(join(dir, '.claude-plugin', 'plugin.json'), 'utf8'))
  const files = (gitFiles(dir) ?? walk(dir)).sort()

  // Folder entries first, then files, each folder before what it holds.
  const folders = new Set()
  for (const f of files) {
    const parts = relative(dir, f).split(sep)
    for (let i = 1; i < parts.length; i++) folders.add(parts.slice(0, i).join('/') + '/')
  }
  const entries = [
    ...[...folders].sort().map((name) => ({ name })),
    ...files.map((f) => ({
      name: relative(dir, f).split(sep).join('/'),
      data: readFileSync(f),
      mode: 0o100000 | (statSync(f).mode & 0o777),
    })),
  ]

  const file = `${entry.name}-${manifest.version}.zip`
  const data = zip(entries, now)
  writeFileSync(join(outDir, file), data)
  downloads[entry.name] = {
    name: entry.name,
    displayName: manifest.displayName ?? entry.displayName ?? entry.name,
    version: manifest.version,
    file,
    href: `/downloads/${file}`,
    bytes: data.length,
  }
  console.log(`plugin-zips: ${file} (${files.length} files, ${(data.length / 1024).toFixed(0)} KB)`)
}

writeFileSync(manifestOut, JSON.stringify(downloads, null, 2) + '\n')
