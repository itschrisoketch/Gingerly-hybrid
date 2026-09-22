import { DocumentsTable } from '@/components/dashboard/documents-table'
import { DocumentUploadModal } from '@/components/dashboard/document-upload-modal'
import { PageBanner } from '@/components/dashboard/page-banner'
import { SampleDataChip } from '@/components/dashboard/sample-data-notice'
import { StatTiles, type Figure } from '@/components/dashboard/stat-tiles'
import { daysUntil, expiringSoon, formatBytes } from '@/lib/dashboard/document-meta'
import {
  IS_SAMPLE_DATA,
  sampleDocuments,
  sampleProperties,
} from '@/lib/dashboard/sample-data'

/**
 * Documents.
 *
 * Rebuilt on the page that was here rather than in place of it — every feature
 * it had survives: the upload action, the search, the category / property /
 * status filters, the four figures at the top, and View / Download / Share on
 * each row. The filters now do something, which they did not: all three were
 * `<Select defaultValue="all">` with no state behind them.
 *
 * What is new is expiry. A lease or an insurance policy that runs out is the one
 * exposure a document store can see and nothing else in the product can, so it
 * is the banner, a filter and a column.
 */

/** Expiry is measured from here, so the server and client agree. */
const AS_OF = '2026-09-21'

export default function DocumentsPage() {
  const documents = sampleDocuments

  const expiring = documents
    .filter((d) => expiringSoon(d, AS_OF))
    .sort((a, b) => daysUntil(a.expiresAt!, AS_OF) - daysUntil(b.expiresAt!, AS_OF))
  const lapsed = expiring.filter((d) => daysUntil(d.expiresAt!, AS_OF) < 0)
  const soonest = expiring[0]

  const leases = documents.filter((d) => d.kind === 'lease' && d.status === 'active')
  const finance = documents.filter((d) => d.category === 'finance')
  const legal = documents.filter((d) => d.category === 'legal')
  const totalBytes = documents.reduce((n, d) => n + d.bytes, 0)

  // The four figures the previous page showed, with storage added — it is the
  // number a filing cabinet is asked about and was the obvious gap.
  const figures: Figure[] = [
    {
      label: 'Documents',
      value: String(documents.length),
      icon: 'FileText',
    },
    { label: 'Active leases', value: String(leases.length), icon: 'FileCheck' },
    { label: 'Legal & finance', value: String(legal.length + finance.length), icon: 'Shield' },
    { label: 'Stored', value: formatBytes(totalBytes), icon: 'Archive', compact: true },
  ]

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Documents</h1>
            {IS_SAMPLE_DATA ? (
              <SampleDataChip detail="These files are placeholders for design review. No document store is connected yet, so nothing here can be opened, downloaded or shared." />
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">
              {documents.length}
            </span>{' '}
            files across <span className="tabular-nums">{sampleProperties.length}</span>{' '}
            properties &middot;{' '}
            <span className="tabular-nums">{formatBytes(totalBytes)}</span> stored
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <DocumentUploadModal properties={sampleProperties.map((p) => p.name)} />
        </div>
      </header>

      {/* Expiry is this page's exception. Nothing else in the product notices a
          policy lapsing. */}
      {expiring.length > 0 && soonest?.expiresAt ? (
        <PageBanner
          id="documents-banner"
          eyebrow={lapsed.length > 0 ? 'Out of date' : 'Expiring soon'}
          title={
            <>
              {expiring.length} {expiring.length === 1 ? 'document needs' : 'documents need'}{' '}
              renewing
            </>
          }
          description={
            <>
              {lapsed.length > 0 ? (
                <>
                  <span className="tabular-nums">{lapsed.length}</span>{' '}
                  {lapsed.length === 1 ? 'has' : 'have'} already lapsed &middot;{' '}
                </>
              ) : null}
              The next is {soonest.title.toLowerCase()}, in{' '}
              <span className="tabular-nums">{daysUntil(soonest.expiresAt, AS_OF)}</span> days
            </>
          }
          action={{ href: '/dashboard/landlord/tenants', label: 'Open tenants' }}
        />
      ) : null}

      <StatTiles figures={figures} label="Document store" id="documents-figures" />

      <DocumentsTable documents={documents} asOf={AS_OF} />
    </div>
  )
}
