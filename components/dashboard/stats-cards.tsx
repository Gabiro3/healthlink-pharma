"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Package } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: "increase" | "decrease"
    period: string
  }
  icon: React.ReactNode
  color?: "default" | "green" | "red" | "blue"
}

function StatsCard({ title, value, change, icon, color = "default" }: StatsCardProps) {
  const colorClasses = {
    default: "bg-gray-50 text-gray-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change && (
          <div className="flex items-center mt-2">
            {change.type === "increase" ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <Badge variant={change.type === "increase" ? "default" : "destructive"} className="text-xs">
              {change.value > 0 ? "+" : ""}
              {change.value}%
            </Badge>
            <span className="text-xs text-gray-500 ml-2">{change.period}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface DashboardStatsProps {
  stats: {
    totalProfit: number
    totalCustomers: number
    totalOrders: number
    averageOrderValue: number
    profitChange: number
    customersChange: number
    ordersChange: number
    aovChange: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Profit"
        value={`$${stats.totalProfit.toLocaleString()}`}
        change={{
          value: stats.profitChange,
          type: stats.profitChange >= 0 ? "increase" : "decrease",
          period: "Since last week",
        }}
        icon={<DollarSign className="w-4 h-4" />}
        color="green"
      />

      <StatsCard
        title="Total Customers"
        value={stats.totalCustomers.toLocaleString()}
        change={{
          value: stats.customersChange,
          type: stats.customersChange >= 0 ? "increase" : "decrease",
          period: "Since last week",
        }}
        icon={<Users className="w-4 h-4" />}
        color="blue"
      />

      <StatsCard
        title="Total Orders"
        value={stats.totalOrders.toLocaleString()}
        change={{
          value: stats.ordersChange,
          type: stats.ordersChange >= 0 ? "increase" : "decrease",
          period: "Since last week",
        }}
        icon={<ShoppingCart className="w-4 h-4" />}
        color="default"
      />

      <StatsCard
        title="Average Order Value"
        value={`$${stats.averageOrderValue.toFixed(2)}`}
        change={{
          value: stats.aovChange,
          type: stats.aovChange >= 0 ? "increase" : "decrease",
          period: "Since last week",
        }}
        icon={<Package className="w-4 h-4" />}
        color="default"
      />
    </div>
  )
}
