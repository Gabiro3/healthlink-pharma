import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"
import type { Database } from "./database.types"
import { logActivity } from "./activity"
import { generatePharmacyCode } from "./auth"

export type UserRole = "admin" | "manager" | "pharmacist" | "cashier"

export type PharmacyUserData = {
  email: string
  password: string
  role: UserRole
  pharmacy_id: string
}

// Create a new user and associate with pharmacy
export async function createPharmacyUser(userData: PharmacyUserData, createdBy: string) {
  const supabase = createClient(cookies())

  // Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true, // Auto-confirm the email
  })

  if (authError || !authData.user) {
    console.error("Error creating user:", authError)
    return { error: authError, data: null }
  }

  // Associate the user with the pharmacy
  const { data: pharmacyUser, error: associationError } = await supabase
    .from("pharmacy_users")
    .insert({
      user_id: authData.user.id,
      pharmacy_id: userData.pharmacy_id,
      role: userData.role,
      is_active: true,
    })
    .select()
    .single()

  if (associationError) {
    console.error("Error associating user with pharmacy:", associationError)
    // Try to delete the created user if association fails
    await supabase.auth.admin.deleteUser(authData.user.id)
    return { error: associationError, data: null }
  }

  // Log the activity
  await logActivity({
    user_id: createdBy,
    action: "create",
    entity_type: "user",
    entity_id: authData.user.id,
    details: { email: userData.email, role: userData.role },
    pharmacy_id: userData.pharmacy_id,
  })

  return {
    error: null,
    data: {
      id: authData.user.id,
      email: authData.user.email,
      role: userData.role,
    },
  }
}

// Get users for a pharmacy
export async function getPharmacyUsers(pharmacyId: string) {
  const supabase = createClient(cookies())

  const { data, error } = await supabase
    .from("pharmacy_users")
    .select(`
      id,
      role,
      is_active,
      created_at,
      users:user_id (
        id,
        email,
        last_sign_in_at
      )
    `)
    .eq("pharmacy_id", pharmacyId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching pharmacy users:", error)
    return { error, data: null }
  }

  // Format the data
  const formattedData = data.map((user) => ({
    id: user.users.id,
    email: user.users.email,
    role: user.role,
    is_active: user.is_active,
    created_at: user.created_at,
    last_sign_in_at: user.users.last_sign_in_at,
  }))

  return { error: null, data: formattedData }
}

// Update user role
export async function updateUserRole(userId: string, pharmacyId: string, role: UserRole, updatedBy: string) {
  const supabase = createClient(cookies())

  const { data, error } = await supabase
    .from("pharmacy_users")
    .update({ role })
    .eq("user_id", userId)
    .eq("pharmacy_id", pharmacyId)
    .select()
    .single()

  if (error) {
    console.error("Error updating user role:", error)
    return { error, data: null }
  }

  // Log the activity
  await logActivity({
    user_id: updatedBy,
    action: "update",
    entity_type: "user",
    entity_id: userId,
    details: { role },
    pharmacy_id: pharmacyId,
  })

  return { error: null, data }
}

// Deactivate a user
export async function deactivateUser(userId: string, pharmacyId: string, deactivatedBy: string) {
  const supabase = createClient(cookies())

  const { data, error } = await supabase
    .from("pharmacy_users")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("pharmacy_id", pharmacyId)
    .select()
    .single()

  if (error) {
    console.error("Error deactivating user:", error)
    return { error, data: null }
  }

  // Log the activity
  await logActivity({
    user_id: deactivatedBy,
    action: "deactivate",
    entity_type: "user",
    entity_id: userId,
    details: { deactivated_at: new Date().toISOString() },
    pharmacy_id: pharmacyId,
  })

  return { error: null, data }
}

// Create a new pharmacy
export async function createPharmacy(
  pharmacyData: Omit<Database["public"]["Tables"]["pharmacies"]["Insert"], "id" | "created_at" | "code">,
  adminEmail: string,
  adminPassword: string,
) {
  const supabase = createClient(cookies())

  // Generate a pharmacy code
  const pharmacyCode = generatePharmacyCode()

  // Create the pharmacy
  const { data: pharmacy, error: pharmacyError } = await supabase
    .from("pharmacies")
    .insert({
      ...pharmacyData,
      code: pharmacyCode,
      is_active: true,
    })
    .select()
    .single()

  if (pharmacyError || !pharmacy) {
    console.error("Error creating pharmacy:", pharmacyError)
    return { error: pharmacyError, data: null }
  }

  // Create the admin user
  const { data: adminUser, error: adminError } = await createPharmacyUser(
    {
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      pharmacy_id: pharmacy.id,
    },
    pharmacy.id,
  ) // Using pharmacy.id as createdBy since no user exists yet

  if (adminError) {
    console.error("Error creating admin user:", adminError)
    // Try to delete the created pharmacy if admin creation fails
    await supabase.from("pharmacies").delete().eq("id", pharmacy.id)
    return { error: adminError, data: null }
  }

  return {
    error: null,
    data: {
      pharmacy,
      admin: adminUser,
    },
  }
}
