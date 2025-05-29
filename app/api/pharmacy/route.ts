import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("pharmacies").select("*").limit(1).single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching pharmacy details:", error)
    return NextResponse.json({ error: "Failed to fetch pharmacy details" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const data = await request.json()

    const { data: existingPharmacy } = await supabase.from("pharmacies").select("id").limit(1)

    let result

    if (existingPharmacy && existingPharmacy.length > 0) {
      // Update existing pharmacy
      const { data: updatedData, error } = await supabase
        .from("pharmacies")
        .update({
          name: data.name,
          address: data.address,
          city: data.city,
          country: data.country,
          phone: data.phone,
          email: data.email,
          website: data.website,
          logo_url: data.logo_url,
          currency: data.currency,
          tax_rate: data.tax_rate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingPharmacy[0].id)
        .select()

      if (error) throw error
      result = updatedData
    } else {
      // Create new pharmacy
      const { data: newData, error } = await supabase
        .from("pharmacies")
        .insert({
          name: data.name,
          address: data.address,
          city: data.city,
          country: data.country,
          phone: data.phone,
          email: data.email,
          website: data.website,
          logo_url: data.logo_url,
          currency: data.currency,
          tax_rate: data.tax_rate,
        })
        .select()

      if (error) throw error
      result = newData
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error saving pharmacy details:", error)
    return NextResponse.json({ error: "Failed to save pharmacy details" }, { status: 500 })
  }
}
