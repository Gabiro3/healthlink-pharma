"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Plus,
  Download,
  UserPlus,
  Crown,
} from "lucide-react"

interface PharmacyAdminStats {
  total_users: number
  total_products: number
  total_sales_this_month: number
  total_sales_all_time: number
  active_orders: number
  low_stock_products: number
}

interface PharmacyAdminDashboardProps {
  stats: PharmacyAdminStats
  pharmacyName: string
  pharmacyCode: string
}

export function PharmacyAdminDashboard({ stats, pharmacyName, pharmacyCode }: PharmacyAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pharmacy Administration</h2>
          <p className="text-gray-600">
            {pharmacyName} • {pharmacyCode}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm" className="bg-lime-400 text-teal-800 hover:bg-lime-500">
            <Plus className="w-4 h-4 mr-2" />
            Quick Actions
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users}</div>
            <p className="text-xs text-gray-500">Active pharmacy users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_products}</div>
            <p className="text-xs text-gray-500">In inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month Sales</CardTitle>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.total_sales_this_month.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Current month revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.total_sales_all_time.toLocaleString()}</div>
            <p className="text-xs text-gray-500">All time revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_orders}</div>
            <p className="text-xs text-gray-500">Pending/processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.low_stock_products}</div>
            <p className="text-xs text-gray-500">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="products">Product Management</TabsTrigger>
          <TabsTrigger value="billing">Billing & Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add New User
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  Add New Product
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="w-4 h-4 mr-2" />
                  View Sales Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New user added</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Product updated</p>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Low stock alert</p>
                      <p className="text-xs text-gray-500">6 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <Button size="sm" className="bg-lime-400 text-teal-800 hover:bg-lime-500">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add New User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Role</span>
                  <span>Status</span>
                  <span>Last Login</span>
                  <span>Actions</span>
                </div>

                {/* Mock user data */}
                {[
                  {
                    name: "John Doe",
                    email: "john@pharmacy.com",
                    role: "pharmacist",
                    status: "active",
                    lastLogin: "2 hours ago",
                  },
                  {
                    name: "Jane Smith",
                    email: "jane@pharmacy.com",
                    role: "cashier",
                    status: "active",
                    lastLogin: "1 day ago",
                  },
                ].map((user, index) => (
                  <div key={index} className="grid grid-cols-6 gap-4 items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-sm">{user.email}</span>
                    <Badge variant="outline">{user.role}</Badge>
                    <Badge className="bg-green-100 text-green-800" variant="secondary">
                      {user.status}
                    </Badge>
                    <span className="text-sm text-gray-500">{user.lastLogin}</span>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Crown className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        ✏️
                      </Button>
                      <Button variant="ghost" size="sm">
                        🔒
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Product Management</CardTitle>
                <Button size="sm" className="bg-lime-400 text-teal-800 hover:bg-lime-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                  <span>Product Name</span>
                  <span>Category</span>
                  <span>Stock</span>
                  <span>Price</span>
                  <span>Sales</span>
                  <span>Actions</span>
                </div>

                {/* Mock product data */}
                {[
                  {
                    name: "Paracetamol 500mg",
                    category: "Pain Relief",
                    stock: 150,
                    price: 2.5,
                    sales: 45,
                  },
                  {
                    name: "Ibuprofen 400mg",
                    category: "Pain Relief",
                    stock: 75,
                    price: 3.75,
                    sales: 32,
                  },
                ].map((product, index) => (
                  <div key={index} className="grid grid-cols-6 gap-4 items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium">{product.name}</span>
                    <span className="text-sm">{product.category}</span>
                    <span className="text-sm">{product.stock}</span>
                    <span className="text-sm">${product.price.toFixed(2)}</span>
                    <span className="text-sm">{product.sales} sold</span>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        👁️
                      </Button>
                      <Button variant="ghost" size="sm">
                        ✏️
                      </Button>
                      <Button variant="ghost" size="sm">
                        📊
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Billing Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Monthly Sales</span>
                    <span className="text-sm font-medium">${stats.total_sales_this_month.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Service Charge (2%)</span>
                    <span className="text-sm font-medium">${(stats.total_sales_this_month * 0.02).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">User Fees ({stats.total_users} × $10)</span>
                    <span className="text-sm font-medium">${(stats.total_users * 10).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Total Due</span>
                      <span className="font-medium">
                        ${(stats.total_sales_this_month * 0.02 + stats.total_users * 10).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Monthly Sales Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Product Performance
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    User Activity Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Billing History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
