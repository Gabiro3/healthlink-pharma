"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, AlertTriangle, Plus, Search, Download, ShoppingCart, XCircle, Clock, Truck } from "lucide-react"
import { addDays, isBefore } from "date-fns"

interface Product {
  id: string
  name: string
  category: string
  stock_quantity: number
  unit_price: number
  reorder_level: number
  expiry_date?: string
  batch_number?: string
  supplier?: string
  status: "active" | "low_stock" | "out_of_stock" | "expired" | "near_expiry"
}

interface DamagedProduct {
  id: string
  product_id: string
  product_name: string
  quantity: number
  reason: string
  reported_by: string
  reported_at: string
  status: "reported" | "confirmed" | "disposed"
}

interface InventoryManagementProps {
  products: Product[]
  damagedProducts: DamagedProduct[]
}

export function InventoryManagement({ products, damagedProducts }: InventoryManagementProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const categories = [...new Set(products.map((p) => p.category))]

  // Calculate product statuses
  const productsWithStatus = products.map((product) => {
    let status = product.status

    if (product.expiry_date) {
      const expiryDate = new Date(product.expiry_date)
      const today = new Date()
      const thirtyDaysFromNow = addDays(today, 30)

      if (isBefore(expiryDate, today)) {
        status = "expired"
      } else if (isBefore(expiryDate, thirtyDaysFromNow)) {
        status = "near_expiry"
      }
    }

    return { ...product, status }
  })

  const filteredProducts = productsWithStatus.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Get products by status
  const expiredProducts = productsWithStatus.filter((p) => p.status === "expired")
  const nearExpiryProducts = productsWithStatus.filter((p) => p.status === "near_expiry")
  const lowStockProducts = productsWithStatus.filter((p) => p.status === "low_stock")
  const outOfStockProducts = productsWithStatus.filter((p) => p.status === "out_of_stock")

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "expired":
        return { color: "bg-red-100 text-red-800", icon: XCircle, label: "Expired" }
      case "near_expiry":
        return { color: "bg-orange-100 text-orange-800", icon: Clock, label: "Near Expiry" }
      case "low_stock":
        return { color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle, label: "Low Stock" }
      case "out_of_stock":
        return { color: "bg-red-100 text-red-800", icon: XCircle, label: "Out of Stock" }
      default:
        return { color: "bg-green-100 text-green-800", icon: Package, label: "Active" }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600">Monitor stock levels, expiry dates, and procurement needs</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-lime-400 text-teal-800 hover:bg-lime-500">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-gray-500">Active inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Items</CardTitle>
            <XCircle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredProducts.length}</div>
            <p className="text-xs text-gray-500">Requires immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Near Expiry</CardTitle>
            <Clock className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{nearExpiryProducts.length}</div>
            <p className="text-xs text-gray-500">Expires within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockProducts.length}</div>
            <p className="text-xs text-gray-500">Below reorder level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</div>
            <p className="text-xs text-gray-500">Zero inventory</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expiry">Expiry Management</TabsTrigger>
          <TabsTrigger value="procurement">Procurement</TabsTrigger>
          <TabsTrigger value="damaged">Damaged Items</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
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
                    <SelectItem value="near_expiry">Near Expiry</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Product Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-8 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                  <span>Product Name</span>
                  <span>Category</span>
                  <span>Stock</span>
                  <span>Price</span>
                  <span>Reorder Level</span>
                  <span>Expiry Date</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>

                {filteredProducts.map((product) => {
                  const statusInfo = getStatusInfo(product.status)
                  const StatusIcon = statusInfo.icon

                  return (
                    <div
                      key={product.id}
                      className="grid grid-cols-8 gap-4 items-center py-3 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-sm font-medium">{product.name}</span>
                      <span className="text-sm">{product.category}</span>
                      <span className="text-sm">{product.stock_quantity}</span>
                      <span className="text-sm">${product.unit_price.toFixed(2)}</span>
                      <span className="text-sm">{product.reorder_level}</span>
                      <span className="text-sm">
                        {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString() : "N/A"}
                      </span>
                      <Badge className={`text-xs ${statusInfo.color}`} variant="secondary">
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          👁️
                        </Button>
                        <Button variant="ghost" size="sm">
                          ✏️
                        </Button>
                        <Button variant="ghost" size="sm">
                          🛒
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiry" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Expired Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <XCircle className="w-5 h-5 mr-2 text-red-600" />
                  Expired Products ({expiredProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expiredProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          Expired: {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <Button size="sm" variant="destructive">
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Near Expiry Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-600" />
                  Near Expiry ({nearExpiryProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nearExpiryProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          Expires: {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Discount
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="procurement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Reorder Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-blue-600" />
                  Reorder Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...lowStockProducts, ...outOfStockProducts].slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          Current: {product.stock_quantity} | Reorder: {product.reorder_level}
                        </p>
                      </div>
                      <Button size="sm" className="bg-lime-400 text-teal-800 hover:bg-lime-500">
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Order
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Order */}
            <Card>
              <CardHeader>
                <CardTitle>Create Purchase Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendor1">PharmaCorp Ltd</SelectItem>
                      <SelectItem value="vendor2">MedSupply Inc</SelectItem>
                      <SelectItem value="vendor3">HealthDistributors</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full bg-lime-400 text-teal-800 hover:bg-lime-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="damaged" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Damaged Products Report</CardTitle>
                <Button size="sm" className="bg-lime-400 text-teal-800 hover:bg-lime-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Report Damage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                  <span>Product Name</span>
                  <span>Quantity</span>
                  <span>Reason</span>
                  <span>Reported By</span>
                  <span>Date</span>
                  <span>Status</span>
                </div>

                {damagedProducts.map((damaged) => (
                  <div
                    key={damaged.id}
                    className="grid grid-cols-6 gap-4 items-center py-3 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-sm font-medium">{damaged.product_name}</span>
                    <span className="text-sm">{damaged.quantity}</span>
                    <span className="text-sm">{damaged.reason}</span>
                    <span className="text-sm">{damaged.reported_by}</span>
                    <span className="text-sm">{new Date(damaged.reported_at).toLocaleDateString()}</span>
                    <Badge
                      className={`text-xs ${
                        damaged.status === "disposed"
                          ? "bg-gray-100 text-gray-800"
                          : damaged.status === "confirmed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                      variant="secondary"
                    >
                      {damaged.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
