import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createBudget } from "@/lib/budget-enhanced"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const budgetData = await request.json()

    if (!budgetData.year || !budgetData.month || !budgetData.category || !budgetData.allocated_amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await createBudget(
      budgetData.pharmacy_id || user.pharmacy_id,
      {
        year: budgetData.year,
        month: budgetData.month,
        category: budgetData.category,
        allocated_amount: budgetData.allocated_amount,
      },
      budgetData.user_id || user.id,
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Create budget error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
