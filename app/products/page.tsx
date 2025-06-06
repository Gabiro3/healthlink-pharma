import { getCurrentUser } from "@/lib/auth"
import { getPharmacyProducts } from "@/lib/cache"
import { Header } from "@/components/layout/header"
import { EnhancedProductGrid } from "@/components/products/enhanced-products-grid"
import { redirect } from "next/navigation"

export default async function ProductsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch products data
  const products = await getPharmacyProducts(user.pharmacy_id)

  // Extract unique categories
  const categories = [...new Set(products.map((p) => p.category))]

  // Transform products to include status
  const productsWithStatus = products.map((product) => ({
    ...product,
    status:
      product.stock_quantity === 0
        ? ("out_of_stock" as const)
        : product.stock_quantity <= product.reorder_level
          ? ("low_stock" as const)
          : ("active" as const),
  }))

  return (
    <div className="space-y-6">
      <Header
        title="Product List"
        subtitle="Manage your pharmacy inventory"
        user={{
          email: user.email,
          pharmacy_name: user.pharmacy_name,
          role: user.role,
        }}
      />

      <div className="px-6">
        <EnhancedProductGrid products={productsWithStatus} categories={categories} />
      </div>
    </div>
  )
}
