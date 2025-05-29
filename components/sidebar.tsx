"use client"

import { useEffect, useState } from "react"
import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import {
  BarChart3,
  BarChart4,
  Box,
  ClipboardList,
  CreditCard,
  FileTextIcon,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Pill,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react"

interface RouteItem {
  label: string
  icon: React.ElementType
  href: string
  active: boolean
}
interface PharmacyDetails {
  name: string
  logo_url?: string
  currency: string
}

export function Sidebar() {
  const pathname = usePathname()
  const [pharmacyDetails, setPharmacyDetails] = useState<PharmacyDetails>({
    name: "Healthlink Pharma",
    currency: "RWF",
  })

  useEffect(() => {
    const fetchPharmacyDetails = async () => {
      try {
        const response = await fetch("/api/pharmacy")
        if (response.ok) {
          const data = await response.json()
          if (data) {
            setPharmacyDetails({
              name: data.name || "PharmaSys",
              logo_url: data.logo_url,
              currency: data.currency || "RWF",
            })
          }
        }
      } catch (error) {
        console.error("Error fetching pharmacy details:", error)
      }
    }

    fetchPharmacyDetails()
  }, [])
  const router = useRouter()
  const { signOut } = useAuth()
  const handleSignOut = async () => {
      await signOut()
      router.push("/login")
    }

  const routes: RouteItem[] = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Products",
      icon: Box,
      href: "/products",
      active: pathname === "/products",
    },
    {
      label: "Orders",
      icon: ClipboardList,
      href: "/orders",
      active: pathname === "/orders",
    },
    {
      label: "Sales",
      icon: BarChart3,
      href: "/sales",
      active: pathname === "/sales",
    },
    {
      label: "Budget",
      icon: FileTextIcon,
      href: "/budget",
      active: pathname === "/budget",
    },
    {
      label: "Customers",
      icon: Users,
      href: "/customers",
      active: pathname === "/customers",
    },
    {
      label: "Payments",
      icon: CreditCard,
      href: "/payments",
      active: pathname === "/payments",
    },
    {
      label: "Help & Support",
      icon: HelpCircle,
      href: "/support",
      active: pathname === "/support",
    },
    {
      label: "Pharmacy Settings",
      icon: Settings,
      href: "/settings/pharmacy",
      active: pathname === "/settings/pharmacy",
    },
  ]

  return (
    <div className="flex h-full flex-col bg-[#004d40] text-white">
      <div className="flex items-center p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="rounded-full bg-white/20 p-1">
            {pharmacyDetails.logo_url ? (
            <img src={pharmacyDetails.logo_url || "/placeholder.svg"} alt="Pharmacy Logo" className="h-6 w-6 rounded" />
          ) : (
            <Pill className="h-6 w-6 text-primary" />
          )}
          </div>
          <h1 className="text-xl font-bold">{pharmacyDetails.name}</h1>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                route.active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <div className="rounded-lg bg-white/10 p-4">
          <div className="mb-2 flex items-center justify-center rounded-lg bg-white/20 p-1">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <h3 className="mb-1 text-center text-sm font-medium">Upgrade Pro</h3>
          <p className="mb-3 text-xs text-white/70">Master your pharmacy with detailed analytics and reporting</p>
          <Button className="w-full bg-white text-[#004d40] hover:bg-white/90" size="sm">
            Upgrade Now
          </Button>
        </div>
        <Button
          variant="ghost"
          className="mt-2 w-full justify-start text-white/70 hover:bg-white/10 hover:text-white"
          onClick={() => handleSignOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
