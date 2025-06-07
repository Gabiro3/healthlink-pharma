import { getCurrentUser } from "@/lib/auth"
import { getSuperAdminStats, isSuperAdmin, getAllPharmaciesWithSales } from "@/lib/admin"
import { Header } from "@/components/layout/header"
import { SuperAdminDashboard } from "@/components/admin/super-admin-dashboard"
import { redirect } from "next/navigation"

export default async function SuperAdminPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is super admin
  const isSuper = await isSuperAdmin(user.id)

  if (!isSuper) {
    redirect("/dashboard")
  }

  // Fetch super admin stats and pharmacies
  const [{ data: stats, error: statsError }, { data: pharmacies, error: pharmaciesError }] = await Promise.all([
    getSuperAdminStats(),
    getAllPharmaciesWithSales(),
  ])

  if (statsError) {
    console.error("Error fetching super admin stats:", statsError)
  }

  if (pharmaciesError) {
    console.error("Error fetching pharmacies:", pharmaciesError)
  }

  return (
    <div className="space-y-6">
      <Header
        title="Super Admin Dashboard"
        subtitle="Manage all pharmacies and system operations"
        user={{
          email: user.email,
          pharmacy_name: "System Administrator",
          role: "super_admin",
        }}
      />

      <div className="px-6">
        <SuperAdminDashboard
          stats={
            stats || {
              total_pharmacies: 0,
              total_users: 0,
              total_products: 0,
              total_sales_this_month: 0,
              total_sales_all_time: 0,
              active_pharmacies: 0,
              pending_invoices: 0,
            }
          }
          pharmacies={pharmacies || []}
        />
      </div>
    </div>
  )
}
