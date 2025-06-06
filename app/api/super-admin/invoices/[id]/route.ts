import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { isSuperAdmin, generateInvoice } from "@/lib/admin"

export async function POST(request: Request, { params }: { params: { id: string } }) {
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

    const billingId = params.id

    const { data, error } = await generateInvoice(billingId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Generate invoice error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
