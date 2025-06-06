import { getCurrentUser } from "@/lib/auth"
import { getProductDetails, getProductSalesData } from "@/lib/products"
import { Header } from "@/components/layout/header"
import { ProductDetailsView } from "@/components/products/product-details-view"
import { redirect, notFound } from "next/navigation"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const [productResult, salesResult] = await Promise.all([
    getProductDetails(params.id, user.pharmacy_id),
    getProductSalesData(params.id, user.pharmacy_id),
  ])

  if (productResult.error || !productResult.data) {
    notFound()
  }

  const product = productResult.data
  const salesData = (salesResult.data as []) || []

  return (
    <div className="space-y-6">
      <Header
        title={product.name}
        subtitle={`${product.category} • SKU: ${product.sku || "N/A"}`}
        user={{
          email: user.email,
          pharmacy_name: user.pharmacy_name,
          role: user.role,
        }}
      />

      <div className="px-6">
        <ProductDetailsView product={product} salesData={salesData} />
      </div>
    </div>
  )
}
