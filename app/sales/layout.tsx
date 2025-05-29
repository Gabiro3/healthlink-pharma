import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { CurrencyProvider } from "@/lib/contexts/currency-context"

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute><CurrencyProvider>{children}</CurrencyProvider></ProtectedRoute>
}
