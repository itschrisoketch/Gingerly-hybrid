'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Icon } from '@/components/ui/icon'
import { StatusBadge } from '@/components/ui/status-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  HELP_ANSWERS,
  PRODUCT_LINKS,
  SUPPORT_CONTACT,
  type HelpAnswer,
  type HelpTopic,
} from '@/lib/dashboard/help-content'
import type { SupportCase } from '@/lib/dashboard/sample-data'

/**
 * The help screen's four tabs.
 *
 * The client boundary is here rather than on the page, so the page stays a
 * Server Component — the same split documents and messages use.
 *
 * Two things the old version showed but did not do, both fixed here because a
 * control that does nothing is worse than no control: the FAQ search was a bare
 * <Input type="search"> with no state behind it, and every answer carried a
 * chevron implying an accordion while being permanently expanded. Search now
 * filters, and the chevron now opens something.
 *
 * The search field is a raw <input> with the house classes rather than
 * <Input className="input-modern" />, matching documents-table. That is not
 * only for consistency: `.input-modern` @applies px-4 and lands later in the
 * utilities layer, so a pl-10 beside it never wins and the placeholder runs
 * under the search icon — the bug this very page had.
 *
 * WCAG 2.2 "Consistent Help" (A) wants repeated help mechanisms to keep a
 * consistent relative position, so Contact is always the last tab and the
 * contact block always sits at the top of it.
 */

export type HelpTab = 'answers' | 'cases' | 'guide' | 'contact'

const TABS: { value: HelpTab; label: string; icon: 'HelpCircle' | 'MessageSquare' | 'Book' | 'Phone' }[] = [
  { value: 'answers', label: 'Answers', icon: 'HelpCircle' },
  { value: 'cases', label: 'Support cases', icon: 'MessageSquare' },
  { value: 'guide', label: 'Where things live', icon: 'Book' },
  { value: 'contact', label: 'Contact', icon: 'Phone' },
]

const TOPICS: HelpTopic[] = ['Payments', 'Tenants', 'Properties', 'Documents', 'Account']

/**
 * Folds case, hyphens and spaces away before matching.
 *
 * Found by testing rather than by reading: the most important answer on this
 * page is about M-Pesa, and searching "mpesa" — which is how most people type
 * it — matched nothing at all, because the copy spells it "M-Pesa". A help
 * search that fails on the product's own most common term is worse than no
 * search, since it answers "we have nothing on that".
 */
function normalise(value: string) {
  return value.toLowerCase().replace(/[\s-]+/g, '')
}

export function HelpPanel({
  cases,
  initialTab = 'answers',
}: {
  cases: SupportCase[]
  initialTab?: HelpTab
}) {
  const [tab, setTab] = React.useState<HelpTab>(initialTab)

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as HelpTab)} className="space-y-6">
      <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1 lg:grid-cols-4">
        {TABS.map((t) => (
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

      <TabsContent value="answers">
        <AnswersTab />
      </TabsContent>

      <TabsContent value="cases">
        <CasesTab cases={cases} />
      </TabsContent>

      <TabsContent value="guide">
        <GuideTab />
      </TabsContent>

      <TabsContent value="contact">
        <ContactTab />
      </TabsContent>
    </Tabs>
  )
}

/* ------------------------------------------------------------------ */

function AnswersTab() {
  const [query, setQuery] = React.useState('')
  const [topic, setTopic] = React.useState<HelpTopic | 'all'>('all')

  const results = React.useMemo(() => {
    const q = normalise(query)
    return HELP_ANSWERS.filter((a) => {
      if (topic !== 'all' && a.topic !== topic) return false
      if (!q) return true
      // The answer body is searched too, not just the question. Someone typing
      // "mpesa" is describing their situation, not quoting our heading.
      return normalise(`${a.question} ${a.answer} ${a.topic}`).includes(q)
    })
  }, [query, topic])

  const reset = () => {
    setQuery('')
    setTopic('all')
  }

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
        <div className="relative sm:w-72">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <Icon name="Search" className="h-4 w-4" />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search answers"
            aria-label="Search help answers by question, answer text or topic"
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <TopicChip active={topic === 'all'} onClick={() => setTopic('all')}>
            All
          </TopicChip>
          {TOPICS.map((t) => (
            <TopicChip key={t} active={topic === t} onClick={() => setTopic(t)}>
              {t}
            </TopicChip>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <Icon name="Search" className="h-6 w-6 text-muted-foreground" />
          <p className="font-medium text-foreground">No answer matches that</p>
          <p className="max-w-[44ch] text-sm text-muted-foreground">
            Questions, answers and topics are all searched. If nothing here covers it, open a
            support case and a person will pick it up.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-2 flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Clear search
          </button>
        </div>
      ) : (
        <Accordion type="single" collapsible className="px-5 pb-2">
          {results.map((a) => (
            <AnswerRow key={a.id} answer={a} />
          ))}
        </Accordion>
      )}
    </section>
  )
}

function AnswerRow({ answer }: { answer: HelpAnswer }) {
  return (
    <AccordionItem value={answer.id} className="rule-b border-b-0">
      <AccordionTrigger className="gap-4 py-4 text-left hover:no-underline">
        <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <span className="text-sm font-medium text-foreground">{answer.question}</span>
          <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {answer.topic}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="max-w-[72ch] pb-4 text-sm leading-relaxed text-muted-foreground">
        {answer.answer}
      </AccordionContent>
    </AccordionItem>
  )
}

function TopicChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-8 rounded-lg px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
        active
          ? 'bg-accent text-accent-foreground'
          : 'border border-border text-muted-foreground hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */

const CASE_TONE = {
  open: 'warning',
  waiting: 'info',
  resolved: 'success',
} as const

/** Spelled out rather than capitalising the raw status, so "waiting" reads as
 *  who it is waiting on — the one thing an agent needs from this column. */
const CASE_LABEL = {
  open: 'Open',
  waiting: 'Waiting on you',
  resolved: 'Resolved',
} as const

function CasesTab({ cases }: { cases: SupportCase[] }) {
  return (
    <section className="space-y-4">
      {/* Says plainly that the button cannot do anything yet, rather than
          offering a control that silently discards what someone types. */}
      <p className="flex items-start gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <Icon name="Info" className="mt-0.5 h-4 w-4 shrink-0" />
        There is no support endpoint on the API yet, so cases cannot be opened from here. These
        three are placeholders showing how they will read.
      </p>

      <div className="rounded-2xl border border-border bg-card">
        {cases.map((c, i) => (
          <article
            key={c.id}
            className={cn(
              'flex flex-col gap-2 p-5',
              i < cases.length - 1 && 'rule-b',
            )}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h3 className="text-sm font-medium text-foreground">{c.subject}</h3>
              <StatusBadge tone={CASE_TONE[c.status]}>{CASE_LABEL[c.status]}</StatusBadge>
              {c.priority === 'high' ? <StatusBadge tone="danger">High</StatusBadge> : null}
            </div>

            <p className="max-w-[80ch] text-sm text-muted-foreground">{c.detail}</p>

            <p className="text-xs text-muted-foreground tabular-nums">
              {c.id} &middot; opened {c.opened} &middot; updated {c.updated}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function GuideTab() {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {PRODUCT_LINKS.map((l) => (
        <Link
          key={l.id}
          href={l.href}
          className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Icon name={l.icon} className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              {l.label}
              <Icon
                name="ArrowRight"
                className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              />
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">{l.description}</span>
          </span>
        </Link>
      ))}
    </section>
  )
}

/* ------------------------------------------------------------------ */

function ContactTab() {
  const { phone, email, hours } = SUPPORT_CONTACT

  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <ContactCard icon="Phone" label="Support line" value={phone} />
        <ContactCard icon="Mail" label="Email" value={email} />
        <ContactCard icon="Clock" label="Hours" value={hours} />
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <Icon name="Info" className="mt-0.5 h-4 w-4 shrink-0" />
        Support contact details are not published yet and will be filled in before launch. Until
        then, the fastest route to a person is the agent you were onboarded by.
      </p>
    </section>
  )
}

function ContactCard({
  icon,
  label,
  value,
}: {
  icon: 'Phone' | 'Mail' | 'Clock'
  label: string
  value: string | null
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      {/* Never an invented number. A support line that does not answer is worse
          than no support line. */}
      <p className={cn('mt-1 text-sm', value ? 'text-foreground' : 'italic text-muted-foreground')}>
        {value ?? 'Not published yet'}
      </p>
    </div>
  )
}
