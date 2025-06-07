"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, UserPlus, Shield, Activity, Search, Eye, Ban, MoreHorizontal } from "lucide-react"
import { CreateUserDialog } from "./create-user-dialog"
import { UserActivityDialog } from "./user-activity-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface User {
  id: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  last_sign_in_at?: string
}

interface CurrentUser {
  id: string
  email: string
  role: string
  pharmacy_id: string
}

interface EnhancedUserManagementProps {
  users: User[]
  currentUser: CurrentUser
  pharmacyId: string
}

export function EnhancedUserManagement({ users: initialUsers, currentUser, pharmacyId }: EnhancedUserManagementProps) {
  const [users, setUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showActivityDialog, setShowActivityDialog] = useState(false)

  const roles = ["admin", "manager", "pharmacist", "cashier"]

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active)
    return matchesSearch && matchesRole && matchesStatus
  })

  const activeUsers = users.filter((u) => u.is_active).length
  const inactiveUsers = users.filter((u) => !u.is_active).length
  const adminUsers = users.filter((u) => u.role === "admin").length
  const recentUsers = users.filter((u) => {
    const createdDate = new Date(u.created_at)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return createdDate > sevenDaysAgo
  }).length

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "manager":
        return "bg-blue-100 text-blue-800"
      case "pharmacist":
        return "bg-green-100 text-green-800"
      case "cashier":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleRevokeAccess = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, is_active: false } : u)))
        toast.success("User access revoked successfully")
      } else {
        toast.error("Failed to revoke user access")
      }
    } catch (error) {
      console.error("Error revoking access:", error)
      toast.error("An unexpected error occurred")
    }
  }

  const handleViewActivity = (user: User) => {
    setSelectedUser(user)
    setShowActivityDialog(true)
  }

  const handleUserCreated = () => {
    // Refresh users list
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CreateUserDialog pharmacyId={pharmacyId} currentUserId={currentUser.id} onUserCreated={handleUserCreated} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-gray-500">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Shield className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
            <p className="text-xs text-gray-500">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers}</div>
            <p className="text-xs text-gray-500">Admin privileges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <UserPlus className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentUsers}</div>
            <p className="text-xs text-gray-500">Recently added</p>
          </CardContent>
        </Card>
      </div>

      {/* User Management Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">All Users</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="activity">Activity Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users by email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>System Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                  <span>Email</span>
                  <span>Role</span>
                  <span>Status</span>
                  <span>Created</span>
                  <span>Last Sign In</span>
                  <span>Actions</span>
                </div>

                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="grid grid-cols-6 gap-4 items-center py-3 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-sm font-medium">{user.email}</span>
                    <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`} variant="secondary">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                    <Badge
                      className={`text-xs ${user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      variant="secondary"
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-sm">{new Date(user.created_at).toLocaleDateString()}</span>
                    <span className="text-sm">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Never"}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewActivity(user)}>
                          <Activity className="w-4 h-4 mr-2" />
                          View Activity
                        </DropdownMenuItem>
                        {user.is_active && user.id !== currentUser.id && (
                          <DropdownMenuItem onClick={() => handleRevokeAccess(user.id)} className="text-red-600">
                            <Ban className="w-4 h-4 mr-2" />
                            Revoke Access
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map((role) => {
                  const roleUsers = users.filter((u) => u.role === role)
                  const percentage = users.length > 0 ? (roleUsers.length / users.length) * 100 : 0

                  return (
                    <div key={role} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium capitalize">{role}</h3>
                        <p className="text-sm text-gray-500">{roleUsers.length} users</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getRoleBadgeColor(role)} variant="secondary">
                          {percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.slice(0, 10).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        Last active:{" "}
                        {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Never"}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleViewActivity(user)}>
                      <Eye className="w-3 h-3 mr-1" />
                      View Logs
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Activity Dialog */}
      {selectedUser && (
        <UserActivityDialog user={selectedUser} open={showActivityDialog} onOpenChange={setShowActivityDialog} />
      )}
    </div>
  )
}
