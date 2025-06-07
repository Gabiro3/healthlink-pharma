import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const pharmacyId = searchParams.get("pharmacy_id")

    if (!category || !pharmacyId) {
      return NextResponse.json({ error: "Category and pharmacy_id are required" }, { status: 400 })
    }

    const supabase = createClient()

    // Get current year and month
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("pharmacy_id", pharmacyId)
      .eq("category", category)
      .gte("year", currentYear - 1) // Include last year's budgets
      .order("year", { ascending: false })
      .order("month", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching budgets by category:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
