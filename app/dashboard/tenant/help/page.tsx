import { HelpPanel, type HelpTab } from '@/components/dashboard/help-panel'
import { PageBanner } from '@/components/dashboard/page-banner'
import { SampleDataChip } from '@/components/dashboard/sample-data-notice'
import { StatTiles, type Figure } from '@/components/dashboard/stat-tiles'
import { TENANT_ANSWERS, TENANT_LINKS } from '@/lib/dashboard/help-content'
import { IS_SAMPLE_DATA, sampleTenantCases } from '@/lib/dashboard/sample-data'
import { formatFullDate, tenancy } from '@/lib/dashboard/tenant-view'

/**
 * Tenant help.
 *
 * The same panel the agent's help screen uses, which now takes its answers,
 * links and cases as props rather than reading one fixed set — so the two
 * screens are one object answering two different jobs.
 *
 * The page it replaces was a community handbook for a different building:
 * whether guests could stay overnight, how to open the fitness centre door, a
 * noise complaint about Unit 3C. Every answer here names a screen, a control or
 * an API limit that exists in this product.
 *
 * Three of them are uncomfortable — you cannot pay rent through Gingerly, you
 * cannot download a receipt, you cannot raise a repair from the app. They are
 * first because they are the three things a tenant will try first, and finding
 * out by failing is worse than being told.
 */

/** Case ages count from here, so server and client agree. */
const AS_OF = '2026-09-21'

export default async function TenantHelpPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const initialTab: HelpTab = (['answers', 'cases', 'guide', 'contact'] as const).includes(
    tab as HelpTab,
  )
    ? (tab as HelpTab)
    : 'answers'

  const cases = sampleTenantCases
  const open = cases.filter((c) => c.status !== 'resolved')
  const waiting = cases.filter((c) => c.status === 'waiting')
  const topics = new Set(TENANT_ANSWERS.map((a) => a.topic))

  const oldest = open.reduce<string | null>(
    (worst, c) => (worst === null || c.opened < worst ? c.opened : worst),
    null,
  )
  const daysOpen = oldest
    ? Math.floor((new Date(AS_OF).getTime() - new Date(oldest).getTime()) / 86_400_000)
    : 0

  const figures: Figure[] = [
    { label: 'Answers', value: String(TENANT_ANSWERS.length), icon: 'HelpCircle' },
    { label: 'Topics', value: String(topics.size), icon: 'Book' },
    { label: 'Open cases', value: String(open.length), icon: 'MessageSquare' },
    {
      label: 'Resolved',
      value: String(cases.length - open.length),
      icon: 'CheckCircle',
    },
  ]

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Help</h1>
          {IS_SAMPLE_DATA ? (
            <SampleDataChip detail="The support cases and contact details here are placeholders — no support endpoint exists yet, so nothing can be opened or replied to. The answers themselves are accurate." />
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">
            {TENANT_ANSWERS.length}
          </span>{' '}
          answers across <span className="tabular-nums">{topics.size}</span> topics &middot;{' '}
          <span className="tabular-nums">{open.length}</span>{' '}
          {open.length === 1 ? 'case' : 'cases'} open
        </p>
      </header>

      {waiting.length > 0 ? (
        <PageBanner
          id="help-banner"
          eyebrow="Waiting on you"
          title={
            <>
              {waiting.length} {waiting.length === 1 ? 'case needs' : 'cases need'} something
              from you
            </>
          }
          description={
            <>
              The oldest has been open{' '}
              <span className="tabular-nums">{daysOpen}</span>{' '}
              {daysOpen === 1 ? 'day' : 'days'} &middot; {waiting[0].subject}
            </>
          }
          action={{ href: '/dashboard/tenant/help?tab=cases', label: 'Open cases' }}
        />
      ) : (
        <PageBanner
          id="help-banner"
          tone="calm"
          icon="HelpCircle"
          eyebrow="Help"
          title="Nothing is waiting on you"
          description={
            <>
              Search the answers below, or call {tenancy.agent.name} on {tenancy.agent.phone}{' '}
              if it is urgent.
            </>
          }
        />
      )}

      <StatTiles figures={figures} label="Help and support" id="help-figures" />

      <HelpPanel
        cases={cases}
        initialTab={initialTab}
        answers={TENANT_ANSWERS}
        links={TENANT_LINKS}
        casesNote={`There is no support endpoint on the API yet, so cases cannot be opened from here. Call ${tenancy.agent.name} on ${tenancy.agent.phone} and they will raise one. The last was updated ${formatFullDate(cases[0].updated)}.`}
      />
    </div>
  )
}
