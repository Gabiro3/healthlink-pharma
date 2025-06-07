import { getCurrentUser } from "@/lib/auth"
import { getPharmacyUsers } from "@/lib/user-management"
import { Header } from "@/components/layout/header"
import { EnhancedUserManagement } from "@/components/users/enhanced-user-management"
import { redirect } from "next/navigation"

export default async function UsersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch users for the pharmacy
  const { data: users, error } = await getPharmacyUsers(user.pharmacy_id)

  if (error) {
    console.error("Error fetching users:", error)
  }

  return (
    <div className="space-y-6">
      <Header
        title="User Management"
        subtitle="Manage pharmacy users, roles, and permissions"
        user={{
          email: user.email,
          pharmacy_name: user.pharmacy_name,
          role: user.role,
        }}
      />

      <div className="px-6">
        <EnhancedUserManagement users={users || []} currentUser={user} pharmacyId={user.pharmacy_id} />
      </div>
    </div>
  )
}
