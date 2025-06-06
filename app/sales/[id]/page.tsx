import { getCurrentUser } from "@/lib/auth"
import { getSaleWithItems } from "@/lib/sales"
import { Header } from "@/components/layout/header"
import { SaleDetailsView } from "@/components/sales/sales-details-view"
import { redirect, notFound } from "next/navigation"

interface SalePageProps {
  params: {
    id: string
  }
}

export default async function SalePage({ params }: SalePageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const { data: sale, error } = await getSaleWithItems(params.id, user.pharmacy_id)

  if (error || !sale) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <Header
        title={`Sale #${sale.id.slice(0, 8)}`}
        subtitle={`Transaction Details • ${new Date(sale.created_at).toLocaleDateString()}`}
        user={{
          email: user.email,
          pharmacy_name: user.pharmacy_name,
          role: user.role,
        }}
      />

      <div className="px-6">
        <SaleDetailsView sale={sale} />
      </div>
    </div>
  )
}
