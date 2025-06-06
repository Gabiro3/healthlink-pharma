import { getCurrentUser } from "@/lib/auth"
import { getBudgetSummary } from "@/lib/budget"
import { Header } from "@/components/layout/header"
import { BudgetDashboard } from "@/components/budget/budget-dashboard"
import { redirect } from "next/navigation"

export default async function BudgetPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  // Fetch budget data
  const { data: budgets, error } = await getBudgetSummary(user.pharmacy_id, currentYear)

  if (error) {
    console.error("Error fetching budgets:", error)
  }

  // Transform budgets to include created_by information
  const budgetsWithCreator = (budgets || []).map((budget) => ({
    ...budget,
    created_by: user.email, // In a real app, this would come from the database
  }))

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
        <BudgetDashboard budgets={budgetsWithCreator} currentYear={currentYear} currentMonth={currentMonth} />
      </div>
    </div>
  )
}
