import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"
import type { Database } from "./database.types"
import { logActivity } from "./activity"

export type Expense = Database["public"]["Tables"]["expenses"]["Row"] & {
  recorded_by_email?: string
  approved_by_email?: string
}

export type ExpenseStats = {
  total_expenses: number
  approved_expenses: number
  pending_expenses: number
  expense_count: number
  budget_allocated: number
  budget_remaining: number
  budget_utilization: number
}

export type CreateExpenseData = {
  description: string
  amount: number
  expense_date: string
  payment_method: string
  category: string
  receipt_url?: string
}

// Get expenses for a pharmacy
export async function getExpenses(pharmacyId: string, year?: number, month?: number) {
  const supabase = createClient()

  let query = supabase
    .from("expenses")
    .select(`
      *,
      recorded_by_user:recorded_by(email),
      approved_by_user:approved_by(email)
    `)
    .eq("pharmacy_id", pharmacyId)
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
    console.error("Error fetching expenses:", error)
    return { error, data: null }
  }

  // Format the data
  const formattedData = data.map((expense) => ({
    ...expense,
    recorded_by_email: expense.recorded_by_user?.email,
    approved_by_email: expense.approved_by_user?.email,
  }))

  return { error: null, data: formattedData }
}

// Get expense statistics
export async function getExpenseStats(pharmacyId: string, year?: number, month?: number) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_expense_stats", {
    p_pharmacy_id: pharmacyId,
    p_year: year,
    p_month: month,
  })

  if (error) {
    console.error("Error fetching expense stats:", error)
    return { error, data: null }
  }

  return { error: null, data: data[0] }
}

// Create a new expense
export async function createExpense(
  pharmacyId: string,
  expenseData: CreateExpenseData,
  userId: string,
): Promise<{ data: string | null; error: any }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      ...expenseData,
      pharmacy_id: pharmacyId,
      recorded_by: userId,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating expense:", error)
    return { error, data: null }
  }

  // Log the activity
  await logActivity({
    user_id: userId,
    action: "create",
    entity_type: "expense",
    entity_id: data.id,
    details: {
      description: expenseData.description,
      amount: expenseData.amount,
      category: expenseData.category,
    },
    pharmacy_id: pharmacyId,
  })

  return { error: null, data: data.id }
}

// Approve an expense
export async function approveExpense(expenseId: string, userId: string) {
  const supabase = createClient()

  const { error } = await supabase.rpc("approve_expense", {
    p_expense_id: expenseId,
    p_approved_by: userId,
  })

  if (error) {
    console.error("Error approving expense:", error)
    return { error }
  }

  return { error: null }
}

// Get expense by ID
export async function getExpenseById(expenseId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("expenses")
    .select(`
      *,
      recorded_by_user:recorded_by(email),
      approved_by_user:approved_by(email)
    `)
    .eq("id", expenseId)
    .single()

  if (error) {
    console.error("Error fetching expense:", error)
    return { error, data: null }
  }

  const formattedData = {
    ...data,
    recorded_by_email: data.recorded_by_user?.email,
    approved_by_email: data.approved_by_user?.email,
  }

  return { error: null, data: formattedData }
}

// Update expense
export async function updateExpense(expenseId: string, updates: Partial<CreateExpenseData>, userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("expenses")
    .update(updates)
    .eq("id", expenseId)
    .eq("recorded_by", userId) // Only allow user to update their own expenses
    .select()
    .single()

  if (error) {
    console.error("Error updating expense:", error)
    return { error, data: null }
  }

  // Log the activity
  await logActivity({
    user_id: userId,
    action: "update",
    entity_type: "expense",
    entity_id: expenseId,
    details: updates,
    pharmacy_id: data.pharmacy_id,
  })

  return { error: null, data }
}
