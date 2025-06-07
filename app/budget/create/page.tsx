import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { CreateBudgetForm } from "@/components/budget/create-budget-form"
import { redirect } from "next/navigation"

export default async function CreateBudgetPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <Header
        title="Create Budget"
        subtitle="Set up a new budget plan for your pharmacy"
        user={{
          email: user.email,
          pharmacy_name: user.pharmacy_name,
          role: user.role,
        }}
      />

      <div className="px-6">
        <CreateBudgetForm pharmacyId={user.pharmacy_id} userId={user.id} />
      </div>
    </div>
  )
}
