#!/usr/bin/env node
/**
 * The sample dashboard data is four datasets describing one portfolio, and they
 * are only useful while they agree. A tenant list whose rent does not add up to
 * the property it sits in, or a payment from somebody who rents nothing, reads
 * as a bug in design review and wastes the review on arithmetic.
 *
 * These are the invariants a real API would hold by construction. Run with
 * `pnpm verify:data`.
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../lib/dashboard/sample-data.ts', import.meta.url), 'utf8')

/** Pulls one `export const <name> = ...` literal out and evaluates it. */
function read(name) {
  const at = src.indexOf(`export const ${name}`)
  if (at === -1) throw new Error(`${name} not found in sample-data.ts`)
  const start = src.indexOf('=', at) + 1
  const open = src.slice(start).search(/[[{]/)
  const from = start + open
  const closer = src[from] === '[' ? ']' : '}'
  let depth = 0
  for (let i = from; i < src.length; i++) {
    if (src[i] === src[from]) depth++
    else if (src[i] === closer && --depth === 0) {
      // Strip block comments and numeric separators, both legal TS and neither
      // legal JSON.
      const body = src.slice(from, i + 1).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(\d)_(?=\d)/g, '$1')
      return eval(`(${body})`)
    }
  }
  throw new Error(`could not find the end of ${name}`)
}

const collection = read('sampleCollection')
const portfolio = read('samplePortfolio')
const properties = read('sampleProperties')
const tenants = read('sampleTenants')
const transactions = read('sampleTransactions')
const payments = read('samplePayments')
const mix = read('sampleCollectionMix')
const maintenance = read('sampleMaintenance')
const diary = read('sampleDiary')

const sum = (xs, f) => xs.reduce((n, x) => n + f(x), 0)
const failures = []
const check = (label, actual, expected) => {
  const ok = actual === expected
  if (!ok) failures.push(`${label}: got ${actual}, expected ${expected}`)
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label.padEnd(46)} ${actual}`)
}

console.log('portfolio totals')
check('properties = samplePortfolio.properties', properties.length, portfolio.properties)
check('units = samplePortfolio.units', sum(properties, (p) => p.units), portfolio.units)
check('occupied = samplePortfolio.occupied', sum(properties, (p) => p.occupied), portfolio.occupied)
check('property rent = collection.expected', sum(properties, (p) => p.monthlyRent), collection.expected)
check('property late = collection.unitsLate', sum(properties, (p) => p.unitsLate), collection.unitsLate)

console.log('\ntenants against properties')
check('tenants = occupied units', tenants.length, portfolio.occupied)
for (const p of properties) {
  const mine = tenants.filter((t) => t.property === p.name)
  check(`  ${p.name} tenants`, mine.length, p.occupied)
  check(`  ${p.name} rent`, sum(mine, (t) => t.rent), p.monthlyRent)
  check(`  ${p.name} late`, mine.filter((t) => t.status === 'late').length, p.unitsLate)
}

console.log('\ncollection status')
const by = (s) => tenants.filter((t) => t.status === s)
check('paid = collection.unitsPaid', by('paid').length, collection.unitsPaid)
check('late = collection.unitsLate', by('late').length, collection.unitsLate)
check('due = collection.unitsDue', by('due').length, collection.unitsDue)
check('paid rent = collection.collected', sum(by('paid'), (t) => t.rent), collection.collected)
check(
  'unpaid rent = expected - collected',
  sum([...by('late'), ...by('due')], (t) => t.rent),
  collection.expected - collection.collected,
)

console.log('\nreferential integrity')
const names = new Set(properties.map((p) => p.name))
check('tenant properties all exist', tenants.filter((t) => !names.has(t.property)).length, 0)
check('tenant units unique per property', new Set(tenants.map((t) => `${t.property}|${t.unit}`)).size, tenants.length)
check('tenant names unique', new Set(tenants.map((t) => t.name)).size, tenants.length)
check('tenant emails unique', new Set(tenants.map((t) => t.email)).size, tenants.length)
check(
  'transactions resolve to a tenant on that unit',
  transactions.filter(
    (x) => !tenants.some((t) => t.name === x.tenant && t.property === x.property && t.unit === x.unit && t.rent === x.amount),
  ).length,
  0,
)
check('occupied never exceeds units', properties.filter((p) => p.occupied > p.units).length, 0)
check('lease always ends after move-in', tenants.filter((t) => t.leaseEnd <= t.moveIn).length, 0)

console.log('\npayment ledger against tenants')
check('one payment row per let unit', payments.length, tenants.length)
check(
  'every row matches its tenant exactly',
  payments.filter(
    (p) => !tenants.some((t) => t.name === p.tenant && t.unit === p.unit && t.property === p.property && t.rent === p.amount),
  ).length,
  0,
)
check('payment ids unique', new Set(payments.map((p) => p.id)).size, payments.length)
const pay = (s) => payments.filter((p) => p.status === s)
check('paid rows = collection.unitsPaid', pay('paid').length, collection.unitsPaid)
check('pending rows = collection.unitsDue', pay('pending').length, collection.unitsDue)
check('failed + late rows = collection.unitsLate', pay('failed').length + pay('late').length, collection.unitsLate)
check('paid rows sum to collection.collected', sum(pay('paid'), (p) => p.amount), collection.collected)
check('every paid row carries a reference', pay('paid').filter((p) => !p.reference).length, 0)
check('no unsettled row carries a reference', payments.filter((p) => p.status !== 'paid' && p.reference).length, 0)
check('late rows carry no method or timestamp', pay('late').filter((p) => p.method || p.at).length, 0)
check('every failed row says why', pay('failed').filter((p) => !p.note).length, 0)
check(
  'payment status agrees with tenant status',
  payments.filter((p) => {
    const t = tenants.find((t) => t.name === p.tenant)
    const expected = p.status === 'paid' ? 'paid' : p.status === 'pending' ? 'due' : 'late'
    return t.status !== expected
  }).length,
  0,
)
check(
  'the six dashboard transactions appear in the ledger, unchanged',
  transactions.filter(
    (x) => !payments.some(
      (p) => p.tenant === x.tenant && p.unit === x.unit && p.amount === x.amount && p.at === x.at && p.method === x.method,
    ),
  ).length,
  0,
)

console.log('\ncollection mix against the current period')
const last = mix[mix.length - 1]
check('mix months', mix.length, 12)
check('latest month is the reported period', last.month, '2026-09')
check('mix total = collection.expected', last.onTime + last.late + last.unpaid, collection.expected)
check('mix on-time + late = collection.collected', last.onTime + last.late, collection.collected)
check('mix unpaid = expected - collected', last.unpaid, collection.expected - collection.collected)
check('every month has a positive total', mix.filter((m) => m.onTime + m.late + m.unpaid <= 0).length, 0)

console.log('\nmaintenance against tenants')
check('request ids unique', new Set(maintenance.map((m) => m.id)).size, maintenance.length)
check(
  'every request sits on its tenant\'s own unit',
  maintenance.filter(
    (m) => !tenants.some((t) => t.name === m.tenant && t.unit === m.unit && t.property === m.property),
  ).length,
  0,
)
check(
  'only resolved requests carry resolvedAt',
  maintenance.filter((m) => (m.status === 'resolved') !== Boolean(m.resolvedAt)).length,
  0,
)
check(
  'nothing is resolved before it was raised',
  maintenance.filter((m) => m.resolvedAt && m.resolvedAt <= m.raisedAt).length,
  0,
)
check(
  'scheduled and in-progress jobs have a contractor',
  maintenance.filter((m) => ['scheduled', 'in_progress'].includes(m.status) && !m.assignee).length,
  0,
)
check(
  'scheduled and in-progress jobs have a visit date',
  maintenance.filter((m) => ['scheduled', 'in_progress'].includes(m.status) && !m.scheduledFor).length,
  0,
)
check(
  'no visit is booked before the job was raised',
  maintenance.filter((m) => m.scheduledFor && m.scheduledFor < m.raisedAt.slice(0, 10)).length,
  0,
)
check(
  'open and resolved jobs carry no visit date',
  maintenance.filter((m) => ['open', 'resolved'].includes(m.status) && m.scheduledFor).length,
  0,
)
check(
  'categories are all known',
  maintenance.filter(
    (m) => !['plumbing', 'electrical', 'heating', 'structural', 'security', 'other'].includes(m.category),
  ).length,
  0,
)
check(
  'priorities are all known',
  maintenance.filter((m) => !['urgent', 'normal', 'low'].includes(m.priority)).length,
  0,
)

console.log('\ndiary')
check('diary ids unique', new Set(diary.map((d) => d.id)).size, diary.length)
check('every entry names a real property', diary.filter((d) => !names.has(d.property)).length, 0)
check(
  'entries naming a tenant name a real one, on that property',
  diary.filter((d) => d.tenant && !tenants.some((t) => t.name === d.tenant && t.property === d.property)).length,
  0,
)
check('kinds are all known', diary.filter((d) => !['inspection', 'meeting', 'viewing'].includes(d.kind)).length, 0)
check('dates are all YYYY-MM-DD', diary.filter((d) => !/^\d{4}-\d{2}-\d{2}$/.test(d.date)).length, 0)
check('times, where given, are HH:mm', diary.filter((d) => d.time && !/^\d{2}:\d{2}$/.test(d.time)).length, 0)
check(
  'every contractor visit has a time',
  maintenance.filter((m) => m.scheduledFor && !m.scheduledTime).length,
  0,
)

if (failures.length > 0) {
  console.error(`\n${failures.length} failed:\n` + failures.map((f) => `  - ${f}`).join('\n'))
  process.exit(1)
}
console.log('\nAll sample data reconciles.')
