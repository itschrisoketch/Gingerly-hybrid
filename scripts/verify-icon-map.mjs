#!/usr/bin/env node
/**
 * Two independent checks, because they catch different mistakes:
 *
 * 1. Upstream check — fails if any name in ICON_MAP is absent from the
 *    installed icon package. This is the guard that makes a 93-icon
 *    migration safe: a typo is a hard failure here rather than a silently
 *    blank icon in production.
 *
 * 2. Bundle-drift check — fails if any ICON_MAP target is missing from the
 *    generated lib/icons/icon-data.ts, i.e. the collection actually
 *    registered via addCollection() at runtime. A name can be perfectly
 *    valid upstream (check 1 passes) while icon-data.ts is stale because
 *    someone edited icon-map.ts and forgot to run `pnpm generate:icons`.
 *    Without this check that drift is invisible until Iconify falls through
 *    to a network fetch for the missing name in production.
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'

const require = createRequire(import.meta.url)
const pkg = require('@iconify-icons/material-symbols/package.json')
const exportsMap = pkg.exports ?? {}

const mapSrc = readFileSync(new URL('../lib/icons/icon-map.ts', import.meta.url), 'utf8')
const entries = [...mapSrc.matchAll(/^\s*(\w+):\s*'([a-z0-9-]+)',/gm)].map((m) => [m[1], m[2]])

if (entries.length === 0) {
  console.error('verify-icon-map: parsed 0 entries — the map format changed.')
  process.exit(1)
}

const missingUpstream = entries.filter(([, name]) => !exportsMap[`./${name}`])

if (missingUpstream.length > 0) {
  console.error(`verify-icon-map: ${missingUpstream.length} unresolved icon(s):`)
  for (const [lucide, name] of missingUpstream) console.error(`  ✗ ${lucide} -> ${name}`)
  process.exit(1)
}

let dataSrc
try {
  dataSrc = readFileSync(new URL('../lib/icons/icon-data.ts', import.meta.url), 'utf8')
} catch {
  console.error('verify-icon-map: lib/icons/icon-data.ts is missing — run `pnpm generate:icons`.')
  process.exit(1)
}

const bundled = new Set(
  [...dataSrc.matchAll(/^\s*'([a-z0-9-]+)':\s*\w+,/gm)].map((m) => m[1])
)

const staleAgainstBundle = entries.filter(([, name]) => !bundled.has(name))

if (staleAgainstBundle.length > 0) {
  console.error(
    `verify-icon-map: ${staleAgainstBundle.length} icon(s) missing from the generated bundle (icon-data.ts is stale — run \`pnpm generate:icons\`):`
  )
  for (const [lucide, name] of staleAgainstBundle) console.error(`  ✗ ${lucide} -> ${name}`)
  process.exit(1)
}

console.log(`verify-icon-map: all ${entries.length} icons resolved (upstream + bundle).`)
