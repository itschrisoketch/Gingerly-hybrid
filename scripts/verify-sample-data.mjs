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
const conversations = read('sampleConversations')
const documents = read('sampleDocuments')
const cases = read('sampleSupportCases')
const tenantPayments = read('sampleTenantPayments')
const tenancy = read('sampleTenancy')

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

console.log('\nconversations')
check('conversation ids unique', new Set(conversations.map((c) => c.id)).size, conversations.length)
// The bug that shipped: six conversations, message threads for two of them.
check('every conversation has messages', conversations.filter((c) => !c.messages?.length).length, 0)
check(
  'every conversation is a real tenant on their own unit',
  conversations.filter(
    (c) => !tenants.some((t) => t.name === c.tenant && t.unit === c.unit && t.property === c.property),
  ).length,
  0,
)
check('message ids unique across all threads', new Set(conversations.flatMap((c) => c.messages.map((m) => m.id))).size, conversations.reduce((n, c) => n + c.messages.length, 0))
check(
  'messages are oldest-first within a thread',
  conversations.filter((c) => c.messages.some((m, i) => i > 0 && m.at < c.messages[i - 1].at)).length,
  0,
)
check(
  'senders are all known',
  conversations.flatMap((c) => c.messages).filter((m) => !['tenant', 'agent'].includes(m.from)).length,
  0,
)
check('topics are all known', conversations.filter((c) => !['maintenance', 'payment', 'lease', 'general'].includes(c.topic)).length, 0)
check(
  'unread never exceeds the tenant messages in the thread',
  conversations.filter((c) => c.unread > c.messages.filter((m) => m.from === 'tenant').length).length,
  0,
)

console.log('\ndocuments')
const TODAY = '2026-09-21'
check('document ids unique', new Set(documents.map((d) => d.id)).size, documents.length)
check(
  'every document names a real property',
  documents.filter((d) => d.property !== 'All properties' && !names.has(d.property)).length,
  0,
)
check(
  'documents naming a tenant name a real one, on that unit',
  documents.filter(
    (d) => d.tenant && !tenants.some((t) => t.name === d.tenant && t.unit === d.unit && t.property === d.property),
  ).length,
  0,
)
// Caught during authoring: the September statement was dated the 28th.
check('nothing is uploaded in the future', documents.filter((d) => d.uploadedAt > TODAY).length, 0)
check('nothing expires before it was uploaded', documents.filter((d) => d.expiresAt && d.expiresAt < d.uploadedAt).length, 0)
check('only leases and insurance expire', documents.filter((d) => d.expiresAt && !['lease', 'insurance'].includes(d.kind)).length, 0)
check('every size is a positive byte count', documents.filter((d) => !(d.bytes > 0)).length, 0)
check('categories are all known', documents.filter((d) => !['legal', 'finance', 'tenant', 'property', 'marketing'].includes(d.category)).length, 0)
check('statuses are all known', documents.filter((d) => !['active', 'approved', 'final', 'draft', 'archived'].includes(d.status)).length, 0)
check(
  'listing photos only exist for properties with a vacancy',
  documents.filter((d) => d.kind === 'photos' && !properties.some((p) => p.name === d.property && p.occupied < p.units)).length,
  0,
)

console.log('\nsupport cases')
check('case ids unique', new Set(cases.map((c) => c.id)).size, cases.length)
check('statuses are all known', cases.filter((c) => !['open', 'waiting', 'resolved'].includes(c.status)).length, 0)
check('priorities are all known', cases.filter((c) => !['low', 'normal', 'high'].includes(c.priority)).length, 0)
check('dates are all YYYY-MM-DD', cases.filter((c) => !/^\d{4}-\d{2}-\d{2}$/.test(c.opened) || !/^\d{4}-\d{2}-\d{2}$/.test(c.updated)).length, 0)
check('nothing was opened in the future', cases.filter((c) => c.opened > TODAY).length, 0)
// A case cannot be touched before it existed, and cannot be updated after today.
check('updated is on or after opened, and not in the future', cases.filter((c) => c.updated < c.opened || c.updated > TODAY).length, 0)
check('every case has a subject and a detail', cases.filter((c) => !c.subject?.trim() || !c.detail?.trim()).length, 0)

console.log('\ntransactions against the payment ledger')
check('only paid transactions carry a reference',
  transactions.filter((t) => t.reference && t.status !== 'paid').length, 0)
check('every paid transaction carries one',
  transactions.filter((t) => t.status === 'paid' && !t.reference).length, 0)
// The recents feed and the payments ledger show the SAME payment, so a
// reference that differs between them would have an agent quoting one code to
// support and reading another on screen.
check('references match the ledger row for the same payment',
  transactions.filter((t) => {
    const pay = payments.find((p) => p.tenant === t.tenant && p.at === t.at)
    return pay && pay.reference !== t.reference
  }).length, 0)

console.log('\nthe signed-in tenant')
const me = tenants.find((t) => t.id === 'tn1')
check('SIGNED_IN_TENANT_ID points at a real tenant', me ? 1 : 0, 1)
check('payment ids unique', new Set(tenantPayments.map((p) => p.id)).size, tenantPayments.length)
check('periods unique', new Set(tenantPayments.map((p) => p.period)).size, tenantPayments.length)
check('periods are all YYYY-MM', tenantPayments.filter((p) => !/^\d{4}-\d{2}$/.test(p.period)).length, 0)
check('nothing is paid in the future', tenantPayments.filter((p) => p.at && p.at.slice(0, 10) > TODAY).length, 0)
check('a paid month carries a method, a time and a reference',
  tenantPayments.filter((p) => p.status === 'paid' && !(p.method && p.at && p.reference)).length, 0)
// A full month must be the rent on the tenancy; only a part month may differ,
// and it must be smaller. This is what stops the history drifting from the unit.
check('full months equal the rent on the tenancy',
  tenantPayments.filter((p) => !p.note && p.amount !== me.rent).length, 0)
check('a part month is less than a full one',
  tenantPayments.filter((p) => p.note && !(p.amount < me.rent)).length, 0)
check('no month precedes the move-in',
  tenantPayments.filter((p) => p.period < me.moveIn.slice(0, 7)).length, 0)
// The landlord ledger and the tenant's own history show the SAME September
// payment. If these ever disagree the two dashboards are lying to each other.
const ledger = payments.find((p) => p.tenant === me.name)
const mine = tenantPayments.find((p) => p.period === '2026-09')
check('September matches the landlord ledger row', 
  ledger && mine && ledger.amount === mine.amount && ledger.method === mine.method
    && ledger.at === mine.at && ledger.reference === mine.reference ? 1 : 0, 1)
check('deposit is a positive amount', tenancy.deposit > 0 ? 1 : 0, 1)
check('the unit has at least one room of each kind',
  tenancy.bedrooms > 0 && tenancy.bathrooms > 0 ? 1 : 0, 1)
check('the floor is not below ground', tenancy.floor >= 0 ? 1 : 0, 1)
check('every amenity says when it can be used',
  tenancy.amenities.filter((a) => !a.name?.trim() || !a.access?.trim()).length, 0)
check('amenity names unique', new Set(tenancy.amenities.map((a) => a.name)).size, tenancy.amenities.length)

if (failures.length > 0) {
  console.error(`\n${failures.length} failed:\n` + failures.map((f) => `  - ${f}`).join('\n'))
  process.exit(1)
}
console.log('\nAll sample data reconciles.')
