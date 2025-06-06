"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, CreditCard, Smartphone, Shield } from "lucide-react"
import Link from "next/link"
import { EmptyState } from "@/components/ui/empty-state"
import { ShoppingCart } from "lucide-react"
import { RecordSaleDialog } from "./record-sale-dialog"

interface RecentSale {
  id: string
  customer_name: string
  total_amount: number
  payment_method: string
  payment_status: string
  status: string
  created_at: string
  pharmacy_users: {
    email: string
    full_name?: string
  }
  sale_items: Array<{
    quantity: number
    products: {
      name: string
    }
  }>
}

interface RecentSalesTableProps {
  sales: RecentSale[]
}

export function RecentSalesTable({ sales }: RecentSalesTableProps) {
  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <CreditCard className="w-4 h-4" />
      case "momo":
        return <Smartphone className="w-4 h-4" />
      case "insurance":
        return <Shield className="w-4 h-4" />
      default:
        return <CreditCard className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (sales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={ShoppingCart}
            title="No Recent Sales"
            description="Sales transactions will appear here once you start recording sales."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <RecordSaleDialog
                          trigger={
                            <Button>
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Record Sale
                            </Button>
                          }
                        />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-medium text-sm text-gray-500">Transaction ID</th>
                <th className="text-left py-3 px-2 font-medium text-sm text-gray-500">Customer</th>
                <th className="text-left py-3 px-2 font-medium text-sm text-gray-500">Items</th>
                <th className="text-left py-3 px-2 font-medium text-sm text-gray-500">Amount</th>
                <th className="text-left py-3 px-2 font-medium text-sm text-gray-500">Payment</th>
                <th className="text-left py-3 px-2 font-medium text-sm text-gray-500">Status</th>
                <th className="text-left py-3 px-2 font-medium text-sm text-gray-500">Recorded By</th>
                <th className="text-left py-3 px-2 font-medium text-sm text-gray-500">Date</th>
                <th className="text-left py-3 px-2 font-medium text-sm text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <span className="font-mono text-sm">#{sale.id.slice(0, 8)}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm">{sale.customer_name}</span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="text-sm">
                      {sale.sale_items.length} item{sale.sale_items.length !== 1 ? "s" : ""}
                      {sale.sale_items.length > 0 && (
                        <div className="text-xs text-gray-500 truncate max-w-32">
                          {sale.sale_items[0].products.name}
                          {sale.sale_items.length > 1 && ` +${sale.sale_items.length - 1} more`}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="font-medium text-sm">Rwf {sale.total_amount.toFixed(2)}</span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1">
                      {getPaymentIcon(sale.payment_method)}
                      <span className="text-sm capitalize">{sale.payment_method}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="space-y-1">
                      <Badge className={`text-xs ${getStatusColor(sale.status)}`} variant="secondary">
                        {sale.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="text-sm">
                      <div>{sale.pharmacy_users.full_name || "Unknown"}</div>
                      <div className="text-xs text-gray-500">{sale.pharmacy_users.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="text-sm">
                      <div>{new Date(sale.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(sale.created_at).toLocaleTimeString()}</div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <Link href={`/sales/${sale.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
