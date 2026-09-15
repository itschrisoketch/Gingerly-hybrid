import { Icon } from '@/components/ui/icon'

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden lg:flex flex-col justify-between bg-navy-500 p-12 text-white">
      <div className="flex items-center gap-2">
        <Icon name="Building2" className="h-6 w-6" />
        <span className="text-lg font-medium tracking-tight">Gingerly</span>
      </div>

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-widest text-teal-100 font-semibold">
          Rental payments
        </p>
        <p className="text-4xl leading-tight [text-wrap:balance]">
          Collect Recurring Payments{' '}
          <span className="font-display italic">Automatically</span>
        </p>
      </div>

      <p className="text-xs text-white/50">
        &copy; {new Date().getFullYear()} Gingerly
      </p>
    </aside>
  )
}
