import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  // Get query parameters
  const url = new URL(request.url)
  const category = url.searchParams.get("category")
  const search = url.searchParams.get("search")
  const limit = Number.parseInt(url.searchParams.get("limit") || "10")
  const offset = Number.parseInt(url.searchParams.get("offset") || "0")

  // Build query
  let query = supabase
    .from("medicines")
    .select(`
      *,
      medicine_categories(id, name)
    `)
    .order("name", { ascending: true })
    .limit(limit)
    .range(offset, offset + limit - 1)

  // Add filters if provided
  if (category) {
    query = query.eq("category_id", category)
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%, description.ilike.%${search}%, sku.ilike.%${search}%, barcode.ilike.%${search}%`,
    )
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
    const medicine = await request.json()

    // Validate required fields
    if (!medicine.name || !medicine.category_id) {
      return NextResponse.json({ error: "Name and category are required" }, { status: 400 })
    }

    const { data, error } = await supabase.from("medicines").insert(medicine).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Create inventory transaction for initial stock
    if (medicine.stock_quantity > 0) {
      await supabase.from("inventory_transactions").insert({
        medicine_id: data.id,
        quantity: medicine.stock_quantity,
        transaction_type: "initial",
        created_by: medicine.created_by || null,
        notes: "Initial inventory",
      })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}
