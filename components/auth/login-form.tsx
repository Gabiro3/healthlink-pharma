"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Pill } from "lucide-react"
import { createClient } from "@/supabase/client"

export function LoginForm() {
  const [formData, setFormData] = useState({
    pharmacyCode: "",
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      // First verify pharmacy code exists
      const verifyResponse = await fetch("/api/auth/verify-pharmacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pharmacyCode: formData.pharmacyCode }),
      })

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json()
        throw new Error(errorData.error || "Invalid pharmacy code")
      }

      // Proceed with authentication
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        throw new Error(authError.message)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-12 h-12 bg-teal-800 rounded-lg flex items-center justify-center">
                  <Pill className="w-6 h-6 text-lime-400" />
                </div>
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900">Healthlink Pharma</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Log in to your account</h2>
            <p className="mt-2 text-gray-600">Enter your pharmacy code, email and password to log in</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Access your pharmacy management system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pharmacyCode">Pharmacy Code</Label>
                  <Input
                    id="pharmacyCode"
                    type="text"
                    placeholder="PH-12345"
                    value={formData.pharmacyCode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pharmacyCode: e.target.value }))}
                    required
                    pattern="PH-\d{5}"
                    title="Pharmacy code must be in format PH-12345"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {message && (
                  <Alert>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-teal-800 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Promotional Content */}
      <div className="flex-1 bg-teal-800 flex items-center justify-center p-8 text-white">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="w-64 h-40 bg-white/10 rounded-lg mx-auto mb-6 flex items-center justify-center">
              <div className="text-6xl">📊</div>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">The easiest way to manage your pharmacy</h2>
          <p className="text-blue-100 mb-6">
            Streamline your pharmacy operations with our comprehensive management system. Track inventory, manage sales,
            and grow your business efficiently.
          </p>
          <Button variant="outline" className="text-blue-600 bg-white hover:bg-gray-100">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  )
}
