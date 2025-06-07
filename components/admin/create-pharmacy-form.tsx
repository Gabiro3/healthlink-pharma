"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Building2, User, Mail, Phone, MapPin, Lock, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { generateSecurePassword, copyToClipboard } from "@/lib/password-utils"

interface CreatePharmacyFormProps {
  currentUserId: string
}

export function CreatePharmacyForm({ currentUserId }: CreatePharmacyFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string>("")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    // Pharmacy details
    pharmacyName: "",
    pharmacyAddress: "",
    pharmacyContact: "",
    pharmacyEmail: "",
    // Admin details
    adminEmail: "",
    adminPassword: "",
    confirmPassword: "",
  })

  const generatePharmacyCode = () => {
    const code = `PH-${Math.floor(10000 + Math.random() * 90000)}`
    setGeneratedCode(code)
    return code
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.pharmacyName.trim()) {
      toast.error("Pharmacy name is required")
      return false
    }
    if (!formData.pharmacyAddress.trim()) {
      toast.error("Pharmacy address is required")
      return false
    }
    if (!formData.pharmacyContact.trim()) {
      toast.error("Pharmacy contact number is required")
      return false
    }
    if (!formData.pharmacyEmail.trim()) {
      toast.error("Pharmacy email is required")
      return false
    }
    if (!formData.adminEmail.trim()) {
      toast.error("Admin email is required")
      return false
    }
    if (!formData.adminPassword.trim()) {
      toast.error("Admin password is required")
      return false
    }
    if (formData.adminPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return false
    }
    if (formData.adminPassword.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/super-admin/create-pharmacy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pharmacy: {
            name: formData.pharmacyName,
            address: formData.pharmacyAddress,
            contact_number: formData.pharmacyContact,
            email: formData.pharmacyEmail,
          },
          admin: {
            email: formData.adminEmail,
            password: formData.adminPassword,
          },
          created_by: currentUserId,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("Pharmacy created successfully!")
        setGeneratedCode(result.data.pharmacy_code)

        // Reset form
        setFormData({
          pharmacyName: "",
          pharmacyAddress: "",
          pharmacyContact: "",
          pharmacyEmail: "",
          adminEmail: "",
          adminPassword: "",
          confirmPassword: "",
        })

        // Redirect after a delay to show success
        setTimeout(() => {
          router.push("/admin/super")
        }, 2000)
      } else {
        toast.error(result.error || "Failed to create pharmacy")
      }
    } catch (error) {
      console.error("Error creating pharmacy:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const generatePassword = () => {
    const newPassword = generateSecurePassword(12)
    setFormData((prev) => ({
      ...prev,
      adminPassword: newPassword,
      confirmPassword: newPassword,
    }))
    setShowPassword(true)
  }

  const handleCopyPassword = async () => {
    const success = await copyToClipboard(formData.adminPassword)
    if (success) {
      toast.success("Password copied to clipboard!")
    } else {
      toast.error("Failed to copy password")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Create New Pharmacy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pharmacy Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-lg font-semibold">Pharmacy Information</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pharmacyName">Pharmacy Name *</Label>
                <Input
                  id="pharmacyName"
                  value={formData.pharmacyName}
                  onChange={(e) => handleInputChange("pharmacyName", e.target.value)}
                  placeholder="Enter pharmacy name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pharmacyContact">Contact Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="pharmacyContact"
                    value={formData.pharmacyContact}
                    onChange={(e) => handleInputChange("pharmacyContact", e.target.value)}
                    placeholder="Enter contact number"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pharmacyAddress">Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <Textarea
                  id="pharmacyAddress"
                  value={formData.pharmacyAddress}
                  onChange={(e) => handleInputChange("pharmacyAddress", e.target.value)}
                  placeholder="Enter complete address"
                  className="pl-10"
                  rows={3}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pharmacyEmail">Pharmacy Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="pharmacyEmail"
                  type="email"
                  value={formData.pharmacyEmail}
                  onChange={(e) => handleInputChange("pharmacyEmail", e.target.value)}
                  placeholder="Enter pharmacy email"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {generatedCode && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Pharmacy Code Generated: {generatedCode}</span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Admin Account Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-green-600" />
              <h3 className="text-lg font-semibold">Admin Account</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => handleInputChange("adminEmail", e.target.value)}
                  placeholder="Enter admin email"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Password *</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="adminPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.adminPassword}
                      onChange={(e) => handleInputChange("adminPassword", e.target.value)}
                      placeholder="Enter password (min 8 characters)"
                      className="pl-10"
                      minLength={8}
                      required
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={generatePassword}>
                    Generate
                  </Button>
                  {formData.adminPassword && (
                    <Button type="button" variant="outline" onClick={handleCopyPassword}>
                      Copy
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm password"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>At least 8 characters long</li>
                <li>Should contain a mix of letters and numbers</li>
                <li>Avoid common passwords</li>
              </ul>
            </div>
          </div>

          <Separator />

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Creating..." : "Create Pharmacy"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
