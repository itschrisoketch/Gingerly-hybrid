import { PageBanner } from '@/components/dashboard/page-banner'
import { SampleDataChip } from '@/components/dashboard/sample-data-notice'
import { StatTiles, type Figure } from '@/components/dashboard/stat-tiles'
import { TenantDocuments } from '@/components/dashboard/tenant/tenant-documents'
import { Icon } from '@/components/ui/icon'
import { IS_SAMPLE_DATA } from '@/lib/dashboard/sample-data'
import { formatBytes } from '@/lib/dashboard/document-meta'
import { daysBetween, formatFullDate, me, myDocuments } from '@/lib/dashboard/tenant-view'

/**
 * The tenant's documents.
 *
 * Mirrors its sibling, the agent's documents screen — banner, figures, then the
 * list — but scoped to one tenancy. See TenantDocuments for why the agent's
 * table and its property filter are the wrong shape on this side.
 *
 * The page it replaces had four sections (legal, payment receipts, maintenance,
 * everything), two filters and a search, none of which were wired to anything,
 * and Download and Share buttons on every row. There is no document store, so
 * nothing can be opened: those two buttons are gone rather than present and
 * dead, and the page says why once, at the top.
 *
 * The banner is the lease. It is the only document here with a deadline, and the
 * date it carries is the same one the tenancy is built from, so the two cannot
 * disagree.
 */

/** Expiry is measured from here, so server and client agree. */
const AS_OF = '2026-09-21'

export default function TenantDocumentsPage() {
  const documents = myDocuments
  const lease = documents.find((d) => d.kind === 'lease')
  const totalBytes = documents.reduce((n, d) => n + d.bytes, 0)
  const categories = new Set(documents.map((d) => d.category))

  const leaseDaysLeft = lease?.expiresAt ? daysBetween(AS_OF, lease.expiresAt) : null
  const leaseMonthsLeft = leaseDaysLeft === null ? null : Math.round(leaseDaysLeft / 30)

  const figures: Figure[] = [
    { label: 'Documents', value: String(documents.length), icon: 'FileText' },
    {
      label: 'Lease ends',
      value: lease?.expiresAt ? formatFullDate(lease.expiresAt).replace(/ \d{4}$/, '') : '—',
      icon: 'FileCheck',
      compact: true,
    },
    { label: 'Categories', value: String(categories.size), icon: 'Filter' },
    { label: 'Stored', value: formatBytes(totalBytes), icon: 'Archive', compact: true },
  ]

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Documents</h1>
          {IS_SAMPLE_DATA ? (
            <SampleDataChip detail="These files are placeholders for design review. No document store is connected yet, so nothing here can be opened, downloaded or shared." />
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Filed against {me.unit}, {me.property} &middot;{' '}
          <span className="tabular-nums">{documents.length}</span>{' '}
          {documents.length === 1 ? 'document' : 'documents'}
        </p>
      </header>

      {lease?.expiresAt && leaseMonthsLeft !== null ? (
        leaseDaysLeft !== null && leaseDaysLeft <= 90 ? (
          <PageBanner
            id="documents-banner"
            eyebrow="Lease ending"
            title={
              <>
                Your lease runs out in{' '}
                <span className="tabular-nums">{leaseMonthsLeft}</span>{' '}
                {leaseMonthsLeft === 1 ? 'month' : 'months'}
              </>
            }
            description={
              <>
                It ends {formatFullDate(lease.expiresAt)}. Talk to your agent about renewing
                before then.
              </>
            }
            action={{ href: '/dashboard/tenant/messages', label: 'Message your agent' }}
          />
        ) : (
          <PageBanner
            id="documents-banner"
            tone="calm"
            icon="FileCheck"
            eyebrow="Lease"
            title={<>Your tenancy runs to {formatFullDate(lease.expiresAt)}</>}
            description={
              <>
                <span className="tabular-nums">{leaseMonthsLeft}</span> months left. Nothing
                filed here needs renewing before then.
              </>
            }
          />
        )
      ) : null}

      <StatTiles figures={figures} label="Your documents" id="documents-figures" />

      {/* Said once, rather than as a disabled Download and Share on every row. */}
      <div className="flex items-start gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3">
        <Icon name="Info" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          There is no document store connected yet, so these cannot be opened, downloaded or
          shared. Ask your agent for a copy of anything you need.
        </p>
      </div>

      <TenantDocuments documents={documents} />
    </div>
  )
}
