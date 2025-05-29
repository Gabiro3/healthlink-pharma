import { getSupabaseClient } from "@/lib/supabase-client"
import type { Sale, SaleItem, SaleWithItems } from "@/lib/types"
import type { SupportedCurrency } from "./currency-service"

// Get sales with pagination and filtering
export async function getSales(options: {
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
  currency?: SupportedCurrency
}): Promise<{ data: SaleWithItems[]; count: number }> {
  const supabase = getSupabaseClient()
  const { startDate, endDate, limit = 10, offset = 0, currency = "RWF" } = options

  // Build query
  let query = supabase
    .from("sales")
    .select(
      `
      *,
      patients(id, name),
      sale_items(
        id,
        medicine_id,
        quantity,
        unit_price,
        total_price,
        currency,
        medicines(id, name)
      )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1)

  // Add date filters if provided
  if (startDate) {
    query = query.gte("created_at", startDate)
  }

  if (endDate) {
    // Add one day to include the end date
    const nextDay = new Date(endDate)
    nextDay.setDate(nextDay.getDate() + 1)
    query = query.lt("created_at", nextDay.toISOString().split("T")[0])
  }

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching sales:", error)
    return { data: [], count: 0 }
  }

  // Convert currency if needed
  if (currency !== "RWF") {
    // In a real app, we would convert the currency here
    // For now, we'll just return the data as is
  }

  return {
    data: data as SaleWithItems[],
    count: count || 0,
  }
}

// Create a new sale
export async function createSale(
  sale: Omit<Sale, "id" | "created_at" | "updated_at">,
  items: Omit<SaleItem, "id" | "sale_id" | "created_at">[],
): Promise<SaleWithItems | null> {
  const supabase = getSupabaseClient()
  console.log("Creating sale:", sale, items)

  try {
    // Generate invoice number if not provided
    const timestamp = new Date().getTime().toString().slice(-6)
    const invoiceNumber = sale.invoice_number || `INV-${timestamp}`

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.total_price || 0), 0)

    // Create the sale
    const { data, error } = await supabase
      .from("sales")
      .insert({
        ...sale,
        invoice_number: invoiceNumber,
        total_amount: totalAmount,
        payment_status: sale.payment_status || "paid",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating sale:", error)
      return null
    }

    // Add sale items
    const saleItems = items.map((item) => ({
      ...item,
      sale_id: data.id,
      created_at: new Date().toISOString(),
    }))

    const { error: itemsError } = await supabase.from("sale_items").insert(saleItems)

    if (itemsError) {
      // Rollback sale creation
      await supabase.from("sales").delete().eq("id", data.id)
      console.error("Error creating sale items:", itemsError)
      return null
    }

    // Update medicine stock quantities and create inventory transactions
    for (const item of items) {
      // Get current medicine data
      const { data: medicine, error: medicineError } = await supabase
        .from("medicines")
        .select("stock_quantity")
        .eq("id", item.medicine_id)
        .single()

      if (medicineError) continue

      // Update stock quantity
      const newQuantity = medicine.stock_quantity - item.quantity

      await supabase.from("medicines").update({ stock_quantity: newQuantity }).eq("id", item.medicine_id)

      // Create inventory transaction
      await supabase.from("inventory_transactions").insert({
        medicine_id: item.medicine_id,
        quantity: item.quantity,
        transaction_type: "sale",
        reference_id: data.id,
        created_by: sale.created_by,
        notes: `Sale: ${invoiceNumber}`,
        created_at: new Date().toISOString(),
      })
    }


    // Return the created sale with items
    return {
      ...data,
      sale_items: saleItems.map((item) => ({
        ...item,
        id: "", // We don't have the generated IDs here
        medicines: { id: item.medicine_id, name: "" }, // We don't have the medicine names here
      })),
    } as SaleWithItems
  } catch (error) {
    console.error("Error in createSale:", error)
    return null
  }
}

// Get sales statistics
export async function getSalesStatistics(options: {
  startDate?: string
  endDate?: string
  currency?: SupportedCurrency
}): Promise<{
  totalRevenue: number
  totalSales: number
  averageOrderValue: number
  topProducts: Array<{ id: string; name: string; quantity: number; revenue: number }>
}> {
  const supabase = getSupabaseClient()
  const { startDate, endDate, currency = "RWF" } = options

  // Build query for sales
  let salesQuery = supabase.from("sales").select("*")

  // Add date filters if provided
  if (startDate) {
    salesQuery = salesQuery.gte("created_at", startDate)
  }

  if (endDate) {
    // Add one day to include the end date
    const nextDay = new Date(endDate)
    nextDay.setDate(nextDay.getDate() + 1)
    salesQuery = salesQuery.lt("created_at", nextDay.toISOString().split("T")[0])
  }

  const { data: sales, error: salesError } = await salesQuery

  if (salesError) {
    console.error("Error fetching sales statistics:", salesError)
    return { totalRevenue: 0, totalSales: 0, averageOrderValue: 0, topProducts: [] }
  }

  // Calculate statistics
  const totalRevenue = sales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0
  const totalSales = sales?.length || 0
  const averageOrderValue = totalSales ? totalRevenue / totalSales : 0

  // Get top products
  const { data: products, error: productsError } = await supabase
    .from("sale_items")
    .select(`
      medicine_id,
      medicines(name),
      quantity,
      total_price
    `)
    .order("quantity", { ascending: false })

  if (productsError) {
    console.error("Error fetching top products:", productsError)
    return {
      totalRevenue,
      totalSales,
      averageOrderValue,
      topProducts: [],
    }
  }

  // Process top products data
  const productMap: Record<string, { id: string; name: string; quantity: number; revenue: number }> = {}

  products?.forEach((item: any) => {
    const id = item.medicine_id
    if (!productMap[id]) {
      productMap[id] = {
        id,
        name: item.medicines?.name || "Unknown",
        quantity: 0,
        revenue: 0,
      }
    }
    productMap[id].quantity += item.quantity
    productMap[id].revenue += item.total_price
  })

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return {
    totalRevenue,
    totalSales,
    averageOrderValue,
    topProducts,
  }
}
