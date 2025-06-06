import { getCurrentUser } from "@/lib/auth"
import { getInsuranceSalesReport } from "@/lib/analytics"
import { Header } from "@/components/layout/header"
import { InsuranceReports } from "@/components/insurance/insurance-reports"
import { redirect } from "next/navigation"

export default async function InsurancePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Get all insurance sales for the last 30 days
  const insuranceSales = await getInsuranceSalesReport(user.pharmacy_id)

  return (
    <div className="space-y-6">
      <Header
        title="Insurance Reports"
        subtitle="View and manage insurance sales transactions"
        user={{
          email: user.email,
          pharmacy_name: user.pharmacy_name,
          role: user.role,
        }}
      />

      <div className="px-6">
        <InsuranceReports initialSales={insuranceSales} />
      </div>
    </div>
  )
}
