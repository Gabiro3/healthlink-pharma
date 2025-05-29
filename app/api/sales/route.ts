import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  // Get query parameters
  const url = new URL(request.url)
  const startDate = url.searchParams.get("start_date")
  const endDate = url.searchParams.get("end_date")
  const limit = Number.parseInt(url.searchParams.get("limit") || "10")
  const offset = Number.parseInt(url.searchParams.get("offset") || "0")

  // Build query
  let query = supabase
    .from("sales")
    .select(`
      *,
      patients(id, name)
    `)
    .order("created_at", { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1)

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
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data, count })
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  try {
    const { sale, items } = await request.json()

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json(
        {
          error: "At least one sale item is required",
        },
        { status: 400 },
      )
    }

    // Generate invoice number
    const timestamp = new Date().getTime().toString().slice(-6)
    const invoiceNumber = `INV-${timestamp}`

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.total_price || 0)
    }, 0)

    // Create the sale
    const { data, error } = await supabase
      .from("sales")
      .insert({
        ...sale,
        invoice_number: sale.invoice_number || invoiceNumber,
        total_amount: totalAmount,
        payment_status: sale.payment_status || "paid",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Add sale items
    const saleItems = items.map((item: any) => ({
      ...item,
      sale_id: data.id,
    }))

    const { error: itemsError } = await supabase.from("sale_items").insert(saleItems)

    if (itemsError) {
      // Rollback sale creation
      await supabase.from("sales").delete().eq("id", data.id)
      return NextResponse.json({ error: itemsError.message }, { status: 400 })
    }

    // Update medicine stock quantities and create inventory transactions
    for (const item of items) {
      // Get current medicine data
      const { data: medicine, error: medicineError } = await supabase
        .from("medicines")
        .select("stock_quantity")
        .eq("id", item.medicine_id)
        .single()

      if (medicineError) {
        continue
      }

      // Update stock quantity
      const newQuantity = medicine.stock_quantity - item.quantity

      await supabase.from("medicines").update({ stock_quantity: newQuantity }).eq("id", item.medicine_id)

      // Create inventory transaction
      await supabase.from("inventory_transactions").insert({
        medicine_id: item.medicine_id,
        quantity: item.quantity,
        transaction_type: "sale",
        reference_id: data.id,
        created_by: sale.created_by,
        notes: `Sale: ${data.invoice_number}`,
      })
    }

    // If this is a prescription sale, update prescription status
    if (sale.prescription_id) {
      await supabase.from("prescriptions").update({ status: "dispensed" }).eq("id", sale.prescription_id)
    }

    return NextResponse.json(
      {
        data: {
          ...data,
          items: saleItems,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}
