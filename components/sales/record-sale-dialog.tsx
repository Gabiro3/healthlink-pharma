"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, ShoppingCart, CreditCard, Smartphone, Shield } from "lucide-react"
import { ProductSearch } from "@/components/search/product-search"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  category: string
  stock_quantity: number
  unit_price: number
  reorder_level: number
  status: "active" | "low_stock" | "out_of_stock"
}

interface SaleItem {
  product: Product
  quantity: number
  unit_price: number
  total_price: number
}

interface RecordSaleDialogProps {
  trigger?: React.ReactNode
}

export function RecordSaleDialog({ trigger }: RecordSaleDialogProps) {
  const [open, setOpen] = useState(false)
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "momo" | "insurance">("cash")
  const [insuranceProvider, setInsuranceProvider] = useState("")
  const [insuranceAmount, setInsuranceAmount] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addProduct = (product: Product) => {
    const existingItem = saleItems.find((item) => item.product.id === product.id)

    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1)
    } else {
      const newItem: SaleItem = {
        product,
        quantity: 1,
        unit_price: product.unit_price,
        total_price: product.unit_price,
      }
      setSaleItems([...saleItems, newItem])
    }
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeProduct(productId)
      return
    }

    setSaleItems((items) =>
      items.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: Math.min(newQuantity, item.product.stock_quantity),
              total_price: item.unit_price * Math.min(newQuantity, item.product.stock_quantity),
            }
          : item,
      ),
    )
  }

  const removeProduct = (productId: string) => {
    setSaleItems((items) => items.filter((item) => item.product.id !== productId))
  }

  const getTotalAmount = () => {
    return saleItems.reduce((total, item) => total + item.total_price, 0)
  }

  const handleSubmit = async () => {
    if (saleItems.length === 0) {
      toast.error("Please add at least one product to the sale")
      return
    }

    if (paymentMethod === "insurance" && (!insuranceProvider || !insuranceAmount)) {
      toast.error("Please provide insurance details")
      return
    }

    setIsSubmitting(true)

    try {
      const saleData = {
        customer_name: customerName || "Walk-in Customer",
        customer_contact: customerPhone || null,
        total_amount: getTotalAmount(),
        payment_method: paymentMethod,
        payment_status: "completed",
        status: "completed",
        insurance_provider: paymentMethod === "insurance" ? insuranceProvider : null,
        insurance_amount: paymentMethod === "insurance" ? Number.parseFloat(insuranceAmount) : null,
      }

      const items = saleItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }))

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ saleData, items }),
      })

      if (response.ok) {
        toast.success("Sale recorded successfully!")
        resetForm()
        setOpen(false)
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to record sale")
      }
    } catch (error) {
      console.error("Sale submission error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSaleItems([])
    setPaymentMethod("cash")
    setInsuranceProvider("")
    setInsuranceAmount("")
    setCustomerName("")
    setCustomerPhone("")
  }

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Record Sale
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record New Sale</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Selection */}
          <div className="space-y-4">
            <div>
              <Label>Search and Add Products</Label>
              <ProductSearch onProductSelect={addProduct} showSalesButton />
            </div>

            {/* Selected Products */}
            <div className="space-y-2">
              <Label>Selected Products ({saleItems.length})</Label>
              {saleItems.length === 0 ? (
                <Card>
                  <CardContent className="p-4 text-center text-gray-500">
                    No products selected. Search and add products above.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {saleItems.map((item) => (
                    <Card key={item.product.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.product.name}</h4>
                            <p className="text-xs text-gray-500">${item.unit_price} each</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock_quantity}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Badge variant="secondary" className="ml-2">
                              ${item.total_price.toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sale Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  placeholder="Walk-in Customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  placeholder="Optional"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Cash
                    </div>
                  </SelectItem>
                  <SelectItem value="momo">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Mobile Money (MOMO)
                    </div>
                  </SelectItem>
                  <SelectItem value="insurance">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Insurance
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === "insurance" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                  <Input
                    id="insuranceProvider"
                    placeholder="e.g., NHIS, Private Insurance"
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="insuranceAmount">Insurance Amount</Label>
                  <Input
                    id="insuranceAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={insuranceAmount}
                    onChange={(e) => setInsuranceAmount(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Sale Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Items:</span>
                    <span>{saleItems.reduce((total, item) => total + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${getTotalAmount().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${getTotalAmount().toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {getPaymentIcon(paymentMethod)}
                    <span>Payment: {paymentMethod.toUpperCase()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={saleItems.length === 0 || isSubmitting} className="flex-1">
                {isSubmitting ? "Recording..." : "Record Sale"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
