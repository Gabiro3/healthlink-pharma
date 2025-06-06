"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, Smartphone, Shield, User, DollarSign, Package, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface SaleItem {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  product_name: string
}

interface Sale {
  id: string
  customer_name: string
  customer_phone?: string
  total_amount: number
  payment_method: string
  payment_status?: string
  status: string
  insurance_provider?: string
  insurance_amount?: number
  created_at: string
  items: SaleItem[]
}

interface SaleDetailsViewProps {
  sale: Sale
}

export function SaleDetailsView({ sale }: SaleDetailsViewProps) {
  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <CreditCard className="w-5 h-5" />
      case "momo":
        return <Smartphone className="w-5 h-5" />
      case "insurance":
        return <Shield className="w-5 h-5" />
      default:
        return <CreditCard className="w-5 h-5" />
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

  const totalItems = sale.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/sales">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sales
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sale Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Sale Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                <p className="font-mono text-sm">#{sale.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date & Time</label>
                <p className="text-sm">
                  {new Date(sale.created_at).toLocaleDateString()} at {new Date(sale.created_at).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Amount</label>
                <p className="text-lg font-bold">${sale.total_amount.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Badge className={`${getStatusColor(sale.status)}`} variant="secondary">
                  {sale.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Customer Name</label>
                <p className="text-sm">{sale.customer_name}</p>
              </div>
              {sale.customer_phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-sm">{sale.customer_phone}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getPaymentIcon(sale.payment_method)}
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Payment Method</label>
                <p className="text-sm capitalize">{sale.payment_method}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Payment Status</label>
                <Badge className={`${getStatusColor(sale.payment_status ?? 'pending')}`} variant="secondary">
                  {sale.payment_status}
                </Badge>
              </div>
              {sale.payment_method === "insurance" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Insurance Provider</label>
                    <p className="text-sm">{sale.insurance_provider}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Insurance Amount</label>
                    <p className="text-sm">${sale.insurance_amount?.toFixed(2)}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Items Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Total Items</label>
                <p className="text-lg font-bold">{totalItems}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Unique Products</label>
                <p className="text-lg font-bold">{sale.items.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Details */}
      <Card>
        <CardHeader>
          <CardTitle>Items Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium text-sm text-gray-500">Product</th>
                  <th className="text-left py-3 px-2 font-medium text-sm text-gray-500">Quantity</th>
                  <th className="text-left py-3 px-2 font-medium text-sm text-gray-500">Unit Price</th>
                  <th className="text-left py-3 px-2 font-medium text-sm text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3 px-2">
                      <Link href={`/products/${item.product_id}`} className="text-blue-600 hover:underline">
                        {item.product_name}
                      </Link>
                    </td>
                    <td className="py-3 px-2">{item.quantity}</td>
                    <td className="py-3 px-2">Rwf {item.unit_price.toFixed(2)}</td>
                    <td className="py-3 px-2 font-medium">Rwf {item.total_price.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 font-bold">
                  <td className="py-3 px-2" colSpan={3}>
                    Total
                  </td>
                  <td className="py-3 px-2">${sale.total_amount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
