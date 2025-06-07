import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { logActivity } from "@/lib/activity"

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user_id, new_password } = await request.json()

    if (!user_id || !new_password) {
      return NextResponse.json({ error: "User ID and new password are required" }, { status: 400 })
    }

    const supabase = createClient()

    // Check if current user has permission to reset this user's password
    const { data: targetUser, error: targetUserError } = await supabase
      .from("pharmacy_users")
      .select("role, pharmacy_id")
      .eq("user_id", user_id)
      .single()

    if (targetUserError) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Permission check
    const canReset =
      currentUser.role === "super_admin" ||
      (currentUser.role === "admin" &&
        targetUser.role !== "admin" &&
        targetUser.role !== "super_admin" &&
        targetUser.pharmacy_id === currentUser.pharmacy_id)

    if (!canReset) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Reset the password
    const { error: resetError } = await supabase.auth.admin.updateUserById(user_id, {
      password: new_password,
    })

    if (resetError) {
      return NextResponse.json({ error: resetError.message }, { status: 500 })
    }

    // Log the activity
    await logActivity({
      user_id: currentUser.id,
      action: "password_reset",
      entity_type: "user",
      entity_id: user_id,
      details: { reset_by: currentUser.role },
      pharmacy_id: currentUser.pharmacy_id,
    })

    return NextResponse.json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
