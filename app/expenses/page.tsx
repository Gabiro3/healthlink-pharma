import { getCurrentUser } from "@/lib/auth"
import { getExpenses, getExpenseStats } from "@/lib/expenses"
import { Header } from "@/components/layout/header"
import { ExpenseManagement } from "@/components/expenses/expense-management"
import { redirect } from "next/navigation"

export default async function ExpensesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch expense data
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [expensesResult, statsResult] = await Promise.all([
    getExpenses(user.pharmacy_id),
    getExpenseStats(user.pharmacy_id, currentYear, currentMonth),
  ])

  if (expensesResult.error) {
    console.error("Error fetching expenses:", expensesResult.error)
  }

  if (statsResult.error) {
    console.error("Error fetching expense stats:", statsResult.error)
  }

  return (
    <div className="space-y-6">
      <Header
        title="Expense Management"
        subtitle="Track and manage pharmacy expenses"
        user={{
          email: user.email,
          pharmacy_name: user.pharmacy_name,
          role: user.role,
        }}
      />

      <div className="px-6">
        <ExpenseManagement
          expenses={expensesResult.data || []}
          stats={
            statsResult.data || {
              total_expenses: 0,
              approved_expenses: 0,
              pending_expenses: 0,
              expense_count: 0,
              budget_allocated: 0,
              budget_remaining: 0,
              budget_utilization: 0,
            }
          }
          currentUser={user}
        />
      </div>
    </div>
  )
}
