import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createPurchaseOrder } from "@/lib/procurement"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderData, items } = await request.json()

    if (!orderData || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid purchase order data" }, { status: 400 })
    }

    // Add user and pharmacy info to order data
    const completeData = {
      ...orderData,
      user_id: user.id,
      pharmacy_id: user.pharmacy_id,
    }

    const { data, error } = await createPurchaseOrder(completeData, items)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Create purchase order error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || undefined

    const cookieStore = cookies()
    const supabase = createClient()

    let query = supabase
      .from("purchase_orders")
      .select(
        `
        *,
        vendors:vendor_id (
          name
        )
      `,
        { count: "exact" },
      )
      .eq("pharmacy_id", user.pharmacy_id)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format the data to include vendor name
    const formattedData = data.map((order) => ({
      ...order,
      vendor_name: order.vendors.name,
    }))

    return NextResponse.json({
      data: formattedData,
      meta: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Get purchase orders error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
