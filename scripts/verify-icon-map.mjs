#!/usr/bin/env node
/**
 * Fails if any name in ICON_MAP is absent from the installed icon package.
 * This is the guard that makes a 93-icon migration safe: a typo is a hard
 * failure here rather than a silently blank icon in production.
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'

const require = createRequire(import.meta.url)
const pkg = require('@iconify-icons/material-symbols/package.json')
const exportsMap = pkg.exports ?? {}

const src = readFileSync(new URL('../lib/icons/icon-map.ts', import.meta.url), 'utf8')
const entries = [...src.matchAll(/^\s*(\w+):\s*'([a-z0-9-]+)',/gm)].map((m) => [m[1], m[2]])

if (entries.length === 0) {
  console.error('verify-icon-map: parsed 0 entries — the map format changed.')
  process.exit(1)
}

const missing = entries.filter(([, name]) => !exportsMap[`./${name}`])

if (missing.length > 0) {
  console.error(`verify-icon-map: ${missing.length} unresolved icon(s):`)
  for (const [lucide, name] of missing) console.error(`  ✗ ${lucide} -> ${name}`)
  process.exit(1)
}

console.log(`verify-icon-map: all ${entries.length} icons resolved.`)
