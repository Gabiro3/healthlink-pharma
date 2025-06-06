import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getPharmacyBilling, isPharmacyAdmin } from "@/lib/admin"

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

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const { data, error, count } = await getPharmacyBilling(user.pharmacy_id, page, limit)

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
    console.error("Get billing error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
