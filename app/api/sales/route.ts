import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createSale } from "@/lib/sales"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { saleData, items } = await request.json()

    if (!saleData || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid sale data" }, { status: 400 })
    }

    // Add user and pharmacy info to sale data
    const completeData = {
      ...saleData,
      user_id: user.id,
      pharmacy_id: user.pharmacy_id,
    }

    const { data, error } = await createSale(completeData, items)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Create sale error:", error)
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
    const startDate = searchParams.get("startDate") || undefined
    const endDate = searchParams.get("endDate") || undefined
    const status = searchParams.get("status") || undefined

    const cookieStore = cookies()
    const supabase = createClient()

    let query = supabase
      .from("sales")
      .select("*", { count: "exact" })
      .eq("pharmacy_id", user.pharmacy_id)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (startDate && endDate) {
      query = query.gte("created_at", startDate).lte("created_at", endDate)
    }

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data,
      meta: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Get sales error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
