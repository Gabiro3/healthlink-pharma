import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    const { data, error } = await supabase
      .from("procurement_orders")
      .select("*, procurement_items(*)")
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching procurement order:", error)
    return NextResponse.json({ error: "Failed to fetch procurement order" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id
    const data = await request.json()

    // Update order
    const { data: order, error: orderError } = await supabase
      .from("procurement_orders")
      .update({
        supplier_name: data.supplier_name,
        supplier_id: data.supplier_id,
        total_amount: data.total_amount,
        currency: data.currency,
        status: data.status,
        expected_delivery_date: data.expected_delivery_date,
        notes: data.notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (orderError) throw orderError

    // Delete existing items
    const { error: deleteError } = await supabase.from("procurement_items").delete().eq("procurement_order_id", id)

    if (deleteError) throw deleteError

    // Insert updated items
    if (data.items && data.items.length > 0) {
      const items = data.items.map((item: any) => ({
        procurement_order_id: id,
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
    console.error("Error updating procurement order:", error)
    return NextResponse.json({ error: "Failed to update procurement order" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    // Delete order (cascade will delete items)
    const { error } = await supabase.from("procurement_orders").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting procurement order:", error)
    return NextResponse.json({ error: "Failed to delete procurement order" }, { status: 500 })
  }
}
