"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { KeyRound, Copy, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { generateSecurePassword, copyToClipboard } from "@/lib/password-utils"

interface PasswordResetDialogProps {
  userId: string
  userEmail: string
  userRole: string
  currentUserRole: string
  onPasswordReset?: () => void
}

export function PasswordResetDialog({
  userId,
  userEmail,
  userRole,
  currentUserRole,
  onPasswordReset,
}: PasswordResetDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [resetComplete, setResetComplete] = useState(false)

  // Check if current user can reset this user's password
  const canResetPassword = () => {
    if (currentUserRole === "super_admin") return true
    if (currentUserRole === "admin" && userRole !== "admin" && userRole !== "super_admin") return true
    return false
  }

  const generateNewPassword = () => {
    const password = generateSecurePassword(12)
    setNewPassword(password)
    setShowPassword(true)
  }

  const handleCopyPassword = async () => {
    const success = await copyToClipboard(newPassword)
    if (success) {
      toast.success("Password copied to clipboard!")
    } else {
      toast.error("Failed to copy password")
    }
  }

  const handlePasswordReset = async () => {
    if (!newPassword) {
      toast.error("Please generate a new password first")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          new_password: newPassword,
        }),
      })

      if (response.ok) {
        toast.success("Password reset successfully!")
        setResetComplete(true)
        onPasswordReset?.()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to reset password")
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setNewPassword("")
    setShowPassword(false)
    setResetComplete(false)
  }

  if (!canResetPassword()) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <KeyRound className="w-4 h-4 mr-2" />
          Reset Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
        </DialogHeader>

        {!resetComplete ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                You are about to reset the password for <strong>{userEmail}</strong>. This action cannot be undone and
                the user will need to use the new password to log in.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password or generate one"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <Button type="button" variant="outline" onClick={generateNewPassword}>
                  Generate
                </Button>
                {newPassword && (
                  <Button type="button" variant="outline" onClick={handleCopyPassword}>
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>At least 8 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains numbers and special characters</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handlePasswordReset}
                disabled={isLoading || !newPassword}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                Password has been reset successfully! Make sure to share the new password with the user securely.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>New Password (copy this before closing)</Label>
              <div className="flex gap-2">
                <Input type="text" value={newPassword} readOnly className="font-mono" />
                <Button type="button" variant="outline" onClick={handleCopyPassword}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="button" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
