import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const url = new URL(request.url)
    const baseCurrency = url.searchParams.get("base") || "RWF"
    const date = url.searchParams.get("date") || new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("currency_rates")
      .select("*")
      .eq("base_currency", baseCurrency)
      .eq("effective_date", date)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching currency rates:", error)
    return NextResponse.json({ error: "Failed to fetch currency rates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const data = await request.json()

    // Check if rate already exists
    const { data: existingRate } = await supabase
      .from("currency_rates")
      .select("id")
      .eq("base_currency", data.base_currency)
      .eq("target_currency", data.target_currency)
      .eq("effective_date", data.effective_date)

    let result

    if (existingRate && existingRate.length > 0) {
      // Update existing rate
      const { data: updatedData, error } = await supabase
        .from("currency_rates")
        .update({
          rate: data.rate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRate[0].id)
        .select()

      if (error) throw error
      result = updatedData
    } else {
      // Create new rate
      const { data: newData, error } = await supabase
        .from("currency_rates")
        .insert({
          base_currency: data.base_currency,
          target_currency: data.target_currency,
          rate: data.rate,
          effective_date: data.effective_date,
        })
        .select()

      if (error) throw error
      result = newData
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error saving currency rate:", error)
    return NextResponse.json({ error: "Failed to save currency rate" }, { status: 500 })
  }
}
