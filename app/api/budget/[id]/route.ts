import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    const { data, error } = await supabase.from("budget_plans").select("*, budget_allocations(*)").eq("id", id).single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching budget plan:", error)
    return NextResponse.json({ error: "Failed to fetch budget plan" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id
    const data = await request.json()

    // Update budget plan
    const { data: plan, error: planError } = await supabase
      .from("budget_plans")
      .update({
        title: data.title,
        start_date: data.start_date,
        end_date: data.end_date,
        total_budget: data.total_budget,
        currency: data.currency,
        status: data.status,
        notes: data.notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (planError) throw planError

    // Delete existing allocations
    const { error: deleteError } = await supabase.from("budget_allocations").delete().eq("budget_plan_id", id)

    if (deleteError) throw deleteError

    // Insert updated allocations
    if (data.allocations && data.allocations.length > 0) {
      const allocations = data.allocations.map((allocation: any) => ({
        budget_plan_id: id,
        category_id: allocation.category_id,
        allocated_amount: allocation.allocated_amount,
        currency: allocation.currency || data.currency,
        notes: allocation.notes,
      }))

      const { error: allocationsError } = await supabase.from("budget_allocations").insert(allocations)

      if (allocationsError) throw allocationsError
    }

    return NextResponse.json(plan)
  } catch (error) {
    console.error("Error updating budget plan:", error)
    return NextResponse.json({ error: "Failed to update budget plan" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    // Delete budget plan (cascade will delete allocations)
    const { error } = await supabase.from("budget_plans").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting budget plan:", error)
    return NextResponse.json({ error: "Failed to delete budget plan" }, { status: 500 })
  }
}
