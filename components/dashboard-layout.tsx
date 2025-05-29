import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { CurrencyProvider } from "@/lib/contexts/currency-context"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  onRefresh?: () => void
}

export function DashboardLayout({ children, title, subtitle, onRefresh }: DashboardLayoutProps) {
  return (
    <CurrencyProvider>
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} onRefresh={onRefresh} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
    </CurrencyProvider>
  )
}
