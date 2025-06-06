"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Order {
  id: string
  medicine_name: string
  price: number
  status: "delivered" | "pending" | "processing"
  payment_status: "completed" | "pending"
}

interface RecentOrdersProps {
  orders: Order[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
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
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Latest Orders</CardTitle>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
            <span>Order ID</span>
            <span>Medicine Name</span>
            <span>Price</span>
            <span>Order Status</span>
            <span>Payment Status</span>
            <span>Action</span>
          </div>

          {/* Table Rows */}
          {orders.map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-6 gap-4 items-center py-2 border-b border-gray-100 last:border-0"
            >
              <span className="text-sm font-medium">#{order.id}</span>
              <span className="text-sm">{order.medicine_name}</span>
              <span className="text-sm font-medium">${order.price.toFixed(2)}</span>
              <Badge className={`text-xs ${getStatusColor(order.status)}`} variant="secondary">
                {order.status}
              </Badge>
              <Badge className={`text-xs ${getPaymentStatusColor(order.payment_status)}`} variant="secondary">
                {order.payment_status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
