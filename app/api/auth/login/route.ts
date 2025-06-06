import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { email, pharmacyCode } = await request.json()

    if (!email || !pharmacyCode) {
      return NextResponse.json({ error: "Email and pharmacy code are required" }, { status: 400 })
    }

    // Send magic link email
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${requestUrl.origin}/api/auth/callback`,
        data: {
          pharmacy_code: pharmacyCode,
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Check your email for the login link" })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
