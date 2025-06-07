"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, TrendingUp, Clock, CheckCircle, Search, Download, Eye, Check, Receipt } from "lucide-react"
import { CreateExpenseDialog } from "./create-expense-dialog"
import { ExpenseDetailsDialog } from "./expense-details-dialog"
import { toast } from "sonner"

interface ExpenseStats {
  total_expenses: number
  approved_expenses: number
  pending_expenses: number
  expense_count: number
  budget_allocated: number
  budget_remaining: number
  budget_utilization: number
}

interface Expense {
  id: string
  description: string
  amount: number
  expense_date: string
  payment_method: string
  category: string
  recorded_by: string
  recorded_by_email?: string
  approved_by?: string
  approved_by_email?: string
  is_approved: boolean
  created_at: string
  receipt_url?: string
}

interface CurrentUser {
  id: string
  email: string
  role: string
  pharmacy_id: string
}

interface ExpenseManagementProps {
  expenses: Expense[]
  stats: ExpenseStats
  currentUser: CurrentUser
}

export function ExpenseManagement({ expenses: initialExpenses, stats, currentUser }: ExpenseManagementProps) {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all")
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const categories = [...new Set(expenses.map((e) => e.category))]
  const paymentMethods = [...new Set(expenses.map((e) => e.payment_method))]

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "approved" && expense.is_approved) ||
      (statusFilter === "pending" && !expense.is_approved)
    const matchesPaymentMethod = paymentMethodFilter === "all" || expense.payment_method === paymentMethodFilter
    return matchesSearch && matchesCategory && matchesStatus && matchesPaymentMethod
  })

  const canApprove = currentUser.role === "admin" || currentUser.role === "manager"

  const handleApproveExpense = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expenses/Rwf {expenseId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setExpenses(
          expenses.map((e) =>
            e.id === expenseId
              ? {
                  ...e,
                  is_approved: true,
                  approved_by: currentUser.id,
                  approved_by_email: currentUser.email,
                }
              : e,
          ),
        )
        toast.success("Expense approved successfully")
      } else {
        toast.error("Failed to approve expense")
      }
    } catch (error) {
      console.error("Error approving expense:", error)
      toast.error("An unexpected error occurred")
    }
  }

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowDetailsDialog(true)
  }

  const handleExpenseCreated = () => {
    // Refresh expenses list
    window.location.reload()
  }

  const getStatusBadge = (isApproved: boolean) => {
    if (isApproved) {
      return (
        <Badge className="bg-green-100 text-green-800" variant="secondary">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      )
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    )
  }

  const getPaymentMethodBadge = (method: string) => {
    const colors = {
      cash: "bg-blue-100 text-blue-800",
      card: "bg-purple-100 text-purple-800",
      bank_transfer: "bg-green-100 text-green-800",
      mobile_money: "bg-orange-100 text-orange-800",
      check: "bg-gray-100 text-gray-800",
    }
    return colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <CreateExpenseDialog
            pharmacyId={currentUser.pharmacy_id}
            currentUserId={currentUser.id}
            onExpenseCreated={handleExpenseCreated}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rwf {stats.total_expenses.toLocaleString()}</div>
            <p className="text-xs text-gray-500">{stats.expense_count} total expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rwf {stats.approved_expenses.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Approved expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">Rwf {stats.pending_expenses.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Usage</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.budget_utilization.toFixed(1)}%</div>
            <p className="text-xs text-gray-500">Of allocated budget</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget vs Expenses Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Expenses Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-sm text-gray-500">Budget Allocated</p>
              <p className="text-2xl font-bold text-blue-600">Rwf {stats.budget_allocated.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Expenses (Approved)</p>
              <p className="text-2xl font-bold text-green-600">Rwf {stats.approved_expenses.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Remaining Budget</p>
              <p className={`text-2xl font-bold Rwf {stats.budget_remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                Rwf {Math.abs(stats.budget_remaining).toLocaleString()}
                {stats.budget_remaining < 0 && " over"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Management Tabs */}
      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expenses">All Expenses</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method.replace("_", " ").toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Table */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-8 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                  <span>Description</span>
                  <span>Amount</span>
                  <span>Category</span>
                  <span>Date</span>
                  <span>Payment</span>
                  <span>Status</span>
                  <span>Recorded By</span>
                  <span>Actions</span>
                </div>

                {filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="grid grid-cols-8 gap-4 items-center py-3 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{expense.description}</p>
                      {expense.receipt_url && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Receipt className="w-3 h-3 mr-1" />
                          Receipt attached
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-semibold">Rwf {expense.amount.toLocaleString()}</span>
                    <Badge variant="outline" className="text-xs">
                      {expense.category}
                    </Badge>
                    <span className="text-sm">{new Date(expense.expense_date).toLocaleDateString()}</span>
                    <Badge className={`text-xs Rwf {getPaymentMethodBadge(expense.payment_method)}`} variant="secondary">
                      {expense.payment_method.replace("_", " ").toUpperCase()}
                    </Badge>
                    {getStatusBadge(expense.is_approved)}
                    <span className="text-sm">{expense.recorded_by_email}</span>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewExpense(expense)}>
                        <Eye className="w-3 h-3" />
                      </Button>
                      {!expense.is_approved && canApprove && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApproveExpense(expense.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {filteredExpenses.length === 0 && (
                  <div className="text-center py-8">
                    <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria or create a new expense.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses
                  .filter((e) => !e.is_approved)
                  .map((expense) => (
                    <div key={expense.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{expense.description}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold">Rwf {expense.amount.toLocaleString()}</span>
                          {canApprove && (
                            <Button size="sm" onClick={() => handleApproveExpense(expense.id)}>
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                        <span>Category: {expense.category}</span>
                        <span>Date: {new Date(expense.expense_date).toLocaleDateString()}</span>
                        <span>Payment: {expense.payment_method.replace("_", " ")}</span>
                        <span>By: {expense.recorded_by_email}</span>
                      </div>
                    </div>
                  ))}

                {expenses.filter((e) => !e.is_approved).length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All expenses approved</h3>
                    <p className="text-gray-500">No expenses are pending approval.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map((category) => {
                    const categoryExpenses = expenses.filter((e) => e.category === category && e.is_approved)
                    const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0)
                    const percentage = stats.approved_expenses > 0 ? (total / stats.approved_expenses) * 100 : 0

                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category}</span>
                        <div className="text-right">
                          <span className="text-sm font-semibold">Rwf {total.toLocaleString()}</span>
                          <span className="text-xs text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const methodExpenses = expenses.filter((e) => e.payment_method === method && e.is_approved)
                    const total = methodExpenses.reduce((sum, e) => sum + e.amount, 0)
                    const count = methodExpenses.length

                    return (
                      <div key={method} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{method.replace("_", " ").toUpperCase()}</span>
                        <div className="text-right">
                          <span className="text-sm font-semibold">Rwf {total.toLocaleString()}</span>
                          <span className="text-xs text-gray-500 ml-2">({count} transactions)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Expense Details Dialog */}
      {selectedExpense && (
        <ExpenseDetailsDialog
          expense={selectedExpense}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          canApprove={canApprove}
          onApprove={() => handleApproveExpense(selectedExpense.id)}
        />
      )}
    </div>
  )
}
