import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"
import type { Database } from "./database.types"
import { logActivity } from "./activity"

export type Vendor = Database["public"]["Tables"]["vendors"]["Row"]
export type PurchaseOrder = Database["public"]["Tables"]["purchase_orders"]["Row"]
export type PurchaseOrderItem = Database["public"]["Tables"]["purchase_order_items"]["Row"]
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"]

export type PurchaseOrderWithItems = PurchaseOrder & {
  items: Array<PurchaseOrderItem & { product_name: string }>
  vendor_name: string
}

// Create a new vendor
export async function createVendor(vendorData: Omit<Vendor, "id" | "created_at">) {
  const supabase = createClient(cookies())

  const { data, error } = await supabase.from("vendors").insert(vendorData).select().single()

  if (error) {
    console.error("Error creating vendor:", error)
    return { error, data: null }
  }

  // Log the activity
  await logActivity({
    user_id: vendorData.pharmacy_id, // Using pharmacy_id as a proxy for user_id here
    action: "create",
    entity_type: "vendor",
    entity_id: data.id,
    details: { name: vendorData.name },
    pharmacy_id: vendorData.pharmacy_id,
  })

  return { error: null, data }
}

// Get vendors for a pharmacy
export async function getVendors(pharmacyId: string, isActive = true) {
  const supabase = createClient(cookies())

  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("pharmacy_id", pharmacyId)
    .eq("is_active", isActive)
    .order("name")

  if (error) {
    console.error("Error fetching vendors:", error)
    return { error, data: null }
  }

  return { error: null, data }
}

// Create a purchase order
export async function createPurchaseOrder(
  orderData: Omit<PurchaseOrder, "id" | "created_at">,
  items: Array<Omit<PurchaseOrderItem, "id" | "created_at" | "purchase_order_id" | "total_price">>,
) {
  const supabase = createClient(cookies())

  // Create the purchase order
  const { data: order, error: orderError } = await supabase.from("purchase_orders").insert(orderData).select().single()

  if (orderError || !order) {
    console.error("Error creating purchase order:", orderError)
    return { error: orderError, data: null }
  }

  // Insert purchase order items
  const orderItems = items.map((item) => ({
    purchase_order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.quantity * item.unit_price,
  }))

  const { error: itemsError } = await supabase.from("purchase_order_items").insert(orderItems)

  if (itemsError) {
    console.error("Error creating purchase order items:", itemsError)
    return { error: itemsError, data: null }
  }

  // Log the activity
  await logActivity({
    user_id: orderData.user_id,
    action: "create",
    entity_type: "purchase_order",
    entity_id: order.id,
    details: { total_amount: orderData.total_amount, vendor_id: orderData.vendor_id },
    pharmacy_id: orderData.pharmacy_id,
  })

  return { error: null, data: order }
}

// Get purchase orders with pagination
export async function getPurchaseOrders(pharmacyId: string, page = 1, limit = 10, status?: string) {
  const supabase = createClient(cookies())

  let query = supabase
    .from("purchase_orders")
    .select(
      `
      *,
      vendors:vendor_id (
        name
      )
    `,
      { count: "exact" },
    )
    .eq("pharmacy_id", pharmacyId)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching purchase orders:", error)
    return { error, data: null, count: 0 }
  }

  // Format the data to include vendor name
  const formattedData = data.map((order) => ({
    ...order,
    vendor_name: order.vendors.name,
  }))

  return { error: null, data: formattedData, count: count || 0 }
}

// Get a single purchase order with its items
export async function getPurchaseOrderWithItems(orderId: string, pharmacyId: string) {
  const supabase = createClient(cookies())

  // Get the purchase order
  const { data: order, error: orderError } = await supabase
    .from("purchase_orders")
    .select(`
      *,
      vendors:vendor_id (
        name
      )
    `)
    .eq("id", orderId)
    .eq("pharmacy_id", pharmacyId)
    .single()

  if (orderError || !order) {
    console.error("Error fetching purchase order:", orderError)
    return { error: orderError, data: null }
  }

  // Get the purchase order items with product names
  const { data: items, error: itemsError } = await supabase
    .from("purchase_order_items")
    .select(`
      *,
      products:product_id (
        name
      )
    `)
    .eq("purchase_order_id", orderId)

  if (itemsError) {
    console.error("Error fetching purchase order items:", itemsError)
    return { error: itemsError, data: null }
  }

  // Format the items to include product name
  const formattedItems = items.map((item) => ({
    ...item,
    product_name: item.products.name,
  }))

  const orderWithItems: PurchaseOrderWithItems = {
    ...order,
    items: formattedItems,
    vendor_name: order.vendors.name,
  }

  return { error: null, data: orderWithItems }
}

// Create an invoice for a purchase order
export async function createInvoice(invoiceData: Omit<Invoice, "id" | "created_at">) {
  const supabase = createClient(cookies())

  const { data, error } = await supabase.from("invoices").insert(invoiceData).select().single()

  if (error) {
    console.error("Error creating invoice:", error)
    return { error, data: null }
  }

  // Update purchase order status
  const { error: updateError } = await supabase
    .from("purchase_orders")
    .update({ status: "invoiced" })
    .eq("id", invoiceData.purchase_order_id)

  if (updateError) {
    console.error("Error updating purchase order status:", updateError)
    // Continue even if update fails
  }

  // Log the activity
  await logActivity({
    user_id: invoiceData.pharmacy_id, // Using pharmacy_id as a proxy for user_id here
    action: "create",
    entity_type: "invoice",
    entity_id: data.id,
    details: {
      invoice_number: invoiceData.invoice_number,
      purchase_order_id: invoiceData.purchase_order_id,
      total_amount: invoiceData.total_amount,
    },
    pharmacy_id: invoiceData.pharmacy_id,
  })

  return { error: null, data }
}

// Get invoices for a pharmacy
export async function getInvoices(pharmacyId: string, page = 1, limit = 10, status?: string) {
  const supabase = createClient(cookies())

  let query = supabase
    .from("invoices")
    .select(
      `
      *,
      purchase_orders:purchase_order_id (
        vendor_id,
        vendors:vendor_id (
          name
        )
      )
    `,
      { count: "exact" },
    )
    .eq("pharmacy_id", pharmacyId)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching invoices:", error)
    return { error, data: null, count: 0 }
  }

  // Format the data to include vendor name
  const formattedData = data.map((invoice) => ({
    ...invoice,
    vendor_name: invoice.purchase_orders.vendors.name,
  }))

  return { error: null, data: formattedData, count: count || 0 }
}
