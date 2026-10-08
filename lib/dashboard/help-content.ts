/**
 * Help content.
 *
 * Deliberately NOT in sample-data.ts. These answers are true statements about
 * how Gingerly behaves today, so they are content, not placeholders — the
 * sample-data chip on the page covers the support cases and the contact block,
 * which are invented, and must not be read as covering these.
 *
 * What was here before described a different product: US tenant screening with
 * credit reports, QuickBooks integration, "state-by-state compliance", ROI
 * templates, a (555) phone number. None of it existed in this codebase. Every
 * answer below names a screen, a control or an API limit that does.
 *
 * Several answers are uncomfortable — you cannot change your email, your phone
 * number or your notification preferences, and payout details still go through
 * support. They are here BECAUSE they are the things a landlord will actually
 * get stuck on. A help page that only documents the happy path sends people to
 * support with the questions it should have answered.
 *
 * Verify these against the LIVE /apispec.json, not gingerly-api.md — the
 * markdown documents 13 of the 44 paths the API actually serves and is stale.
 * The payout answer was wrong on first writing for exactly that reason: it
 * claimed no endpoint existed, when /bank-accounts has five. If the client
 * wires up an endpoint, or the API gains one, the matching answer here is
 * wrong and must change with it.
 */

export type HelpTopic =
  // The agent's topics.
  | 'Payments'
  | 'Tenants'
  | 'Properties'
  | 'Documents'
  | 'Account'
  // A tenant's. Different words because they are a different job: an agent
  // chases rent across a portfolio, a tenant pays their own and lives in the
  // flat. The chips on each screen are derived from the answers shown there,
  // so neither side sees a filter that matches nothing.
  | 'Rent'
  | 'Repairs'
  | 'Your home'
  | 'Moving out'

export interface HelpAnswer {
  id: string
  topic: HelpTopic
  question: string
  answer: string
}

export const HELP_ANSWERS: HelpAnswer[] = [
  {
    id: 'mpesa-missing',
    topic: 'Payments',
    question: 'A tenant says they paid by M-Pesa, but I cannot see it',
    answer:
      'Open Payments and look for the unit rather than the tenant — a payment sent from a phone number that is not on the tenancy still arrives, but it lands against the unit it was paid for. Check the status column before anything else: Failed with "Insufficient funds" means the money never left their account, which is the most common cause of a tenant believing they have paid.',
  },
  {
    id: 'chase-late',
    topic: 'Payments',
    question: 'How do I chase rent that is late?',
    answer:
      'The dashboard opens with the amount still outstanding and how many days are left in the period. Send reminders from there — it takes you to Payments filtered to the late units, so you are acting on the same list the figure was counted from rather than a list you assembled by hand.',
  },
  {
    id: 'payout-account',
    topic: 'Account',
    question: 'How do I change the bank account my rent is paid into?',
    answer:
      'Not from Settings yet. The Banking tab is read-only today because it has not been wired up — the API itself does support adding, updating and removing bank accounts, so this is a gap on our side rather than a missing capability. Contact support to change payout details in the meantime.',
  },
  {
    id: 'change-email',
    topic: 'Account',
    question: 'Why can I not change my email address or phone number?',
    answer:
      'Settings shows them because they are on your account, but the update endpoint currently accepts only your first name, last name and ERP settings. Everything else on that screen is displayed as stored and says so. Your phone number in particular is what M-Pesa and your one-time codes are tied to, so changing it goes through support.',
  },
  {
    id: 'notification-prefs',
    topic: 'Account',
    question: 'Are my notification settings actually saved?',
    answer:
      'Not yet. There is no preferences endpoint, so the toggles on the Notifications tab are remembered in this browser only and do not change what Gingerly actually sends you. Clearing your browser data resets them, and they will not follow you to another device. The tab says this too.',
  },
  {
    id: 'add-property',
    topic: 'Properties',
    question: 'How do I add a property and its units?',
    answer:
      'Add property, from the dashboard or from Properties. A property holds its units, and rent is set per unit rather than per property, so a block where the ground floor costs less than the upper floors does not need to be split into two properties.',
  },
  {
    id: 'onboard-tenant',
    topic: 'Tenants',
    question: 'How do I move a tenant into a unit?',
    answer:
      'Open Tenants and onboard them against the unit they are taking. A unit holding a tenant is what makes it count as occupied, so the occupancy figure on the dashboard moves as soon as the tenancy exists — if a unit you have filled still reads as vacant, the tenancy has not been recorded against it.',
  },
  {
    id: 'lease-expiry',
    topic: 'Documents',
    question: 'How do I know when a lease is about to expire?',
    answer:
      'Documents tracks expiry on leases and insurance policies, and says so at the top of the page when something is close or has already lapsed. Nothing else in Gingerly watches for this, so a lease that was never uploaded will not be counted — the warning is only as good as what is filed.',
  },
]

export interface ProductLink {
  id: string
  label: string
  description: string
  href: string
  icon: 'Building2' | 'Users' | 'CreditCard' | 'Wrench' | 'FileText' | 'Settings'
}

/**
 * Replaces a tab that listed six PDFs — "Property Management Best Practices,
 * 3.2 MB" and so on — behind Download buttons that downloaded nothing, because
 * no document store exists. Fabricated files with invented sizes are exactly
 * what DESIGN.md means by sample data presented as real.
 *
 * Every entry below navigates somewhere that exists in this app.
 */
export const PRODUCT_LINKS: ProductLink[] = [
  {
    id: 'properties',
    label: 'Properties',
    description: 'Add a property, set up its units and what each one rents for.',
    href: '/dashboard/landlord/properties',
    icon: 'Building2',
  },
  {
    id: 'tenants',
    label: 'Tenants',
    description: 'Onboard someone into a unit, or see who is in which one.',
    href: '/dashboard/landlord/tenants',
    icon: 'Users',
  },
  {
    id: 'payments',
    label: 'Payments',
    description: 'Every payment with its method and status, and who is late.',
    href: '/dashboard/landlord/payments',
    icon: 'CreditCard',
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    description: 'Jobs tenants have raised, and the contractor visits booked for them.',
    href: '/dashboard/landlord/maintenance',
    icon: 'Wrench',
  },
  {
    id: 'documents',
    label: 'Documents',
    description: 'Leases, policies and receipts, with expiry tracked on the first two.',
    href: '/dashboard/landlord/documents',
    icon: 'FileText',
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Your details and business record, and what can be changed today.',
    href: '/dashboard/landlord/settings',
    icon: 'Settings',
  },
]

/**
 * Not published yet. Chris's call: basic placeholders now, real details at
 * launch. Kept as one constant so going live is a change in one file, and
 * rendered as "Not published yet" rather than an invented number — a support
 * line that does not answer is worse than no support line, because someone
 * calls it while a tenant is standing in front of them.
 */
export const SUPPORT_CONTACT = {
  phone: null as string | null,
  email: null as string | null,
  hours: null as string | null,
}


/**
 * The tenant's answers.
 *
 * Same rule as the agent's: every one names a screen, a control or an API limit
 * that exists. The page this replaces asked whether guests could stay overnight
 * and how to open the fitness centre door — a community handbook for a building
 * that is not this one.
 *
 * The awkward ones are here for the same reason they are on the agent's side.
 * A tenant cannot pay rent through Gingerly yet, cannot download a receipt and
 * cannot raise a repair from the app; those are the three things they will try
 * first, so the answers say so plainly and point at what does work.
 */
export const TENANT_ANSWERS: HelpAnswer[] = [
  {
    id: 't-pay-rent',
    topic: 'Rent',
    question: 'How do I actually pay my rent?',
    answer:
      'Send it to your agent the way you already do — M-Pesa or a bank transfer. Gingerly cannot take the payment itself yet, so there is no Pay button that moves money. Once your agent records it, the month turns Paid on your Payments screen and the reference appears beside it.',
  },
  {
    id: 't-not-showing',
    topic: 'Rent',
    question: 'I paid but it still says the month is unpaid',
    answer:
      'It is recorded by your agent rather than matched automatically, so there is usually a gap between paying and seeing it. Check Payments first — if the month is still open after a day, message your agent with the M-Pesa reference from your confirmation SMS. There is a copy button beside every reference on that screen for exactly this.',
  },
  {
    id: 't-receipt',
    topic: 'Rent',
    question: 'Can I get a receipt?',
    answer:
      'Not from here yet — there is no receipts endpoint, so the download button on each payment is shown but cannot do anything. Your M-Pesa confirmation SMS is the proof in the meantime, and the reference on your Payments screen matches it. Ask your agent if you need something on letterhead.',
  },
  {
    id: 't-late',
    topic: 'Rent',
    question: 'What happens if I pay late?',
    answer:
      'Your unit shows as late on your agent\u2019s screen the day after rent was due, and they will usually message you. Gingerly does not charge a late fee itself — whatever your lease says is between you and your agent, so tell them early if a month is going to be difficult.',
  },
  {
    id: 't-repair',
    topic: 'Repairs',
    question: 'How do I report something broken?',
    answer:
      'The form on Maintenance has every field your agent needs, but it cannot submit yet — there is no maintenance endpoint. Fill it in to gather your thoughts if that helps, then call your agent and read it out. Once they log it, it appears in your list and you can follow it through to the visit.',
  },
  {
    id: 't-visit',
    topic: 'Repairs',
    question: 'When is the contractor coming?',
    answer:
      'Once a visit is booked it is on Maintenance and on your Calendar, with the firm and the time. Somebody needs to be in to let them in — if the day does not work, tell your agent rather than the contractor, because the booking is theirs to move.',
  },
  {
    id: 't-emergency',
    topic: 'Repairs',
    question: 'Something is actually dangerous. What now?',
    answer:
      'Do not use this app. A burst pipe, a smell of gas, exposed wiring or a security failure is a phone call to your agent, and to the building caretaker if it is quicker. Gingerly records work; it does not dispatch anyone, and nothing you type here reaches a person faster than a call.',
  },
  {
    id: 't-details',
    topic: 'Your home',
    question: 'Where do I find my lease and deposit?',
    answer:
      'Documents holds everything filed against your tenancy — the lease, your move-in inventory, the deposit receipt and any works reports. They cannot be downloaded yet, as no document store is connected, so ask your agent for a copy of anything you need to send on.',
  },
  {
    id: 't-change-details',
    topic: 'Account',
    question: 'How do I change my phone number or email?',
    answer:
      'You cannot do it yourself. The update endpoint accepts your first and last name and nothing else, which is why the rest of Settings shows your details as stored. Your phone number is what M-Pesa and your one-time codes are tied to, so it goes through your agent.',
  },
  {
    id: 't-notifications',
    topic: 'Account',
    question: 'Are my notification settings saved?',
    answer:
      'Not yet. There is no preferences endpoint, so the toggles in Settings are remembered in this browser only and do not change what Gingerly actually sends. Clearing your browser data resets them, and they will not follow you to another device.',
  },
  {
    id: 't-lease-end',
    topic: 'Moving out',
    question: 'My lease is ending. What do I need to do?',
    answer:
      'Documents shows the exact date and warns you once it is within ninety days. Renewing or leaving is a conversation with your agent rather than a button here — start it early, because a replacement tenant and an inspection both take time to arrange.',
  },
  {
    id: 't-deposit-back',
    topic: 'Moving out',
    question: 'How do I get my deposit back?',
    answer:
      'Through your agent, against the move-in inventory filed in Documents. That inventory is the record of what the flat was like when you took it, which is why it is worth reading before you move out rather than after.',
  },
]

/** Where a tenant should go instead of asking. */
export const TENANT_LINKS: ProductLink[] = [
  {
    id: 'payments',
    label: 'Payments',
    description: 'Every month you have paid, the method and the reference.',
    href: '/dashboard/tenant/payments',
    icon: 'CreditCard',
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    description: 'What you have reported and when somebody is coming.',
    href: '/dashboard/tenant/maintenance',
    icon: 'Wrench',
  },
  {
    id: 'unit',
    label: 'Your unit',
    description: 'Your lease, deposit, the building and who your agent is.',
    href: '/dashboard/tenant/home',
    icon: 'Building2',
  },
  {
    id: 'documents',
    label: 'Documents',
    description: 'The lease, your inventory and anything else on file.',
    href: '/dashboard/tenant/documents',
    icon: 'FileText',
  },
  {
    id: 'messages',
    label: 'Messages',
    description: 'Your thread with your agent, and their number.',
    href: '/dashboard/tenant/messages',
    icon: 'Users',
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Your name and password, and what else can be changed.',
    href: '/dashboard/tenant/settings',
    icon: 'Settings',
  },
]
