"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"
import { Plus, Trash } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { createProcurementOrder } from "@/lib/services/procurement-service"
import { useCurrency } from "@/contexts/currency-context"
import type { SupportedCurrency } from "@/lib/services/currency-service"

interface AddProcurementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOrderCreated: () => void
}

export function AddProcurementDialog({ open, onOpenChange, onOrderCreated }: AddProcurementDialogProps) {
  const [formData, setFormData] = useState({
    supplier_name: "",
    supplier_id: "",
    status: "draft",
    expected_delivery_date: "",
    notes: "",
  })
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [medicines, setMedicines] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseClient()
  const { user } = useAuth()
  const { currentCurrency, formatAmount } = useCurrency()
  
  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])
  
  const fetchData = async () => {
    setIsLoadingData(true)
    try {
      // Fetch medicines
      const { data: medicinesData, error: medicinesError } = await supabase
        .from("medicines")
        .select(`
          *,
          medicine_categories(id, name)
        `)
        .order("name", { ascending: true })
      
      if (medicinesError) throw medicinesError
      
      setMedicines(medicinesData || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  
  const addOrderItem = () => {
    setOrderItems([
      ...orderItems,
      {
        medicine_id: "",
        medicine_name: "",
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        currency: currentCurrency,
      },
    ])
  }
  
  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }
  
  const updateOrderItem = (index: number, field: string, value: any) => {
    const updatedItems = [...orderItems]
    
    if (field === "medicine_id") {
      const medicine = medicines.find((m) => m.id === value)
      if (medicine) {
        updatedItems[index] = {
          ...updatedItems[index],
          medicine_id: value,
          medicine_name: medicine.name,
          unit_price: medicine.unit_price,
          total_price: updatedItems[index].quantity * medicine.unit_price,
          currency: medicine.currency || currentCurrency,
        }
      }
    } else if (field === "quantity") {
      const quantity = Number.parseInt(value) || 0
      updatedItems[index] = {
        ...updatedItems[index],
        quantity,
        total_price: quantity * updatedItems[index].unit_price,
      }
    } else if (field === "unit_price") {
      const unitPrice = Number.parseFloat(value) || 0
      updatedItems[index] = {
        ...updatedItems[index],
        unit_price: unitPrice,
        total_price: updatedItems[index].quantity * unitPrice,
      }
    }
    
    setOrderItems(updatedItems)
  }
  
  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total_price, 0)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the order",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Generate order number
      const timestamp = new Date().getTime().toString().slice(-6)
      const orderNumber = `PO-${timestamp}`
      
      const result = await createProcurementOrder(
        {
          ...formData,
          order_number: orderNumber,
          total_amount: calculateTotal(),
          currency: currentCurrency as SupportedCurrency,
          created_by: user?.id || '',
        },
        orderItems.map(item => ({
          medicine_id: item.medicine_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          currency: item.currency || currentCurrency,
        }))
      )
      
      if (result) {
        toast({
          title: "Success",
          description: "Procurement order created successfully",
        })
        
        // Reset form
        setFormData({
          supplier_name: "",
          supplier_id: "",
          status: "draft",
          expected_delivery_date: "",
          notes: "",
        })
        setOrderItems([])
        
        // Notify parent
        onOrderCreated()
      } else {
        throw new Error("Failed to create procurement order")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create procurement order",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Procurement Order</DialogTitle>
            <DialogDescription>Create a new order for medicine procurement</DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 grid gap-4 py-4">
            {/* Supplier Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier_name">Supplier Name</Label>
                <Input
                  id="supplier_name"
                  name="supplier_name"
                  value={formData.supplier_name}
                  onChange={handleChange}
                  placeholder="Enter supplier name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expected_delivery_date">Expected Delivery Date</Label>
                <Input
                  id="expected_delivery_date"
                  name="expected_delivery_date"
                  type="date"
                  value={formData.expected_delivery_date}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Enter any additional notes"
                rows={3}
              />
            </div>
            
            {/* Order Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Order Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addOrderItem} className="h-8">
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add Item
                </Button>
              </div>
              
              {orderItems.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  No items added. Click "Add Item" to add products to this order.
                </div>
              ) : (
                <div className="space-y-3">
                  {orderItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2">
                      <div className="col-span-5">
                        <Select
                          value={item.medicine_id}
                          onValueChange={(value) => updateOrderItem(index, "medicine_id", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select medicine" />
                          </SelectTrigger>
                          <SelectContent>
                            {medicines.map((medicine) => (
                              <SelectItem key={medicine.id} value={medicine.id}>
                                {medicine.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(index, "quantity", e.target.value)}
                          placeholder="Qty"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateOrderItem(index, "unit_price", e.target.value)}
                          placeholder="Unit Price"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input 
                          type="text" 
                          value={formatAmount(item.total_price)} 
                          disabled 
                          className="bg-gray-50" 
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOrderItem(index)}
                          className="h-10 w-10 text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end border-t pt-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">Total Amount</div>
                      <div className="text-lg font-bold">{formatAmount(calculateTotal())}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Order Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Order Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="ml-2"
                disabled={isSubmitting}
            />
                          <Button
                type="submit"
                className="ml-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Create Order'}
              </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
