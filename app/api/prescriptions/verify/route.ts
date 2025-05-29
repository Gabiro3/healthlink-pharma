import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  try {
    const { share_code } = await request.json()

    if (!share_code) {
      return NextResponse.json({ error: "Share code is required" }, { status: 400 })
    }

    // Find prescription by share code
    const { data: prescription, error: prescriptionError } = await supabase
      .from("prescriptions")
      .select(`
        *,
        patients(id, name)
      `)
      .eq("share_code", share_code)
      .single()

    if (prescriptionError) {
      return NextResponse.json(
        {
          error: "Invalid share code or prescription not found",
        },
        { status: 404 },
      )
    }

    // Check if prescription is expired
    const today = new Date()
    const expiryDate = new Date(prescription.expiry_date)

    if (expiryDate < today) {
      return NextResponse.json(
        {
          error: "Prescription has expired",
          data: {
            prescription,
            expired: true,
          },
        },
        { status: 400 },
      )
    }

    // Get prescription items
    const { data: items, error: itemsError } = await supabase
      .from("prescription_items")
      .select(`
        *,
        medicines(id, name, unit_price, stock_quantity)
      `)
      .eq("prescription_id", prescription.id)

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 400 })
    }

    return NextResponse.json({
      data: {
        ...prescription,
        items,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}
