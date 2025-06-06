import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { isSuperAdmin, getAllPharmacies } from "@/lib/admin"
import { generatePharmacyCode } from "@/lib/auth"
import { logActivity } from "@/lib/activity"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is super admin
    const isSuper = await isSuperAdmin(user.id)

    if (!isSuper) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const pharmacyData = await request.json()

    if (!pharmacyData.name || !pharmacyData.address || !pharmacyData.contact_number || !pharmacyData.email) {
      return NextResponse.json({ error: "All pharmacy details are required" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Generate pharmacy code
    const pharmacyCode = generatePharmacyCode()

    const completePharmacyData = {
      ...pharmacyData,
      code: pharmacyCode,
      is_active: true,
    }

    const { data, error } = await supabase.from("pharmacies").insert(completePharmacyData).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log activity
    await logActivity({
      user_id: user.id,
      action: "create",
      entity_type: "pharmacy",
      entity_id: data.id,
      details: { name: pharmacyData.name, code: pharmacyCode },
      pharmacy_id: data.id,
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Create pharmacy error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is super admin
    const isSuper = await isSuperAdmin(user.id)

    if (!isSuper) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const { data, error, count } = await getAllPharmacies(page, limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    console.error("Get pharmacies error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
