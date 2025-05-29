import { getSupabaseClient } from "@/lib/supabase-client"
import type { Pharmacy } from "@/lib/types"

export async function getPharmacyDetails(): Promise<Pharmacy | null> {
  const supabase = getSupabaseClient()

  // Get the first pharmacy (assuming single pharmacy system for now)
  const { data, error } = await supabase.from("pharmacies").select("*").limit(1).single()

  if (error) {
    console.error("Error fetching pharmacy details:", error)
    return null
  }

  return data as Pharmacy
}

export async function updatePharmacyDetails(pharmacy: Partial<Pharmacy>): Promise<Pharmacy | null> {
  const supabase = getSupabaseClient()

  // Check if pharmacy exists
  const { data: existingPharmacy } = await supabase.from("pharmacies").select("id").limit(1).single()

  let result

  if (existingPharmacy) {
    // Update existing pharmacy
    const { data, error } = await supabase
      .from("pharmacies")
      .update({
        ...pharmacy,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingPharmacy.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating pharmacy details:", error)
      return null
    }

    result = data
  } else {
    // Create new pharmacy
    const { data, error } = await supabase
      .from("pharmacies")
      .insert({
        ...pharmacy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating pharmacy details:", error)
      return null
    }

    result = data
  }

  return result as Pharmacy
}

export async function uploadPharmacyLogo(file: File): Promise<string | null> {
  const supabase = getSupabaseClient()

  // Upload to storage
  const fileExt = file.name.split(".").pop()
  const fileName = `pharmacy-logo-${Date.now()}.${fileExt}`
  const filePath = `pharmacy-logos/${fileName}`

  const { error: uploadError } = await supabase.storage.from("pharmacy-assets").upload(filePath, file)

  if (uploadError) {
    console.error("Error uploading logo:", uploadError)
    return null
  }

  // Get public URL
  const { data } = supabase.storage.from("pharmacy-assets").getPublicUrl(filePath)

  return data.publicUrl
}
