import { getCurrentUser } from "@/lib/auth"
import { getExpenseById } from "@/lib/expenses"
import { Header } from "@/components/layout/header"
import { ExpenseDetailsView } from "@/components/expenses/expense-details-view"
import { redirect, notFound } from "next/navigation"

interface ExpensePageProps {
  params: {
    id: string
  }
}

export default async function ExpensePage({ params }: ExpensePageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const { data: expense, error } = await getExpenseById(params.id)

  if (error || !expense) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <Header
        title="Expense Details"
        subtitle={`View details for expense: ${expense.description}`}
        user={{
          email: user.email,
          pharmacy_name: user.pharmacy_name,
          role: user.role,
        }}
      />

      <div className="px-6">
        <ExpenseDetailsView expense={expense} currentUser={user} />
      </div>
    </div>
  )
}
