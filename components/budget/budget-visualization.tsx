"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Progress } from "@/components/ui/progress"
import { useCurrency } from "@/lib/contexts/currency-context"
import { TrendingUp, Target, PieChartIcon, BarChart3 } from "lucide-react"

interface BudgetAllocation {
  category_id: string
  category_name: string
  allocated_amount: number
  percentage: number
  notes?: string
}

interface BudgetGoal {
  id: string
  title: string
  target_amount: number
  current_amount: number
  deadline: string
  priority: "high" | "medium" | "low"
}

interface BudgetVisualizationProps {
  allocations: BudgetAllocation[]
  totalBudget: number
  goals: BudgetGoal[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

export function BudgetVisualization({ allocations, totalBudget, goals }: BudgetVisualizationProps) {
  const { formatAmount } = useCurrency()

  // Prepare data for charts
  const pieData = Array.isArray(allocations)
    ? allocations.map((allocation, index) => ({
        name: allocation.category_name,
        value: allocation.allocated_amount,
        percentage: allocation.percentage,
        color: COLORS[index % COLORS.length],
      }))
    : []

  const barData = Array.isArray(allocations)
    ? allocations.map((allocation) => ({
        category:
          allocation.category_name.length > 15
            ? allocation.category_name.substring(0, 15) + "..."
            : allocation.category_name,
        amount: allocation.allocated_amount,
        percentage: allocation.percentage,
      }))
    : []

  const goalData = Array.isArray(goals)
    ? goals.map((goal) => ({
        title: goal.title,
        progress: goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0,
        current: goal.current_amount,
        target: goal.target_amount,
        priority: goal.priority,
      }))
    : []

  if (!Array.isArray(allocations) || allocations.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Budget Distribution
            </CardTitle>
            <CardDescription>Visual breakdown of budget allocations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No budget allocations to display</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Allocation Amounts
            </CardTitle>
            <CardDescription>Budget amounts by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No allocation data to display</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Budget Distribution
            </CardTitle>
            <CardDescription>Visual breakdown of budget allocations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatAmount(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Allocation Amounts
            </CardTitle>
            <CardDescription>Budget amounts by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} fontSize={12} />
                  <YAxis tickFormatter={(value) => formatAmount(value)} />
                  <Tooltip formatter={(value) => formatAmount(Number(value))} />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">{formatAmount(totalBudget)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Allocated</p>
                <p className="text-2xl font-bold">
                  {formatAmount(allocations.reduce((sum, alloc) => sum + alloc.allocated_amount, 0))}
                </p>
              </div>
              <PieChartIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{allocations.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress */}
      {Array.isArray(goals) && goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Financial Goals Progress
            </CardTitle>
            <CardDescription>Track your budget goals and milestones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {goalData.map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{goal.title}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        goal.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : goal.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {goal.priority}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatAmount(goal.current)} / {formatAmount(goal.target)}
                  </span>
                </div>
                <Progress value={goal.progress} className="h-2" />
                <div className="text-xs text-muted-foreground">{goal.progress.toFixed(1)}% complete</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
