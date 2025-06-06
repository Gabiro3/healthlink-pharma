import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getProductSalesReport, isPharmacyAdmin } from "@/lib/admin"

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
    const startDate = searchParams.get("startDate") || undefined
    const endDate = searchParams.get("endDate") || undefined

    const { data, error } = await getProductSalesReport(user.pharmacy_id, startDate, endDate)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Get sales report error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
