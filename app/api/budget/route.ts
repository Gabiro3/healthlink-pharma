import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const limit = Number.parseInt(url.searchParams.get("limit") || "100")

    let query = supabase
      .from("budget_plans")
      .select(`
        *,
        budget_allocations(
          id,
          category_id,
          allocated_amount,
          currency,
          notes,
          medicine_categories(id, name)
        )
      `)
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    if (limit > 0) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Ensure we return an array even if data is null
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching budget plans:", error)
    return NextResponse.json({ error: "Failed to fetch budget plans" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.start_date || !data.end_date || !data.total_budget) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (data.total_budget <= 0) {
      return NextResponse.json({ error: "Total budget must be greater than 0" }, { status: 400 })
    }

    if (new Date(data.end_date) <= new Date(data.start_date)) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 })
    }

    // Create budget plan
    const { data: plan, error: planError } = await supabase
      .from("budget_plans")
      .insert({
        title: data.title,
        start_date: data.start_date,
        end_date: data.end_date,
        total_budget: data.total_budget,
        currency: data.currency || "RWF",
        status: data.status || "draft",
        notes: data.notes || "",
        created_by: data.created_by,
      })
      .select()
      .single()

    if (planError) {
      console.error("Error creating budget plan:", planError)
      return NextResponse.json({ error: planError.message }, { status: 500 })
    }

    // Insert allocations if provided
    if (data.allocations && Array.isArray(data.allocations) && data.allocations.length > 0) {
      const allocations = data.allocations.map((allocation: any) => ({
        budget_plan_id: plan.id,
        category_id: allocation.category_id,
        allocated_amount: allocation.allocated_amount || 0,
        currency: allocation.currency || data.currency || "RWF",
        notes: allocation.notes || "",
      }))

      const { error: allocationsError } = await supabase.from("budget_allocations").insert(allocations)

      if (allocationsError) {
        // Rollback plan creation
        await supabase.from("budget_plans").delete().eq("id", plan.id)
        console.error("Error creating budget allocations:", allocationsError)
        return NextResponse.json({ error: allocationsError.message }, { status: 500 })
      }
    }

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error("Error creating budget plan:", error)
    return NextResponse.json({ error: "Failed to create budget plan" }, { status: 500 })
  }
}
