import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createPharmacyUserByAdmin, isPharmacyAdmin } from "@/lib/admin"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is pharmacy admin
    const isAdmin = await isPharmacyAdmin(user.id, user.pharmacy_id)

    if (!isAdmin) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const userData = await request.json()

    if (!userData.email || !userData.password || !userData.role) {
      return NextResponse.json({ error: "Email, password, and role are required" }, { status: 400 })
    }

    // Add pharmacy ID to user data
    userData.pharmacyId = user.pharmacy_id

    const { data, error } = await createPharmacyUserByAdmin(userData, user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is pharmacy admin
    const isAdmin = await isPharmacyAdmin(user.id, user.pharmacy_id)

    if (!isAdmin) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
      .from("pharmacy_users")
      .select(`
        id,
        role,
        is_active,
        created_at,
        users:user_id (
          id,
          email,
          last_sign_in_at
        )
      `)
      .eq("pharmacy_id", user.pharmacy_id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format the data
    const formattedData = data.map((pharmacyUser) => ({
      id: pharmacyUser.users.id,
      email: pharmacyUser.users.email,
      role: pharmacyUser.role,
      is_active: pharmacyUser.is_active,
      created_at: pharmacyUser.created_at,
      last_sign_in_at: pharmacyUser.users.last_sign_in_at,
    }))

    return NextResponse.json({ data: formattedData })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
