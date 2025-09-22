"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Shield, Bell, Database, Globe, Save } from "lucide-react"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // System Settings
    systemName: "PropertyHub Ghana",
    systemEmail: "admin@propertyhub.gh",
    systemTimezone: "Africa/Accra",
    maintenanceMode: false,

    // User Settings
    autoApproveUsers: false,
    requireGhanaCard: true,
    allowSelfRegistration: true,

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    systemAlerts: true,

    // Security Settings
    sessionTimeout: "24",
    passwordExpiry: "90",
    twoFactorAuth: false,

    // Platform Settings
    defaultCurrency: "GHS",
    defaultLanguage: "en-GH",
    maxPropertiesPerLandlord: "50",
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    // TODO: Implement settings save
    console.log("Saving settings:", settings)
  }

  const handleSystemBackup = () => {
    // TODO: Implement system backup
    console.log("Creating system backup...")
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start animate-in fade-in-0 slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              System Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Configure system-wide settings, security, and platform preferences.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSystemBackup} className="min-h-[44px] bg-transparent">
              <Database className="h-4 w-4 mr-2" />
              Backup System
            </Button>
            <Button onClick={handleSaveSettings} className="min-h-[44px]">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Configuration */}
          <AnimatedCard delay={100} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Settings className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="systemName">System Name</Label>
                <Input
                  id="systemName"
                  value={settings.systemName}
                  onChange={(e) => handleSettingChange("systemName", e.target.value)}
                  className="border-gray-200 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemEmail">System Email</Label>
                <Input
                  id="systemEmail"
                  type="email"
                  value={settings.systemEmail}
                  onChange={(e) => handleSettingChange("systemEmail", e.target.value)}
                  className="border-gray-200 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemTimezone">System Timezone</Label>
                <Select
                  value={settings.systemTimezone}
                  onValueChange={(value) => handleSettingChange("systemTimezone", value)}
                >
                  <SelectTrigger className="border-gray-200 dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Accra">Africa/Accra (GMT)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Temporarily disable system access for maintenance
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleSettingChange("maintenanceMode", checked)}
                />
              </div>
            </CardContent>
          </AnimatedCard>

          {/* User Management Settings */}
          <AnimatedCard delay={200} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Shield className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-approve Users</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically approve new user registrations
                  </p>
                </div>
                <Switch
                  checked={settings.autoApproveUsers}
                  onCheckedChange={(checked) => handleSettingChange("autoApproveUsers", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Ghana Card</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Require Ghana Card ID for user registration
                  </p>
                </div>
                <Switch
                  checked={settings.requireGhanaCard}
                  onCheckedChange={(checked) => handleSettingChange("requireGhanaCard", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Self Registration</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Allow users to register without admin invitation
                  </p>
                </div>
                <Switch
                  checked={settings.allowSelfRegistration}
                  onCheckedChange={(checked) => handleSettingChange("allowSelfRegistration", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxProperties">Max Properties per Landlord</Label>
                <Input
                  id="maxProperties"
                  type="number"
                  value={settings.maxPropertiesPerLandlord}
                  onChange={(e) => handleSettingChange("maxPropertiesPerLandlord", e.target.value)}
                  className="border-gray-200 dark:border-gray-700"
                />
              </div>
            </CardContent>
          </AnimatedCard>

          {/* Notification Settings */}
          <AnimatedCard delay={300} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Send system notifications via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Send notifications via SMS (requires SMS provider)
                  </p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Alerts</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive alerts for system events and errors
                  </p>
                </div>
                <Switch
                  checked={settings.systemAlerts}
                  onCheckedChange={(checked) => handleSettingChange("systemAlerts", checked)}
                />
              </div>
            </CardContent>
          </AnimatedCard>

          {/* Security Settings */}
          <AnimatedCard delay={400} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange("sessionTimeout", e.target.value)}
                  className="border-gray-200 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                <Input
                  id="passwordExpiry"
                  type="number"
                  value={settings.passwordExpiry}
                  onChange={(e) => handleSettingChange("passwordExpiry", e.target.value)}
                  className="border-gray-200 dark:border-gray-700"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Require 2FA for admin accounts</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => handleSettingChange("twoFactorAuth", checked)}
                />
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Platform Settings */}
        <AnimatedCard delay={500} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Globe className="h-5 w-5" />
              Platform Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select
                  value={settings.defaultCurrency}
                  onValueChange={(value) => handleSettingChange("defaultCurrency", value)}
                >
                  <SelectTrigger className="border-gray-200 dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GHS">Ghana Cedi (₵)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <Select
                  value={settings.defaultLanguage}
                  onValueChange={(value) => handleSettingChange("defaultLanguage", value)}
                >
                  <SelectTrigger className="border-gray-200 dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-GH">English (Ghana)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="tw">Twi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>
      </div>
    </MainLayout>
  )
}
