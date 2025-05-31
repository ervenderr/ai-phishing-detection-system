"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, AlertTriangle, CheckCircle, X, Settings, Shield, Clock } from "lucide-react"

interface Notification {
  id: string
  type: "threat" | "system" | "update"
  title: string
  message: string
  timestamp: string
  read: boolean
  severity: "low" | "medium" | "high"
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "threat",
    title: "High-Risk Phishing Attempt Detected",
    message: 'Email from "security@fake-bank.com" flagged as high-risk phishing attempt targeting user credentials.',
    timestamp: "2024-01-15T10:30:00Z",
    read: false,
    severity: "high",
  },
  {
    id: "2",
    type: "system",
    title: "ML Model Updated",
    message: "Phishing detection model has been updated with new training data. Accuracy improved to 97.8%.",
    timestamp: "2024-01-15T09:15:00Z",
    read: false,
    severity: "medium",
  },
  {
    id: "3",
    type: "threat",
    title: "Suspicious Domain Activity",
    message: 'Multiple emails detected from recently registered domain "suspicious-site.net".',
    timestamp: "2024-01-15T08:45:00Z",
    read: true,
    severity: "medium",
  },
  {
    id: "4",
    type: "update",
    title: "Weekly Security Report Available",
    message: "Your weekly phishing detection summary is ready for review.",
    timestamp: "2024-01-15T08:00:00Z",
    read: true,
    severity: "low",
  },
]

export function NotificationPanel() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [settings, setSettings] = useState({
    emailAlerts: true,
    pushNotifications: true,
    highRiskOnly: false,
    weeklyReports: true,
  })

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const getNotificationIcon = (type: string, severity: string) => {
    if (type === "threat") {
      return severity === "high" ? (
        <AlertTriangle className="h-5 w-5 text-red-500" />
      ) : (
        <Shield className="h-5 w-5 text-yellow-500" />
      )
    }
    if (type === "system") {
      return <Settings className="h-5 w-5 text-blue-500" />
    }
    return <Bell className="h-5 w-5 text-gray-500" />
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-l-red-500 bg-red-50"
      case "medium":
        return "border-l-yellow-500 bg-yellow-50"
      case "low":
        return "border-l-blue-500 bg-blue-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Notification Settings
          </CardTitle>
          <CardDescription>Configure how you want to receive security alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-alerts">Email Alerts</Label>
              <Switch
                id="email-alerts"
                checked={settings.emailAlerts}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emailAlerts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, pushNotifications: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="high-risk-only">High Risk Only</Label>
              <Switch
                id="high-risk-only"
                checked={settings.highRiskOnly}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, highRiskOnly: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="weekly-reports">Weekly Reports</Label>
              <Switch
                id="weekly-reports"
                checked={settings.weeklyReports}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, weeklyReports: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Recent Notifications
            </div>
            <Badge variant="secondary">{notifications.filter((n) => !n.read).length} unread</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications at this time</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 rounded-lg ${getSeverityColor(notification.severity)} ${
                    !notification.read ? "border-2 border-blue-200" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getNotificationIcon(notification.type, notification.severity)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimestamp(notification.timestamp)}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {notification.type}
                          </Badge>
                          <Badge
                            variant={notification.severity === "high" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {notification.severity}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => dismissNotification(notification.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="flex justify-center mt-6">
              <Button variant="outline">Load More Notifications</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
