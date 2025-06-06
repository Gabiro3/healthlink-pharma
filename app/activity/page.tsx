import { getCurrentUser } from "@/lib/auth"
import { getActivityLogs } from "@/lib/activity"
import { Header } from "@/components/layout/header"
import { ActivityLogUI } from "@/components/activity/activity-log"
import { redirect } from "next/navigation"

export default async function ActivityPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch activity logs
  const { data: activities, error } = await getActivityLogs(user.pharmacy_id, 1, 100)

  if (error) {
    console.error("Error fetching activity logs:", error)
  }

  return (
    <div className="space-y-6">
      <Header
        title="Activity Log"
        subtitle="Monitor all system activities and user actions"
        user={{
          email: user.email,
          pharmacy_name: user.pharmacy_name,
          role: user.role,
        }}
      />

      <div className="px-6">
        <ActivityLogUI activities={activities || []} />
      </div>
    </div>
  )
}
