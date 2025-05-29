"use client"

import type React from "react"

import { useEffect, useState } from "react"
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
import { getSupabaseClient } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"
import { Loader2, Plus, Trash } from "lucide-react"

interface AddOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export function AddOrderDialog({ open, onOpenChange, onSubmit }: AddOrderDialogProps) {
  const [formData, setFormData] = useState({
    customer_name: "",
    patient_id: "",
    prescription_id: "",
    payment_method: "cash",
    payment_status: "paid",
  })
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [medicines, setMedicines] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shareCode, setShareCode] = useState("")
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseClient()
  const { user } = useAuth()

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    setIsLoadingData(true)
    try {
      // Fetch patients
      const { data: patientsData, error: patientsError } = await supabase
        .from("patients")
        .select("*")
        .order("name", { ascending: true })

      if (patientsError) throw patientsError

      // Fetch medicines
      const { data: medicinesData, error: medicinesError } = await supabase
        .from("medicines")
        .select(`
          *,
          medicine_categories(id, name)
        `)
        .gt("stock_quantity", 0)
        .order("name", { ascending: true })

      if (medicinesError) throw medicinesError

      setPatients(patientsData || [])
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

  const fetchPrescriptions = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", patientId)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (error) throw error

      setPrescriptions(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load prescriptions",
        variant: "destructive",
      })
    }
  }

  const verifyShareCode = async () => {
    if (!shareCode) return

    setIsVerifyingCode(true)
    try {
      const response = await fetch("/api/prescriptions/share-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ share_code: shareCode }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Invalid share code")
      }

      const prescription = result.data

      // Set patient and prescription
      setFormData((prev) => ({
        ...prev,
        patient_id: prescription.patient_id,
        prescription_id: prescription.id,
        customer_name: prescription.patients?.name || "",
      }))

      // Set order items from prescription items
      const items = prescription.items.map((item: any) => ({
        medicine_id: item.medicine_id,
        medicine_name: item.medicines.name,
        quantity: item.quantity,
        unit_price: item.medicines.unit_price,
        total_price: item.quantity * item.medicines.unit_price,
        stock_quantity: item.medicines.stock_quantity,
      }))

      setOrderItems(items)

      toast({
        title: "Success",
        description: "Prescription verified successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify share code",
        variant: "destructive",
      })
    } finally {
      setIsVerifyingCode(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === "patient_id" && value) {
      fetchPrescriptions(value)
    }
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
        stock_quantity: 0,
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
          stock_quantity: medicine.stock_quantity,
          total_price: updatedItems[index].quantity * medicine.unit_price,
        }
      }
    } else if (field === "quantity") {
      const quantity = Number.parseInt(value) || 0
      updatedItems[index] = {
        ...updatedItems[index],
        quantity,
        total_price: quantity * updatedItems[index].unit_price,
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

    // Validate stock quantities
    const invalidItems = orderItems.filter((item) => item.quantity > item.stock_quantity)
    if (invalidItems.length > 0) {
      toast({
        title: "Error",
        description: `Insufficient stock for ${invalidItems[0].medicine_name}`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const orderData = {
        ...formData,
        total_amount: calculateTotal(),
        items: orderItems,
        created_by: user?.id,
      }

      await onSubmit(orderData)
      onOpenChange(false)

      // Reset form
      setFormData({
        customer_name: "",
        patient_id: "",
        prescription_id: "",
        payment_method: "cash",
        payment_status: "paid",
      })
      setOrderItems([])
      setShareCode("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Order</DialogTitle>
            <DialogDescription>Create a new order. Add products and complete the checkout process.</DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid gap-4 py-4">
            {/* Prescription Verification */}
            <div className="rounded-lg border bg-gray-50 p-4">
              <h3 className="mb-2 text-sm font-medium">Verify Prescription (Optional)</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter prescription share code"
                  value={shareCode}
                  onChange={(e) => setShareCode(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={verifyShareCode}
                  disabled={isVerifyingCode || !shareCode}
                >
                  {isVerifyingCode ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient_id">Patient (Optional)</Label>
                <Select value={formData.patient_id} onValueChange={(value) => handleSelectChange("patient_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.patient_id && prescriptions.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="prescription_id">Prescription (Optional)</Label>
                <Select
                  value={formData.prescription_id}
                  onValueChange={(value) => handleSelectChange("prescription_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select prescription" />
                  </SelectTrigger>
                  <SelectContent>
                    {prescriptions.map((prescription) => (
                      <SelectItem key={prescription.id} value={prescription.id}>
                        {new Date(prescription.issue_date).toLocaleDateString()} - Dr. {prescription.doctor_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {medicines.map((medicine) => (
                              <SelectItem key={medicine.id} value={medicine.id}>
                                {medicine.name} (${medicine.unit_price.toFixed(2)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="1"
                          max={item.stock_quantity}
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(index, "quantity", e.target.value)}
                          placeholder="Qty"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input type="text" value={`$${item.unit_price.toFixed(2)}`} disabled className="bg-gray-50" />
                      </div>
                      <div className="col-span-2">
                        <Input type="text" value={`$${item.total_price.toFixed(2)}`} disabled className="bg-gray-50" />
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
                      <div className="text-lg font-bold">${calculateTotal().toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => handleSelectChange("payment_method", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="mobile_payment">Mobile Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_status">Payment Status</Label>
                <Select
                  value={formData.payment_status}
                  onValueChange={(value) => handleSelectChange("payment_status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#004d40] hover:bg-[#00695c]"
              disabled={isSubmitting || orderItems.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Complete Order"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
