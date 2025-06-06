import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"
import type { Database } from "./database.types"

export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"]
export type ActivityLogInput = Omit<ActivityLog, "id" | "created_at">

// Log an activity
export async function logActivity(activityData: ActivityLogInput) {
  const supabase = createClient(cookies())

  const { error } = await supabase.from("activity_logs").insert(activityData)

  if (error) {
    console.error("Error logging activity:", error)
    // Don't throw or return error - logging should not block main operations
  }

  return { success: !error }
}

// Get activity logs with pagination and filtering
export async function getActivityLogs(
  pharmacyId: string,
  page = 1,
  limit = 20,
  userId?: string,
  entityType?: string,
  startDate?: string,
  endDate?: string,
) {
  const supabase = createClient(cookies())

  let query = supabase
    .from("activity_logs")
    .select(
      `
      *,
      users:user_id (
        email
      )
    `,
      { count: "exact" },
    )
    .eq("pharmacy_id", pharmacyId)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (userId) {
    query = query.eq("user_id", userId)
  }

  if (entityType) {
    query = query.eq("entity_type", entityType)
  }

  if (startDate && endDate) {
    query = query.gte("created_at", startDate).lte("created_at", endDate)
  }

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching activity logs:", error)
    return { error, data: null, count: 0 }
  }

  // Format the data to include user email
  const formattedData = data.map((log) => ({
    ...log,
    user_email: log.users?.email || "Unknown",
  }))

  return { error: null, data: formattedData, count: count || 0 }
}
