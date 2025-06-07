import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getBudgetForecast } from "@/lib/budget-enhanced"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pharmacyId = searchParams.get("pharmacy_id") || user.pharmacy_id
    const category = searchParams.get("category")
    const monthsAhead = Number.parseInt(searchParams.get("months_ahead") || "3")

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 })
    }

    const { data: forecast, error } = await getBudgetForecast(pharmacyId, category, monthsAhead)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ forecast })
  } catch (error) {
    console.error("Budget forecast error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
