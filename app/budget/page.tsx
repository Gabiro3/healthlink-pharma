import { getCurrentUser } from "@/lib/auth"
import { getBudgetStats, getEnhancedBudgets } from "@/lib/budget-enhanced"
import { Header } from "@/components/layout/header"
import { EnhancedBudgetDashboard } from "@/components/budget/enhanced-budget-dashboard"
import { redirect } from "next/navigation"

export default async function BudgetPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  // Fetch budget data and stats
  const [{ data: budgets, error: budgetError }, { data: stats, error: statsError }] = await Promise.all([
    getEnhancedBudgets(user.pharmacy_id),
    getBudgetStats(user.pharmacy_id),
  ])

  if (budgetError) {
    console.error("Error fetching budgets:", budgetError)
  }

  if (statsError) {
    console.error("Error fetching budget stats:", statsError)
  }

  return (
    <div className="space-y-6">
      <Header
        title="Budget Management"
        subtitle="Monitor and manage your pharmacy's financial planning"
        user={{
          email: user.email,
          pharmacy_name: user.pharmacy_name,
          role: user.role,
        }}
      />

      <div className="px-6">
        <EnhancedBudgetDashboard
          budgets={budgets || []}
          stats={
            stats || {
              total_allocated: 0,
              total_spent: 0,
              total_remaining: 0,
              budget_count: 0,
              over_budget_count: 0,
            }
          }
          currentYear={currentYear}
          currentMonth={currentMonth}
        />
      </div>
    </div>
  )
}
