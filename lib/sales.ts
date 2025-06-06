import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"
import type { Database } from "./database.types"
import { logActivity } from "./activity"

export type Sale = Database["public"]["Tables"]["sales"]["Row"]
export type SaleItem = Database["public"]["Tables"]["sale_items"]["Row"]

export type SaleWithItems = Sale & {
  items: Array<SaleItem & { product_name: string }>
}

// Create a new sale transaction
export async function createSale(
  saleData: Omit<Sale, "id" | "created_at">,
  items: Array<Omit<SaleItem, "id" | "created_at" | "sale_id" | "total_price">>,
) {
  const supabase = createClient()

  // Start a transaction
  const { data: sale, error: saleError } = await supabase.from("sales").insert(saleData).select().single()

  if (saleError || !sale) {
    console.error("Error creating sale:", saleError)
    return { error: saleError, data: null }
  }

  // Insert sale items
  const saleItems = items.map((item) => ({
    sale_id: sale.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.quantity * item.unit_price,
  }))

  const { error: itemsError } = await supabase.from("sale_items").insert(saleItems)

  if (itemsError) {
    console.error("Error creating sale items:", itemsError)
    return { error: itemsError, data: null }
  }

  // Update product stock quantities
  for (const item of items) {
    const { error: stockError } = await supabase.rpc("decrement_medicine_stock", {
      p_medecine_id: item.product_id,
      p_pharmacy_id: saleData.pharmacy_id,
      p_quantity_to_decrement: item.quantity,
    })

    if (stockError) {
      console.error("Error updating stock:", stockError)
      // Continue processing other items even if one fails
    }
  }

  // Log the activity
  await logActivity({
    user_id: saleData.user_id,
    action: "create",
    entity_type: "sale",
    entity_id: sale.id,
    details: { total_amount: saleData.total_amount, items_count: items.length },
    pharmacy_id: saleData.pharmacy_id,
  })

  return { error: null, data: sale }
}

// Get sales with pagination
export async function getSales(
  pharmacyId: string,
  page = 1,
  limit = 10,
  startDate?: string,
  endDate?: string,
  status?: string,
) {
  const supabase = createClient()

  let query = supabase
    .from("sales")
    .select("*", { count: "exact" })
    .eq("pharmacy_id", pharmacyId)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (startDate && endDate) {
    query = query.gte("created_at", startDate).lte("created_at", endDate)
  }

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching sales:", error)
    return { error, data: null, count: 0 }
  }

  return { error: null, data, count: count || 0 }
}

// Get a single sale with its items
export async function getSaleWithItems(saleId: string, pharmacyId: string) {
  const supabase = createClient()

  // Get the sale
  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .select("*")
    .eq("id", saleId)
    .eq("pharmacy_id", pharmacyId)
    .single()

  if (saleError || !sale) {
    console.error("Error fetching sale:", saleError)
    return { error: saleError, data: null }
  }

  // Get the sale items with product names
  const { data: items, error: itemsError } = await supabase
    .from("sale_items")
    .select(`
      *,
      products:product_id (
        name
      )
    `)
    .eq("sale_id", saleId)

  if (itemsError) {
    console.error("Error fetching sale items:", itemsError)
    return { error: itemsError, data: null }
  }

  // Format the items to include product name
  const formattedItems = items.map((item) => ({
    ...item,
    product_name: item.products.name,
  }))

  const saleWithItems: SaleWithItems = {
    ...sale,
    items: formattedItems,
  }

  return { error: null, data: saleWithItems }
}

// Generate sales report
export async function generateSalesReport(
  pharmacyId: string,
  startDate: string,
  endDate: string,
  groupBy: "day" | "week" | "month" = "day",
) {
  const supabase = createClient()

  // Use a database function to generate the report
  const { data, error } = await supabase.rpc("generate_sales_report", {
    input_data: {
      pharmacy_id: pharmacyId,
      start_date: startDate,
      end_date: endDate,
      group_by: groupBy,
    },
  })

  if (error) {
    console.error("Error generating sales report:", error)
    return { error, data: null }
  }

  return { error: null, data }
}
