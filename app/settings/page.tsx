"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Bell, Globe, Lock, Moon, Sun } from "lucide-react"

export default function SettingsPage() {
  const [theme, setTheme] = useState("light")
  const [language, setLanguage] = useState("english")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [desktopNotifications, setDesktopNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const { toast } = useToast()

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully",
    })
  }

  return (
    <DashboardLayout title="Settings" subtitle="Let's check your pharmacy today">
      <div className="grid gap-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how your theme looks on your device</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === "light" ? (
                <Sun className="h-5 w-5 text-orange-500" />
              ) : (
                <Moon className="h-5 w-5 text-blue-500" />
              )}
              <span>Theme</span>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Language</CardTitle>
            <CardDescription>Select your language</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-gray-500" />
              <span>Language</span>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="german">German</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Two-factor Authentication</CardTitle>
            <CardDescription>Keep your account secure by enabling 2FA via email</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-gray-500" />
              <span>Enable 2FA</span>
            </div>
            <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Mobile Push Notifications</CardTitle>
            <CardDescription>Receive push notification</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-500" />
              <span>Enable push notifications</span>
            </div>
            <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Desktop Notification</CardTitle>
            <CardDescription>Receive push notification in desktop</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-500" />
              <span>Enable desktop notifications</span>
            </div>
            <Switch checked={desktopNotifications} onCheckedChange={setDesktopNotifications} />
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Receive email notification</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-500" />
              <span>Enable email notifications</span>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Notices & Articles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-red-100 bg-red-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600">
                  Upcoming Maintenance
                </span>
                <span className="text-xs text-gray-500">Published: 25-Nov-2024</span>
              </div>
              <p className="text-sm">
                We will perform system maintenance on 30-Dec-2024 from 2 AM to 4 AM. Expect temporary downtime.
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Read more
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button className="bg-[#004d40] hover:bg-[#00695c]" onClick={handleSaveSettings}>
            Save Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
