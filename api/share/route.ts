import { type NextRequest, NextResponse } from "next/server"
import {getSupabaseClient} from "../../lib/supabase-client"

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient()

  try {
    const { share_code } = await request.json()

    if (!share_code) {
      return NextResponse.json({ error: "Share code is required" }, { status: 400 })
    }

    // Make an HTTP request to the external API
    const apiUrl = `${process.env.NEXT_PUBLIC_HDMS_URL}/${share_code}`
    const apiResponse = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Parse the response from the external API
    const apiData = await apiResponse.json()
    console.log("API Data:", apiData)

    if (!apiResponse.ok || apiData.error) {
      return NextResponse.json(
        {
          error: apiData.error || "Invalid share code or prescription not found",
        },
        { status: apiResponse.status || 404 },
      )
    }

    // Extract prescription from the data
    const prescription = apiData.data

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

    // Check if prescription is already dispensed
    if (prescription.status === "dispensed") {
      return NextResponse.json(
        {
          error: "Prescription has already been dispensed",
          data: {
            prescription,
            dispensed: true,
          },
        },
        { status: 400 },
      )
    }

    // Get prescription items from the database
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

    // Check if all medicines are in stock
    const outOfStockItems = items.filter((item: any) => item.medicines.stock_quantity < item.quantity)

    return NextResponse.json({
      data: {
        ...prescription,
        items,
        out_of_stock_items: outOfStockItems.length > 0 ? outOfStockItems : null,
      },
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}
