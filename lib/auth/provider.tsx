"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AuthContext } from "./context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Session, User, AuthError } from "@supabase/supabase-js"
import type { UserWithRole } from "./types"

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  // Fetch user role from the database
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("pharmacy_roles").select("role").eq("user_id", userId).single()

      if (error) {
        console.error("Error fetching user role:", error)
        return null
      }

      return data?.role || null
    } catch (error) {
      console.error("Error in fetchUserRole:", error)
      return null
    }
  }

  // Update user with role information
  const updateUserWithRole = async (currentUser: User | null) => {
    if (!currentUser) {
      setUser(null)
      return
    }

    try {
      const role = await fetchUserRole(currentUser.id)
      setUser({
        ...currentUser,
        role,
      })
    } catch (error) {
      console.error("Error updating user with role:", error)
      setUser(currentUser as UserWithRole)
    }
  }

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true)
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        setSession(currentSession)

        if (currentSession?.user) {
          await updateUserWithRole(currentSession.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error getting session:", error)
        setSession(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession)

      if (currentSession?.user) {
        await updateUserWithRole(currentSession.user)
      } else {
        setUser(null)
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      console.error("Error in signIn:", error)
      return { error: error as AuthError }
    }
  }

  const signUp = async (email: string, password: string, metadata?: { [key: string]: any }) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })
      return { error }
    } catch (error) {
      console.error("Error in signUp:", error)
      return { error: error as AuthError }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error("Error in signOut:", error)
      return { error: error as AuthError }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error }
    } catch (error) {
      console.error("Error in resetPassword:", error)
      return { error: error as AuthError }
    }
  }

  // Create the context value with all auth functions and state
  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  // Provide the context value to all children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
