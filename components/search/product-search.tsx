"use client"

import { useState, useEffect } from "react"
import { Search, Package, TrendingUp, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Product {
  id: string
  name: string
  category: string
  stock_quantity: number
  unit_price: number
  reorder_level: number
  status: "active" | "low_stock" | "out_of_stock"
}

interface ProductSearchProps {
  onProductSelect?: (product: Product) => void
  showSalesButton?: boolean
}

export function ProductSearch({ onProductSelect, showSalesButton = false }: ProductSearchProps) {
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setProducts([])
        setShowResults(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
          setShowResults(true)
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "out_of_stock":
        return "destructive"
      case "low_stock":
        return "secondary"
      default:
        return "default"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "out_of_stock":
        return <AlertTriangle className="w-3 h-3" />
      case "low_stock":
        return <TrendingUp className="w-3 h-3" />
      default:
        return <Package className="w-3 h-3" />
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
          onFocus={() => query.length >= 2 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
      </div>

      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto">
          <CardContent className="p-2">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Searching...</div>
            ) : products.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No products found</div>
            ) : (
              <div className="space-y-1">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer flex items-center justify-between"
                    onClick={() => {
                      onProductSelect?.(product)
                      setShowResults(false)
                      setQuery("")
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{product.name}</h4>
                        <Badge variant={getStatusColor(product.status)} className="text-xs">
                          {getStatusIcon(product.status)}
                          <span className="ml-1">{product.status.replace("_", " ")}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>{product.category}</span>
                        <span>Stock: {product.stock_quantity}</span>
                        <span>${product.unit_price}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/products/${product.id}`}>View</Link>
                      </Button>
                      {showSalesButton && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onProductSelect?.(product)
                          }}
                        >
                          Sell
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
