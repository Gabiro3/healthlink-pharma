import { createClient } from "@/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { pharmacyCode } = await request.json()
    const user = await getCurrentUser()

    if (!pharmacyCode || !user?.id || !user?.pharmacy_id) {
      return NextResponse.json(
        { error: "Invalid request or unauthenticated user" },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Look up pharmacy by code
    const { data: pharmacy, error: pharmacyError } = await supabase
      .from("pharmacies")
      .select("id, code, is_active")
      .eq("code", pharmacyCode)
      .single()

    if (pharmacyError || !pharmacy) {
      return NextResponse.json({ error: "Pharmacy not found" }, { status: 404 })
    }

    if (!pharmacy.is_active) {
      return NextResponse.json({ error: "Pharmacy is inactive" }, { status: 403 })
    }

    if (user.pharmacy_id !== pharmacy.id) {
      return NextResponse.json({ error: "User does not belong to this pharmacy" }, { status: 403 })
    }

    // Update last sign-in
    const { error: updateError } = await supabase
      .from("pharmacy_users")
      .update({ last_sign_in_at: new Date().toISOString() })
      .eq("user_id", user.id)

    if (updateError) {
      console.error("Error updating last sign-in:", updateError)
      // Not fatal
    }

    return NextResponse.json({
      message: "User verified successfully",
      user: {
        role: user.role,
        pharmacy_code: pharmacy.code,
      },
    })
  } catch (error) {
    console.error("Error verifying user pharmacy:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
