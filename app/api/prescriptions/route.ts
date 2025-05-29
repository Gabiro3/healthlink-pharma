import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"
import { randomBytes } from "crypto"

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  // Get query parameters
  const url = new URL(request.url)
  const patientId = url.searchParams.get("patient_id")
  const status = url.searchParams.get("status")
  const limit = Number.parseInt(url.searchParams.get("limit") || "10")
  const offset = Number.parseInt(url.searchParams.get("offset") || "0")

  // Build query
  let query = supabase
    .from("prescriptions")
    .select(`
      *,
      patients(id, name)
    `)
    .order("created_at", { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1)

  // Add filters if provided
  if (patientId) {
    query = query.eq("patient_id", patientId)
  }

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data, count })
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  try {
    const { prescription, items } = await request.json()

    // Validate required fields
    if (!prescription.patient_id || !prescription.doctor_name || !items || items.length === 0) {
      return NextResponse.json(
        {
          error: "Patient ID, doctor name, and at least one medicine item are required",
        },
        { status: 400 },
      )
    }

    // Generate a unique share code (6 characters alphanumeric)
    const shareCode = randomBytes(3).toString("hex").toUpperCase()

    // Create the prescription
    const { data, error } = await supabase
      .from("prescriptions")
      .insert({
        ...prescription,
        share_code: shareCode,
        status: prescription.status || "active",
        issue_date: prescription.issue_date || new Date().toISOString().split("T")[0],
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Add prescription items
    const prescriptionItems = items.map((item: any) => ({
      ...item,
      prescription_id: data.id,
    }))

    const { error: itemsError } = await supabase.from("prescription_items").insert(prescriptionItems)

    if (itemsError) {
      // Rollback prescription creation
      await supabase.from("prescriptions").delete().eq("id", data.id)
      return NextResponse.json({ error: itemsError.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        data: {
          ...data,
          items: prescriptionItems,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}
