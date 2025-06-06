import { getCurrentUser } from "@/lib/auth"
import { getPharmacyProducts } from "@/lib/cache"
import { Header } from "@/components/layout/header"
import { InventoryManagement } from "@/components/inventory/inventory-management"
import { redirect } from "next/navigation"

export default async function InventoryPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch products data
  const products = await getPharmacyProducts(user.pharmacy_id)

  // Mock damaged products data - in a real app, this would come from the database
  const damagedProducts = [
    {
      id: "1",
      product_id: "prod1",
      product_name: "Paracetamol 500mg",
      quantity: 5,
      reason: "Water damage",
      reported_by: user.email,
      reported_at: new Date().toISOString(),
      status: "reported" as const,
    },
    {
      id: "2",
      product_id: "prod2",
      product_name: "Ibuprofen 400mg",
      quantity: 2,
      reason: "Expired",
      reported_by: user.email,
      reported_at: new Date(Date.now() - 86400000).toISOString(),
      status: "confirmed" as const,
    },
  ]

  // Transform products to include status based on stock and expiry
  const productsWithStatus = products.map((product) => {
    let status = "active" as const

    if (product.stock_quantity === 0) {
      status = "out_of_stock"
    } else if (product.stock_quantity <= product.reorder_level) {
      status = "low_stock"
    }

    return { ...product, status }
  })

  return (
    <div className="space-y-6">
      <Header
        title="Inventory Management"
        subtitle="Monitor stock levels, expiry dates, and procurement needs"
        user={{
          email: user.email,
          pharmacy_name: user.pharmacy_name,
          role: user.role,
        }}
      />

      <div className="px-6">
        <InventoryManagement products={productsWithStatus} damagedProducts={damagedProducts} />
      </div>
    </div>
  )
}
