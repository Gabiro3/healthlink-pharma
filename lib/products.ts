import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"

export async function getProductDetails(productId: string, pharmacyId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("pharmacy_id", pharmacyId)
    .single()

  if (error) {
    console.error("Error fetching product details:", error)
    return { error, data: null }
  }

  return { error: null, data }
}

export async function getProductSalesData(productId: string, pharmacyId: string) {
  const supabase = createClient()

  // Get sales data for the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data, error } = await supabase
    .from("sale_items")
    .select(`
      quantity,
      unit_price,
      total_price,
      sales!inner(
        created_at,
        pharmacy_id
      )
    `)
    .eq("product_id", productId)
    .eq("sales.pharmacy_id", pharmacyId)
    .gte("sales.created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true, foreignTable: "sales" })

  if (error) {
    console.error("Error fetching product sales data:", error)
    return { error, data: null }
  }

  // Group by date and calculate metrics
  const salesByDate = data.reduce((acc: any, item: any) => {
    const date = new Date(item.sales.created_at).toISOString().split("T")[0]

    if (!acc[date]) {
      acc[date] = {
        date,
        quantity: 0,
        revenue: 0,
        profit: 0,
      }
    }

    acc[date].quantity += item.quantity
    acc[date].revenue += item.total_price
    // Assuming cost_price is available, calculate profit
    // For now, using a simple margin calculation
    acc[date].profit += item.total_price * 0.3 // 30% profit margin assumption

    return acc
  }, {})

  const salesData = Object.values(salesByDate)

  return { error: null, data: salesData }
}
