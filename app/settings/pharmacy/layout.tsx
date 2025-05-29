import { DashboardLayout } from "@/components/dashboard-layout"
import type { ReactNode } from "react"

export default function PharmacyLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout title="Pharmacy Details">{children}</DashboardLayout>
}