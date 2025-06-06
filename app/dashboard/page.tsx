import { getCurrentUser } from "@/lib/auth"
import { getDailyMetrics, getTopSellingProducts, getRecentSalesWithDetails } from "@/lib/analytics"
import { Header } from "@/components/layout/header"
import { EnhancedDashboardStats } from "@/components/dashboard/enhanced-stats-cards"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { EnhancedTopProducts } from "@/components/dashboard/enhanced-top-products"
import { RecentSalesTable } from "@/components/sales/recent-sales-table"
import { redirect } from "next/navigation"
import { ProductSearch } from "@/components/search/product-search"
import { RecordSaleDialog } from "@/components/sales/record-sale-dialog"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch dashboard data
  const [dailyMetrics, topProducts, recentSales] = await Promise.all([
    getDailyMetrics(user.pharmacy_id),
    getTopSellingProducts(user.pharmacy_id, 5),
    getRecentSalesWithDetails(user.pharmacy_id, 10),
  ])

  // Mock sales chart data - replace with actual data later
  const salesData = [
    { period: "01", sales: 8000 },
    { period: "02", sales: 12000 },
    { period: "03", sales: 9500 },
    { period: "04", sales: 15000 },
    { period: "05", sales: 11000 },
    { period: "06", sales: 18000 },
    { period: "07", sales: 16500 },
    { period: "08", sales: 14000 },
    { period: "09", sales: 19000 },
    { period: "10", sales: 17500 },
    { period: "11", sales: 21000 },
    { period: "12", sales: dailyMetrics?.today_sales || 0 },
  ]

  return (
    <div className="space-y-6">
      <Header
        title="Dashboard Overview"
        subtitle="Real-time pharmacy analytics and insights"
        user={{
          email: user.email,
          pharmacy_name: user.pharmacy_name,
          role: user.role,
        }}
      />

      <div className="px-6 flex justify-between items-center">
        <ProductSearch />
        <RecordSaleDialog />
      </div>

      <div className="px-6 space-y-6">
        {dailyMetrics && <EnhancedDashboardStats metrics={dailyMetrics} />}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SalesChart data={salesData} totalRevenue={dailyMetrics?.today_sales || 0} revenueChange={8.2} />
          </div>
          <EnhancedTopProducts products={topProducts} />
        </div>

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
