import type React from "react"
import type { Metadata, Viewport } from "next"
import { Jost, Inter_Tight, Instrument_Serif } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/sidebar-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils"

const fontSans = Jost({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

const fontBody = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

const fontDisplay = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400"],
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  title: "Gingerly - Modern Rental Payment Platform",
  description: "Simplifying rental payments for landlords and tenants with automated solutions",
  keywords: ["rental payments", "landlord software", "property management", "rent collection"],
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121A2D" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable, fontBody.variable, fontDisplay.variable)}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <SidebarProvider>{children}</SidebarProvider>
            <Toaster position="top-right" richColors closeButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
