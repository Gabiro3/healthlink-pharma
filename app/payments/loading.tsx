import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardSkeleton } from "@/components/loading-skeleton"

export default function PaymentsLoading() {
  return (
    <DashboardLayout title="Payments" subtitle="Track and manage payment transactions">
      <DashboardSkeleton />
    </DashboardLayout>
  )
}
