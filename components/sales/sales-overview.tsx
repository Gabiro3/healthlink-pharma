"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, Plus, ShoppingCart } from "lucide-react"
import { RecordSaleDialog } from "./record-sale-dialog"

interface Sale {
  id: string
  customer_name: string
  total_amount: number
  payment_method: string
  status: string
  created_at: string
}

interface SalesOverviewProps {
  sales: Sale[]
  stats: {
    totalRevenue: number
    totalProfit: number
    totalCost: number
    averageOrderValue: number
  }
}

export function SalesOverview({ sales, stats }: SalesOverviewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rwf {stats.totalRevenue.toLocaleString()}</div>
            <Badge className="mt-2 bg-green-100 text-green-800">+8.2% Since last week</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rwf {stats.totalProfit.toLocaleString()}</div>
            <Badge className="mt-2 bg-green-100 text-green-800">+5.4% Since last week</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rwf {stats.totalCost.toLocaleString()}</div>
            <Badge className="mt-2 bg-red-100 text-red-800">+2.1% Since last week</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rwf {stats.averageOrderValue.toFixed(2)}</div>
            <Badge className="mt-2 bg-green-100 text-green-800">+3.2% Since last week</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
