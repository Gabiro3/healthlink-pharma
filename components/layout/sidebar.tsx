"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Package,
  Users,
  LogOut,
  Pill,
  DollarSign,
  Activity,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ShieldIcon,
  Wallet2Icon,
  Shield,
} from "lucide-react"
import { createClient } from "@/supabase/client"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Sales", href: "/sales", icon: DollarSign },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Insurance", href: "/insurance", icon: ShieldIcon },
  { name: "Budget", href: "/budget", icon: DollarSign },
  { name: "Expenses", href: "/expenses", icon: Wallet2Icon },
  { name: "Activity", href: "/activity", icon: Activity },
]

interface SidebarProps {
  user?: {
    email: string
    pharmacy_name: string
    role: string
  }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div
  className={cn(
    "bg-teal-800 text-white flex flex-col transition-all duration-300",
    isCollapsed ? "w-17" : "w-64",
    "max-h-screen overflow-y-auto" // ✅ Add this
  )}
>

      {/* Header */}
      <div className="p-4 border-b border-teal-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-lime-400 rounded-lg flex items-center justify-center mr-3">
                <Pill className="w-5 h-5 text-teal-800" />
              </div>
              <span className="text-xl font-bold">Pharma</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:bg-teal-700"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-lime-400 text-teal-800" : "text-teal-100 hover:bg-teal-700 hover:text-white",
                )}
              >
                <item.icon className={cn("flex-shrink-0", isCollapsed ? "w-5 h-5" : "w-5 h-5 mr-3")} />
                {!isCollapsed && <span>{item.name}</span>}
              </div>
            </Link>
          )
        })}
        {/* Admin Panel (Only visible to admins) */}
{user?.role === "admin" && !isCollapsed && (
  <div className="p-4 border-t border-teal-700">
    <h3 className="text-sm font-semibold text-teal-200 mb-2">Admin Panel</h3>
    <div className="space-y-2">
      <Link href="/admin/users">
        <div
          className={cn(
            "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            pathname === "/admin/pharmacy/"
              ? "bg-lime-400 text-teal-800"
              : "text-teal-100 hover:bg-teal-700 hover:text-white"
          )}
        >
          <Shield className={cn("flex-shrink-0", isCollapsed ? "w-5 h-5" : "w-5 h-5 mr-3")} />
          {!isCollapsed && <span>Admin Dashboard</span>}
        </div>
      </Link>
      <Link href="/admin/users">
        <div
          className={cn(
            "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            pathname === "/admin/pharmacy/"
              ? "bg-lime-400 text-teal-800"
              : "text-teal-100 hover:bg-teal-700 hover:text-white"
          )}
        >
          <Users className={cn("flex-shrink-0", isCollapsed ? "w-5 h-5" : "w-5 h-5 mr-3")} />
          {!isCollapsed && <span>Manage Users</span>}
        </div>
      </Link>
    </div>
  </div>
)}

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-teal-100 hover:bg-teal-700 hover:text-white"
        >
          <LogOut className={cn("flex-shrink-0", isCollapsed ? "w-5 h-5" : "w-5 h-5 mr-3")} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </nav>

      {/* Upgrade Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-teal-700">
          <div className="bg-teal-700 rounded-lg p-2 text-center">
            <h3 className="font-semibold mb-1">Upgrade Pro</h3>
            <p className="text-xs text-teal-200 mb-3">
              Master your pharmacy with advanced analytics and clear insights.
            </p>
            <Button size="sm" className="w-full bg-lime-400 text-teal-800 hover:bg-lime-500" onClick={() => router.push("/premium")}>
              Upgrade Now
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}
