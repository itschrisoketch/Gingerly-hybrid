import { AuthBrandPanel } from '@/components/auth/auth-brand-panel'
import { Icon } from '@/components/ui/icon'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-auth-shell
      className="min-h-screen font-body lg:grid lg:grid-cols-[1fr_minmax(420px,45%)]"
    >
      <main className="flex flex-col px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
        {/* Mobile-only wordmark; the panel below lg is hidden. */}
        <div className="flex items-center gap-2 lg:hidden">
          <Icon name="Building2" className="h-6 w-6 text-foreground" />
          <span className="text-lg font-medium tracking-tight text-foreground">Gingerly</span>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          {/* max-w-md, not max-w-sm: the signup forms lay first/last name out as
              `sm:grid-cols-2`, which needs the wider column to avoid two cramped
              ~180px fields. Login is comfortable at this width too. */}
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>

      <AuthBrandPanel />
    </div>
  )
}
