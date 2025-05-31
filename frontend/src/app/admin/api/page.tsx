"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Key, Copy, Eye, EyeOff, Plus, Trash2, Edit, Activity, Book, Play } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Mock data for API keys
const mockApiKeys = [
  {
    id: "1",
    name: "Production API Key",
    key: "pg_live_sk_1234567890abcdef",
    permissions: ["read", "write"],
    rateLimit: "1000/hour",
    lastUsed: "2024-01-15T10:30:00Z",
    status: "active",
    usage: 750,
  },
  {
    id: "2",
    name: "Development Key",
    key: "pg_test_sk_abcdef1234567890",
    permissions: ["read"],
    rateLimit: "100/hour",
    lastUsed: "2024-01-14T15:45:00Z",
    status: "active",
    usage: 45,
  },
  {
    id: "3",
    name: "Analytics Integration",
    key: "pg_live_sk_fedcba0987654321",
    permissions: ["read"],
    rateLimit: "500/hour",
    lastUsed: "2024-01-13T09:20:00Z",
    status: "inactive",
    usage: 0,
  },
]

const apiEndpoints = [
  {
    method: "POST",
    endpoint: "/api/v1/analyze",
    description: "Analyze email content for phishing threats",
    parameters: ["email_content", "headers", "metadata"],
  },
  {
    method: "GET",
    endpoint: "/api/v1/threats",
    description: "Retrieve threat analysis history",
    parameters: ["limit", "offset", "date_range"],
  },
  {
    method: "POST",
    endpoint: "/api/v1/feedback",
    description: "Submit feedback for false positives/negatives",
    parameters: ["threat_id", "feedback_type", "comments"],
  },
  {
    method: "GET",
    endpoint: "/api/v1/stats",
    description: "Get system statistics and metrics",
    parameters: ["period", "granularity"],
  },
]

export default function AdminApiPage() {
  const [apiKeys, setApiKeys] = useState(mockApiKeys)
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState(apiEndpoints[0])
  const [testRequest, setTestRequest] = useState("")
  const [testResponse, setTestResponse] = useState("")

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleCreateApiKey = () => {
    // Handle API key creation
    setIsCreateDialogOpen(false)
  }

  const handleTestEndpoint = () => {
    // Simulate API test
    setTestResponse(`{
  "status": "success",
  "data": {
    "threat_level": "high",
    "confidence": 0.94,
    "reasons": ["Suspicious domain", "Urgency tactics"],
    "analysis_id": "threat_${Date.now()}"
  },
  "timestamp": "${new Date().toISOString()}"
}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">API Management</h1>
        <p className="text-gray-600 mt-2">
          Manage API keys, view documentation, and test endpoints for PhishGuard AI integration.
        </p>
      </div>

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
          <TabsTrigger value="testing">API Testing</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">API Keys</h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>Generate a new API key for accessing PhishGuard AI services.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input id="keyName" placeholder="e.g., Production API Key" />
                  </div>
                  <div>
                    <Label htmlFor="permissions">Permissions</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select permissions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">Read Only</SelectItem>
                        <SelectItem value="write">Read & Write</SelectItem>
                        <SelectItem value="admin">Full Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rateLimit">Rate Limit</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rate limit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100 requests/hour</SelectItem>
                        <SelectItem value="500">500 requests/hour</SelectItem>
                        <SelectItem value="1000">1000 requests/hour</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateApiKey}>Create Key</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <Key className="h-5 w-5 mr-2" />
                        {apiKey.name}
                      </CardTitle>
                      <CardDescription>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={apiKey.status === "active" ? "default" : "secondary"}>{apiKey.status}</Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">API Key</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        value={showKeys[apiKey.id] ? apiKey.key : "••••••••••••••••••••••••••••••••"}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button variant="outline" size="sm" onClick={() => toggleKeyVisibility(apiKey.id)}>
                        {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(apiKey.key)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Permissions</Label>
                      <div className="flex space-x-1 mt-1">
                        {apiKey.permissions.map((permission) => (
                          <Badge key={permission} variant="outline">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Rate Limit</Label>
                      <p className="text-sm text-gray-600 mt-1">{apiKey.rateLimit}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Usage</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {apiKey.usage}/{apiKey.rateLimit.split("/")[0]} requests
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="h-5 w-5 mr-2" />
                API Documentation
              </CardTitle>
              <CardDescription>Complete reference for PhishGuard AI REST API endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Base URL</h3>
                <code className="bg-gray-100 px-3 py-2 rounded text-sm">https://api.phishguard.ai/v1</code>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Authentication</h3>
                <p className="text-gray-600 mb-2">Include your API key in the Authorization header:</p>
                <code className="bg-gray-100 px-3 py-2 rounded text-sm block">Authorization: Bearer YOUR_API_KEY</code>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Endpoints</h3>
                <div className="space-y-4">
                  {apiEndpoints.map((endpoint, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={endpoint.method === "GET" ? "default" : "secondary"}>{endpoint.method}</Badge>
                          <code className="text-sm">{endpoint.endpoint}</code>
                        </div>
                        <p className="text-gray-600 mb-2">{endpoint.description}</p>
                        <div>
                          <Label className="text-sm font-medium">Parameters:</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {endpoint.parameters.map((param) => (
                              <Badge key={param} variant="outline" className="text-xs">
                                {param}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Rate Limiting</h3>
                <p className="text-gray-600">
                  API requests are rate limited based on your subscription plan. Rate limit information is included in
                  response headers:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                  <li>
                    <code>X-RateLimit-Limit</code>: Request limit per hour
                  </li>
                  <li>
                    <code>X-RateLimit-Remaining</code>: Remaining requests
                  </li>
                  <li>
                    <code>X-RateLimit-Reset</code>: Time when limit resets
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="h-5 w-5 mr-2" />
                API Testing Console
              </CardTitle>
              <CardDescription>Test API endpoints directly from the admin interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Select Endpoint</Label>
                <Select
                  value={selectedEndpoint.endpoint}
                  onValueChange={(value) => {
                    const endpoint = apiEndpoints.find((e) => e.endpoint === value)
                    if (endpoint) setSelectedEndpoint(endpoint)
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {apiEndpoints.map((endpoint) => (
                      <SelectItem key={endpoint.endpoint} value={endpoint.endpoint}>
                        {endpoint.method} {endpoint.endpoint}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Request Body</Label>
                <Textarea
                  value={testRequest}
                  onChange={(e) => setTestRequest(e.target.value)}
                  placeholder={`{
  "email_content": "Subject: Urgent Account Verification...",
  "headers": {
    "from": "security@example.com",
    "to": "user@company.com"
  }
}`}
                  rows={8}
                  className="mt-1 font-mono text-sm"
                />
              </div>

              <Button onClick={handleTestEndpoint} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Send Test Request
              </Button>

              {testResponse && (
                <div>
                  <Label className="text-sm font-medium">Response</Label>
                  <Textarea value={testResponse} readOnly rows={8} className="mt-1 font-mono text-sm bg-gray-50" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                API Usage Analytics
              </CardTitle>
              <CardDescription>Monitor API usage patterns and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">2,847</div>
                  <div className="text-sm text-gray-600">Total Requests Today</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">99.2%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">145ms</div>
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">Usage by Endpoint</h4>
                <div className="space-y-3">
                  {apiEndpoints.map((endpoint, index) => {
                    const usage = Math.floor(Math.random() * 1000) + 100
                    const percentage = (usage / 2847) * 100
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{endpoint.method}</Badge>
                          <span className="text-sm font-mono">{endpoint.endpoint}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">{usage}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
