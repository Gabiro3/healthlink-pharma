import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  try {
    const { email, password } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required",
        },
        { status: 400 },
      )
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Record failed login attempt
      await supabase.from("failed_login_attempts").insert({
        email,
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        attempt_time: new Date().toISOString(),
      })

      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    // Update last login timestamp
    await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", data.user.id)

    // Get user role and permissions
    const { data: roleData, error: roleError } = await supabase
      .from("pharmacy_roles")
      .select("*")
      .eq("user_id", data.user.id)
      .single()

    if (roleError && roleError.code !== "PGRST116") {
      // PGRST116 is "No rows returned" error
      return NextResponse.json({ error: roleError.message }, { status: 400 })
    }

    return NextResponse.json({
      session: data.session,
      user: data.user,
      role: roleData,
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}
