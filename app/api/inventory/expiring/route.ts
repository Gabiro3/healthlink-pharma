import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  // Get query parameters
  const url = new URL(request.url)
  const days = Number.parseInt(url.searchParams.get("days") || "90")

  // Calculate the date threshold
  const today = new Date()
  const threshold = new Date()
  threshold.setDate(today.getDate() + days)

  // Get medicines expiring within the threshold
  const { data, error } = await supabase
    .from("medicines")
    .select(`
      *,
      medicine_categories(id, name)
    `)
    .lt("expiry_date", threshold.toISOString().split("T")[0])
    .gt("expiry_date", today.toISOString().split("T")[0])
    .gt("stock_quantity", 0)
    .order("expiry_date", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data })
}
