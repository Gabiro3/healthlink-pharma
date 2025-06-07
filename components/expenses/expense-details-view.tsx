"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  Clock,
  Receipt,
  User,
  Calendar,
  CreditCard,
  DollarSign,
  ArrowLeft,
  Check,
  Edit,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

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

interface ExpenseDetailsViewProps {
  expense: Expense
  currentUser: CurrentUser
}

export function ExpenseDetailsView({ expense, currentUser }: ExpenseDetailsViewProps) {
  const canApprove = (currentUser.role === "admin" || currentUser.role === "manager") && !expense.is_approved
  const canEdit = expense.recorded_by === currentUser.id && !expense.is_approved

  const getStatusInfo = (isApproved: boolean) => {
    if (isApproved) {
      return {
        icon: CheckCircle,
        label: "Approved",
        color: "bg-green-100 text-green-800",
      }
    }
    return {
      icon: Clock,
      label: "Pending Approval",
      color: "bg-yellow-100 text-yellow-800",
    }
  }

  const handleApprove = async () => {
    try {
      const response = await fetch(`/api/expenses/${expense.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        toast.success("Expense approved successfully")
        window.location.reload()
      } else {
        toast.error("Failed to approve expense")
      }
    } catch (error) {
      console.error("Error approving expense:", error)
      toast.error("An unexpected error occurred")
    }
  }

  const statusInfo = getStatusInfo(expense.is_approved)
  const StatusIcon = statusInfo.icon

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Link href="/expenses">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Expenses
          </Button>
        </Link>
        <div className="flex items-center space-x-2">
          {canEdit && (
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
          {canApprove && (
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700" size="sm">
              <Check className="w-4 h-4 mr-2" />
              Approve
            </Button>
          )}
        </div>
      </div>

      {/* Main Expense Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Expense Details</CardTitle>
            <Badge className={statusInfo.color} variant="secondary">
              <StatusIcon className="w-4 h-4 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{expense.description}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-2xl font-bold text-green-600">${expense.amount.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Expense Date</p>
                <p className="text-lg font-semibold">{new Date(expense.expense_date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
              <CreditCard className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="text-lg font-semibold">{expense.payment_method.replace("_", " ").toUpperCase()}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Category</h3>
              <Badge variant="outline" className="text-sm px-3 py-1">
                {expense.category}
              </Badge>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Created</h3>
              <p className="text-gray-600">{new Date(expense.created_at).toLocaleString()}</p>
            </div>
          </div>

          {/* Receipt Section */}
          {expense.receipt_url && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Receipt className="w-5 h-5 mr-2" />
                  Receipt
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <a
                    href={expense.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    View Receipt Document →
                  </a>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* User Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <User className="w-6 h-6 text-gray-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Recorded By</p>
                  <p className="font-semibold">{expense.recorded_by_email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(expense.created_at).toLocaleDateString()} at{" "}
                    {new Date(expense.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {expense.is_approved && expense.approved_by_email && (
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Approved By</p>
                    <p className="font-semibold">{expense.approved_by_email}</p>
                    <p className="text-xs text-gray-400 mt-1">Expense has been approved</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
