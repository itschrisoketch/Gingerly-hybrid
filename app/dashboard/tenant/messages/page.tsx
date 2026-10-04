import { PageBanner } from '@/components/dashboard/page-banner'
import { SampleDataChip } from '@/components/dashboard/sample-data-notice'
import { StatTiles, type Figure } from '@/components/dashboard/stat-tiles'
import { TenantThread } from '@/components/dashboard/tenant/tenant-thread'
import { Icon } from '@/components/ui/icon'
import Link from 'next/link'
import { IS_SAMPLE_DATA, sampleConversations } from '@/lib/dashboard/sample-data'
import { TOPIC, lastMessage } from '@/lib/dashboard/message-meta'
import { me, tenancy } from '@/lib/dashboard/tenant-view'
import { cn } from '@/lib/utils'

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

      {/* The thread beside its context rather than alone. On its own it ran the
          full width of the page and was the only thing on it, which made a
          quiet conversation look like the whole job. The two cards here are the
          questions a tenant actually has next to a message box: how else do I
          reach this person, and is messaging even the right way to ask. */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TenantThread conversations={mine} asOf={AS_OF} agentName={tenancy.agent.name} />
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-medium text-foreground">Other ways to reach them</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Messages here are not delivered yet, so for anything urgent use the phone.
            </p>

            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent-text">
                {tenancy.agent.name
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('')}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{tenancy.agent.name}</p>
                <p className="text-xs text-muted-foreground">Your agent</p>
              </div>
            </div>

            <a
              href={`tel:${tenancy.agent.phone.replace(/\s/g, '')}`}
              className="mt-4 flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <Icon name="Phone" className="h-4 w-4" />
              <span className="whitespace-nowrap tabular-nums">{tenancy.agent.phone}</span>
            </a>
          </section>

          <section className="rounded-2xl border border-border bg-card">
            <header className="p-5 pb-3">
              <h2 className="text-sm font-medium text-foreground">Try this first</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Some things have their own screen, and get dealt with faster there than in a
                message.
              </p>
            </header>

            <ul className="pb-2">
              {ROUTES.map((r, i) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className={cn(
                      'group flex items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40',
                      i < ROUTES.length - 1 && 'rule-b',
                    )}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon name={r.icon} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        {r.label}
                        <Icon
                          name="ArrowRight"
                          className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {r.detail}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}

/** Where a question belongs when it is not really a message. Every one of these
 *  screens exists and does the thing described. */
const ROUTES: { href: string; label: string; detail: string; icon: 'Wrench' | 'CreditCard' | 'FileText' }[] = [
  {
    href: '/dashboard/tenant/maintenance',
    label: 'Something is broken',
    detail: 'Raise it as a request so it is tracked and a contractor can be booked.',
    icon: 'Wrench',
  },
  {
    href: '/dashboard/tenant/payments',
    label: 'A payment question',
    detail: 'Check the reference and status of every month you have paid.',
    icon: 'CreditCard',
  },
  {
    href: '/dashboard/tenant/documents',
    label: 'Your lease or deposit',
    detail: 'The agreement and anything else filed against your tenancy.',
    icon: 'FileText',
  },
]
