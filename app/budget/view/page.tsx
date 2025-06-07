import { getCurrentUser } from "@/lib/auth"
import { getEnhancedBudgets, getBudgetStats } from "@/lib/budget-enhanced"
import { Header } from "@/components/layout/header"
import { BudgetViewDashboard } from "@/components/budget/budget-view-dashboard"
import { redirect } from "next/navigation"

export default async function BudgetViewPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch budget data
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [budgetsResult, statsResult] = await Promise.all([
    getEnhancedBudgets(user.pharmacy_id),
    getBudgetStats(user.pharmacy_id),
  ])

  if (budgetsResult.error) {
    console.error("Error fetching budgets:", budgetsResult.error)
  }

  if (statsResult.error) {
    console.error("Error fetching budget stats:", statsResult.error)
  }

  return (
    <div className="space-y-6">
      <Header
        title="Budget Overview"
        subtitle="View and analyze your pharmacy's budget performance"
        user={{
          email: user.email,
          pharmacy_name: user.pharmacy_name,
          role: user.role,
        }}
      />

      <div className="px-6">
        <BudgetViewDashboard
          budgets={budgetsResult.data || []}
          stats={
            statsResult.data || {
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
