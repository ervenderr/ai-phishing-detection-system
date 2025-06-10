"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, Eye, Upload, Edit } from "lucide-react"

// Mock data for user dashboard
const userStats = {
  totalEmails: 1247,
  threatsBlocked: 23,
  safeEmails: 1224,
  falsePositives: 2,
  protectionRate: 98.2,
}

const recentAlerts = [
  {
    id: "1",
    subject: "Urgent: Verify Your Account",
    sender: "security@fake-bank.com",
    timestamp: "2024-01-15T10:30:00Z",
    threatLevel: "high",
    reason: "Suspicious domain and urgency tactics detected",
    status: "blocked",
  },
  {
    id: "2",
    subject: "Invoice #12345 - Payment Required",
    sender: "billing@suspicious-site.net",
    timestamp: "2024-01-15T09:15:00Z",
    threatLevel: "medium",
    reason: "Unknown sender requesting payment",
    status: "blocked",
  },
  {
    id: "3",
    subject: "Your Package Delivery Update",
    sender: "delivery@legit-courier.com",
    timestamp: "2024-01-15T08:45:00Z",
    threatLevel: "low",
    reason: "Flagged for review - reported as false positive",
    status: "delivered",
  },
]

export default function UserDashboard() {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return date.toLocaleDateString()
  }

  const getThreatIcon = (level: string) => {
    switch (level) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "medium":
        return <Shield className="h-4 w-4 text-yellow-500" />
      case "low":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  const getThreatColor = (level: string) => {
    switch (level) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Protection Dashboard</h1>
        <p className="text-muted-foreground">Your personal email security overview</p>
      </div>

      {/* Protection Status Alert */}
      <Alert className="border-green-200 bg-green-50">
        <Shield className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Protection Active:</strong> Your email is being monitored for phishing threats.{" "}
          {userStats.threatsBlocked} threats blocked in the last 30 days.
        </AlertDescription>
      </Alert>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalEmails.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threats Blocked</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{userStats.threatsBlocked}</div>
            <p className="text-xs text-muted-foreground">Phishing attempts stopped</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safe Emails</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userStats.safeEmails.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Delivered safely</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userStats.protectionRate}%</div>
            <Progress value={userStats.protectionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Security Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Recent Security Alerts
            </CardTitle>
            <CardDescription>Latest threats detected and blocked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className={`p-4 border-l-4 rounded-lg ${getThreatColor(alert.threatLevel)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getThreatIcon(alert.threatLevel)}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 truncate">{alert.subject}</h4>
                        <p className="text-sm text-gray-600 mt-1">From: {alert.sender}</p>
                        <p className="text-sm text-gray-600 mt-1">{alert.reason}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimestamp(alert.timestamp)}
                          </div>
                          <Badge variant={alert.status === "blocked" ? "destructive" : "secondary"} className="text-xs">
                            {alert.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View All Alerts
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Protection Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-500" />
              Protection Summary
            </CardTitle>
            <CardDescription>Your email security status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Real-time Scanning</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">AI Detection</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Enabled
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Link Protection</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Attachment Scanning</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Enabled
              </Badge>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report False Positive
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  View Blocked Messages
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2 text-blue-500" />
            Analyze Email
          </CardTitle>
          <CardDescription>Upload or paste email content for phishing analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Upload className="h-6 w-6" />
              <span>Upload .eml File</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Edit className="h-6 w-6" />
              <span>Analyze Email Content</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Educational Content */}
      <Card>
        <CardHeader>
          <CardTitle>Stay Protected</CardTitle>
          <CardDescription>Tips to enhance your email security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Verify Sender Identity</h4>
              <p className="text-sm text-gray-600">
                Always verify the sender's identity before clicking links or downloading attachments, especially for
                urgent requests.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Check URLs Carefully</h4>
              <p className="text-sm text-gray-600">
                Hover over links to see the actual destination. Be wary of shortened URLs or suspicious domains.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Report Suspicious Emails</h4>
              <p className="text-sm text-gray-600">
                Help improve our protection by reporting false positives and suspicious emails that weren't caught.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
