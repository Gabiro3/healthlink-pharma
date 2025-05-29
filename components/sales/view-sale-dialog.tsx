"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCurrency } from "@/contexts/currency-context"
import type { SaleWithItems } from "@/lib/types"
import type { SupportedCurrency } from "@/lib/services/currency-service"
import { Download, Printer } from "lucide-react"

interface ViewSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sale: SaleWithItems
}

export function ViewSaleDialog({ open, onOpenChange, sale }: ViewSaleDialogProps) {
  const { formatAmount, convertAmount } = useCurrency()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Sale Details</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Sale Header */}
          <div className="flex flex-col justify-between gap-4 rounded-lg border bg-gray-50 p-4 sm:flex-row">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Invoice Number</h3>
              <p className="text-lg font-bold">#{sale.invoice_number}</p>
              <p className="text-sm text-gray-500">{formatDate(sale.created_at)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Customer</h3>
              <p className="font-medium">{sale.customer_name || sale.patients?.name || "Walk-in Customer"}</p>
              {sale.prescription_id && (
                <p className="text-sm text-gray-500">Prescription ID: {sale.prescription_id.slice(0, 8)}...</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  sale.payment_status === "paid"
                    ? "bg-green-100 text-green-700"
                    : sale.payment_status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {sale.payment_status.charAt(0).toUpperCase() + sale.payment_status.slice(1)}
              </span>
              <p className="mt-1 text-sm text-gray-500">
                {sale.payment_method.charAt(0).toUpperCase() + sale.payment_method.slice(1)}
              </p>
            </div>
          </div>

          {/* Sale Items */}
          <div>
            <h3 className="mb-2 text-sm font-medium">Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.sale_items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.medicines?.name || "Unknown Product"}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatAmount(convertAmount(item.unit_price, item.currency as SupportedCurrency))}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatAmount(convertAmount(item.total_price, item.currency as SupportedCurrency))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Sale Summary */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total:</span>
                <span className="font-bold">
                  {formatAmount(convertAmount(sale.total_amount, sale.currency as SupportedCurrency))}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
