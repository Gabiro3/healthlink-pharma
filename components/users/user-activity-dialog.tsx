"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Activity } from "lucide-react"

interface User {
  id: string
  email: string
  role: string
}

interface ActivityLog {
  id: string
  action: string
  entity_type: string
  entity_id: string
  details: any
  created_at: string
}

interface UserActivityDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserActivityDialog({ user, open, onOpenChange }: UserActivityDialogProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && user) {
      fetchUserActivity()
    }
  }, [open, user])

  const fetchUserActivity = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${user.id}/activity`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error("Error fetching user activity:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-800"
      case "update":
        return "bg-blue-100 text-blue-800"
      case "delete":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Activity Log - {user.email}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading activity logs...
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getActionColor(activity.action)} variant="secondary">
                      {activity.action.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-500">{new Date(activity.created_at).toLocaleString()}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {activity.entity_type}: {activity.entity_id}
                    </p>
                    {activity.details && (
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <pre>{JSON.stringify(activity.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activity found</h3>
              <p className="text-gray-500">This user hasn't performed any logged activities yet.</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
