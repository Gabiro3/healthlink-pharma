export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      pharmacies: {
        Row: {
          id: string
          created_at: string
          name: string
          code: string
          address: string
          contact_number: string
          email: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          code: string
          address: string
          contact_number: string
          email: string
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          code?: string
          address?: string
          contact_number?: string
          email?: string
          is_active?: boolean
        }
      }
      pharmacy_users: {
        Row: {
          id: string
          user_id: string
          pharmacy_id: string
          role: string
          created_at: string
          is_active: boolean
          full_name: string | null
          contact_number: string | null
          last_sign_in_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          pharmacy_id: string
          role: string
          created_at?: string
          is_active?: boolean
          full_name?: string | null
          contact_number?: string | null
          last_sign_in_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          pharmacy_id?: string
          role?: string
          created_at?: string
          is_active?: boolean
          full_name?: string | null
          contact_number?: string | null
          last_sign_in_at?: string | null
        }
      }
      super_admins: {
        Row: {
          id: string
          user_id: string
          created_at: string
          is_active: boolean
          created_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          is_active?: boolean
          created_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          is_active?: boolean
          created_by?: string | null
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          sku: string
          category: string
          unit_price: number
          stock_quantity: number
          reorder_level: number
          pharmacy_id: string
          is_active: boolean
          purchased_from: string | null
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          sku: string
          category: string
          unit_price: number
          stock_quantity: number
          reorder_level: number
          pharmacy_id: string
          is_active?: boolean
          purchased_from?: string | null
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          sku?: string
          category?: string
          unit_price?: number
          stock_quantity?: number
          reorder_level?: number
          pharmacy_id?: string
          is_active?: boolean
          purchased_from?: string | null
          created_by?: string
        }
      }
      sales: {
        Row: {
          id: string
          created_at: string
          customer_name: string
          customer_contact: string
          total_amount: number
          payment_method: string
          status: string
          pharmacy_id: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          customer_name: string
          customer_contact: string
          total_amount: number
          payment_method: string
          status: string
          pharmacy_id: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          customer_name?: string
          customer_contact?: string
          total_amount?: number
          payment_method?: string
          status?: string
          pharmacy_id?: string
          user_id?: string
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          created_at: string
          name: string
          contact_person: string
          email: string
          phone: string
          address: string
          pharmacy_id: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          contact_person: string
          email: string
          phone: string
          address: string
          pharmacy_id: string
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          contact_person?: string
          email?: string
          phone?: string
          address?: string
          pharmacy_id?: string
          is_active?: boolean
        }
      }
      purchase_orders: {
        Row: {
          id: string
          created_at: string
          vendor_id: string
          expected_delivery_date: string
          status: string
          total_amount: number
          pharmacy_id: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          vendor_id: string
          expected_delivery_date: string
          status: string
          total_amount: number
          pharmacy_id: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          vendor_id?: string
          expected_delivery_date?: string
          status?: string
          total_amount?: number
          pharmacy_id?: string
          user_id?: string
        }
      }
      purchase_order_items: {
        Row: {
          id: string
          purchase_order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          purchase_order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          purchase_order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          created_at: string
          purchase_order_id: string
          invoice_number: string
          invoice_date: string
          due_date: string
          total_amount: number
          status: string
          pharmacy_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          purchase_order_id: string
          invoice_number: string
          invoice_date: string
          due_date: string
          total_amount: number
          status: string
          pharmacy_id: string
        }
        Update: {
          id?: string
          created_at?: string
          purchase_order_id?: string
          invoice_number?: string
          invoice_date?: string
          due_date?: string
          total_amount?: number
          status?: string
          pharmacy_id?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          details: Json
          pharmacy_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          details: Json
          pharmacy_id: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          action?: string
          entity_type?: string
          entity_id?: string
          details?: Json
          pharmacy_id?: string
        }
      }
      budgets: {
        Row: {
          id: string
          created_at: string
          year: number
          month: number
          category: string
          allocated_amount: number
          spent_amount: number
          pharmacy_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          year: number
          month: number
          category: string
          allocated_amount: number
          spent_amount: number
          pharmacy_id: string
        }
        Update: {
          id?: string
          created_at?: string
          year?: number
          month?: number
          category?: string
          allocated_amount?: number
          spent_amount?: number
          pharmacy_id?: string
        }
      }
      expenses: {
        Row: {
          id: string
          created_at: string
          description: string
          amount: number
          expense_date: string
          payment_method: string
          category: string
          recorded_by: string
          pharmacy_id: string
          receipt_url: string | null
          is_approved: boolean
          approved_by: string | null
          approved_at: string | null
          budget_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          description: string
          amount: number
          expense_date: string
          payment_method: string
          category: string
          recorded_by: string
          pharmacy_id: string
          receipt_url?: string | null
          is_approved?: boolean
          approved_by?: string | null
          approved_at?: string | null
          budget_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          description?: string
          amount?: number
          expense_date?: string
          payment_method?: string
          category?: string
          recorded_by?: string
          pharmacy_id?: string
          receipt_url?: string | null
          is_approved?: boolean
          approved_by?: string | null
          approved_at?: string | null
          budget_id?: string | null
        }
      }
      billing_details: {
        Row: {
          id: string
          created_at: string
          pharmacy_id: string
          billing_period_start: string
          billing_period_end: string
          total_amount: number
          status: string
          due_date: string
          invoice_number: string
          generated_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          pharmacy_id: string
          billing_period_start: string
          billing_period_end: string
          total_amount: number
          status: string
          due_date: string
          invoice_number: string
          generated_by: string
        }
        Update: {
          id?: string
          created_at?: string
          pharmacy_id?: string
          billing_period_start?: string
          billing_period_end?: string
          total_amount?: number
          status?: string
          due_date?: string
          invoice_number?: string
          generated_by?: string
        }
      }
      payment_history: {
        Row: {
          id: string
          created_at: string
          billing_id: string
          amount_paid: number
          payment_date: string
          payment_method: string
          transaction_id: string
          status: string
          processed_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          billing_id: string
          amount_paid: number
          payment_date: string
          payment_method: string
          transaction_id: string
          status: string
          processed_by: string
        }
        Update: {
          id?: string
          created_at?: string
          billing_id?: string
          amount_paid?: number
          payment_date?: string
          payment_method?: string
          transaction_id?: string
          status?: string
          processed_by?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
