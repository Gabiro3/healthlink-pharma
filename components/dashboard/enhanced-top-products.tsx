"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

interface TopProduct {
  product_id: string
  product_name: string
  total_quantity: number
  total_revenue: number
  sales_count: number
}

interface EnhancedTopProductsProps {
  products: TopProduct[]
}

export function EnhancedTopProducts({ products }: EnhancedTopProductsProps) {
  const maxQuantity = Math.max(...products.map((p) => p.total_quantity), 1)

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Selling Medicine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No sales data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Top Selling Medicine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.map((product, index) => (
          <div key={product.product_id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                  {index + 1}
                </Badge>
                <span className="font-medium text-sm">{product.product_name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{product.total_quantity} sold</div>
                <div className="text-xs text-gray-500">Rwf {product.total_revenue.toFixed(2)}</div>
              </div>
            </div>
            <Progress value={(product.total_quantity / maxQuantity) * 100} className="h-2" />
            <div className="text-xs text-gray-500">{product.sales_count} transactions</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
