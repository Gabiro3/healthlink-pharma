"use client"

import { useAuth } from "@/lib/auth"
import { useEffect, useState } from "react"

export function AuthDebug() {
  const authData = useAuth() // ✅ valid use

  const [auth, setAuth] = useState<{
    isLoading: boolean
    user: { id: string; role: string | null } | null
  }>({ isLoading: true, user: null })

  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    try {
      setAuth({
        ...authData,
        user: authData.user
          ? { ...authData.user, role: authData.user.role ?? null }
          : null,
      })
    } catch (e: any) {
      setError(e as Error)
    }
  }, [authData]) // Optional: react to changes

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 z-50 rounded-md bg-red-500/80 p-4 text-xs text-white">
        Auth Error: {error.message}
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-md bg-black/80 p-4 text-xs text-white">
      <div>
        Auth Status:{" "}
        {auth.isLoading
          ? "Loading"
          : auth.user
          ? "Authenticated"
          : "Not Authenticated"}
      </div>
      {auth.user && (
        <div>
          <div>User ID: {auth.user.id}</div>
          <div>Role: {auth.user.role || "None"}</div>
        </div>
      )}
    </div>
  )
}
