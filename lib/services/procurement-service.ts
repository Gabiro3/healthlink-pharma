import { getSupabaseClient } from "@/lib/supabase-client"
import type { ProcurementOrder, ProcurementItem, ProcurementOrderWithItems } from "@/lib/types"
import type { SupportedCurrency } from "./currency-service"

// Get procurement orders with pagination and filtering
export async function getProcurementOrders(options: {
  status?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
  currency?: SupportedCurrency
}): Promise<{ data: ProcurementOrderWithItems[]; count: number }> {
  const supabase = getSupabaseClient()
  const { status, startDate, endDate, limit = 10, offset = 0, currency = "RWF" } = options

  // Build query
  let query = supabase
    .from("procurement_orders")
    .select(
      `
      *,
      procurement_items(
        id,
        medicine_id,
        quantity,
        unit_price,
        currency,
        total_price,
        medicines(id, name)
      )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1)

  // Add status filter if provided
  if (status) {
    query = query.eq("status", status)
  }

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
    console.error("Error fetching procurement orders:", error)
    return { data: [], count: 0 }
  }

  return {
    data: data as ProcurementOrderWithItems[],
    count: count || 0,
  }
}

// Create a new procurement order
export async function createProcurementOrder(
  order: Omit<ProcurementOrder, "id" | "created_at" | "updated_at">,
  items: Omit<ProcurementItem, "id" | "procurement_order_id" | "created_at">[],
): Promise<ProcurementOrderWithItems | null> {
  const supabase = getSupabaseClient()

  try {
    // Generate order number if not provided
    const timestamp = new Date().getTime().toString().slice(-6)
    const orderNumber = order.order_number || `PO-${timestamp}`

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.total_price || 0), 0)

    // Create the procurement order
    const { data, error } = await supabase
      .from("procurement_orders")
      .insert({
        ...order,
        order_number: orderNumber,
        total_amount: totalAmount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating procurement order:", error)
      return null
    }

    // Add procurement items
    const procurementItems = items.map((item) => ({
      ...item,
      procurement_order_id: data.id,
      created_at: new Date().toISOString(),
    }))

    const { error: itemsError } = await supabase.from("procurement_items").insert(procurementItems)

    if (itemsError) {
      // Rollback order creation
      await supabase.from("procurement_orders").delete().eq("id", data.id)
      console.error("Error creating procurement items:", itemsError)
      return null
    }

    // Return the created order with items
    return {
      ...data,
      procurement_items: procurementItems.map((item) => ({
        ...item,
        id: "", // We don't have the generated IDs here
        medicines: { id: item.medicine_id, name: "" }, // We don't have the medicine names here
      })),
    } as ProcurementOrderWithItems
  } catch (error) {
    console.error("Error in createProcurementOrder:", error)
    return null
  }
}

// Update procurement order status
export async function updateProcurementOrderStatus(orderId: string, status: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  try {
    const { error } = await supabase
      .from("procurement_orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (error) {
      console.error("Error updating procurement order status:", error)
      return false
    }

    // If status is "received", update inventory
    if (status === "received") {
      // Get order items
      const { data: items, error: itemsError } = await supabase
        .from("procurement_items")
        .select(`
          id,
          medicine_id,
          quantity
        `)
        .eq("procurement_order_id", orderId)

      if (itemsError) {
        console.error("Error fetching procurement items:", itemsError)
        return false
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
        const newQuantity = medicine.stock_quantity + item.quantity

        await supabase.from("medicines").update({ stock_quantity: newQuantity }).eq("id", item.medicine_id)

        // Create inventory transaction
        await supabase.from("inventory_transactions").insert({
          medicine_id: item.medicine_id,
          quantity: item.quantity,
          transaction_type: "procurement",
          reference_id: orderId,
          created_by: userId,
          notes: `Procurement order received: ${orderId}`,
          created_at: new Date().toISOString(),
        })
      }
    }

    return true
  } catch (error) {
    console.error("Error in updateProcurementOrderStatus:", error)
    return false
  }
}

// Get procurement statistics
export async function getProcurementStatistics(options: {
  startDate?: string
  endDate?: string
  currency?: SupportedCurrency
}): Promise<{
  totalSpent: number
  pendingOrders: number
  receivedOrders: number
  averageOrderValue: number
}> {
  const supabase = getSupabaseClient()
  const { startDate, endDate, currency = "RWF" } = options

  // Build query for procurement orders
  let ordersQuery = supabase.from("procurement_orders").select("*")

  // Add date filters if provided
  if (startDate) {
    ordersQuery = ordersQuery.gte("created_at", startDate)
  }

  if (endDate) {
    // Add one day to include the end date
    const nextDay = new Date(endDate)
    nextDay.setDate(nextDay.getDate() + 1)
    ordersQuery = ordersQuery.lt("created_at", nextDay.toISOString().split("T")[0])
  }

  const { data: orders, error: ordersError } = await ordersQuery

  if (ordersError) {
    console.error("Error fetching procurement statistics:", ordersError)
    return { totalSpent: 0, pendingOrders: 0, receivedOrders: 0, averageOrderValue: 0 }
  }

  // Calculate statistics
  const totalSpent =
    orders?.reduce((sum, order) => {
      // Only count received orders in total spent
      if (order.status === "received") {
        return sum + order.total_amount
      }
      return sum
    }, 0) || 0

  const pendingOrders = orders?.filter((order) => order.status === "pending" || order.status === "approved").length || 0

  const receivedOrders = orders?.filter((order) => order.status === "received").length || 0

  const totalOrders = receivedOrders
  const averageOrderValue = totalOrders ? totalSpent / totalOrders : 0

  return {
    totalSpent,
    pendingOrders,
    receivedOrders,
    averageOrderValue,
  }
}
