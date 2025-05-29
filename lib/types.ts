export interface Medicine {
  id: string
  name: string
  description: string
  manufacturer: string
  sku: string
  barcode: string
  category_id: string
  unit_price: number
  stock_quantity: number
  reorder_level: number
  expiry_date: string
  currency: string
  created_at: string
  updated_at: string
}

export interface MedicineCategory {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

export interface Prescription {
  id: string
  patient_id: string
  doctor_name: string
  issue_date: string
  expiry_date: string
  notes: string
  share_code: string
  status: string
  created_at: string
  updated_at: string
}

export interface PrescriptionItem {
  id: string
  prescription_id: string
  medicine_id: string
  quantity: number
  dosage: string
  frequency: string
  duration: string
  instructions: string
  created_at: string
}

export interface Sale {
  id: string
  invoice_number: string
  customer_name: string
  patient_id: string | null
  total_amount: number
  payment_method: string
  payment_status: string
  currency: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface SaleItem {
  id: string
  sale_id: string
  medicine_id: string
  quantity: number
  unit_price: number
  discount: number
  total_price: number
  currency: string
  created_at: string
  medicines?: {
    id: string
    name: string
  }
}

export interface SaleWithItems extends Sale {
  sale_items: SaleItem[]
  patients?: {
    id: string
    name: string
  }
}

export interface SalesForecast {
  id: string
  medicine_id: string
  start_date: string
  end_date: string
  forecast_period: string
  forecasted_quantity: number
  confidence_level: number
  created_at: string
  updated_at: string
}

export interface InventoryTransaction {
  id: string
  medicine_id: string
  quantity: number
  transaction_type: string
  reference_id: string | null
  notes: string | null
  created_by: string
  created_at: string
}

export interface User {
  id: string
  full_name: string
  email: string
  role: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  name: string
  patient_info: any
  created_at: string
  updated_at: string
}

// New types for the enhanced features

export interface Pharmacy {
  id: string
  name: string
  address: string
  city: string
  country: string
  phone: string
  email: string
  website: string
  logo_url: string
  currency: string
  tax_rate: number
  created_at: string
  updated_at: string
}

export interface CurrencyRate {
  id: string
  base_currency: string
  target_currency: string
  rate: number
  effective_date: string
  created_at: string
  updated_at: string
}

export interface ProcurementOrder {
  id: string
  order_number: string
  supplier_name: string
  supplier_id: string | null
  total_amount: number
  currency: string
  status: string
  expected_delivery_date: string | null
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface ProcurementItem {
  id: string
  procurement_order_id: string
  medicine_id: string
  quantity: number
  unit_price: number
  currency: string
  total_price: number
  created_at: string
  medicines?: {
    id: string
    name: string
  }
}

export interface ProcurementOrderWithItems extends ProcurementOrder {
  procurement_items: ProcurementItem[]
}

export interface BudgetPlan {
  id: string
  title: string
  start_date: string
  end_date: string
  total_budget: number
  currency: string
  status: string
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface BudgetAllocation {
  id: string
  budget_plan_id: string
  category_id: string
  allocated_amount: number
  currency: string
  notes: string | null
  created_at: string
  updated_at: string
  medicine_categories?: {
    id: string
    name: string
  }
}

export interface BudgetPlanWithAllocations extends BudgetPlan {
  budget_allocations: BudgetAllocation[]
}
