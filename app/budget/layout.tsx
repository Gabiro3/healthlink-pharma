import { DashboardLayout } from "@/components/dashboard-layout"
import type { ReactNode } from "react"

export default function BudgetLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout title="Budgeting Page">{children}</DashboardLayout>
}
