'use client'

import * as React from 'react'
import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { StatusBadge } from '@/components/ui/status-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { formatKes } from '@/lib/format'
import { formatFullDate, formatPeriod } from '@/lib/dashboard/tenant-view'
import type {
  StoredDocument,
  Tenant,
  TenancyDetail,
  TenantPayment,
  TxMethod,
} from '@/lib/dashboard/sample-data'

/**
 * The three tabs under the tenant's home: payments, the unit, documents.
 *
 * Carried over from the page this replaces, which had the same three. The
 * client boundary is here so the page stays a Server Component, matching the
 * landlord screens.
 *
 * Amounts are right-aligned and tabular so a column of rent reads as a column
 * of money rather than a column of text.
 */

// Building, not Landmark: Landmark is a lucide name and this codebase resolves
// icons through ICON_MAP (Material Symbols), which has no entry for it.
const METHOD_ICON: Record<TxMethod, 'Smartphone' | 'Building' | 'CreditCard'> = {
  'M-Pesa': 'Smartphone',
  'Bank transfer': 'Building',
  Card: 'CreditCard',
}

export function TenantHomePanel({
  payments,
  documents,
  tenant,
  tenancy,
  lastPaidMethod,
}: {
  payments: TenantPayment[]
  documents: StoredDocument[]
  tenant: Tenant
  tenancy: TenancyDetail
  lastPaidMethod?: TxMethod
}) {
  return (
    <Tabs defaultValue="payments" className="space-y-6">
      <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1">
        {[
          { value: 'payments', label: 'Payments', icon: 'CreditCard' as const },
          { value: 'unit', label: 'Your unit', icon: 'Home' as const },
          { value: 'documents', label: 'Documents', icon: 'FileText' as const },
        ].map((t) => (
          <TabsTrigger
            key={t.value}
            value={t.value}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm data-[state=active]:bg-background"
          >
            <Icon name={t.icon} className="h-4 w-4" />
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="payments">
        <section className="rounded-2xl border border-border bg-card">
          <header className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <h2 className="text-sm font-medium text-foreground">Recent payments</h2>
              <p className="text-sm text-muted-foreground">
                {lastPaidMethod
                  ? `You usually pay by ${lastPaidMethod}.`
                  : 'Your rent history.'}
              </p>
            </div>
            <Link
              href="/dashboard/tenant/payments"
              className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              View all
              <Icon name="ArrowRight" className="h-4 w-4" />
            </Link>
          </header>

          <ul>
            {payments.map((p, i) => (
              <li
                key={p.id}
                className={cn(
                  'flex items-center justify-between gap-4 px-5 py-3',
                  i < payments.length - 1 && 'rule-b [--rule-inset:0px]',
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon
                      name={p.method ? METHOD_ICON[p.method] : 'Clock'}
                      className="h-4 w-4"
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {formatPeriod(p.period)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.note ?? p.reference ?? 'Not yet paid'}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge tone={p.status === 'paid' ? 'success' : 'warning'} size="sm">
                    {p.status === 'paid' ? 'Paid' : 'Due'}
                  </StatusBadge>
                  <span className="text-sm font-medium text-foreground tabular-nums">
                    {formatKes(p.amount)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </TabsContent>

      <TabsContent value="unit">
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-medium text-foreground">Your unit</h2>
            <dl className="mt-4 space-y-3">
              <Row label="Unit" value={`${tenant.unit}, ${tenant.property}`} />
              <Row label="Bedrooms" value={String(tenancy.bedrooms)} />
              <Row label="Bathrooms" value={String(tenancy.bathrooms)} />
              <Row label="Floor area" value={`${tenancy.areaSqm} m²`} />
              <Row label="Furnished" value={tenancy.furnished ? 'Yes' : 'No'} last />
            </dl>

            <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              In the building
            </h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {tenancy.amenities.map((a) => (
                <li
                  key={a}
                  className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {a}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-medium text-foreground">Your lease</h2>
            <dl className="mt-4 space-y-3">
              <Row label="Moved in" value={formatFullDate(tenant.moveIn)} />
              <Row label="Lease ends" value={formatFullDate(tenant.leaseEnd)} />
              <Row label="Rent" value={`${formatKes(tenant.rent)} a month`} />
              <Row label="Deposit held" value={formatKes(tenancy.deposit)} last />
            </dl>

            <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Your agent
            </h3>
            <p className="mt-2 text-sm text-foreground">{tenancy.agent.name}</p>
            <p className="text-sm text-muted-foreground tabular-nums">{tenancy.agent.phone}</p>
          </section>
        </div>
      </TabsContent>

      <TabsContent value="documents">
        <section className="rounded-2xl border border-border bg-card">
          <header className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <h2 className="text-sm font-medium text-foreground">Your documents</h2>
              <p className="text-sm text-muted-foreground">
                Filed against your tenancy.
              </p>
            </div>
            <Link
              href="/dashboard/tenant/documents"
              className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              View all
              <Icon name="ArrowRight" className="h-4 w-4" />
            </Link>
          </header>

          {documents.length === 0 ? (
            <p className="px-5 pb-6 text-sm text-muted-foreground">
              Nothing filed against your tenancy yet.
            </p>
          ) : (
            <ul>
              {documents.map((d, i) => (
                <li
                  key={d.id}
                  className={cn(
                    'flex items-center justify-between gap-4 px-5 py-3',
                    i < documents.length - 1 && 'rule-b [--rule-inset:0px]',
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon name="FileText" className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{d.title}</p>
                      <p className="text-xs text-muted-foreground">Added {formatFullDate(d.uploadedAt)}</p>
                    </div>
                  </div>
                  {/* Not a download: there is no document store behind this. */}
                  <span className="shrink-0 text-xs capitalize text-muted-foreground">
                    {d.kind}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </TabsContent>
    </Tabs>
  )
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 pb-3',
        !last && 'rule-b [--rule-inset:0px]',
      )}
    >
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground tabular-nums">{value}</dd>
    </div>
  )
}
