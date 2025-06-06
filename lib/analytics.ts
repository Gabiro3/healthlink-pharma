import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"

export interface DailyMetrics {
  today_sales: number
  yesterday_sales: number
  total_products: number
  expired_products: number
  low_stock_products: number
}

export interface TopSellingProduct {
  product_id: string
  product_name: string
  total_quantity: number
  total_revenue: number
  sales_count: number
}

export interface PaymentMethodStats {
  payment_method: string
  transaction_count: number
  total_amount: number
  percentage: number
}

export interface InsuranceSale {
  sale_id: string
  customer_name: string
  insurance_provider: string
  insurance_amount: number
  total_amount: number
  created_at: string
  user_email: string
}

export async function getDailyMetrics(pharmacyId: string): Promise<DailyMetrics | null> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_daily_sales_metrics", {
    p_pharmacy_id: pharmacyId,
  })

  if (error) {
    console.error("Error fetching daily metrics:", error)
    return null
  }

  return data[0] || null
}

export async function getTopSellingProducts(pharmacyId: string, limit = 5): Promise<TopSellingProduct[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_top_selling_products", {
    p_pharmacy_id: pharmacyId,
    p_limit: limit,
  })

  if (error) {
    console.error("Error fetching top selling products:", error)
    return []
  }

  return data || []
}

export async function getSalesByPaymentMethod(pharmacyId: string): Promise<PaymentMethodStats[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_sales_by_payment_method", {
    p_pharmacy_id: pharmacyId,
  })

  if (error) {
    console.error("Error fetching payment method stats:", error)
    return []
  }

  return data || []
}

export async function getInsuranceSalesReport(
  pharmacyId: string,
  insuranceProvider?: string,
  startDate?: string,
  endDate?: string,
): Promise<InsuranceSale[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_insurance_sales_report", {
    p_pharmacy_id: pharmacyId,
    p_insurance_provider: insuranceProvider || null,
    p_start_date: startDate || null,
    p_end_date: endDate || null,
  })

  if (error) {
    console.error("Error fetching insurance sales report:", error)
    return []
  }

  return data || []
}

export async function getRecentSalesWithDetails(pharmacyId: string, limit = 10) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("sales")
    .select(`
      id,
      customer_name,
      total_amount,
      payment_method,
      payment_status,
      status,
      created_at,
      pharmacy_users!inner(email, full_name),
      sale_items(
        quantity,
        products(name)
      )
    `)
    .eq("pharmacy_id", pharmacyId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching recent sales:", error)
    return []
  }

  return data || []
}
