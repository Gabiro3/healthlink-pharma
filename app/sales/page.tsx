"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUp, Calendar, DollarSign, Filter, Plus, Search } from "lucide-react"
import { LineChart } from "@/components/charts/line-chart"
import { ProgressiveChart } from "@/components/charts/progressive-chart"
import { SalesForecastDialog } from "@/components/sales/sales-forecast-dialog"
import { Input } from "@/components/ui/input"
import { DateRangePicker } from "@/components/date-range-picker"
import { AddSaleDialog } from "@/components/sales/add-sale-dialog"
import { ViewSaleDialog } from "@/components/sales/view-sale-dialog"
import { getSales, getSalesStatistics } from "@/lib/services/sales-service"
import { CurrencyProvider, useCurrency } from "@/lib/contexts/currency-context"
import { CurrencySelector } from "@/components/currency-selector"
import type { DateRange } from "react-day-picker"
import { TableSkeleton } from "@/components/loading-skeleton"
import { EmptyState } from "@/components/emtpy-state"
import type { SaleWithItems } from "@/lib/types"

export default function SalesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [salesData, setSalesData] = useState<any[]>([])
  const [progressiveData, setProgressiveData] = useState<any[]>([])
  const [recentSales, setRecentSales] = useState<SaleWithItems[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    averageOrderValue: 0,
  })
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })

  const handleDateRangeChange = (date: DateRange | undefined) => {
    setDateRange(date ?? { from: undefined, to: undefined })
  }
  const [searchQuery, setSearchQuery] = useState("")
  const [isForecastDialogOpen, setIsForecastDialogOpen] = useState(false)
  const [isAddSaleDialogOpen, setIsAddSaleDialogOpen] = useState(false)
  const [isViewSaleDialogOpen, setIsViewSaleDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedSale, setSelectedSale] = useState<SaleWithItems | null>(null)
  const { toast } = useToast()
  const { currentCurrency, formatAmount, convertAmount } = useCurrency()

  const fetchSalesData = async () => {
    setIsLoading(true)
    try {
      // Fetch sales data
      const startDate = dateRange.from?.toISOString().split("T")[0]
      const endDate = dateRange.to?.toISOString().split("T")[0]

      const { data: sales, count } = await getSales({
        startDate,
        endDate,
        limit: 100,
        currency: currentCurrency,
      })

      // Get sales statistics
      const statistics = await getSalesStatistics({
        startDate,
        endDate,
        currency: currentCurrency,
      })

      // Process data for charts
      const salesByDay: Record<string, number> = {}

      sales.forEach((sale) => {
        const date = new Date(sale.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        if (!salesByDay[date]) {
          salesByDay[date] = 0
        }
        salesByDay[date] += convertAmount(sale.total_amount, sale.currency as any)
      })

      const chartData = Object.entries(salesByDay).map(([name, total]) => ({
        name,
        total,
      }))

      // Create progressive data
      let cumulative = 0
      const progressiveChartData = chartData.map((item) => {
        cumulative += item.total
        return {
          name: item.name,
          value: item.total,
          cumulative,
        }
      })

      setSalesData(chartData)
      setProgressiveData(progressiveChartData)
      setRecentSales(sales.slice(0, 5))
      setTopProducts(statistics.topProducts)
      setStats({
        totalRevenue: statistics.totalRevenue,
        totalSales: statistics.totalSales,
        averageOrderValue: statistics.averageOrderValue,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load sales data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSalesData()
  }, [dateRange, currentCurrency])

  const handleForecastClick = (product: any) => {
    setSelectedProduct(product)
    setIsForecastDialogOpen(true)
  }

  const handleViewSale = (sale: SaleWithItems) => {
    setSelectedSale(sale)
    setIsViewSaleDialogOpen(true)
  }

  const handleSaleCreated = () => {
    fetchSalesData()
    setIsAddSaleDialogOpen(false)
  }

  return (
    <DashboardLayout title="Sales Overview" subtitle="Track and manage your pharmacy sales" onRefresh={fetchSalesData}>
      <div className="grid gap-6">
        {/* Filters and Actions */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search sales..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <DateRangePicker date={dateRange} onDateChange={handleDateRangeChange} />
          </div>
          <div className="flex items-center gap-2">
            <CurrencySelector />
            <Button className="gap-1 bg-[#004d40] hover:bg-[#00695c]" onClick={() => setIsAddSaleDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              <span>New Sale</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
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
                <span className="flex items-center text-green-300">
                  <ArrowUp className="mr-1 h-3 w-3" />
                  5.8%
                </span>
                <span className="ml-1 text-white/60">Since last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <div className="rounded-full bg-blue-100 p-2">
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
              <div className="flex items-center text-xs">
                <span className="flex items-center text-green-500">
                  <ArrowUp className="mr-1 h-3 w-3" />
                  3.2%
                </span>
                <span className="ml-1 text-muted-foreground">Since last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <div className="rounded-full bg-green-100 p-2">
                <DollarSign className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(stats.averageOrderValue)}</div>
              <div className="flex items-center text-xs">
                <span className="flex items-center text-green-500">
                  <ArrowUp className="mr-1 h-3 w-3" />
                  2.4%
                </span>
                <span className="ml-1 text-muted-foreground">Since last period</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart and Progressive Sales */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Revenue Trend</CardTitle>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004d40]"></div>
                  </div>
                ) : salesData.length > 0 ? (
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Progressive Sales</CardTitle>
              <div className="flex items-center gap-1 text-xs">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#004d40]"></span>
                  Cumulative
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#00695c]"></span>
                  Period
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004d40]"></div>
                  </div>
                ) : progressiveData.length > 0 ? (
                  <ProgressiveChart data={progressiveData} />
                ) : (
                  <EmptyState
                    icon={Calendar}
                    title="No progressive data"
                    description="No progressive sales data available."
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales and Top Products */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <TableSkeleton rows={5} columns={5} />
              ) : recentSales.length > 0 ? (
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
                      <TableRow key={sale.id} className="cursor-pointer" onClick={() => handleViewSale(sale)}>
                        <TableCell className="font-medium">
                          #{sale.invoice_number?.slice(-6) || sale.id.slice(0, 6)}
                        </TableCell>
                        <TableCell>{sale.customer_name || sale.patients?.name || "Walk-in Customer"}</TableCell>
                        <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{formatAmount(convertAmount(sale.total_amount, sale.currency as any))}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${sale.payment_status === "paid"
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
                  icon={Calendar}
                  title="No recent sales"
                  description="No sales have been recorded recently."
                />
              )}
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <TableSkeleton rows={5} columns={4} />
              ) : topProducts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{formatAmount(convertAmount(product.revenue, "RWF" as any))}</TableCell>
                        <TableCell>{product.quantity} units</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleForecastClick(product)}>
                            Forecast
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState icon={DollarSign} title="No product data" description="No product sales data available." />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      {selectedProduct && (
        <SalesForecastDialog
          open={isForecastDialogOpen}
          onOpenChange={setIsForecastDialogOpen}
          medicine={selectedProduct}
        />
      )}

      <AddSaleDialog
        open={isAddSaleDialogOpen}
        onOpenChange={setIsAddSaleDialogOpen}
        onSaleCreated={handleSaleCreated}
      />

      {selectedSale && (
        <ViewSaleDialog open={isViewSaleDialogOpen} onOpenChange={setIsViewSaleDialogOpen} sale={selectedSale} />
      )}
    </DashboardLayout>
  )
}
