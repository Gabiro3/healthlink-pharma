import { getCurrentUser } from "@/lib/auth"
import { getSalesByPaymentMethod } from "@/lib/analytics"
import { Header } from "@/components/layout/header"
import { PaymentsOverview } from "@/components/payments/payments-overview"
import { redirect } from "next/navigation"

export default async function PaymentsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const paymentStats = await getSalesByPaymentMethod(user.pharmacy_id)

  return (
    <div className="space-y-6">
      <Header
        title="Payments Overview"
        subtitle="View sales transactions by payment method"
        user={{
          email: user.email,
          pharmacy_name: user.pharmacy_name,
          role: user.role,
        }}
      />

      <div className="px-6">
        <PaymentsOverview paymentStats={paymentStats} />
      </div>
    </div>
  )
}
