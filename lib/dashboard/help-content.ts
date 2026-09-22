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
 * Several answers are uncomfortable — you cannot change your own payout bank
 * account, your email, or your notification preferences. They are here BECAUSE
 * they are the things a landlord will actually get stuck on. A help page that
 * only documents the happy path sends people to support with the questions it
 * should have answered. Each of these is traceable to the endpoint audit in
 * components/dashboard/settings/settings-panel.tsx — if the API gains an
 * endpoint, the matching answer here is wrong and must change with it.
 */

export type HelpTopic = 'Payments' | 'Tenants' | 'Properties' | 'Documents' | 'Account'

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
      'You cannot change it yourself. Payout details are captured once when your account is created and there is no endpoint to update them, which is why the Banking tab in Settings is read-only. Contact support to change them. This is deliberate rather than missing — a payout account that can be changed from a signed-in session is the single most valuable thing for someone who has taken over an account.',
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
