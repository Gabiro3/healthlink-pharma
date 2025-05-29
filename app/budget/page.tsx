"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import { Plus, FileText, Edit, Trash2, DollarSign, TrendingUp, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TableSkeleton } from "@/components/loading-skeleton"
import { EmptyState } from "@/components/emtpy-state"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useCurrency } from "@/lib/contexts/currency-context"
import { getBudgetPlans, getBudgetVsActual } from "@/lib/services/budget-service"
import type { BudgetPlanWithAllocations } from "@/lib/types"
import { redirect } from "next/navigation"

interface BudgetOverview {
  totalBudget: number
  totalSpent: number
  remainingBudget: number
  utilizationRate: number
}

export default function BudgetPage() {
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlanWithAllocations[]>([])
  const [budgetOverview, setBudgetOverview] = useState<BudgetOverview>({
    totalBudget: 0,
    totalSpent: 0,
    remainingBudget: 0,
    utilizationRate: 0,
  })
  const [budgetVsActual, setBudgetVsActual] = useState<any>({
    categories: [],
    totals: { budgeted: 0, actual: 0, variance: 0 },
  })
  const [isLoading, setIsLoading] = useState(true)
  const { formatAmount } = useCurrency()

  useEffect(() => {
    fetchBudgetData()
  }, [])

  async function fetchBudgetData() {
    setIsLoading(true)
    try {
      // Fetch budget plans
      const { data: plans } = await getBudgetPlans({})
      setBudgetPlans(plans)

      // Calculate overview from active plans
      const activePlans = plans.filter((plan) => plan.status === "active")
      const totalBudget = activePlans.reduce((sum, plan) => sum + plan.total_budget, 0)

      // Get budget vs actual data
      const budgetComparison = await getBudgetVsActual({})
      setBudgetVsActual(budgetComparison)

      const totalSpent = budgetComparison.totals.actual
      const remainingBudget = totalBudget - totalSpent
      const utilizationRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

      setBudgetOverview({
        totalBudget,
        totalSpent,
        remainingBudget,
        utilizationRate,
      })
    } catch (error) {
      console.error("Error fetching budget data:", error)
      toast.error("Failed to load budget data")
    } finally {
      setIsLoading(false)
    }
  }

  function getBadgeColor(status: string) {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500 text-white"
      case "draft":
        return "bg-yellow-500 text-white"
      case "completed":
        return "bg-blue-500 text-white"
      case "cancelled":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <>
      <div className="grid gap-6">
        {/* Budget Overview Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-[#004d40] text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <div className="rounded-full bg-white/10 p-2">
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(budgetOverview.totalBudget)}</div>
              <div className="text-xs text-white/60">Current fiscal period</div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <div className="rounded-full bg-red-100 p-2">
                <TrendingUp className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(budgetOverview.totalSpent)}</div>
              <div className="text-xs text-muted-foreground">{budgetOverview.utilizationRate.toFixed(1)}% utilized</div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <div className="rounded-full bg-green-100 p-2">
                <DollarSign className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(budgetOverview.remainingBudget)}</div>
              <div className="text-xs text-muted-foreground">Available to spend</div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Utilization</CardTitle>
              <div className="rounded-full bg-blue-100 p-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{budgetOverview.utilizationRate.toFixed(1)}%</div>
              <Progress value={budgetOverview.utilizationRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Budget vs Actual */}
        {budgetVsActual.categories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual by Category</CardTitle>
              <CardDescription>Compare budgeted amounts with actual spending</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Budgeted</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Variance</TableHead>
                    <TableHead>Utilization</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetVsActual.categories.map((category: any) => {
                    const utilization = category.budgeted > 0 ? (category.actual / category.budgeted) * 100 : 0
                    const isOverBudget = category.actual > category.budgeted

                    return (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{formatAmount(category.budgeted)}</TableCell>
                        <TableCell>{formatAmount(category.actual)}</TableCell>
                        <TableCell>
                          <span className={isOverBudget ? "text-red-600" : "text-green-600"}>
                            {formatAmount(Math.abs(category.variance))}
                            {isOverBudget ? " over" : " under"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={Math.min(utilization, 100)} className="flex-1" />
                            <span className="text-sm">{utilization.toFixed(0)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Budget Plans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Budget Plans</CardTitle>
              <CardDescription>View and manage your budget plans</CardDescription>
            </div>
            <Button onClick={() => redirect("/budget/create")}>
              <Plus className="mr-2 h-4 w-4" />
              New Budget Plan
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton rows={5} columns={5} />
            ) : budgetPlans.length === 0 ? (
              <EmptyState
                icon={DollarSign}
                title="No budget plans found"
                description="Create your first budget plan to start managing your pharmacy finances."
                action={{
                  label: "Create Budget Plan",
                  onClick: () => redirect("/budget/create"),
                }}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Total Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.title}</TableCell>
                      <TableCell>
                        {format(new Date(plan.start_date), "MMM d, yyyy")} -{" "}
                        {format(new Date(plan.end_date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{formatAmount(plan.total_budget)}</TableCell>
                      <TableCell>
                        <Badge className={getBadgeColor(plan.status)}>{plan.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Plan
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Plan
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      </>
  )
}
