"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, ShoppingCart } from "lucide-react"

interface EnhancedStatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: "increase" | "decrease"
    period: string
  }
  icon: React.ReactNode
  color?: "default" | "green" | "red" | "blue" | "orange"
}

function EnhancedStatsCard({ title, value, change, icon, color = "default" }: EnhancedStatsCardProps) {
  const colorClasses = {
    default: "bg-gray-50 text-gray-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
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
              {change.value.toFixed(1)}%
            </Badge>
            <span className="text-xs text-gray-500 ml-2">{change.period}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface EnhancedDashboardStatsProps {
  metrics: {
    today_sales: number
    yesterday_sales: number
    total_products: number
    expired_products: number
    low_stock_products: number
  }
}

export function EnhancedDashboardStats({ metrics }: EnhancedDashboardStatsProps) {
  const salesChange =
    metrics.yesterday_sales > 0 ? ((metrics.today_sales - metrics.yesterday_sales) / metrics.yesterday_sales) * 100 : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <EnhancedStatsCard
        title="Today's Sales"
        value={`Rwf ${metrics.today_sales.toLocaleString()}`}
        change={{
          value: salesChange,
          type: salesChange >= 0 ? "increase" : "decrease",
          period: "vs yesterday",
        }}
        icon={<DollarSign className="w-4 h-4" />}
        color="green"
      />

      <EnhancedStatsCard
        title="Total Products"
        value={metrics.total_products.toLocaleString()}
        icon={<Package className="w-4 h-4" />}
        color="blue"
      />

      <EnhancedStatsCard
        title="Expired Products"
        value={metrics.expired_products.toLocaleString()}
        icon={<AlertTriangle className="w-4 h-4" />}
        color={metrics.expired_products > 0 ? "red" : "default"}
      />

      <EnhancedStatsCard
        title="Low Stock Items"
        value={metrics.low_stock_products.toLocaleString()}
        icon={<ShoppingCart className="w-4 h-4" />}
        color={metrics.low_stock_products > 0 ? "orange" : "default"}
      />
    </div>
  )
}
