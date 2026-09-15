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
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>

      <AuthBrandPanel />
    </div>
  )
}
