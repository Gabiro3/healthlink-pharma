"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Building2,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  FileText,
  Plus,
  Download,
  Search,
  Send,
  Ban,
  Eye,
} from "lucide-react"

interface SuperAdminStats {
  total_pharmacies: number
  total_users: number
  total_products: number
  total_sales_this_month: number
  total_sales_all_time: number
  active_pharmacies: number
  pending_invoices: number
}

interface SuperAdminDashboardProps {
  stats: SuperAdminStats
}

export function SuperAdminDashboard({ stats }: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Mock data for demonstration
  const pharmacies = [
    {
      id: "1",
      name: "MediCare Pharmacy",
      code: "PH-12345",
      address: "123 Main St, Downtown",
      users: 5,
      sales: 25000,
      status: "active",
    },
    {
      id: "2",
      name: "HealthPlus Pharmacy",
      code: "PH-67890",
      address: "456 Oak Ave, Uptown",
      users: 3,
      sales: 18000,
      status: "active",
    },
  ]

  const billingData = [
    {
      id: "1",
      pharmacy: "MediCare Pharmacy",
      period: "2024-01",
      sales: 25000,
      serviceCharge: 500,
      userFees: 50,
      total: 550,
      status: "paid",
    },
    {
      id: "2",
      pharmacy: "HealthPlus Pharmacy",
      period: "2024-01",
      sales: 18000,
      serviceCharge: 360,
      userFees: 30,
      total: 390,
      status: "pending",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h2>
          <p className="text-gray-600">Manage all pharmacies and system operations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm" className="bg-lime-400 text-teal-800 hover:bg-lime-500">
            <Plus className="w-4 h-4 mr-2" />
            Add Pharmacy
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pharmacies</CardTitle>
            <Building2 className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_pharmacies}</div>
            <p className="text-xs text-gray-500">Active pharmacies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users}</div>
            <p className="text-xs text-gray-500">Across all pharmacies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_products}</div>
            <p className="text-xs text-gray-500">In all inventories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.total_sales_this_month.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Total sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">All Time Sales</CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.total_sales_all_time.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Total revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pharmacies</CardTitle>
            <Building2 className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_pharmacies}</div>
            <p className="text-xs text-gray-500">Currently operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending_invoices}</div>
            <p className="text-xs text-gray-500">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pharmacies">Pharmacy Management</TabsTrigger>
          <TabsTrigger value="billing">Billing & Invoicing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Pharmacies</span>
                    <Badge className="bg-green-100 text-green-800" variant="secondary">
                      {stats.active_pharmacies}/{stats.total_pharmacies}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Uptime</span>
                    <Badge className="bg-green-100 text-green-800" variant="secondary">
                      99.9%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending Issues</span>
                    <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">
                      2
                    </Badge>
                  </div>
                </div>
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
                      <p className="text-sm font-medium">New pharmacy registered</p>
                      <p className="text-xs text-gray-500">HealthPlus Pharmacy • 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Invoice generated</p>
                      <p className="text-xs text-gray-500">MediCare Pharmacy • 4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Payment received</p>
                      <p className="text-xs text-gray-500">CityPharm • 6 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pharmacies" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search pharmacies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pharmacies Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pharmacy Management</CardTitle>
                <Button size="sm" className="bg-lime-400 text-teal-800 hover:bg-lime-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Pharmacy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                  <span>Pharmacy Name</span>
                  <span>Code</span>
                  <span>Address</span>
                  <span>Users</span>
                  <span>Monthly Sales</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>

                {pharmacies.map((pharmacy) => (
                  <div key={pharmacy.id} className="grid grid-cols-7 gap-4 items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium">{pharmacy.name}</span>
                    <span className="text-sm">{pharmacy.code}</span>
                    <span className="text-sm">{pharmacy.address}</span>
                    <span className="text-sm">{pharmacy.users}</span>
                    <span className="text-sm">${pharmacy.sales.toLocaleString()}</span>
                    <Badge className={getStatusColor(pharmacy.status)} variant="secondary">
                      {pharmacy.status}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        ✏️
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Ban className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Billing & Invoicing</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm" className="bg-lime-400 text-teal-800 hover:bg-lime-500">
                    Generate Invoices
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                  <span>Pharmacy</span>
                  <span>Period</span>
                  <span>Sales</span>
                  <span>Service Charge</span>
                  <span>User Fees</span>
                  <span>Total</span>
                  <span>Actions</span>
                </div>

                {billingData.map((billing) => (
                  <div key={billing.id} className="grid grid-cols-7 gap-4 items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium">{billing.pharmacy}</span>
                    <span className="text-sm">{billing.period}</span>
                    <span className="text-sm">${billing.sales.toLocaleString()}</span>
                    <span className="text-sm">${billing.serviceCharge}</span>
                    <span className="text-sm">${billing.userFees}</span>
                    <span className="text-sm font-medium">${billing.total}</span>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Send className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">This Month</span>
                    <span className="text-sm font-medium">${stats.total_sales_this_month.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Last Month</span>
                    <span className="text-sm font-medium">$42,300</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Growth</span>
                    <Badge className="bg-green-100 text-green-800" variant="secondary">
                      +12.5%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Pharmacies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pharmacies.map((pharmacy, index) => (
                    <div key={pharmacy.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{pharmacy.name}</p>
                        <p className="text-xs text-gray-500">${pharmacy.sales.toLocaleString()}</p>
                      </div>
                      <Badge variant="outline">#{index + 1}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
