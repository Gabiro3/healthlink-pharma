import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createExpense } from "@/lib/expenses"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const expenseData = await request.json()

    if (!expenseData.description || !expenseData.amount || !expenseData.expense_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await createExpense(user.pharmacy_id, expenseData, user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Create expense error:", error)
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
    const year = searchParams.get("year") ? Number.parseInt(searchParams.get("year")!) : undefined
    const month = searchParams.get("month") ? Number.parseInt(searchParams.get("month")!) : undefined

    const supabase = createClient()

    let query = supabase
      .from("expenses")
      .select(`
        *,
        recorded_by_user:recorded_by(email),
        approved_by_user:approved_by(email)
      `)
      .eq("pharmacy_id", user.pharmacy_id)
      .order("created_at", { ascending: false })

    if (year) {
      query = query.gte("expense_date", `${year}-01-01`).lt("expense_date", `${year + 1}-01-01`)
    }

    if (month) {
      const startDate = `${year}-${month.toString().padStart(2, "0")}-01`
      const endDate = new Date(year!, month, 0).getDate()
      const endDateStr = `${year}-${month.toString().padStart(2, "0")}-${endDate}`
      query = query.gte("expense_date", startDate).lte("expense_date", endDateStr)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Get expenses error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
