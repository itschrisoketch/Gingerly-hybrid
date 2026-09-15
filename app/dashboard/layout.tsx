import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { SidebarProvider } from "@/components/sidebar-provider"

/**
 * Dashboard shell.
 *
 * `data-brand-font` opts this subtree into Inter Tight. It is load-bearing, not
 * decorative: globals.css sets an explicit `font-family: var(--font-sans)` (Jost)
 * on h1-h6, p, a, span, div, input and button inside @layer base, which a class
 * on this element cannot override. The scoped rule keyed to this attribute is
 * what puts the app in the brand face. Remove the attribute and everything here
 * silently reverts to Jost.
 *
 * The gradient grounds that were here are gone. Flat surfaces are the point: a
 * dashboard is scanned, and a tinted gradient behind data competes with the
 * hierarchy the content is trying to establish.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div data-brand-font className="flex h-screen overflow-hidden bg-background font-body">
        <MobileNav />
        <div className="flex flex-1 overflow-hidden">
          <DashboardSidebar />
          <main className="flex-1 overflow-auto bg-muted/20">
            <div className="mx-auto max-w-7xl space-y-6 p-4 md:space-y-8 md:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
