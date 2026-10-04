import { PageBanner } from '@/components/dashboard/page-banner'
import { SampleDataChip } from '@/components/dashboard/sample-data-notice'
import { StatTiles, type Figure } from '@/components/dashboard/stat-tiles'
import { TenantThread } from '@/components/dashboard/tenant/tenant-thread'
import { IS_SAMPLE_DATA, sampleConversations } from '@/lib/dashboard/sample-data'
import { TOPIC, lastMessage } from '@/lib/dashboard/message-meta'
import { me, tenancy } from '@/lib/dashboard/tenant-view'

/**
 * The tenant's messages.
 *
 * One thread with their agent, not the agent's two-pane triage screen — see
 * TenantThread for why the list pane is wrong on this side.
 *
 * The page it replaces had a thread with "John Doe" and two invented
 * correspondents, "Property Management" and "Maintenance Team", neither of
 * which is anything in this product. A tenant here talks to the agent who
 * onboarded them, and the conversation is the one already in the data — the
 * same thread the agent sees from their side.
 *
 * The banner answers the only question worth answering on arrival: is anyone
 * waiting on me, or am I waiting on them.
 */

/** Relative headings are measured from here, so server and client agree. */
const AS_OF = '2026-09-21T09:00:00Z'

export default function TenantMessagesPage() {
  const mine = sampleConversations.filter((c) => c.tenant === me.name)

  const messages = mine.reduce((n, c) => n + c.messages.length, 0)
  const unread = mine.reduce((n, c) => n + c.unread, 0)

  // Whoever spoke last decides who the ball is with. Derived from the thread
  // rather than stored, so it cannot go stale.
  const latest = mine
    .map(lastMessage)
    .filter(Boolean)
    .sort((a, b) => (a!.at < b!.at ? 1 : -1))[0]
  const waitingOnAgent = latest?.from === 'tenant'

  const hoursSince = latest
    ? Math.max(
        Math.floor((new Date(AS_OF).getTime() - new Date(latest.at).getTime()) / 3_600_000),
        0,
      )
    : 0

  const figures: Figure[] = [
    { label: 'Messages', value: String(messages), icon: 'MessageSquare' },
    { label: 'Unread', value: String(unread), icon: 'Bell' },
    {
      label: 'Last activity',
      value: hoursSince < 24 ? `${hoursSince}h ago` : `${Math.floor(hoursSince / 24)}d ago`,
      icon: 'Clock',
      compact: true,
    },
    {
      label: 'Topics',
      value: String(new Set(mine.map((c) => c.topic)).size),
      icon: 'Filter',
    },
  ]

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Messages</h1>
          {IS_SAMPLE_DATA ? (
            <SampleDataChip detail="This thread is a placeholder for design review. No messaging endpoint exists yet, so nothing sent from here reaches anybody." />
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          You and {tenancy.agent.name} about {me.unit}, {me.property}
        </p>
      </header>

      {mine.length === 0 ? null : waitingOnAgent ? (
        <PageBanner
          id="messages-banner"
          tone="calm"
          icon="Clock"
          eyebrow="Waiting on a reply"
          title={<>{tenancy.agent.name} has not replied yet</>}
          description={
            <>
              You sent the last message{' '}
              {hoursSince < 24 ? (
                <>
                  <span className="tabular-nums">{hoursSince}</span>{' '}
                  {hoursSince === 1 ? 'hour' : 'hours'} ago
                </>
              ) : (
                <>
                  <span className="tabular-nums">{Math.floor(hoursSince / 24)}</span> days ago
                </>
              )}
              . If it is urgent, call {tenancy.agent.phone}.
            </>
          }
        />
      ) : (
        <PageBanner
          id="messages-banner"
          tone="calm"
          icon="CheckCircle"
          eyebrow={`Last word · ${TOPIC[mine[0].topic].label}`}
          title={<>{tenancy.agent.name} replied to you</>}
          description="Nothing is waiting on either of you. Send a message below if you need anything."
        />
      )}

      <StatTiles figures={figures} label="Your messages" id="messages-figures" />

      <TenantThread conversations={mine} asOf={AS_OF} agentName={tenancy.agent.name} />
    </div>
  )
}
