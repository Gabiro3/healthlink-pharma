"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  TrendingUp,
  Target,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PieChart,
  Download,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from "recharts"

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

interface BudgetViewDashboardProps {
  budgets: Budget[]
  stats: BudgetStats
  currentYear: number
  currentMonth: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function BudgetViewDashboard({ budgets, stats, currentYear, currentMonth }: BudgetViewDashboardProps) {
  const [selectedYear, setSelectedYear] = useState(currentYear.toString())
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
    const matchesCategory = selectedCategory === "all" || budget.category === selectedCategory
    return matchesYear && matchesCategory
  })

  const budgetUtilization = stats.total_allocated > 0 ? (stats.total_spent / stats.total_allocated) * 100 : 0

  // Prepare chart data
  const monthlyData = months.map((month) => {
    const monthBudgets = filteredBudgets.filter((b) => b.month === Number.parseInt(month.value))
    const allocated = monthBudgets.reduce((sum, b) => sum + b.allocated_amount, 0)
    const spent = monthBudgets.reduce((sum, b) => sum + b.spent_amount, 0)

    return {
      month: month.label.substring(0, 3),
      allocated,
      spent,
      remaining: allocated - spent,
    }
  })

  const categoryData = categories.map((category, index) => {
    const categoryBudgets = filteredBudgets.filter((b) => b.category === category)
    const allocated = categoryBudgets.reduce((sum, b) => sum + b.allocated_amount, 0)
    const spent = categoryBudgets.reduce((sum, b) => sum + b.spent_amount, 0)

    return {
      name: category,
      allocated,
      spent,
      utilization: allocated > 0 ? (spent / allocated) * 100 : 0,
      color: COLORS[index % COLORS.length],
    }
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

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budget Analysis</h2>
          <p className="text-gray-600">Comprehensive view of your budget performance and trends</p>
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
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Target className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.total_allocated.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">{stats.budget_count} active budgets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.total_spent.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">{budgetUtilization.toFixed(1)}% utilized</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <DollarSign className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.total_remaining.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Available to spend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
            <PieChart className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetUtilization.toFixed(1)}%</div>
            <Progress value={budgetUtilization} className="mt-2" />
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

      {/* Charts and Analysis */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="categories">Category Analysis</TabsTrigger>
          <TabsTrigger value="details">Budget Details</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Budget vs Spending Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`Rwf ${Number(value).toLocaleString()}`, ""]} />
                    <Line type="monotone" dataKey="allocated" stroke="#8884d8" strokeWidth={2} name="Allocated" />
                    <Line type="monotone" dataKey="spent" stroke="#82ca9d" strokeWidth={2} name="Spent" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Budget Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Tooltip formatter={(value) => [`Rwf ${Number(value).toLocaleString()}`, ""]} />
                      <Pie
                        data={categoryData}
                        dataKey="allocated"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{category.name}</span>
                        <span>{category.utilization.toFixed(1)}%</span>
                      </div>
                      <Progress value={category.utilization} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Spent: Rwf {category.spent.toLocaleString()}</span>
                        <span>Budget: Rwf {category.allocated.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredBudgets.map((budget) => {
                  const statusInfo = getBudgetStatusInfo(budget.status)
                  const StatusIcon = statusInfo.icon

                  return (
                    <div key={budget.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{budget.category}</h3>
                          <p className="text-sm text-gray-500">
                            {months.find((m) => m.value === budget.month.toString())?.label} {budget.year}
                          </p>
                        </div>
                        <Badge className={`${statusInfo.color}`} variant="secondary">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Allocated</p>
                          <p className="text-lg font-semibold">${budget.allocated_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Spent</p>
                          <p className="text-lg font-semibold">Rwf {budget.spent_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Remaining</p>
                          <p
                            className={`text-lg font-semibold ${
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
                    <p className="text-gray-500">No budgets match your current filters.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
