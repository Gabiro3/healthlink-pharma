"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Clock, Receipt, User, Calendar, CreditCard, DollarSign, Check } from "lucide-react"

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

interface ExpenseDetailsDialogProps {
  expense: Expense
  open: boolean
  onOpenChange: (open: boolean) => void
  canApprove: boolean
  onApprove: () => void
}

export function ExpenseDetailsDialog({
  expense,
  open,
  onOpenChange,
  canApprove,
  onApprove,
}: ExpenseDetailsDialogProps) {
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

  const statusInfo = getStatusInfo(expense.is_approved)
  const StatusIcon = statusInfo.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Expense Details</span>
            <Badge className={statusInfo.color} variant="secondary">
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{expense.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-xl font-bold">${expense.amount.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Expense Date</p>
                  <p className="font-medium">{new Date(expense.expense_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <Badge variant="outline" className="mt-1">
                  {expense.category}
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">{expense.payment_method.replace("_", " ").toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Receipt Information */}
          {expense.receipt_url && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Receipt className="w-4 h-4 mr-2" />
                  Receipt
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <a
                    href={expense.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View Receipt Document
                  </a>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* User Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">User Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-500">Recorded By</p>
                  <p className="font-medium">{expense.recorded_by_email}</p>
                  <p className="text-xs text-gray-400">{new Date(expense.created_at).toLocaleString()}</p>
                </div>
              </div>

              {expense.is_approved && expense.approved_by_email && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Approved By</p>
                    <p className="font-medium">{expense.approved_by_email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {!expense.is_approved && canApprove && (
              <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700">
                <Check className="w-4 h-4 mr-2" />
                Approve Expense
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
