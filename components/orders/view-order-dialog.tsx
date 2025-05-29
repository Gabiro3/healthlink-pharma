"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Download, Printer } from "lucide-react"

interface ViewOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: any
}

export function ViewOrderDialog({ open, onOpenChange, order }: ViewOrderDialogProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Order Header */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">Order #{order.invoice_number || order.id.slice(0, 6)}</h3>
                <p className="text-sm text-muted-foreground">Date: {formatDate(order.created_at)}</p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    order.payment_status === "paid"
                      ? "bg-green-100 text-green-700"
                      : order.payment_status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                </span>
                <p className="mt-1 text-sm text-muted-foreground">
                  Payment: {order.payment_method.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h3 className="mb-2 text-sm font-medium">Customer Information</h3>
            <div className="rounded-lg border p-4">
              <p className="font-medium">{order.customer_name || order.patients?.name || "Walk-in Customer"}</p>
              {order.patients && <p className="text-sm text-muted-foreground">Patient ID: {order.patients.id}</p>}
              {order.prescription_id && (
                <p className="text-sm text-muted-foreground">Prescription ID: {order.prescription_id}</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="mb-2 text-sm font-medium">Order Items</h3>
            <div className="rounded-lg border">
              <div className="grid grid-cols-12 gap-2 bg-gray-50 p-3 text-sm font-medium">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              <Separator />
              {order.sale_items?.map((item: any) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 p-3 text-sm">
                  <div className="col-span-6">{item.medicines?.name || "Unknown Product"}</div>
                  <div className="col-span-2 text-center">{item.quantity}</div>
                  <div className="col-span-2 text-right">${item.unit_price.toFixed(2)}</div>
                  <div className="col-span-2 text-right">${item.total_price.toFixed(2)}</div>
                </div>
              ))}
              <Separator />
              <div className="grid grid-cols-12 gap-2 bg-gray-50 p-3 text-sm font-medium">
                <div className="col-span-10 text-right">Total Amount:</div>
                <div className="col-span-2 text-right">${order.total_amount.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="rounded-lg border bg-gray-50 p-4 text-sm">
            <p className="font-medium">Additional Information</p>
            <p className="text-muted-foreground">Order processed by: {order.created_by || "System"}</p>
            <p className="text-muted-foreground">Order ID: {order.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
