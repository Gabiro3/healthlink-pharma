export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      medicine_categories: {
        Row: {
          id: string
          name: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      medicines: {
        Row: {
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          manufacturer?: string
          sku?: string
          barcode?: string
          category_id: string
          unit_price: number
          stock_quantity: number
          reorder_level?: number
          expiry_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          manufacturer?: string
          sku?: string
          barcode?: string
          category_id?: string
          unit_price?: number
          stock_quantity?: number
          reorder_level?: number
          expiry_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      prescriptions: {
        Row: {
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
        Insert: {
          id?: string
          patient_id: string
          doctor_name: string
          issue_date?: string
          expiry_date?: string
          notes?: string
          share_code?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_name?: string
          issue_date?: string
          expiry_date?: string
          notes?: string
          share_code?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      prescription_items: {
        Row: {
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
        Insert: {
          id?: string
          prescription_id: string
          medicine_id: string
          quantity: number
          dosage?: string
          frequency?: string
          duration?: string
          instructions?: string
          created_at?: string
        }
        Update: {
          id?: string
          prescription_id?: string
          medicine_id?: string
          quantity?: number
          dosage?: string
          frequency?: string
          duration?: string
          instructions?: string
          created_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          invoice_number: string
          customer_name: string
          patient_id: string | null
          prescription_id?: string | null
          total_amount: number
          payment_method: string
          payment_status: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number?: string
          customer_name?: string
          patient_id?: string | null
          prescription_id?: string | null
          total_amount: number
          payment_method?: string
          payment_status?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          customer_name?: string
          patient_id?: string | null
          prescription_id?: string | null
          total_amount?: number
          payment_method?: string
          payment_status?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          medicine_id: string
          quantity: number
          unit_price: number
          discount: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          medicine_id: string
          quantity: number
          unit_price: number
          discount?: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          medicine_id?: string
          quantity?: number
          unit_price?: number
          discount?: number
          total_price?: number
          created_at?: string
        }
      }
      sales_forecasts: {
        Row: {
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
        Insert: {
          id?: string
          medicine_id: string
          start_date: string
          end_date: string
          forecast_period: string
          forecasted_quantity: number
          confidence_level: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          medicine_id?: string
          start_date?: string
          end_date?: string
          forecast_period?: string
          forecasted_quantity?: number
          confidence_level?: number
          created_at?: string
          updated_at?: string
        }
      }
      inventory_transactions: {
        Row: {
          id: string
          medicine_id: string
          quantity: number
          transaction_type: string
          reference_id: string | null
          notes: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          medicine_id: string
          quantity: number
          transaction_type: string
          reference_id?: string | null
          notes?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          medicine_id?: string
          quantity?: number
          transaction_type?: string
          reference_id?: string | null
          notes?: string | null
          created_by?: string
          created_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          name: string
          patient_info: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          patient_info?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          patient_info?: Json
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          full_name: string
          email: string
          role: string
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          role?: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pharmacy_roles: {
        Row: {
          id: string
          user_id: string
          role: string
          permissions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
