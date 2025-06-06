"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface Budget {
  id: string
  year: number
  month: number
  category: string
  allocated_amount: number
  spent_amount: number
  created_by: string
  created_at: string
  percentage_used: number
  remaining_amount: number
}

interface BudgetDashboardProps {
  budgets: Budget[]
  currentYear: number
  currentMonth: number
}

export function BudgetDashboard({ budgets, currentYear, currentMonth }: BudgetDashboardProps) {
  const [selectedYear, setSelectedYear] = useState(currentYear.toString())
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString())
  const [selectedCategory, setSelectedCategory] = useState("all")

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  const categories = [...new Set(budgets.map((b) => b.category))]

  const filteredBudgets = budgets.filter((budget) => {
    const matchesYear = budget.year === Number.parseInt(selectedYear)
    const matchesMonth = selectedMonth === "all" || budget.month === Number.parseInt(selectedMonth)
    const matchesCategory = selectedCategory === "all" || budget.category === selectedCategory
    return matchesYear && matchesMonth && matchesCategory
  })

  const totalAllocated = filteredBudgets.reduce((sum, budget) => sum + budget.allocated_amount, 0)
  const totalSpent = filteredBudgets.reduce((sum, budget) => sum + budget.spent_amount, 0)
  const totalRemaining = totalAllocated - totalSpent
  const overallPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0

  const getBudgetStatus = (percentage: number) => {
    if (percentage >= 90) return { status: "critical", color: "bg-red-100 text-red-800", icon: XCircle }
    if (percentage >= 75) return { status: "warning", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle }
    return { status: "healthy", color: "bg-green-100 text-green-800", icon: CheckCircle }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budget Management</h2>
          <p className="text-gray-600">Monitor and manage your pharmacy's financial planning</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
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
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-lime-400 text-teal-800 hover:bg-lime-500">
            <Plus className="w-4 h-4 mr-2" />
            New Budget
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAllocated.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">{overallPercentage.toFixed(1)}% of allocated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
            <TrendingDown className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRemaining.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Available to spend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
            <Calendar className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallPercentage.toFixed(1)}%</div>
            <Badge className={`mt-1 ${getBudgetStatus(overallPercentage).color}`} variant="secondary">
              {getBudgetStatus(overallPercentage).status}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredBudgets.map((budget) => {
              const statusInfo = getBudgetStatus(budget.percentage_used)
              const StatusIcon = statusInfo.icon

              return (
                <div key={budget.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{budget.category}</h3>
                      <p className="text-sm text-gray-500">
                        Created by {budget.created_by} • {new Date(budget.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={`${statusInfo.color}`} variant="secondary">
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Allocated</p>
                      <p className="text-lg font-semibold">${budget.allocated_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Spent</p>
                      <p className="text-lg font-semibold">${budget.spent_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Remaining</p>
                      <p className="text-lg font-semibold">${budget.remaining_amount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{budget.percentage_used.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(budget.percentage_used)}`}
                        style={{ width: `${Math.min(budget.percentage_used, 100)}%` }}
                      />
                    </div>
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
