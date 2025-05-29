import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  try {
    const { email, password, full_name, role } = await request.json()

    // Validate required fields
    if (!email || !password || !full_name) {
      return NextResponse.json(
        {
          error: "Email, password, and full name are required",
        },
        { status: 400 },
      )
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role: role || "pharmacist",
        },
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Create user in the users table
    const { error: userError } = await supabase.from("users").insert({
      id: authData.user?.id,
      email,
      full_name,
      role: role || "pharmacist",
      is_admin: role === "admin",
      created_at: new Date().toISOString(),
    })

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    // Create pharmacy role
    const { error: roleError } = await supabase.from("pharmacy_roles").insert({
      user_id: authData.user?.id,
      role: role || "pharmacist",
      permissions: getDefaultPermissions(role || "pharmacist"),
      created_at: new Date().toISOString(),
    })

    if (roleError) {
      return NextResponse.json({ error: roleError.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: authData.user,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}

function getDefaultPermissions(role: string) {
  switch (role) {
    case "admin":
      return {
        medicines: ["create", "read", "update", "delete"],
        categories: ["create", "read", "update", "delete"],
        prescriptions: ["create", "read", "update", "delete"],
        sales: ["create", "read", "update", "delete"],
        reports: ["read"],
        users: ["create", "read", "update", "delete"],
      }
    case "pharmacist":
      return {
        medicines: ["read", "update"],
        categories: ["read"],
        prescriptions: ["create", "read", "update"],
        sales: ["create", "read", "update"],
        reports: ["read"],
        users: [],
      }
    case "cashier":
      return {
        medicines: ["read"],
        categories: ["read"],
        prescriptions: ["read"],
        sales: ["create", "read"],
        reports: [],
        users: [],
      }
    default:
      return {
        medicines: ["read"],
        categories: ["read"],
        prescriptions: [],
        sales: [],
        reports: [],
        users: [],
      }
  }
}
