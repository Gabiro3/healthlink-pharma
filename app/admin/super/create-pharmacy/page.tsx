import { getCurrentUser } from "@/lib/auth"
import { isSuperAdmin } from "@/lib/admin"
import { Header } from "@/components/layout/header"
import { CreatePharmacyForm } from "@/components/admin/create-pharmacy-form"
import { redirect } from "next/navigation"

export default async function CreatePharmacyPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is super admin
  const isSuper = await isSuperAdmin(user.id)

  return (
    <div className="space-y-6">
      <Header
        title="Create New Pharmacy"
        subtitle="Add a new pharmacy to the system with admin account"
        user={{
          email: user.email,
          pharmacy_name: "System Administrator",
          role: "super_admin",
        }}
      />

      <div className="px-6 max-w-2xl">
        <CreatePharmacyForm currentUserId={user.id} />
      </div>
    </div>
  )
}
