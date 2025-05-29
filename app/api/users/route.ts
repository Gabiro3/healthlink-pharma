import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  // Get query parameters
  const url = new URL(request.url)
  const role = url.searchParams.get("role")
  const limit = Number.parseInt(url.searchParams.get("limit") || "10")
  const offset = Number.parseInt(url.searchParams.get("offset") || "0")

  // Build query
  let query = supabase
    .from("users")
    .select("*")
    .order("full_name", { ascending: true })
    .limit(limit)
    .range(offset, offset + limit - 1)

  // Add role filter if provided
  if (role) {
    query = query.eq("role", role)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data, count })
}
