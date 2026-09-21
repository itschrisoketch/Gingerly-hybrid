#!/usr/bin/env node
/**
 * Verify that every endpoint the frontend calls actually exists on the live
 * Gingerly API, and that the base URL is usable from a browser.
 *
 * This exists because the original client was written from a draft document
 * and drifted badly from the deployed API — wrong paths, wrong param styles,
 * wrong field names. Comparing our endpoint table against the live OpenAPI
 * spec catches that class of bug without anyone having to click through the UI.
 *
 *   node scripts/verify-api-contract.mjs
 *   API_BASE=https://api.gingerly.africa node scripts/verify-api-contract.mjs
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const API_ORIGIN = process.env.API_BASE || 'https://api.gingerly.africa'
const SPEC_URL = `${API_ORIGIN}/apispec.json`

let failures = 0
const fail = (msg) => {
  failures++
  console.log(`  FAIL  ${msg}`)
}
const pass = (msg) => console.log(`  ok    ${msg}`)

/** Turn a spec path or client path into a comparable shape. */
const normalize = (p) => p.replace(/\$\{[^}]+\}/g, '*').replace(/\{[^}]+\}/g, '*')

/**
 * Pull endpoint paths out of config.ts rather than restating them here, so the
 * test cannot drift from the code it is checking.
 */
function endpointsFromConfig() {
  const src = readFileSync(join(ROOT, 'lib/api/config.ts'), 'utf8')
  const block = src.slice(
    src.indexOf('export const API_ENDPOINTS'),
    src.indexOf('export const STORAGE_KEYS')
  )
  const paths = new Set()
  for (const m of block.matchAll(/['`](\/[^'`]*)['`]/g)) paths.add(m[1])
  return [...paths]
}

async function main() {
  console.log(`\nGingerly API contract check — ${API_ORIGIN}\n`)

  // 1. Transport
  console.log('Transport')
  if (!API_ORIGIN.startsWith('https://')) {
    fail(`base URL is not https (${API_ORIGIN}) — browsers block mixed content`)
  } else {
    pass('base URL is https')
  }

  const health = await fetch(`${API_ORIGIN}/`).catch((e) => e)
  if (health instanceof Error) {
    fail(`API unreachable: ${health.message}`)
    console.log(`\n${failures} failure(s).\n`)
    process.exit(1)
  }
  const healthBody = await health.json().catch(() => ({}))
  healthBody.status === 'healthy'
    ? pass(`service healthy (${healthBody.service} v${healthBody.version})`)
    : fail(`unexpected health payload: ${JSON.stringify(healthBody)}`)

  // 2. CORS, from the origin the app is actually served from
  console.log('\nCORS')
  const origin = process.env.APP_ORIGIN || 'https://gingerly.africa'
  const preflight = await fetch(`${API_ORIGIN}/api/v1/auth/login`, {
    method: 'OPTIONS',
    headers: {
      Origin: origin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type,authorization',
    },
  })
  const allowOrigin = preflight.headers.get('access-control-allow-origin')
  const allowHeaders = preflight.headers.get('access-control-allow-headers') || ''
  allowOrigin === origin || allowOrigin === '*'
    ? pass(`preflight allows ${origin}`)
    : fail(`preflight did not allow ${origin} (got ${allowOrigin})`)
  /authorization/i.test(allowHeaders)
    ? pass('preflight allows the Authorization header')
    : fail(`Authorization header not allowed (got "${allowHeaders}")`)

  // 3. Every endpoint we call must exist in the live spec
  console.log('\nEndpoint contract')
  const spec = await fetch(SPEC_URL).then((r) => r.json())
  const specPaths = Object.keys(spec.paths).map(normalize)
  const ours = endpointsFromConfig()

  if (!ours.length) {
    fail('could not parse any endpoints out of lib/api/config.ts')
  }

  for (const path of ours.sort()) {
    specPaths.includes(normalize(path))
      ? pass(path)
      : fail(`${path} — no such route on the live API`)
  }

  // 4. Endpoints the spec has that we never call, as a coverage note
  const unused = Object.keys(spec.paths)
    .filter((p) => !ours.map(normalize).includes(normalize(p)))
    .sort()
  if (unused.length) {
    console.log(`\nNot yet wired up (${unused.length} of ${Object.keys(spec.paths).length}):`)
    for (const p of unused) console.log(`  ·     ${p}`)
  }

  console.log(
    failures === 0
      ? '\nAll contract checks passed.\n'
      : `\n${failures} failure(s).\n`
  )
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
