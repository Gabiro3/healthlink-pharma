"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Download,
  Filter,
} from "lucide-react"
import Link from "next/link"

interface Budget {
  id: string
  year: number
  month: number
  category: string
  allocated_amount: number
  spent_amount: number
  percentage_used: number
  remaining_amount: number
  status: "healthy" | "warning" | "over_budget"
  created_at: string
}

interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  type: "expense" | "adjustment"
  recorded_by: string
  recorded_by_name: string
  created_at: string
}

interface BudgetCategoryDetailProps {
  budget: Budget
  transactions: Transaction[]
}

export function BudgetCategoryDetail({ budget, transactions }: BudgetCategoryDetailProps) {
  const [transactionFilter, setTransactionFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("desc")

  const getBudgetStatusInfo = (status: string) => {
    switch (status) {
      case "over_budget":
        return { color: "bg-red-100 text-red-800", icon: XCircle, label: "Over Budget" }
      case "warning":
        return { color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle, label: "Warning" }
      default:
        return { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Healthy" }
    }
  }

  const statusInfo = getBudgetStatusInfo(budget.status)
  const StatusIcon = statusInfo.icon

  const filteredTransactions = transactions
    .filter((transaction) => {
      if (transactionFilter === "all") return true
      return transaction.type === transactionFilter
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    })

  const monthName = new Date(0, budget.month - 1).toLocaleString("default", { month: "long" })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/budget">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Budget
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{budget.category}</h2>
            <p className="text-gray-600">
              {monthName} {budget.year} Budget Details
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Badge className={`Rwf {statusInfo.color}`} variant="secondary">
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allocated Budget</CardTitle>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rwf {budget.allocated_amount.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Total allocated for {monthName}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Spent</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rwf {budget.spent_amount.toLocaleString()}</div>
            <p className="text-xs text-gray-500">{budget.percentage_used.toFixed(1)}% of budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
            <TrendingDown className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold Rwf {budget.remaining_amount < 0 ? "text-red-600" : "text-green-600"}`}>
              Rwf {Math.abs(budget.remaining_amount).toLocaleString()}
              {budget.remaining_amount < 0 && " over"}
            </div>
            <p className="text-xs text-gray-500">
              {budget.remaining_amount < 0 ? "Over budget" : "Available to spend"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <Calendar className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budget.percentage_used.toFixed(1)}%</div>
            <Progress value={Math.min(budget.percentage_used, 100)} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {/* Transaction Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                <Select value={transactionFilter} onValueChange={setTransactionFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="expense">Expenses</SelectItem>
                    <SelectItem value="adjustment">Adjustments</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                  <span>Date</span>
                  <span>Description</span>
                  <span>Type</span>
                  <span>Amount</span>
                  <span>Recorded By</span>
                  <span>Status</span>
                </div>

                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="grid grid-cols-6 gap-4 items-center py-3 border-b border-gray-100"
                  >
                    <span className="text-sm">{new Date(transaction.date).toLocaleDateString()}</span>
                    <span className="text-sm font-medium">{transaction.description}</span>
                    <Badge
                      variant="secondary"
                      className={
                        transaction.type === "expense" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                      }
                    >
                      {transaction.type}
                    </Badge>
                    <span className="text-sm font-semibold">Rwf {transaction.amount.toLocaleString()}</span>
                    <span className="text-sm">{transaction.recorded_by_name}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Processed
                    </Badge>
                  </div>
                ))}

                {filteredTransactions.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                    <p className="text-gray-500">No transactions match your current filters.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Spending Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Daily Average</span>
                    <span className="text-sm font-medium">
                      Rwf {(budget.spent_amount / new Date(budget.year, budget.month, 0).getDate()).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Largest Transaction</span>
                    <span className="text-sm font-medium">
                      Rwf {Math.max(...transactions.map((t) => t.amount), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Transactions</span>
                    <span className="text-sm font-medium">{transactions.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Budget Status</span>
                    <Badge className={statusInfo.color} variant="secondary">
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Utilization Rate</span>
                    <span className="text-sm font-medium">{budget.percentage_used.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Days Remaining</span>
                    <span className="text-sm font-medium">
                      {Math.max(0, new Date(budget.year, budget.month, 0).getDate() - new Date().getDate())} days
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Projected Month-End Spending</h4>
                  <p className="text-2xl font-bold text-blue-900">Rwf {(budget.spent_amount * 1.2).toLocaleString()}</p>
                  <p className="text-sm text-blue-700 mt-1">Based on current spending patterns</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-800">Best Case Scenario</h4>
                    <p className="text-lg font-semibold text-green-900">
                      Rwf {(budget.spent_amount * 1.1).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-red-800">Worst Case Scenario</h4>
                    <p className="text-lg font-semibold text-red-900">
                      Rwf {(budget.spent_amount * 1.4).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
