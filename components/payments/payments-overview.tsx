"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Smartphone, Shield, DollarSign, TrendingUp } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface PaymentMethodStats {
  payment_method: string
  transaction_count: number
  total_amount: number
  percentage: number
}

interface PaymentsOverviewProps {
  paymentStats: PaymentMethodStats[]
}

export function PaymentsOverview({ paymentStats }: PaymentsOverviewProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <CreditCard className="w-5 h-5" />
      case "momo":
        return <Smartphone className="w-5 h-5" />
      case "insurance":
        return <Shield className="w-5 h-5" />
      default:
        return <CreditCard className="w-5 h-5" />
    }
  }

  const getPaymentColor = (method: string) => {
    switch (method) {
      case "cash":
        return "#22c55e"
      case "momo":
        return "#3b82f6"
      case "insurance":
        return "#f59e0b"
      default:
        return "#6b7280"
    }
  }

  const totalTransactions = paymentStats.reduce((sum, stat) => sum + stat.transaction_count, 0)
  const totalAmount = paymentStats.reduce((sum, stat) => sum + stat.total_amount, 0)

  const chartData = paymentStats.map((stat) => ({
    name: stat.payment_method.toUpperCase(),
    value: stat.total_amount,
    count: stat.transaction_count,
    percentage: stat.percentage,
    fill: getPaymentColor(stat.payment_method),
  }))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rwf {totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All payment methods</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats.length}</div>
            <p className="text-xs text-muted-foreground">Active methods</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cash">Cash</TabsTrigger>
          <TabsTrigger value="momo">Mobile Money</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Payment Methods List */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentStats.map((stat) => (
                  <div key={stat.payment_method} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPaymentIcon(stat.payment_method)}
                        <span className="font-medium capitalize">{stat.payment_method}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Rwf {stat.total_amount.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">{stat.transaction_count} transactions</div>
                      </div>
                    </div>
                    <Progress value={stat.percentage} className="h-2" />
                    <div className="text-xs text-gray-500">{stat.percentage.toFixed(1)}% of total revenue</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    cash: { label: "Cash", color: "#22c55e" },
                    momo: { label: "Mobile Money", color: "#3b82f6" },
                    insurance: { label: "Insurance", color: "#f59e0b" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-white p-3 border rounded shadow">
                                <p className="font-medium">{data.name}</p>
                                <p className="text-sm">Revenue: Rwf{data.value.toFixed(2)}</p>
                                <p className="text-sm">Transactions: {data.count}</p>
                                <p className="text-sm">Percentage: {data.percentage.toFixed(1)}%</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Volume Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Volume by Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: { label: "Transactions", color: "#8884d8" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#8884d8" name="Transactions" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Payment Method Tabs */}
        {["cash", "momo", "insurance"].map((method) => {
          const methodData = paymentStats.find((stat) => stat.payment_method === method)
          return (
            <TabsContent key={method} value={method}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getPaymentIcon(method)}
                    {method === "momo" ? "Mobile Money" : method.charAt(0).toUpperCase() + method.slice(1)} Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {methodData ? (
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{methodData.transaction_count}</div>
                        <div className="text-sm text-gray-500">Total Transactions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">Rwf {methodData.total_amount.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">Total Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{methodData.percentage.toFixed(1)}%</div>
                        <div className="text-sm text-gray-500">Of Total Revenue</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No {method} transactions found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
