"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Package, TrendingUp, AlertTriangle, Calendar, DollarSign, ShoppingCart } from "lucide-react"
import { RecordSaleDialog } from "@/components/sales/record-sale-dialog"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Product {
  id: string
  name: string
  description?: string
  category: string
  sku?: string
  unit_price: number
  cost_price: number
  stock_quantity: number
  reorder_level: number
  expiry_date?: string
  manufacturer?: string
  batch_number?: string
  created_at: string
  updated_at: string
}

interface SalesData {
  date: string
  quantity: number
  revenue: number
  profit: number
}

interface ProductDetailsViewProps {
  product: Product
  salesData: SalesData[]
}

export function ProductDetailsView({ product, salesData }: ProductDetailsViewProps) {
  const getStatusInfo = () => {
    if (product.stock_quantity === 0) {
      return { status: "Out of Stock", color: "destructive", icon: AlertTriangle }
    }
    if (product.stock_quantity <= product.reorder_level) {
      return { status: "Low Stock", color: "secondary", icon: TrendingUp }
    }
    return { status: "In Stock", color: "default", icon: Package }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  const totalRevenue = salesData.reduce((sum, data) => sum + data.revenue, 0)
  const totalQuantitySold = salesData.reduce((sum, data) => sum + data.quantity, 0)
  const totalProfit = salesData.reduce((sum, data) => sum + data.profit, 0)
  const profitMargin =
    product.unit_price > 0 ? ((product.unit_price - product.cost_price) / product.unit_price) * 100 : 0

  const isExpiringSoon =
    product.expiry_date && new Date(product.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  return (
    <div className="space-y-6">
      {/* Product Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
            <StatusIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{product.stock_quantity}</div>
            <Badge variant={statusInfo.color as any} className="mt-2">
              {statusInfo.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unit Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rwf {product.unit_price.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Cost: Rwf {product.cost_price} • Margin: {profitMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sold</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantitySold}</div>
            <p className="text-xs text-muted-foreground">Revenue: Rwf {totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rwf {totalProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From {salesData.length} sales periods</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(product.stock_quantity <= product.reorder_level || isExpiringSoon) && (
        <div className="space-y-2">
          {product.stock_quantity <= product.reorder_level && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    Low Stock Alert: Only {product.stock_quantity} units remaining (Reorder level:{" "}
                    {product.reorder_level})
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
          {isExpiringSoon && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    Expiry Alert: Product expires on {new Date(product.expiry_date!).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Product Details and Analytics */}
      <Tabs defaultValue="details" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
            <TabsTrigger value="inventory">Inventory History</TabsTrigger>
          </TabsList>
          <RecordSaleDialog
            trigger={
              <Button disabled={product.stock_quantity === 0}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Record Sale
              </Button>
            }
          />
        </div>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-sm">{product.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <p className="text-sm">{product.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">SKU</label>
                    <p className="text-sm">{product.sku || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Manufacturer</label>
                    <p className="text-sm">{product.manufacturer || "N/A"}</p>
                  </div>
                </div>
                {product.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-sm">{product.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Current Stock</label>
                    <p className="text-sm">{product.stock_quantity} units</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Reorder Level</label>
                    <p className="text-sm">{product.reorder_level} units</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Batch Number</label>
                    <p className="text-sm">{product.batch_number || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                    <p className="text-sm">
                      {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          {salesData.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold">No Sales Data</h3>
                <p className="text-gray-500">This product hasn't been sold yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      quantity: {
                        label: "Quantity Sold",
                        color: "hsl(var(--chart-1))",
                      },
                      revenue: {
                        label: "Revenue",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="quantity" stroke="var(--color-quantity)" name="Quantity" />
                        <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" name="Revenue ($)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profit Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      profit: {
                        label: "Profit",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="profit" fill="var(--color-profit)" name="Profit ($)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold">Inventory History</h3>
                <p>Detailed inventory tracking coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
