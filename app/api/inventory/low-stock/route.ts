import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  // Get medicines with stock below reorder level
  const { data, error } = await supabase
    .from("medicines")
    .select(`
      *,
      medicine_categories(id, name)
    `)
    .lt("stock_quantity", supabase.rpc("least", { a: "reorder_level", b: 5 }))
    .order("stock_quantity", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data })
}
