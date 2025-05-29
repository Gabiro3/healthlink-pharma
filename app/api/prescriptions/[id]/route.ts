import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const id = params.id

  // Get prescription details
  const { data: prescription, error: prescriptionError } = await supabase
    .from("prescriptions")
    .select(`
      *,
      patients(id, name)
    `)
    .eq("id", id)
    .single()

  if (prescriptionError) {
    return NextResponse.json({ error: prescriptionError.message }, { status: 404 })
  }

  // Get prescription items
  const { data: items, error: itemsError } = await supabase
    .from("prescription_items")
    .select(`
      *,
      medicines(id, name, unit_price)
    `)
    .eq("prescription_id", id)

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 400 })
  }

  return NextResponse.json({
    data: {
      ...prescription,
      items,
    },
  })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const id = params.id

  try {
    const { prescription, items } = await request.json()

    // Update prescription
    const { data, error } = await supabase
      .from("prescriptions")
      .update({
        ...prescription,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // If items are provided, update them
    if (items && items.length > 0) {
      // Delete existing items
      await supabase.from("prescription_items").delete().eq("prescription_id", id)

      // Add new items
      const prescriptionItems = items.map((item: any) => ({
        ...item,
        prescription_id: id,
      }))

      const { error: itemsError } = await supabase.from("prescription_items").insert(prescriptionItems)

      if (itemsError) {
        return NextResponse.json({ error: itemsError.message }, { status: 400 })
      }
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const id = params.id

  // Check if prescription is used in sales
  const { count, error: countError } = await supabase
    .from("sales")
    .select("*", { count: "exact", head: true })
    .eq("prescription_id", id)

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 400 })
  }

  if (count > 0) {
    return NextResponse.json(
      {
        error: "Cannot delete prescription that is used in sales",
      },
      { status: 400 },
    )
  }

  // Delete prescription items first
  await supabase.from("prescription_items").delete().eq("prescription_id", id)

  // Delete the prescription
  const { error } = await supabase.from("prescriptions").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
