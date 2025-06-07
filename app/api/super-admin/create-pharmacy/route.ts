import { createClient } from "@/supabase/server"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { isSuperAdmin } from "@/lib/admin"
import { generatePharmacyCode } from "@/lib/auth"
import { logActivity } from "@/lib/activity"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is super admin
    const isSuper = await isSuperAdmin(user.id)

    if (!isSuper) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { pharmacy, admin, created_by } = await request.json()

    if (!pharmacy.name || !pharmacy.address || !pharmacy.contact_number || !pharmacy.email) {
      return NextResponse.json({ error: "All pharmacy details are required" }, { status: 400 })
    }

    if (!admin.email || !admin.password) {
      return NextResponse.json({ error: "Admin email and password are required" }, { status: 400 })
    }
    const supabase = createClient()

    // Generate pharmacy code
    const pharmacyCode = generatePharmacyCode()

    // Create pharmacy
    const { data: pharmacyData, error: pharmacyError } = await supabase
      .from("pharmacies")
      .insert({
        ...pharmacy,
        code: pharmacyCode,
        is_active: true,
      })
      .select()
      .single()

    if (pharmacyError) {
      return NextResponse.json({ error: pharmacyError.message }, { status: 500 })
    }

    // Create admin user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: admin.email,
      password: admin.password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      // Rollback pharmacy creation
      await supabase.from("pharmacies").delete().eq("id", pharmacyData.id)
      return NextResponse.json({ error: authError?.message || "Failed to create admin user" }, { status: 500 })
    }

    // Associate admin with pharmacy
    const { error: associationError } = await supabase.from("pharmacy_users").insert({
      user_id: authData.user.id,
      pharmacy_id: pharmacyData.id,
      role: "admin",
      is_active: true,
    })

    if (associationError) {
      // Rollback user and pharmacy creation
      await supabase.auth.admin.deleteUser(authData.user.id)
      await supabase.from("pharmacies").delete().eq("id", pharmacyData.id)
      return NextResponse.json({ error: associationError.message }, { status: 500 })
    }

    // Log activity
    await logActivity({
      user_id: created_by,
      action: "create",
      entity_type: "pharmacy",
      entity_id: pharmacyData.id,
      details: {
        pharmacy_name: pharmacy.name,
        pharmacy_code: pharmacyCode,
        admin_email: admin.email,
      },
      pharmacy_id: pharmacyData.id,
    })

    return NextResponse.json({
      data: {
        pharmacy_id: pharmacyData.id,
        pharmacy_code: pharmacyCode,
        pharmacy_name: pharmacy.name,
        admin_email: admin.email,
      },
    })
  } catch (error) {
    console.error("Create pharmacy error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
