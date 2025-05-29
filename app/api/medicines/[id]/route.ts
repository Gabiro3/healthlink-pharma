import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const id = params.id

  const { data, error } = await supabase
    .from("medicines")
    .select(`
      *,
      medicine_categories(id, name)
    `)
    .eq("id", id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json({ data })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const id = params.id

  try {
    const updates = await request.json()

    // Get current medicine data for inventory tracking
    const { data: currentMedicine, error: fetchError } = await supabase
      .from("medicines")
      .select("stock_quantity")
      .eq("id", id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 404 })
    }

    // Update the medicine
    const { data, error } = await supabase
      .from("medicines")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Create inventory transaction if stock quantity changed
    if (updates.stock_quantity !== undefined && updates.stock_quantity !== currentMedicine.stock_quantity) {
      const quantityChange = updates.stock_quantity - currentMedicine.stock_quantity

      await supabase.from("inventory_transactions").insert({
        medicine_id: id,
        quantity: Math.abs(quantityChange),
        transaction_type: quantityChange > 0 ? "addition" : "reduction",
        created_by: updates.updated_by || null,
        notes: "Manual inventory adjustment",
      })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const id = params.id

  // Check if medicine is used in prescriptions or sales
  const { count: prescriptionCount, error: prescriptionError } = await supabase
    .from("prescription_items")
    .select("*", { count: "exact", head: true })
    .eq("medicine_id", id)

  if (prescriptionError) {
    return NextResponse.json({ error: prescriptionError.message }, { status: 400 })
  }

  const { count: saleCount, error: saleError } = await supabase
    .from("sale_items")
    .select("*", { count: "exact", head: true })
    .eq("medicine_id", id)

  if (saleError) {
    return NextResponse.json({ error: saleError.message }, { status: 400 })
  }

  // Prevent deletion if medicine is used
  if (prescriptionCount > 0 || saleCount > 0) {
    return NextResponse.json(
      {
        error: "Cannot delete medicine that is used in prescriptions or sales",
      },
      { status: 400 },
    )
  }

  // Delete inventory transactions first
  await supabase.from("inventory_transactions").delete().eq("medicine_id", id)

  // Delete the medicine
  const { error } = await supabase.from("medicines").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
