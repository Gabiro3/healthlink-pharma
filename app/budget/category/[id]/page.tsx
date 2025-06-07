import { getCurrentUser } from "@/lib/auth"
import { getBudgetById, getBudgetTransactions } from "@/lib/budget-enhanced"
import { Header } from "@/components/layout/header"
import { BudgetCategoryDetail } from "@/components/budget/budget-category-detail"
import { redirect, notFound } from "next/navigation"

export default async function BudgetCategoryPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const budgetId = params.id

  // Fetch budget details and transactions
  const [{ data: budget, error: budgetError }, { data: transactions, error: transactionsError }] = await Promise.all([
    getBudgetById(budgetId, user.pharmacy_id),
    getBudgetTransactions(budgetId, user.pharmacy_id),
  ])

  if (budgetError || !budget) {
    console.error("Error fetching budget:", budgetError)
    notFound()
  }

  if (transactionsError) {
    console.error("Error fetching transactions:", transactionsError)
  }

  return (
    <div className="space-y-6">
      <Header
        title={`Budget Category: ${budget.category}`}
        subtitle={`${new Date(0, budget.month - 1).toLocaleString("default", { month: "long" })} ${budget.year}`}
        user={{
          email: user.email,
          pharmacy_name: user.pharmacy_name,
          role: user.role,
        }}
      />

      <div className="px-6">
        <BudgetCategoryDetail budget={budget} transactions={transactions || []} />
      </div>
    </div>
  )
}
