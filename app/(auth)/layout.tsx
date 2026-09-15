import { AuthBrandPanel } from '@/components/auth/auth-brand-panel'
import { Wordmark } from '@/components/wordmark'

/**
 * Shell for /login, /signup and /verify-account.
 *
 * `data-auth-shell` is load-bearing, not decorative: globals.css sets an
 * explicit `font-family: var(--font-sans)` on h1-h6, p, a, span, div, input and
 * button inside @layer base, which a class on this element cannot override.
 * A scoped rule keyed to this attribute is what puts the auth flow in Inter
 * Tight. Remove the attribute and every page here silently reverts to Jost.
 *
 * Layout is two inset panels floating on a page gutter rather than two flush
 * halves — the gutter is what stops the dark panel reading as a browser chrome
 * edge. Below `lg` the panel is dropped entirely rather than stacked, so the
 * first thing on a phone is the form, not a screen of branding to scroll past.
 *
 * The form region precedes the panel in DOM order so keyboard and screen-reader
 * users reach the form first; the visual arrangement is the grid's job.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-auth-shell
      className="min-h-screen bg-muted/40 font-body lg:p-3"
    >
      <div className="grid min-h-screen gap-3 lg:min-h-[calc(100vh-1.5rem)] lg:grid-cols-[1fr_minmax(420px,45%)]">
        <main className="flex flex-col rounded-none border-border/60 bg-background px-6 py-10 sm:px-10 lg:rounded-2xl lg:border lg:px-14 lg:py-14">
          {/* Wordmark for the widths where the brand panel is not rendered. */}
          <div className="text-foreground lg:hidden">
            <Wordmark className="h-7" />
          </div>

          <div className="flex flex-1 items-center justify-center py-10">
            {/* max-w-md, not max-w-sm: the signup forms lay first/last name out
                as `sm:grid-cols-2`, which needs the wider column to avoid two
                cramped ~180px fields. Login is comfortable at this width too. */}
            <div className="w-full max-w-md">{children}</div>
          </div>
        </main>

        <AuthBrandPanel />
      </div>
    </div>
  )
}
