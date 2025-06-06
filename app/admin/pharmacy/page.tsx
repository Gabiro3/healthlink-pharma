import { getCurrentUser } from "@/lib/auth"
import { getPharmacyAdminStats, isPharmacyAdmin } from "@/lib/admin"
import { Header } from "@/components/layout/header"
import { PharmacyAdminDashboard } from "@/components/admin/pharmacy-admin-dashboard"
import { redirect } from "next/navigation"

export default async function PharmacyAdminPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is pharmacy admin
  const isAdmin = await isPharmacyAdmin(user.id, user.pharmacy_id)

  if (!isAdmin) {
    redirect("/dashboard")
  }

  // Fetch pharmacy admin stats
  const { data: stats, error } = await getPharmacyAdminStats(user.pharmacy_id)

  if (error) {
    console.error("Error fetching pharmacy admin stats:", error)
  }

  return (
    <div className="space-y-6">
      <Header
        title="Pharmacy Administration"
        subtitle="Manage your pharmacy's operations and users"
        user={{
          email: user.email,
          pharmacy_name: user.pharmacy_name,
          role: user.role,
        }}
      />

      <div className="px-6">
        <PharmacyAdminDashboard
          stats={
            stats || {
              total_users: 0,
              total_products: 0,
              total_sales_this_month: 0,
              total_sales_all_time: 0,
              active_orders: 0,
              low_stock_products: 0,
            }
          }
          pharmacyName={user.pharmacy_name}
          pharmacyCode={user.pharmacy_code}
        />
      </div>
    </div>
  )
}
