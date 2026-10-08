import { SettingsPanel } from '@/components/dashboard/settings/settings-panel'
import { Icon } from '@/components/ui/icon'

/**
 * Settings.
 *
 * The one screen in this dashboard that shows real account data rather than
 * sample data, so there is no sample-data chip here — everything comes from
 * `/auth/my-account` for the signed-in merchant.
 *
 * All six tabs from the previous version survive. Three of them can genuinely
 * save; the rest are read-only and say why. See the note in
 * `components/dashboard/settings/settings-panel.tsx` for the endpoint audit.
 *
 * No banner: a settings page has no outstanding action to announce, and a teal
 * strip saying "these are your settings" would be the decoration PRODUCT.md
 * rules out.
 *
 * The column is capped at 4xl rather than the dashboard's 7xl — see below.
 */
export default function SettingsPage() {
  return (
    /* Narrower than the rest of the dashboard on purpose. The other screens are
       tables and charts that use every pixel; this is a form, and a text input
       stretched to 1280px is hard to scan and hard to fill. The header is inside
       the same wrapper so the title lines up with the cards under it. */
    <div className="max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
          <Icon name="User" className="mt-0.5 h-4 w-4 shrink-0" />
          Your account, business details and how Gingerly reaches you
        </p>
      </header>

      <SettingsPanel />
    </div>
  )
}
