import { getSupabaseClient } from "@/lib/supabase-client"
import type { SupportedCurrency } from "./currency-service"

export interface DashboardStats {
  totalRevenue: number
  totalCustomers: number
  totalOrders: number
  totalProducts: number
  lowStockItems: number
  outOfStock: number
  revenueChange: number
  customerChange: number
  orderChange: number
}

export interface SalesChartData {
  name: string
  total: number
  date: string
}

export interface TopProduct {
  id: string
  name: string
  revenue: number
  quantity: number
  category: string
}

export interface RecentSale {
  id: string
  invoice_number: string
  customer_name: string
  total_amount: number
  payment_status: string
  created_at: string
  currency: string
}

export async function getDashboardStats(currency: SupportedCurrency = "RWF"): Promise<DashboardStats> {
  const supabase = getSupabaseClient()

  try {
    // Get current period (last 30 days)
    const currentDate = new Date()
    const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(currentDate.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Fetch current period sales
    const { data: currentSales, error: currentSalesError } = await supabase
      .from("sales")
      .select("total_amount, currency")
      .gte("created_at", thirtyDaysAgo.toISOString())

    if (currentSalesError) throw currentSalesError

    // Fetch previous period sales for comparison
    const { data: previousSales, error: previousSalesError } = await supabase
      .from("sales")
      .select("total_amount, currency")
      .gte("created_at", sixtyDaysAgo.toISOString())
      .lt("created_at", thirtyDaysAgo.toISOString())

    if (previousSalesError) throw previousSalesError

    // Calculate revenue
    const currentRevenue = currentSales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0
    const previousRevenue = previousSales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0
    const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

    // Fetch customers
    const { count: currentCustomers, error: currentCustomersError } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString())

    if (currentCustomersError) throw currentCustomersError

    const { count: previousCustomers, error: previousCustomersError } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sixtyDaysAgo.toISOString())
      .lt("created_at", thirtyDaysAgo.toISOString())

    if (previousCustomersError) throw previousCustomersError

    const customerChange =
      (previousCustomers ?? 0) > 0 ? (((currentCustomers ?? 0) - (previousCustomers ?? 0)) / (previousCustomers ?? 0)) * 100 : 0

    // Calculate order changes
    const currentOrders = currentSales?.length || 0
    const previousOrders = previousSales?.length || 0
    const orderChange = previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0

    // Fetch product stats
    const { data: products, error: productsError } = await supabase
      .from("medicines")
      .select("stock_quantity, reorder_level")

    if (productsError) throw productsError

    const totalProducts = products?.length || 0
    const lowStockItems = products?.filter((p) => p.stock_quantity <= p.reorder_level).length || 0
    const outOfStock = products?.filter((p) => p.stock_quantity === 0).length || 0

    // Get total customers count
    const { count: totalCustomers, error: totalCustomersError } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })

    if (totalCustomersError) throw totalCustomersError

    return {
      totalRevenue: currentRevenue,
      totalCustomers: totalCustomers || 0,
      totalOrders: currentOrders,
      totalProducts,
      lowStockItems,
      outOfStock,
      revenueChange,
      customerChange,
      orderChange,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalRevenue: 0,
      totalCustomers: 0,
      totalOrders: 0,
      totalProducts: 0,
      lowStockItems: 0,
      outOfStock: 0,
      revenueChange: 0,
      customerChange: 0,
      orderChange: 0,
    }
  }
}

export async function getSalesChartData(days = 30): Promise<SalesChartData[]> {
  const supabase = getSupabaseClient()

  try {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

    const { data: sales, error } = await supabase
      .from("sales")
      .select("total_amount, created_at, currency")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true })

    if (error) throw error

    // Group sales by day
    const salesByDay: Record<string, number> = {}

    sales?.forEach((sale) => {
      const date = new Date(sale.created_at).toISOString().split("T")[0]
      if (!salesByDay[date]) {
        salesByDay[date] = 0
      }
      salesByDay[date] += sale.total_amount
    })

    // Fill in missing days with 0
    const chartData: SalesChartData[] = []
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split("T")[0]
      const dayName = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

      chartData.push({
        name: dayName,
        total: salesByDay[dateStr] || 0,
        date: dateStr,
      })
    }

    return chartData
  } catch (error) {
    console.error("Error fetching sales chart data:", error)
    return []
  }
}

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  const supabase = getSupabaseClient()

  try {
    const { data: saleItems, error } = await supabase.from("sale_items").select(`
        medicine_id,
        quantity,
        total_price,
        medicines(id, name, medicine_categories(name))
      `)

    if (error) throw error

    // Group by medicine and calculate totals
    const productMap: Record<string, TopProduct> = {}

    saleItems?.forEach((item: any) => {
      const medicineId = item.medicine_id
      if (!productMap[medicineId]) {
        productMap[medicineId] = {
          id: medicineId,
          name: item.medicines?.name || "Unknown",
          revenue: 0,
          quantity: 0,
          category: item.medicines?.medicine_categories?.name || "Unknown",
        }
      }
      productMap[medicineId].revenue += item.total_price
      productMap[medicineId].quantity += item.quantity
    })

    return Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
  } catch (error) {
    console.error("Error fetching top products:", error)
    return []
  }
}

export async function getRecentSales(limit = 5): Promise<RecentSale[]> {
  const supabase = getSupabaseClient()

  try {
    const { data: sales, error } = await supabase
      .from("sales")
      .select(`
        id,
        invoice_number,
        customer_name,
        total_amount,
        payment_status,
        created_at,
        currency,
        patients(name)
      `)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    return (
      sales?.map((sale) => ({
        id: sale.id,
        invoice_number: sale.invoice_number,
        customer_name: sale.customer_name || sale.patients?.[0]?.name || "Walk-in Customer",
        total_amount: sale.total_amount,
        payment_status: sale.payment_status,
        created_at: sale.created_at,
        currency: sale.currency || "RWF",
      })) || []
    )
  } catch (error) {
    console.error("Error fetching recent sales:", error)
    return []
  }
}
