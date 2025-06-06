import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"
import { cache } from "react"

export type PharmacyUser = {
  id: string
  email: string
  pharmacy_id: string
  pharmacy_code: string
  pharmacy_name: string
  role: string
}

// Generate a pharmacy code in the format PH-XXXXX where X is a random digit
export function generatePharmacyCode(): string {
  const randomDigits = Math.floor(10000 + Math.random() * 90000).toString()
  return `PH-${randomDigits}`
}

// Cached function to get the current user
export const getCurrentUser = cache(async () => {
  const supabase = createClient()

  try {
    // First DB call: Get the session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return null
    }

    const userId = session.user.id

    // Second DB call: Fetch user data from pharmacy_users and related pharmacies
    const { data: userData, error: userError } = await supabase
      .from("pharmacy_users")
      .select(
        `
        id,
        role,
        pharmacy_id
      `
      )
      .eq("user_id", userId)
      .eq("is_active", true)
      .single()

    if (userError || !userData) {
      return null
    }

    // Third DB call (optional): Fetch pharmacy details separately if needed
    const { data: pharmacy, error: pharmacyError } = await supabase
      .from("pharmacies")
      .select("id, name, code")
      .eq("id", userData.pharmacy_id)
      .single()

    if (pharmacyError || !pharmacy) {
      return null
    }

    const pharmacyUser: PharmacyUser = {
      id: userId,
      email: session.user.email || "",
      pharmacy_id: pharmacy.id || "",
      pharmacy_code: pharmacy.code || "",
      pharmacy_name: pharmacy.name || "",
      role: userData.role,
    }

    return pharmacyUser
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
})

// Verify if a user is associated with a pharmacy
export async function verifyPharmacyAssociation(userId: string, pharmacyCode: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("pharmacy_users")
    .select(`
      pharmacies:pharmacy_id (
        code
      )
    `)
    .eq("user_id", userId)
    .eq("is_active", true)
    .single()

  if (error || !data) {
    return false
  }

  return data.pharmacies[0]?.code === pharmacyCode
}

// Get user details including pharmacy association
export async function getUserDetails(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("pharmacy_users")
    .select(`
      id,
      role,
      pharmacies:pharmacy_id (
        id,
        name,
        code,
        address,
        contact_number,
        email
      ),
      users:user_id (
        email
      )
    `)
    .eq("user_id", userId)
    .eq("is_active", true)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: userId,
    email: data.users[0]?.email,
    role: data.role,
    pharmacy: {
      id: data.pharmacies[0]?.id,
      name: data.pharmacies[0]?.name,
      code: data.pharmacies[0]?.code,
      address: data.pharmacies[0]?.address,
      contactNumber: data.pharmacies[0]?.contact_number,
      email: data.pharmacies[0]?.email,
    },
  }
}
