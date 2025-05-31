"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Shield, CheckCircle, Clock, Search, Eye, Bell } from "lucide-react"

interface UserAlert {
  id: string
  type: "threat_blocked" | "suspicious_activity" | "system_update" | "false_positive"
  title: string
  message: string
  timestamp: string
  severity: "high" | "medium" | "low" | "info"
  read: boolean
  relatedMessageId?: string
}

const mockAlerts: UserAlert[] = [
  {
    id: "1",
    type: "threat_blocked",
    title: "High-Risk Phishing Email Blocked",
    message:
      "We blocked a dangerous phishing email from 'security@fake-bank.com' that was trying to steal your credentials.",
    timestamp: "2024-01-15T10:30:00Z",
    severity: "high",
    read: false,
    relatedMessageId: "msg_001",
  },
  {
    id: "2",
    type: "suspicious_activity",
    title: "Multiple Suspicious Emails Detected",
    message:
      "We've detected 3 suspicious emails from the same domain in the last hour. All have been quarantined for review.",
    timestamp: "2024-01-15T09:15:00Z",
    severity: "medium",
    read: false,
  },
  {
    id: "3",
    type: "system_update",
    title: "Protection System Updated",
    message: "Your email protection has been enhanced with improved AI detection capabilities.",
    timestamp: "2024-01-14T16:00:00Z",
    severity: "info",
    read: true,
  },
  {
    id: "4",
    type: "false_positive",
    title: "False Positive Report Processed",
    message: "Thank you for reporting a false positive. We've updated our filters to prevent similar issues.",
    timestamp: "2024-01-14T14:30:00Z",
    severity: "low",
    read: true,
  },
]

export default function UserAlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || alert.type === filterType
    const matchesSeverity = filterSeverity === "all" || alert.severity === filterSeverity
    const matchesRead = !showUnreadOnly || !alert.read

    return matchesSearch && matchesType && matchesSeverity && matchesRead
  })

  const markAsRead = (alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, read: true } : alert)))
  }

  const markAllAsRead = () => {
    setAlerts((prev) => prev.map((alert) => ({ ...alert, read: true })))
  }

  const getAlertIcon = (type: string, severity: string) => {
    switch (type) {
      case "threat_blocked":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "suspicious_activity":
        return <Shield className="h-5 w-5 text-yellow-500" />
      case "system_update":
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case "false_positive":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-l-red-500 bg-red-50"
      case "medium":
        return "border-l-yellow-500 bg-yellow-50"
      case "low":
        return "border-l-blue-500 bg-blue-50"
      case "info":
        return "border-l-gray-500 bg-gray-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge variant="default">Medium</Badge>
      case "low":
        return <Badge variant="secondary">Low</Badge>
      case "info":
        return <Badge variant="outline">Info</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
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

  const unreadCount = alerts.filter((alert) => !alert.read).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Alerts</h1>
          <p className="text-muted-foreground">Stay informed about your email security</p>
        </div>
        {unreadCount > 0 && <Button onClick={markAllAsRead}>Mark All as Read ({unreadCount})</Button>}
      </div>

      {/* Alert Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threats Blocked</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {alerts.filter((a) => a.type === "threat_blocked").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Updates</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {alerts.filter((a) => a.type === "system_update").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Alerts</CardTitle>
          <CardDescription>Search and filter your security alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Alert Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="threat_blocked">Threats Blocked</SelectItem>
                <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                <SelectItem value="system_update">System Updates</SelectItem>
                <SelectItem value="false_positive">False Positives</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>

            <Button variant={showUnreadOnly ? "default" : "outline"} onClick={() => setShowUnreadOnly(!showUnreadOnly)}>
              Unread Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts ({filteredAlerts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No alerts found matching your criteria</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border-l-4 rounded-lg ${getSeverityColor(alert.severity)} ${
                    !alert.read ? "border-2 border-blue-200" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getAlertIcon(alert.type, alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`font-medium ${!alert.read ? "font-semibold" : ""}`}>{alert.title}</h4>
                          {!alert.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimestamp(alert.timestamp)}
                          </div>
                          {getSeverityBadge(alert.severity)}
                          <Badge variant="outline" className="text-xs">
                            {alert.type.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {alert.relatedMessageId && (
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {!alert.read && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(alert.id)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Security Tips</CardTitle>
          <CardDescription>Stay safe with these email security best practices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Always verify sender identity</strong> before clicking links or downloading attachments,
                especially for urgent requests.
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Report suspicious emails</strong> that weren't caught by our system to help improve protection
                for everyone.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
