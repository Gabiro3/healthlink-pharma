"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string | string[]
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only run this effect if authentication check is complete
    if (!isLoading) {
      // If user is not logged in
      if (!user) {
        // Redirect to login with the current path
        const currentPath = window.location.pathname
        router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`)
        return
      }

      // If role check is required and user doesn't have the required role
      if (user && requiredRole) {
        const userRole = user.role || "user"

        // Check if user has the required role
        const hasRequiredRole = Array.isArray(requiredRole)
          ? requiredRole.includes(userRole)
          : userRole === requiredRole

        if (!hasRequiredRole) {
          // Redirect to unauthorized page
          router.push("/unauthorized")
        }
      }
    }
  }, [user, isLoading, router, requiredRole])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#004d40]" />
      </div>
    )
  }

  // If user is authenticated (and has required role if specified), render children
  if (user && (!requiredRole || (requiredRole && user.role))) {
    return <>{children}</>
  }

  // Return loading indicator while redirecting
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#004d40]" />
    </div>
  )
}
