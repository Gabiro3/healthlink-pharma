import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const limit = Number.parseInt(url.searchParams.get("limit") || "100")

    let query = supabase
      .from("procurement_orders")
      .select("*, procurement_items(*)")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching procurement orders:", error)
    return NextResponse.json({ error: "Failed to fetch procurement orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const data = await request.json()

    // Start a transaction
    const { data: order, error: orderError } = await supabase
      .from("procurement_orders")
      .insert({
        order_number: data.order_number,
        supplier_name: data.supplier_name,
        supplier_id: data.supplier_id,
        total_amount: data.total_amount,
        currency: data.currency,
        status: data.status,
        expected_delivery_date: data.expected_delivery_date,
        notes: data.notes,
        created_by: data.created_by,
      })
      .select()

    if (orderError) throw orderError

    // Insert order items
    if (data.items && data.items.length > 0) {
      const items = data.items.map((item: any) => ({
        procurement_order_id: order[0].id,
        medicine_id: item.medicine_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency: item.currency || data.currency,
        total_price: item.total_price,
      }))

      const { error: itemsError } = await supabase.from("procurement_items").insert(items)

      if (itemsError) throw itemsError
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating procurement order:", error)
    return NextResponse.json({ error: "Failed to create procurement order" }, { status: 500 })
  }
}
