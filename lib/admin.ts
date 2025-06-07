import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"
import type { Database } from "./database.types"
import { logActivity } from "./activity"

export type SuperAdmin = Database["public"]["Tables"]["super_admins"]["Row"]
export type BillingDetail = Database["public"]["Tables"]["billing_details"]["Row"]
export type PaymentHistory = Database["public"]["Tables"]["payment_history"]["Row"]

// Check if user is super admin
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("super_admins")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single()

  return !error && !!data
}

// Check if user is pharmacy admin
export async function isPharmacyAdmin(userId: string, pharmacyId: string): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("pharmacy_users")
    .select("id")
    .eq("user_id", userId)
    .eq("pharmacy_id", pharmacyId)
    .eq("is_active", true)
    .in("role", ["admin", "manager"])
    .single()

  return !error && !!data
}

// Get pharmacy admin dashboard stats
export async function getPharmacyAdminStats(pharmacyId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_pharmacy_admin_stats", {
    p_pharmacy_id: pharmacyId,
  })

  if (error) {
    console.error("Error fetching pharmacy admin stats:", error)
    return { error, data: null }
  }

  return { error: null, data: data[0] }
}

// Get super admin dashboard stats
export async function getSuperAdminStats() {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_super_admin_stats")

  if (error) {
    console.error("Error fetching super admin stats:", error)
    return { error, data: null }
  }

  return { error: null, data: data[0] }
}

// Create new pharmacy user
export async function createPharmacyUserByAdmin(
  userData: {
    email: string
    password: string
    role: string
    pharmacyId: string
  },
  adminUserId: string,
) {
  const supabase = createClient()

  // Create user in auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    return { error: authError, data: null }
  }

  // Associate with pharmacy
  const { data: pharmacyUser, error: associationError } = await supabase
    .from("pharmacy_users")
    .insert({
      user_id: authData.user.id,
      pharmacy_id: userData.pharmacyId,
      role: userData.role,
      is_active: true,
    })
    .select()
    .single()

  if (associationError) {
    // Clean up auth user if association fails
    await supabase.auth.admin.deleteUser(authData.user.id)
    return { error: associationError, data: null }
  }

  // Log activity
  await logActivity({
    user_id: adminUserId,
    action: "create",
    entity_type: "user",
    entity_id: authData.user.id,
    details: { email: userData.email, role: userData.role },
    pharmacy_id: userData.pharmacyId,
  })

  return { error: null, data: { user: authData.user, pharmacyUser } }
}

// Get product sales report
export async function getProductSalesReport(pharmacyId: string, startDate?: string, endDate?: string) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_product_sales_report", {
    p_pharmacy_id: pharmacyId,
    p_start_date: startDate || null,
    p_end_date: endDate || null,
  })

  if (error) {
    console.error("Error fetching product sales report:", error)
    return { error, data: null }
  }

  return { error: null, data }
}

// Calculate monthly billing
export async function calculateMonthlyBilling(pharmacyId: string, periodStart: string, periodEnd: string) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("calculate_monthly_billing", {
    p_pharmacy_id: pharmacyId,
    p_period_start: periodStart,
    p_period_end: periodEnd,
  })

  if (error) {
    console.error("Error calculating monthly billing:", error)
    return { error, data: null }
  }

  return { error: null, data }
}

// Get billing details for pharmacy
export async function getPharmacyBilling(pharmacyId: string, page = 1, limit = 10) {
  const supabase = createClient()

  const { data, error, count } = await supabase
    .from("billing_details")
    .select("*", { count: "exact" })
    .eq("pharmacy_id", pharmacyId)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (error) {
    console.error("Error fetching pharmacy billing:", error)
    return { error, data: null, count: 0 }
  }

  return { error: null, data, count: count || 0 }
}

// Get all pharmacies (super admin)
export async function getAllPharmacies(page = 1, limit = 10) {
  const supabase = createClient()

  const { data, error, count } = await supabase
    .from("pharmacies")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (error) {
    console.error("Error fetching pharmacies:", error)
    return { error, data: null, count: 0 }
  }

  return { error: null, data, count: count || 0 }
}

// Get all billing details (super admin)
export async function getAllBillingDetails(page = 1, limit = 10, status?: string) {
  const supabase = createClient()

  let query = supabase
    .from("billing_details")
    .select(
      `
      *,
      pharmacies:pharmacy_id (
        name,
        code,
        email
      )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching billing details:", error)
    return { error, data: null, count: 0 }
  }

  return { error: null, data, count: count || 0 }
}

// Generate invoice
export async function generateInvoice(billingId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("generate_pharmacy_invoice", {
    p_billing_id: billingId,
  })

  if (error) {
    console.error("Error generating invoice:", error)
    return { error, data: null }
  }

  return { error: null, data }
}

// Deactivate pharmacy users
export async function deactivatePharmacyUsers(pharmacyId: string, adminUserId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("deactivate_pharmacy_users", {
    p_pharmacy_id: pharmacyId,
  })

  if (error) {
    console.error("Error deactivating pharmacy users:", error)
    return { error, data: null }
  }

  // Log activity
  await logActivity({
    user_id: adminUserId,
    action: "deactivate",
    entity_type: "pharmacy_users",
    entity_id: pharmacyId,
    details: { affected_users: data },
    pharmacy_id: pharmacyId,
  })

  return { error: null, data }
}

// Promote user to admin
export async function promoteUserToAdmin(userId: string, pharmacyId: string, promotedBy: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("pharmacy_users")
    .update({ role: "admin" })
    .eq("user_id", userId)
    .eq("pharmacy_id", pharmacyId)
    .select()
    .single()

  if (error) {
    console.error("Error promoting user to admin:", error)
    return { error, data: null }
  }

  // Log activity
  await logActivity({
    user_id: promotedBy,
    action: "update",
    entity_type: "user",
    entity_id: userId,
    details: { role: "admin", action: "promoted_to_admin" },
    pharmacy_id: pharmacyId,
  })

  return { error: null, data }
}

// Get all pharmacies with sales data (super admin)
export async function getAllPharmaciesWithSales(page = 1, limit = 50) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_pharmacies_with_sales", {
    p_page: page,
    p_limit: limit,
  })

  if (error) {
    console.error("Error fetching pharmacies with sales:", error)
    return { error, data: null }
  }

  return { error: null, data }
}

// Revoke access for all pharmacy users
export async function revokePharmacyAccess(pharmacyId: string, adminUserId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("revoke_pharmacy_access", {
    p_pharmacy_id: pharmacyId,
  })

  if (error) {
    console.error("Error revoking pharmacy access:", error)
    return { error, data: null }
  }

  // Log activity
  await logActivity({
    user_id: adminUserId,
    action: "revoke_access",
    entity_type: "pharmacy",
    entity_id: pharmacyId,
    details: { affected_users: data },
    pharmacy_id: pharmacyId,
  })

  return { error: null, data }
}
