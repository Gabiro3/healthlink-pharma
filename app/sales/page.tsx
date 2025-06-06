import { getCurrentUser } from "@/lib/auth"
import { getSales } from "@/lib/sales"
import { getRecentSalesWithDetails } from "@/lib/analytics"
import { Header } from "@/components/layout/header"
import { SalesOverview } from "@/components/sales/sales-overview"
import { RecentSalesTable } from "@/components/sales/recent-sales-table"
import { redirect } from "next/navigation"
import { EmptyState } from "@/components/ui/empty-state"
import { ShoppingCart } from "lucide-react"
import { RecordSaleDialog } from "@/components/sales/record-sale-dialog"

export default async function SalesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch sales data
  const [salesResult, recentSales] = await Promise.all([
    getSales(user.pharmacy_id, 1, 50),
    getRecentSalesWithDetails(user.pharmacy_id, 20),
  ])

  const { data: sales, error } = salesResult

  if (error) {
    console.error("Error fetching sales:", error)
  }

  // Calculate dynamic stats from actual data
  const stats = {
    totalRevenue: sales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0,
    totalProfit: (sales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0) * 0.3, // 30% profit margin
    totalCost: (sales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0) * 0.7, // 70% cost
    averageOrderValue: sales?.length ? sales.reduce((sum, sale) => sum + sale.total_amount, 0) / sales.length : 0,
  }

  if (!sales || sales.length === 0) {
    return (
      <div className="space-y-6">
        <Header
          title="Sales Overview"
          subtitle="Let's check your pharmacy today"
          user={{
            email: user.email,
            pharmacy_name: user.pharmacy_name,
            role: user.role,
          }}
        />
        <div className="px-6">
          <EmptyState
            icon={ShoppingCart}
            title="No Sales Yet"
            description="Start recording sales to see your sales overview and analytics here."
            action={{
              label: "Record First Sale",
              onClick: () => {}, // This will be handled by the RecordSaleDialog
            }}
          />
          <div className="mt-4 flex justify-center">
            <RecordSaleDialog />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Header
        title="Sales Overview"
        subtitle="Let's check your pharmacy today"
        user={{
          email: user.email,
          pharmacy_name: user.pharmacy_name,
          role: user.role,
        }}
      />

      <div className="px-6 space-y-6">
        <SalesOverview sales={sales || []} stats={stats} />
        <RecentSalesTable
          sales={recentSales.map((sale: any) => ({
            ...sale,
            users: sale.users && Array.isArray(sale.users) ? sale.users[0] : sale.users,
          }))}
        />
      </div>
    </div>
  )
}
