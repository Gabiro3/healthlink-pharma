"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Search,
  Download,
  CalendarIcon,
  User,
  Package,
  ShoppingCart,
  DollarSign,
  Settings,
  Eye,
  Plus,
  Edit,
  Trash2,
} from "lucide-react"
import { format } from "date-fns"

interface ActivityLog {
  id: string
  user_email: string
  action: string
  entity_type: string
  entity_id: string
  details: any
  created_at: string
}

interface ActivityLogProps {
  activities: ActivityLog[]
}

export function ActivityLogUI({ activities }: ActivityLogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [entityFilter, setEntityFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  const actions = [...new Set(activities.map((a) => a.action))]
  const entityTypes = [...new Set(activities.map((a) => a.entity_type))]
  const users = [...new Set(activities.map((a) => a.user_email))]

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.entity_id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAction = actionFilter === "all" || activity.action === actionFilter
    const matchesEntity = entityFilter === "all" || activity.entity_type === entityFilter
    const matchesUser = userFilter === "all" || activity.user_email === userFilter

    const activityDate = new Date(activity.created_at)
    const matchesDateRange =
      (!dateRange.from || activityDate >= dateRange.from) && (!dateRange.to || activityDate <= dateRange.to)

    return matchesSearch && matchesAction && matchesEntity && matchesUser && matchesDateRange
  })

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return Plus
      case "update":
        return Edit
      case "delete":
        return Trash2
      case "view":
        return Eye
      default:
        return Settings
    }
  }

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case "product":
        return Package
      case "sale":
        return ShoppingCart
      case "user":
        return User
      case "budget":
        return DollarSign
      default:
        return Settings
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
      case "view":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-purple-100 text-purple-800"
    }
  }

  const formatDetails = (details: any) => {
    if (!details) return "No additional details"

    if (typeof details === "object") {
      return Object.entries(details)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ")
    }

    return details.toString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
          <p className="text-gray-600">Monitor all system activities and user actions</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Log
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {entityTypes.map((entity) => (
                  <SelectItem key={entity} value={entity}>
                    {entity.charAt(0).toUpperCase() + entity.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger>
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setActionFilter("all")
                setEntityFilter("all")
                setUserFilter("all")
                setDateRange({})
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activities ({filteredActivities.length})</CardTitle>
            <Badge variant="outline">
              {filteredActivities.length} of {activities.length} activities
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActivities.map((activity) => {
              const ActionIcon = getActionIcon(activity.action)
              const EntityIcon = getEntityIcon(activity.entity_type)

              return (
                <div key={activity.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <ActionIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <EntityIcon className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getActionColor(activity.action)} variant="secondary">
                            {activity.action}
                          </Badge>
                          <Badge variant="outline">{activity.entity_type}</Badge>
                        </div>
                        <span className="text-sm text-gray-500">{new Date(activity.created_at).toLocaleString()}</span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          <span className="text-blue-600">{activity.user_email}</span> {activity.action}d{" "}
                          {activity.entity_type}
                          <span className="font-mono text-xs bg-gray-100 px-1 rounded ml-1">{activity.entity_id}</span>
                        </p>

                        {activity.details && (
                          <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            {formatDetails(activity.details)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredActivities.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <Settings className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-500">No activities found matching your filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
