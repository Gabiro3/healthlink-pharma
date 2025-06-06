import { cache } from "react"
import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"

// Cache time in seconds
const SHORT_CACHE_TIME = 60 // 1 minute
const MEDIUM_CACHE_TIME = 300 // 5 minutes
const LONG_CACHE_TIME = 3600 // 1 hour

// In-memory cache store
const memoryCache = new Map<string, { data: any; expiry: number }>()

// Generic function to get data with caching
export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = MEDIUM_CACHE_TIME,
): Promise<T> {
  const now = Date.now()

  // Check memory cache first
  const cached = memoryCache.get(key)
  if (cached && cached.expiry > now) {
    return cached.data as T
  }

  // Fetch fresh data
  const data = await fetchFn()

  // Store in memory cache
  memoryCache.set(key, {
    data,
    expiry: now + ttl * 1000,
  })

  return data
}

// Clear cache for a specific key
export function clearCache(key: string): void {
  memoryCache.delete(key)
}

// Clear all cache
export function clearAllCache(): void {
  memoryCache.clear()
}

// Cached function to get pharmacy products
export const getPharmacyProducts = cache(async (pharmacyId: string) => {
  const supabase = createClient()

  const cacheKey = `products_${pharmacyId}`

  return getCachedData(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("pharmacy_id", pharmacyId)
        .eq("is_active", true)
        .order("name")

      if (error) {
        console.error("Error fetching products:", error)
        throw error
      }

      return data
    },
    MEDIUM_CACHE_TIME,
  )
})

// Cached function to get pharmacy vendors
export const getPharmacyVendors = cache(async (pharmacyId: string) => {
  const supabase = createClient()

  const cacheKey = `vendors_${pharmacyId}`

  return getCachedData(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("pharmacy_id", pharmacyId)
        .eq("is_active", true)
        .order("name")

      if (error) {
        console.error("Error fetching vendors:", error)
        throw error
      }

      return data
    },
    MEDIUM_CACHE_TIME,
  )
})

// Cached function to get pharmacy dashboard stats
export const getPharmacyDashboardStats = cache(async (pharmacyId: string) => {
  const supabase = createClient()

  const cacheKey = `dashboard_stats_${pharmacyId}`

  return getCachedData(
    cacheKey,
    async () => {
      // Get today's date and format it
      const today = new Date().toISOString().split("T")[0]

      // Get sales stats
      const { data: salesStats, error: salesError } = await supabase.rpc("get_sales_stats", {
        input_data: {
        pharmacy_id: pharmacyId
  }
      })

      if (salesError) {
        console.error("Error fetching sales stats:", salesError)
        throw salesError
      }

      // Get inventory stats
      const { data: inventoryStats, error: inventoryError } = await supabase.rpc("get_inventory_stats", {
        input_data: {
          pharmacy_id: pharmacyId,
        },
      })

      if (inventoryError) {
        console.error("Error fetching inventory stats:", inventoryError)
        throw inventoryError
      }

      // Get today's sales
      const { data: todaySales, error: todaySalesError } = await supabase
        .from("sales")
        .select("total_amount")
        .eq("pharmacy_id", pharmacyId)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`)
      console.log(pharmacyId)

      if (todaySalesError) {
        console.error("Error fetching today's sales:", todaySalesError)
        throw todaySalesError
      }

      const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0)

      return {
        salesStats,
        inventoryStats,
        todaySales: todayTotal,
      }
    },
    SHORT_CACHE_TIME,
  )
})
export async function getRecentOrders(pharmacyId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("sales")
    .select(`
      id,
      total_amount,
      status,
      payment_status,
      created_at,
      sale_items!inner(
        products(name)
      )
    `)
    .eq("pharmacy_id", pharmacyId)
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) {
    console.error("Error fetching recent orders:", error)
    return []
  }

  return data.map((sale) => ({
    id: sale.id,
    medicine_name: sale.sale_items[0]?.products?.[0]?.name || "Unknown",
    price: sale.total_amount,
    status: sale.status,
    payment_status: sale.payment_status,
  }))
}

export async function getTopProducts(pharmacyId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("sale_items")
    .select(`
      quantity,
      products!inner(
        name,
        pharmacy_id
      )
    `)
    .eq("products.pharmacy_id", pharmacyId)
    .order("quantity", { ascending: false })
    .limit(3)

  if (error) {
    console.error("Error fetching top products:", error)
    return []
  }

  const colors = ["#f97316", "#1f2937", "#84cc16"]

  return data.map((item, index) => ({
    name: item.products?.[0]?.name || "Unknown",
    sales: item.quantity,
    color: colors[index] || "#6b7280",
  }))
}
