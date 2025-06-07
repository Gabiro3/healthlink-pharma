import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient()

    const { pharmacyCode } = await request.json()

    if (!pharmacyCode) {
      return NextResponse.json({ error: "Pharmacy code is required" }, { status: 400 })
    }

    // Check if pharmacy exists with this code
    const { data, error } = await supabase
      .from("pharmacies")
      .select("id, name, code")
      .eq("code", pharmacyCode)
      .eq("is_active", true)

    if (error || !data) {
      return NextResponse.json({ error: "Invalid pharmacy code" }, { status: 404 })
    }

    return NextResponse.json({
      exists: true,
      pharmacy: {
        id: data[0].id,
        name: data[0].name,
        code: data[0].code,
      },
    })
  } catch (error) {
    console.error("Verify pharmacy error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
