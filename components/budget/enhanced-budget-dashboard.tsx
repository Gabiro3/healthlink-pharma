"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DollarSign,
  TrendingUp,
  Plus,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Target,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface BudgetStats {
  total_allocated: number
  total_spent: number
  total_remaining: number
  budget_count: number
  over_budget_count: number
}

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

interface EnhancedBudgetDashboardProps {
  budgets: Budget[]
  stats: BudgetStats
  currentYear: number
  currentMonth: number
}

export function EnhancedBudgetDashboard({ budgets, stats, currentYear, currentMonth }: EnhancedBudgetDashboardProps) {
  const [selectedYear, setSelectedYear] = useState(currentYear.toString())
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const router = useRouter()

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

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500"
    if (percentage >= 90) return "bg-yellow-500"
    return "bg-green-500"
  }

  const budgetUtilization = stats.total_allocated > 0 ? (stats.total_spent / stats.total_allocated) * 100 : 0

  const handleCategoryClick = (budgetId: string) => {
    router.push(`/budget/category/${budgetId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
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
          <Link href="/budget/create">
            <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Budget
            </Button>
          </Link>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
            <Target className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rwf {stats.total_allocated.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">{stats.budget_count} active budgets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rwf {stats.total_spent.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">{budgetUtilization.toFixed(1)}% utilized</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
            <DollarSign className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rwf {stats.total_remaining.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Available to spend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
            <Calendar className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetUtilization.toFixed(1)}%</div>
            <Badge
              className={`mt-1 Rwf {
                budgetUtilization >= 100
                  ? "bg-red-100 text-red-800"
                  : budgetUtilization >= 90
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
              }`}
              variant="secondary"
            >
              {budgetUtilization >= 100 ? "Over Budget" : budgetUtilization >= 90 ? "Warning" : "Healthy"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over Budget</CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.over_budget_count}</div>
            <p className="text-xs text-gray-500 mt-1">Categories exceeded</p>
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
              const statusInfo = getBudgetStatusInfo(budget.status)
              const StatusIcon = statusInfo.icon

              return (
                <div
                  key={budget.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
                  onClick={() => handleCategoryClick(budget.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-blue-600 hover:text-blue-700">{budget.category}</h3>
                      <p className="text-sm text-gray-500">
                        {months.find((m) => m.value === budget.month.toString())?.label} {budget.year}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`Rwf {statusInfo.color}`} variant="secondary">
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCategoryClick(budget.id)
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        View Details →
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Allocated</p>
                      <p className="text-lg font-semibold">Rwf {budget.allocated_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Spent</p>
                      <p className="text-lg font-semibold">Rwf {budget.spent_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Remaining</p>
                      <p
                        className={`text-lg font-semibold Rwf {
                          budget.remaining_amount < 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        Rwf {Math.abs(budget.remaining_amount).toLocaleString()}
                        {budget.remaining_amount < 0 && " over"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{budget.percentage_used.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(budget.percentage_used, 100)} className="h-2" />
                  </div>
                </div>
              )
            })}

            {filteredBudgets.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets found</h3>
                <p className="text-gray-500 mb-4">Create your first budget to start tracking expenses.</p>
                <Link href="/budget/create">
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Budget
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
