import { getSupabaseClient } from "@/lib/supabase-client"
import type { BudgetPlan, BudgetAllocation, BudgetPlanWithAllocations } from "@/lib/types"
import type { SupportedCurrency } from "./currency-service"
import { useAuth } from "@/contexts/auth-context"

// Get budget plans with pagination and filtering
export async function getBudgetPlans(options: {
  status?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
  currency?: SupportedCurrency
}): Promise<{ data: BudgetPlanWithAllocations[]; count: number }> {
  const supabase = getSupabaseClient()
  const { status, startDate, endDate, limit = 10, offset = 0, currency = "RWF" } = options

  try {
    // Build query
    let query = supabase
      .from("budget_plans")
      .select(
        `
        *,
        budget_allocations(
          id,
          category_id,
          allocated_amount,
          currency,
          notes,
          medicine_categories(id, name)
        )
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })

    // Add status filter if provided
    if (status) {
      query = query.eq("status", status)
    }

    // Add date filters if provided
    if (startDate) {
      query = query.gte("start_date", startDate)
    }

    if (endDate) {
      query = query.lte("end_date", endDate)
    }

    // Apply pagination
    if (limit > 0) {
      query = query.limit(limit).range(offset, offset + limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching budget plans:", error)
      return { data: [], count: 0 }
    }

    return {
      data: (data as BudgetPlanWithAllocations[]) || [],
      count: count || 0,
    }
  } catch (error) {
    console.error("Error in getBudgetPlans:", error)
    return { data: [], count: 0 }
  }
}

// Create a new budget plan
export async function createBudgetPlan(
  plan: Omit<BudgetPlan, "id" | "created_at" | "updated_at" | "created_by">,
  allocations: Omit<BudgetAllocation, "id" | "budget_plan_id" | "created_at" | "updated_at">[],
): Promise<BudgetPlanWithAllocations | null> {
  const supabase = getSupabaseClient()
  const { user } = useAuth()

  try {
    // Validate input data
    if (!plan.title || !plan.start_date || !plan.end_date || !plan.total_budget) {
      console.error("Invalid plan data:", plan)
      return null
    }

    if (!Array.isArray(allocations) || allocations.length === 0) {
      console.error("Invalid allocations data:", allocations)
      return null
    }

    // Create the budget plan
    const { data, error } = await supabase
      .from("budget_plans")
      .insert({
        ...plan,
        created_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating budget plan:", error)
      return null
    }

    if (!data) {
      console.error("No data returned from budget plan creation")
      return null
    }

    // Add budget allocations
    const budgetAllocations = allocations.map((allocation) => ({
      ...allocation,
      budget_plan_id: data.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    const { data: allocationData, error: allocationsError } = await supabase
      .from("budget_allocations")
      .insert(budgetAllocations)
      .select()

    if (allocationsError) {
      // Rollback plan creation
      await supabase.from("budget_plans").delete().eq("id", data.id)
      console.error("Error creating budget allocations:", allocationsError)
      return null
    }

    // Return the created plan with allocations
    return {
      ...data,
      budget_allocations: allocationData || [],
    } as BudgetPlanWithAllocations
  } catch (error) {
    console.error("Error in createBudgetPlan:", error)
    return null
  }
}

// Update budget plan status
export async function updateBudgetPlanStatus(planId: string, status: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  try {
    const { error } = await supabase
      .from("budget_plans")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", planId)

    if (error) {
      console.error("Error updating budget plan status:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in updateBudgetPlanStatus:", error)
    return false
  }
}

// Get budget vs actual spending
export async function getBudgetVsActual(options: {
  budgetPlanId?: string
  startDate?: string
  endDate?: string
  currency?: SupportedCurrency
}): Promise<{
  categories: Array<{
    id: string
    name: string
    budgeted: number
    actual: number
    variance: number
  }>
  totals: {
    budgeted: number
    actual: number
    variance: number
  }
}> {
  const supabase = getSupabaseClient()
  const { budgetPlanId, startDate, endDate, currency = "RWF" } = options

  try {
    // Get budget plan if ID is provided
    let budgetPlan = null
    if (budgetPlanId) {
      const { data, error } = await supabase
        .from("budget_plans")
        .select(`
          *,
          budget_allocations(
            id,
            category_id,
            allocated_amount,
            medicine_categories(id, name)
          )
        `)
        .eq("id", budgetPlanId)
        .maybeSingle() // Use maybeSingle instead of single to handle no results

      if (error) {
        console.error("Error fetching budget plan:", error)
      } else if (data) {
        budgetPlan = data
      }
    }

    // If no budget plan ID or couldn't fetch, get the most recent active plan
    if (!budgetPlan) {
      const { data, error } = await supabase
        .from("budget_plans")
        .select(`
          *,
          budget_allocations(
            id,
            category_id,
            allocated_amount,
            medicine_categories(id, name)
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle() // Use maybeSingle instead of single

      if (error) {
        console.error("Error fetching active budget plan:", error)
      } else if (data) {
        budgetPlan = data
      }
    }

    // If still no budget plan found, return empty result
    if (!budgetPlan || !budgetPlan.budget_allocations) {
      return {
        categories: [],
        totals: { budgeted: 0, actual: 0, variance: 0 },
      }
    }

    // Get actual spending by category
    const actualStartDate = startDate || budgetPlan.start_date
    const actualEndDate = endDate || budgetPlan.end_date

    // Get procurement orders in the date range
    const { data: procurementOrders, error: procurementError } = await supabase
      .from("procurement_orders")
      .select(`
        id,
        total_amount,
        currency,
        procurement_items(
          medicine_id,
          total_price,
          medicines(
            id,
            category_id
          )
        )
      `)
      .gte("created_at", actualStartDate)
      .lte("created_at", actualEndDate)
      .eq("status", "received") // Only count received orders

    if (procurementError) {
      console.error("Error fetching procurement data:", procurementError)
    }

    // Calculate actual spending by category
    const actualByCategory: Record<string, number> = {}

    if (procurementOrders && Array.isArray(procurementOrders)) {
      procurementOrders.forEach((order: any) => {
        if (order.procurement_items && Array.isArray(order.procurement_items)) {
          order.procurement_items.forEach((item: any) => {
            const categoryId = item.medicines?.category_id
            if (categoryId) {
              if (!actualByCategory[categoryId]) {
                actualByCategory[categoryId] = 0
              }
              actualByCategory[categoryId] += item.total_price || 0
            }
          })
        }
      })
    }

    // Prepare result
    const categories = (budgetPlan.budget_allocations || []).map((allocation: any) => {
      const categoryId = allocation.category_id
      const budgeted = allocation.allocated_amount || 0
      const actual = actualByCategory[categoryId] || 0
      const variance = budgeted - actual

      return {
        id: categoryId,
        name: allocation.medicine_categories?.name || "Unknown",
        budgeted,
        actual,
        variance,
      }
    })

    // Calculate totals
    const totals = {
      budgeted: categories.reduce((sum: any, cat: { budgeted: any }) => sum + cat.budgeted, 0),
      actual: categories.reduce((sum: any, cat: { actual: any }) => sum + cat.actual, 0),
      variance: categories.reduce((sum: any, cat: { variance: any }) => sum + cat.variance, 0),
    }

    return {
      categories,
      totals,
    }
  } catch (error) {
    console.error("Error in getBudgetVsActual:", error)
    return {
      categories: [],
      totals: { budgeted: 0, actual: 0, variance: 0 },
    }
  }
}
