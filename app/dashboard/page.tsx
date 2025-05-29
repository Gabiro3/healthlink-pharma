"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowDown, ArrowUp, DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import { LineChart } from "@/components/charts/line-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardSkeleton } from "@/components/loading-skeleton"
import { EmptyState } from "@/components/emtpy-state"
import {
  getDashboardStats,
  getSalesChartData,
  getTopProducts,
  getRecentSales,
  type DashboardStats,
  type SalesChartData,
  type TopProduct,
  type RecentSale,
} from "@/lib/services/dashboard-service"
import { CurrencyProvider, useCurrency } from "@/lib/contexts/currency-context"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <CurrencyProvider>
      <DashboardContent />
      </CurrencyProvider>
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalProducts: 0,
    lowStockItems: 0,
    outOfStock: 0,
    revenueChange: 0,
    customerChange: 0,
    orderChange: 0,
  })
  const [salesData, setSalesData] = useState<SalesChartData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [recentSales, setRecentSales] = useState<RecentSale[]>([])
  const { toast } = useToast()
  const { currentCurrency, formatAmount, convertAmount } = useCurrency()

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const [statsData, chartData, productsData, salesData] = await Promise.all([
        getDashboardStats(currentCurrency),
        getSalesChartData(30),
        getTopProducts(5),
        getRecentSales(5),
      ])

      setStats(statsData)
      setSalesData(chartData)
      setTopProducts(productsData)
      setRecentSales(salesData)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [currentCurrency])

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Overview • Last stats" onRefresh={fetchDashboardData}>
        <DashboardSkeleton />
      </DashboardLayout>
    )
  }

  const formatChange = (change: number) => {
    const isPositive = change >= 0
    return (
      <span className={`flex items-center ${isPositive ? "text-green-500" : "text-red-500"}`}>
        {isPositive ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
        {Math.abs(change).toFixed(1)}%
      </span>
    )
  }

  return (
    <DashboardLayout title="Dashboard" subtitle="Overview • Last stats" onRefresh={fetchDashboardData}>
      <div className="grid gap-6">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-[#004d40] text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <div className="rounded-full bg-white/10 p-2">
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(stats.totalRevenue)}</div>
              <div className="flex items-center text-xs">
                {formatChange(stats.revenueChange)}
                <span className="ml-1 text-white/60">Since last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <div className="rounded-full bg-blue-100 p-2">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
              <div className="flex items-center text-xs">
                {formatChange(stats.customerChange)}
                <span className="ml-1 text-muted-foreground">Since last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <div className="rounded-full bg-green-100 p-2">
                <ShoppingCart className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <div className="flex items-center text-xs">
                {formatChange(stats.orderChange)}
                <span className="ml-1 text-muted-foreground">Since last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <div className="rounded-full bg-purple-100 p-2">
                <Package className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <div className="text-xs text-muted-foreground">
                {stats.lowStockItems} low stock • {stats.outOfStock} out of stock
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {salesData.length > 0 ? (
                  <LineChart data={salesData} />
                ) : (
                  <EmptyState
                    icon={DollarSign}
                    title="No sales data"
                    description="No sales data available for the selected period."
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Qty Sold</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{formatAmount(product.revenue)}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState icon={Package} title="No product data" description="No product sales data available." />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        #{sale.invoice_number?.slice(-6) || sale.id.slice(0, 6)}
                      </TableCell>
                      <TableCell>{sale.customer_name}</TableCell>
                      <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{formatAmount(convertAmount(sale.total_amount, sale.currency as any))}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            sale.payment_status === "paid"
                              ? "bg-green-100 text-green-700"
                              : sale.payment_status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {sale.payment_status.charAt(0).toUpperCase() + sale.payment_status.slice(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                icon={ShoppingCart}
                title="No recent sales"
                description="No sales have been recorded recently."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
