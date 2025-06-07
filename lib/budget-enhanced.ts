import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"

export type BudgetStats = {
  total_allocated: number
  total_spent: number
  total_remaining: number
  budget_count: number
  over_budget_count: number
}

export type BudgetForecast = {
  month: number
  year: number
  projected_spending: number
  recommended_budget: number
}

export type CreateBudgetData = {
  year: number
  month: number
  category: string
  allocated_amount: number
}

// Get budget statistics for a pharmacy
export async function getBudgetStats(pharmacyId: string): Promise<{ data: BudgetStats | null; error: any }> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_budget_stats", {
    p_pharmacy_id: pharmacyId,
  })

  if (error) {
    console.error("Error fetching budget stats:", error)
    return { error, data: null }
  }

  return { error: null, data: data[0] }
}

// Create a new budget
export async function createBudget(
  pharmacyId: string,
  budgetData: CreateBudgetData,
  userId: string,
): Promise<{ data: string | null; error: any }> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("create_budget", {
    p_pharmacy_id: pharmacyId,
    p_year: budgetData.year,
    p_month: budgetData.month,
    p_category: budgetData.category,
    p_allocated_amount: budgetData.allocated_amount,
    p_user_id: userId,
  })

  if (error) {
    console.error("Error creating budget:", error)
    return { error, data: null }
  }

  return { error: null, data }
}

// Get budget forecast
export async function getBudgetForecast(
  pharmacyId: string,
  category: string,
  monthsAhead = 3,
): Promise<{ data: BudgetForecast[] | null; error: any }> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_budget_forecast", {
    p_pharmacy_id: pharmacyId,
    p_category: category,
    p_months_ahead: monthsAhead,
  })

  if (error) {
    console.error("Error fetching budget forecast:", error)
    return { error, data: null }
  }

  return { error: null, data }
}

// Get all budgets for a pharmacy with enhanced data
export async function getEnhancedBudgets(pharmacyId: string, year?: number, month?: number) {
  const supabase = createClient()

  let query = supabase
    .from("budgets")
    .select("*")
    .eq("pharmacy_id", pharmacyId)
    .order("created_at", { ascending: false })

  if (year) {
    query = query.eq("year", year)
  }

  if (month) {
    query = query.eq("month", month)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching budgets:", error)
    return { error, data: null }
  }

  // Calculate additional metrics
  const enhancedBudgets = data.map((budget) => ({
    ...budget,
    percentage_used: budget.allocated_amount > 0 ? (budget.spent_amount / budget.allocated_amount) * 100 : 0,
    remaining_amount: budget.allocated_amount - budget.spent_amount,
    status:
      budget.spent_amount > budget.allocated_amount
        ? "over_budget"
        : budget.spent_amount > budget.allocated_amount * 0.9
          ? "warning"
          : "healthy",
  }))

  return { error: null, data: enhancedBudgets }
}

// Update budget spending
export async function updateBudgetSpending(budgetId: string, amount: number, userId: string) {
  const supabase = createClient()

  const { error } = await supabase.rpc("update_budget_spending", {
    p_budget_id: budgetId,
    p_amount: amount,
    p_user_id: userId,
  })

  if (error) {
    console.error("Error updating budget spending:", error)
    return { error }
  }

  return { error: null }
}
// Get budget by ID
export async function getBudgetById(budgetId: string, pharmacyId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("id", budgetId)
    .eq("pharmacy_id", pharmacyId)
    .single()

  if (error) {
    console.error("Error fetching budget:", error)
    return { error, data: null }
  }

  // Calculate derived fields
  const remaining_amount = data.allocated_amount - data.spent_amount
  const percentage_used = data.allocated_amount > 0 ? (data.spent_amount / data.allocated_amount) * 100 : 0

  let status = "healthy"
  if (percentage_used >= 100) {
    status = "over_budget"
  } else if (percentage_used >= 90) {
    status = "warning"
  }

  return {
    error: null,
    data: {
      ...data,
      remaining_amount,
      percentage_used,
      status,
    },
  }
}

// Get budget transactions
export async function getBudgetTransactions(budgetId: string, pharmacyId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("expenses")
    .select(`
      id,
      description,
      amount,
      expense_date,
      recorded_by,
      created_at,
      users:recorded_by (
        email
      )
    `)
    .eq("budget_id", budgetId)
    .eq("pharmacy_id", pharmacyId)
    .eq("is_approved", true)
    .order("expense_date", { ascending: false })

  if (error) {
    console.error("Error fetching budget transactions:", error)
    return { error, data: null }
  }

  // Transform data to include user names
  const transactions = data.map((expense) => ({
    id: expense.id,
    description: expense.description,
    amount: expense.amount,
    date: expense.expense_date,
    type: "expense" as const,
    recorded_by: expense.recorded_by,
    recorded_by_name: expense.users?.[0].email || "Unknown User",
    created_at: expense.created_at,
  }))

  return { error: null, data: transactions }
}
