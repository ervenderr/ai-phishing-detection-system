"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Bell, Shield, User, Save, RefreshCw } from "lucide-react"

export default function UserSettingsPage() {
  const [settings, setSettings] = useState({
    // Profile Settings
    name: "John Doe",
    email: "john.doe@company.com",

    // Notification Settings
    emailAlerts: true,
    browserNotifications: false,
    alertFrequency: "immediate",
    weeklyReports: true,

    // Security Settings
    autoQuarantine: true,
    sensitivityLevel: "medium",
    whitelistEnabled: true,

    // Privacy Settings
    shareAnonymousData: true,
    improvementProgram: true,
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    // Show success message
  }

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your email protection preferences</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={settings.name} onChange={(e) => updateSetting("name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSetting("email", e.target.value)}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Contact your administrator to change your email address
                  </p>
                </div>
              </div>

              <Alert>
                <User className="h-4 w-4" />
                <AlertDescription>
                  Your profile information is used to personalize your experience and security notifications.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how you want to be notified about security events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive email notifications for security threats</p>
                </div>
                <Switch
                  checked={settings.emailAlerts}
                  onCheckedChange={(checked) => updateSetting("emailAlerts", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">Show desktop notifications for immediate threats</p>
                </div>
                <Switch
                  checked={settings.browserNotifications}
                  onCheckedChange={(checked) => updateSetting("browserNotifications", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alertFrequency">Alert Frequency</Label>
                <Select
                  value={settings.alertFrequency}
                  onValueChange={(value) => updateSetting("alertFrequency", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Summary</SelectItem>
                    <SelectItem value="weekly">Weekly Report Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Security Reports</Label>
                  <p className="text-sm text-muted-foreground">Receive weekly summaries of your email security</p>
                </div>
                <Switch
                  checked={settings.weeklyReports}
                  onCheckedChange={(checked) => updateSetting("weeklyReports", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Preferences
              </CardTitle>
              <CardDescription>Configure your email protection settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Quarantine Suspicious Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically quarantine emails flagged as potentially dangerous
                  </p>
                </div>
                <Switch
                  checked={settings.autoQuarantine}
                  onCheckedChange={(checked) => updateSetting("autoQuarantine", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sensitivityLevel">Detection Sensitivity</Label>
                <Select
                  value={settings.sensitivityLevel}
                  onValueChange={(value) => updateSetting("sensitivityLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Fewer false positives</SelectItem>
                    <SelectItem value="medium">Medium - Balanced protection</SelectItem>
                    <SelectItem value="high">High - Maximum security</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Higher sensitivity may result in more false positives but better protection
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Sender Whitelist</Label>
                  <p className="text-sm text-muted-foreground">Allow emails from trusted senders to bypass scanning</p>
                </div>
                <Switch
                  checked={settings.whitelistEnabled}
                  onCheckedChange={(checked) => updateSetting("whitelistEnabled", checked)}
                />
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Security settings changes take effect immediately and apply to all incoming emails.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Privacy Settings
              </CardTitle>
              <CardDescription>Control how your data is used to improve the service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Share Anonymous Usage Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Help improve our service by sharing anonymized threat detection data
                  </p>
                </div>
                <Switch
                  checked={settings.shareAnonymousData}
                  onCheckedChange={(checked) => updateSetting("shareAnonymousData", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Participate in Improvement Program</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow us to analyze your feedback to enhance threat detection
                  </p>
                </div>
                <Switch
                  checked={settings.improvementProgram}
                  onCheckedChange={(checked) => updateSetting("improvementProgram", checked)}
                />
              </div>

              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  All shared data is anonymized and used solely for improving email security. No personal information or
                  email content is ever shared.
                </AlertDescription>
              </Alert>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Data Management</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    Download My Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    Request Data Deletion
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
