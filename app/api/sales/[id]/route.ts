import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const id = params.id

  // Get sale details
  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .select(`
      *,
      patients(id, name),
      prescriptions(id, share_code)
    `)
    .eq("id", id)
    .single()

  if (saleError) {
    return NextResponse.json({ error: saleError.message }, { status: 404 })
  }

  // Get sale items
  const { data: items, error: itemsError } = await supabase
    .from("sale_items")
    .select(`
      *,
      medicines(id, name)
    `)
    .eq("sale_id", id)

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 400 })
  }

  return NextResponse.json({
    data: {
      ...sale,
      items,
    },
  })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const id = params.id

  try {
    const updates = await request.json()

    // Only allow updating payment status and payment method
    const { data, error } = await supabase
      .from("sales")
      .update({
        payment_status: updates.payment_status,
        payment_method: updates.payment_method,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}

// Note: We don't implement DELETE for sales as they should be preserved for accounting purposes
