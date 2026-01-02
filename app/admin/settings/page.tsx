"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Settings, Shield, Bell, Database, Globe, Save, Trash2, RefreshCw, FileText, AlertCircle, CheckCircle2, Loader2, Server, HardDrive } from "lucide-react"
import { useSettings, useUpdateSettings, useClearCache, useSystemLogs } from "@/lib/hooks/use-settings"
import { useAuthStatus } from "@/lib/hooks/use-auth"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const { currentUser: user } = useAuthStatus();
  const { data: settings, isLoading, error, refetch } = useSettings();
  const updateSettings = useUpdateSettings();
  const clearCache = useClearCache();
  const { data: logs, refetch: refetchLogs, isFetching: loadingLogs } = useSystemLogs();

  const [localSettings, setLocalSettings] = useState({
    notifications: {
      email_notifications: true,
      push_notifications: true,
      maintenance_alerts: true,
      payment_reminders: true,
      lease_expiry_alerts: true,
      system_announcements: true,
    },
    preferences: {
      language: "en",
      timezone: "UTC",
      date_format: "Y-m-d",
      currency: "GHS",
      items_per_page: 15,
    },
    privacy: {
      profile_visibility: "private",
      show_email: false,
      show_phone: false,
    },
    system: {
      maintenance_mode: false,
      allow_registration: true,
      require_email_verification: true,
      session_timeout: 120,
      max_file_size: 10,
      allowed_file_types: ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
    },
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Update local settings when data is fetched
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        notifications: settings.notifications || localSettings.notifications,
        preferences: settings.preferences || localSettings.preferences,
        privacy: settings.privacy || localSettings.privacy,
        system: settings.system || localSettings.system,
      });
    }
  }, [settings]);

  const handleNotificationChange = (key: string, value: boolean) => {
    setLocalSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
    setHasChanges(true);
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setLocalSettings((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value },
    }));
    setHasChanges(true);
  };

  const handlePrivacyChange = (key: string, value: any) => {
    setLocalSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value },
    }));
    setHasChanges(true);
  };

  const handleSystemChange = (key: string, value: any) => {
    setLocalSettings((prev) => ({
      ...prev,
      system: { ...prev.system, [key]: value },
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings.mutateAsync(localSettings);
      toast.success("Settings updated successfully!");
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update settings");
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCache.mutateAsync();
      toast.success("Cache cleared successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to clear cache");
    }
  };

  const handleViewLogs = () => {
    refetchLogs();
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load settings. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
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
            {hasChanges && (
              <Badge variant="outline" className="mt-2 border-orange-500 text-orange-500">
                Unsaved Changes
              </Badge>
            )}
          </div>
          <div className="flex gap-3">
            {user?.role === "super_admin" && (
              <>
                <Button
                  variant="outline"
                  onClick={handleClearCache}
                  disabled={clearCache.isPending}
                  className="min-h-[44px] bg-transparent"
                >
                  {clearCache.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Clear Cache
                </Button>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="min-h-[44px] bg-transparent"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </>
            )}
            <Button
              onClick={handleSaveSettings}
              disabled={!hasChanges || updateSettings.isPending}
              className="min-h-[44px]"
            >
              {updateSettings.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Settings
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            {user?.role === "super_admin" && (
              <>
                <TabsTrigger value="system">System</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Preferences */}
              <AnimatedCard delay={100} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Globe className="h-5 w-5" />
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={localSettings.preferences.language}
                      onValueChange={(value) => handlePreferenceChange("language", value)}
                    >
                      <SelectTrigger className="border-gray-200 dark:border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="en-GH">English (Ghana)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={localSettings.preferences.timezone}
                      onValueChange={(value) => handlePreferenceChange("timezone", value)}
                    >
                      <SelectTrigger className="border-gray-200 dark:border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="Africa/Accra">Africa/Accra (GMT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={localSettings.preferences.currency}
                      onValueChange={(value) => handlePreferenceChange("currency", value)}
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
                    <Label htmlFor="items_per_page">Items Per Page</Label>
                    <Input
                      id="items_per_page"
                      type="number"
                      value={localSettings.preferences.items_per_page}
                      onChange={(e) => handlePreferenceChange("items_per_page", parseInt(e.target.value))}
                      className="border-gray-200 dark:border-gray-700"
                    />
                  </div>
                </CardContent>
              </AnimatedCard>

              {/* Privacy */}
              <AnimatedCard delay={200} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Shield className="h-5 w-5" />
                    Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="profile_visibility">Profile Visibility</Label>
                    <Select
                      value={localSettings.privacy.profile_visibility}
                      onValueChange={(value) => handlePrivacyChange("profile_visibility", value)}
                    >
                      <SelectTrigger className="border-gray-200 dark:border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Email</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Make your email visible to others
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.privacy.show_email}
                      onCheckedChange={(checked) => handlePrivacyChange("show_email", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Phone</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Make your phone number visible to others
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.privacy.show_phone}
                      onCheckedChange={(checked) => handlePrivacyChange("show_phone", checked)}
                    />
                  </div>
                </CardContent>
              </AnimatedCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
  )
}
