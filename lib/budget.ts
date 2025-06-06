import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"
import type { Database } from "./database.types"
import { logActivity } from "./activity"

export type Budget = Database["public"]["Tables"]["budgets"]["Row"]

// Create or update a budget
export async function createOrUpdateBudget(
  budgetData: Omit<Budget, "id" | "created_at" | "spent_amount">,
  userId: string,
) {
  const supabase = createClient(cookies())

  // Check if budget already exists for this category, year, and month
  const { data: existingBudget, error: checkError } = await supabase
    .from("budgets")
    .select("id, allocated_amount, spent_amount")
    .eq("pharmacy_id", budgetData.pharmacy_id)
    .eq("year", budgetData.year)
    .eq("month", budgetData.month)
    .eq("category", budgetData.category)
    .maybeSingle()

  if (checkError) {
    console.error("Error checking existing budget:", checkError)
    return { error: checkError, data: null }
  }

  let result

  if (existingBudget) {
    // Update existing budget
    const { data, error } = await supabase
      .from("budgets")
      .update({ allocated_amount: budgetData.allocated_amount })
      .eq("id", existingBudget.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating budget:", error)
      return { error, data: null }
    }

    result = { error: null, data }

    // Log the activity
    await logActivity({
      user_id: userId,
      action: "update",
      entity_type: "budget",
      entity_id: existingBudget.id,
      details: {
        previous_amount: existingBudget.allocated_amount,
        new_amount: budgetData.allocated_amount,
        year: budgetData.year,
        month: budgetData.month,
        category: budgetData.category,
      },
      pharmacy_id: budgetData.pharmacy_id,
    })
  } else {
    // Create new budget with zero spent amount
    const { data, error } = await supabase
      .from("budgets")
      .insert({
        ...budgetData,
        spent_amount: 0,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating budget:", error)
      return { error, data: null }
    }

    result = { error: null, data }

    // Log the activity
    await logActivity({
      user_id: userId,
      action: "create",
      entity_type: "budget",
      entity_id: data.id,
      details: {
        allocated_amount: budgetData.allocated_amount,
        year: budgetData.year,
        month: budgetData.month,
        category: budgetData.category,
      },
      pharmacy_id: budgetData.pharmacy_id,
    })
  }

  return result
}

// Get budgets for a specific year and month
export async function getBudgets(pharmacyId: string, year: number, month?: number) {
  const supabase = createClient(cookies())

  let query = supabase.from("budgets").select("*").eq("pharmacy_id", pharmacyId).eq("year", year)

  if (month !== undefined) {
    query = query.eq("month", month)
  }

  query = query.order("month", { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching budgets:", error)
    return { error, data: null }
  }

  return { error: null, data }
}

// Update spent amount for a budget
export async function updateBudgetSpending(
  budgetId: string,
  additionalSpending: number,
  userId: string,
  pharmacyId: string,
) {
  const supabase = createClient(cookies())

  // Get current budget
  const { data: currentBudget, error: fetchError } = await supabase
    .from("budgets")
    .select("spent_amount")
    .eq("id", budgetId)
    .single()

  if (fetchError || !currentBudget) {
    console.error("Error fetching current budget:", fetchError)
    return { error: fetchError, data: null }
  }

  // Update the spent amount
  const newSpentAmount = currentBudget.spent_amount + additionalSpending

  const { data, error } = await supabase
    .from("budgets")
    .update({ spent_amount: newSpentAmount })
    .eq("id", budgetId)
    .select()
    .single()

  if (error) {
    console.error("Error updating budget spending:", error)
    return { error, data: null }
  }

  // Log the activity
  await logActivity({
    user_id: userId,
    action: "update",
    entity_type: "budget_spending",
    entity_id: budgetId,
    details: {
      previous_spent: currentBudget.spent_amount,
      additional_spending: additionalSpending,
      new_spent: newSpentAmount,
    },
    pharmacy_id: pharmacyId,
  })

  return { error: null, data }
}

// Get budget summary with percentage used
export async function getBudgetSummary(pharmacyId: string, year: number, month?: number) {
  const { data: budgets, error } = await getBudgets(pharmacyId, year, month)

  if (error || !budgets) {
    return { error, data: null }
  }

  // Calculate percentage used and remaining amount
  const budgetSummary = budgets.map((budget) => ({
    ...budget,
    percentage_used: Math.round((budget.spent_amount / budget.allocated_amount) * 100),
    remaining_amount: budget.allocated_amount - budget.spent_amount,
  }))

  return { error: null, data: budgetSummary }
}
