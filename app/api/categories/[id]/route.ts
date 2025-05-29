import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const id = params.id

  const { data, error } = await supabase.from("medicine_categories").select("*").eq("id", id).single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json({ data })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const id = params.id

  try {
    const updates = await request.json()

    if (!updates.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("medicine_categories")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const id = params.id

  // Check if category is used in medicines
  const { count, error: countError } = await supabase
    .from("medicines")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id)

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 400 })
  }

  if (count > 0) {
    return NextResponse.json(
      {
        error: "Cannot delete category that is used by medicines",
      },
      { status: 400 },
    )
  }

  const { error } = await supabase.from("medicine_categories").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
