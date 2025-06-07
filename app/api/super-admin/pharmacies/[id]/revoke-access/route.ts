import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { isSuperAdmin, revokePharmacyAccess } from "@/lib/admin"

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

    const pharmacyId = params.id

    if (!pharmacyId) {
      return NextResponse.json({ error: "Pharmacy ID is required" }, { status: 400 })
    }

    const { data, error } = await revokePharmacyAccess(pharmacyId, user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: "Pharmacy access revoked successfully",
      data,
    })
  } catch (error) {
    console.error("Revoke pharmacy access error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
