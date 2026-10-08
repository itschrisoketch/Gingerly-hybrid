import { HelpPanel, type HelpTab } from '@/components/dashboard/help-panel'
import { PageBanner } from '@/components/dashboard/page-banner'
import { SampleDataChip } from '@/components/dashboard/sample-data-notice'
import { StatTiles, type Figure } from '@/components/dashboard/stat-tiles'
import { HELP_ANSWERS } from '@/lib/dashboard/help-content'
import { IS_SAMPLE_DATA, sampleSupportCases } from '@/lib/dashboard/sample-data'

/**
 * Help.
 *
 * The last landlord screen on the old system, and the rebuild was as much about
 * the copy as the markup. What was here described a different product: US
 * tenant screening with credit reports and employment verification, QuickBooks
 * integration, "state-by-state" compliance, ROI templates, a (555) phone
 * number, and six downloadable PDFs with invented file sizes behind buttons
 * that downloaded nothing. A landlord reading it would have learned things
 * about Gingerly that are not true.
 *
 * Every answer now names a screen, a control or an API limit that exists — see
 * lib/dashboard/help-content.ts, including why the awkward ones (you cannot
 * change your own payout account, email, or notification preferences) are
 * stated rather than omitted.
 *
 * Shape follows the other ten landlord pages: header with the sample-data chip
 * and one line of derived context, a banner only when something is outstanding,
 * the figure row, then the panel.
 */

/** Case ages are measured from here, so the server and client agree. */
const AS_OF = '2026-09-21'

export default async function LandlordHelpPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  // Deep-linkable tabs: the banner below points at ?tab=cases, so the action it
  // names lands on the thing it is talking about rather than the default tab.
  const { tab } = await searchParams
  const initialTab: HelpTab = (['answers', 'cases', 'guide', 'contact'] as const).includes(
    tab as HelpTab,
  )
    ? (tab as HelpTab)
    : 'answers'

  const cases = sampleSupportCases
  const open = cases.filter((c) => c.status !== 'resolved')
  const waiting = cases.filter((c) => c.status === 'waiting')
  const topics = new Set(HELP_ANSWERS.map((a) => a.topic))

  const oldest = open.reduce<string | null>(
    (worst, c) => (worst === null || c.opened < worst ? c.opened : worst),
    null,
  )
  const daysOpen = oldest
    ? Math.floor(
        (new Date(AS_OF).getTime() - new Date(oldest).getTime()) / 86_400_000,
      )
    : 0

  const figures: Figure[] = [
    { label: 'Answers', value: String(HELP_ANSWERS.length), icon: 'HelpCircle' },
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
            <SampleDataChip detail="The support cases and contact details on this page are placeholders — no support endpoint exists yet, so nothing here can be opened or replied to. The answers themselves are accurate." />
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">
            {HELP_ANSWERS.length}
          </span>{' '}
          answers across <span className="tabular-nums">{topics.size}</span> topics &middot;{' '}
          <span className="tabular-nums">{open.length}</span>{' '}
          {open.length === 1 ? 'case' : 'cases'} open
        </p>
      </header>

      {/* Only when something is actually waiting on this agent. A banner that
          says "welcome to help" is the decoration PRODUCT.md rules out. */}
      {waiting.length > 0 ? (
        <PageBanner
          id="help-banner"
          eyebrow="Waiting on you"
          title={
            <>
              {waiting.length} {waiting.length === 1 ? 'case needs' : 'cases need'} a reply from
              you
            </>
          }
          description={
            <>
              The oldest has been open{' '}
              <span className="tabular-nums">{daysOpen}</span>{' '}
              {daysOpen === 1 ? 'day' : 'days'}
            </>
          }
          action={{ href: '/dashboard/landlord/help?tab=cases', label: 'Open cases' }}
        />
      ) : null}

      <StatTiles figures={figures} label="Help and support" id="help-figures" />

      <HelpPanel cases={cases} initialTab={initialTab} />
    </div>
  )
}
