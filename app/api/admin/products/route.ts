import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { isPharmacyAdmin } from "@/lib/admin"
import { logActivity } from "@/lib/activity"

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

    const productData = await request.json()

    if (!productData.name || !productData.category || !productData.unit_price) {
      return NextResponse.json({ error: "Name, category, and price are required" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Add pharmacy ID to product data
    const completeProductData = {
      ...productData,
      pharmacy_id: user.pharmacy_id,
      is_active: true,
    }

    const { data, error } = await supabase.from("products").insert(completeProductData).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log activity
    await logActivity({
      user_id: user.id,
      action: "create",
      entity_type: "product",
      entity_id: data.id,
      details: { name: productData.name, category: productData.category },
      pharmacy_id: user.pharmacy_id,
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
