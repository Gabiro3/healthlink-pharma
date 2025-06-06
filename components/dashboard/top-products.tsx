"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Product {
  name: string
  sales: number
  color: string
}

interface TopProductsProps {
  products: Product[]
}

export function TopProducts({ products }: TopProductsProps) {
  const maxSales = Math.max(...products.map((p) => p.sales))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Top Selling Medicine</CardTitle>
          <Badge variant="outline">This Month</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div
                className="w-12 h-16 rounded-lg flex items-end justify-center text-white text-xs font-medium p-1"
                style={{ backgroundColor: product.color }}
              >
                Rwf {product.sales}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{product.name}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor: product.color,
                      width: `${(product.sales / maxSales) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
