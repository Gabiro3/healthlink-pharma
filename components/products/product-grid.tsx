"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, Plus, Package, AlertTriangle, XCircle } from "lucide-react"

interface Product {
  id: string
  name: string
  category: string
  stock_quantity: number
  unit_price: number
  reorder_level: number
  expiry_date?: string
  status: "active" | "low_stock" | "out_of_stock"
}

interface ProductGridProps {
  products: Product[]
  categories: string[]
}

export function ProductGrid({ products, categories }: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusInfo = (product: Product) => {
    if (product.stock_quantity === 0) {
      return { status: "out_of_stock", color: "bg-red-100 text-red-800", icon: XCircle }
    } else if (product.stock_quantity <= product.reorder_level) {
      return { status: "low_stock", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle }
    }
    return { status: "active", color: "bg-green-100 text-green-800", icon: Package }
  }

  const getCategoryStats = () => {
    const stats = categories.reduce(
      (acc, category) => {
        const categoryProducts = products.filter((p) => p.category === category)
        acc[category] = {
          total: categoryProducts.length,
          change: Math.floor(Math.random() * 20) - 10, // Mock change percentage
        }
        return acc
      },
      {} as Record<string, { total: number; change: number }>,
    )

    return stats
  }

  const categoryStats = getCategoryStats()

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length.toLocaleString()}</div>
            <Badge className="mt-2 bg-green-100 text-green-800">+5.2% Since last week</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.stock_quantity <= p.reorder_level && p.stock_quantity > 0).length}
            </div>
            <Badge className="mt-2 bg-yellow-100 text-yellow-800">Needs attention</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((p) => p.stock_quantity === 0).length}</div>
            <Badge className="mt-2 bg-red-100 text-red-800">Critical</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Package className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <Badge className="mt-2 bg-blue-100 text-blue-800">Active categories</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Category Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {categories.slice(0, 8).map((category) => {
          const stats = categoryStats[category]
          const Icon = Package
          return (
            <Card key={category}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{category}</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <Badge
                      className={`text-xs mt-1 ${stats.change >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      variant="secondary"
                    >
                      {stats.change > 0 ? "+" : ""}
                      {stats.change}% Since last week
                    </Badge>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Product List</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm" className="bg-lime-400 text-teal-800 hover:bg-lime-500">
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-7 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
              <span>Product ID</span>
              <span>Product Name</span>
              <span>Quantity</span>
              <span>Price</span>
              <span>Expiry Date</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {/* Table Rows */}
            {filteredProducts.map((product) => {
              const statusInfo = getStatusInfo(product)
              const StatusIcon = statusInfo.icon

              return (
                <div
                  key={product.id}
                  className="grid grid-cols-7 gap-4 items-center py-3 border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm font-medium">#{product.id}</span>
                  <span className="text-sm">{product.name}</span>
                  <span className="text-sm">{product.stock_quantity} Units</span>
                  <span className="text-sm font-medium">${product.unit_price.toFixed(2)}</span>
                  <span className="text-sm">
                    {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString() : "N/A"}
                  </span>
                  <Badge className={`text-xs ${statusInfo.color}`} variant="secondary">
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.status.replace("_", " ")}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm">
                      👁️
                    </Button>
                    <Button variant="ghost" size="sm">
                      ✏️
                    </Button>
                    <Button variant="ghost" size="sm">
                      🗑️
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
