"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  MessageCircle,
  CheckCircle,
  X,
  AlertTriangle,
  Download,
  Tag,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
} from "lucide-react"

interface FeedbackItem {
  id: string
  type: "false_positive" | "false_negative" | "suggestion" | "bug_report"
  status: "pending" | "reviewed" | "implemented" | "rejected"
  messageId: string
  subject: string
  sender: string
  recipient: string
  submittedBy: string
  submittedAt: string
  originalVerdict: "safe" | "suspicious" | "dangerous" | "critical"
  userComment: string
  adminNotes?: string
  tags: string[]
}

const mockFeedback: FeedbackItem[] = [
  {
    id: "1",
    type: "false_positive",
    status: "pending",
    messageId: "msg_001",
    subject: "Your Package Delivery Update",
    sender: "delivery@legit-courier.com",
    recipient: "user@company.com",
    submittedBy: "John Doe",
    submittedAt: "2024-01-15T10:30:00Z",
    originalVerdict: "dangerous",
    userComment: "This is a legitimate email from our courier service. We use them regularly.",
    tags: ["delivery", "courier"],
  },
  {
    id: "2",
    type: "false_negative",
    status: "reviewed",
    messageId: "msg_002",
    subject: "Urgent: Verify Your Account",
    sender: "security@fake-bank.com",
    recipient: "finance@company.com",
    submittedBy: "Sarah Johnson",
    submittedAt: "2024-01-14T15:45:00Z",
    originalVerdict: "safe",
    userComment: "This email was marked safe but is clearly a phishing attempt.",
    adminNotes: "Confirmed phishing attempt. Model updated to detect similar patterns.",
    tags: ["banking", "phishing", "urgent"],
  },
  {
    id: "3",
    type: "suggestion",
    status: "implemented",
    messageId: "",
    subject: "Feature Request: Bulk Analysis",
    sender: "",
    recipient: "",
    submittedBy: "Mike Chen",
    submittedAt: "2024-01-13T09:20:00Z",
    originalVerdict: "safe",
    userComment: "It would be helpful to analyze multiple emails at once.",
    adminNotes: "Implemented in v2.1.0",
    tags: ["feature", "bulk", "analysis"],
  },
  {
    id: "4",
    type: "bug_report",
    status: "pending",
    messageId: "msg_004",
    subject: "Weekly Newsletter",
    sender: "newsletter@company.com",
    recipient: "user2@company.com",
    submittedBy: "Lisa Wong",
    submittedAt: "2024-01-15T08:15:00Z",
    originalVerdict: "suspicious",
    userComment: "Internal company newsletter is being flagged as suspicious.",
    tags: ["internal", "newsletter"],
  },
]

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState(mockFeedback)
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

  const filteredFeedback = feedback.filter((item) => {
    const matchesSearch =
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userComment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || item.type === filterType
    const matchesStatus = filterStatus === "all" || item.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const feedbackStats = {
    total: feedback.length,
    pending: feedback.filter((item) => item.status === "pending").length,
    falsePositives: feedback.filter((item) => item.type === "false_positive").length,
    falseNegatives: feedback.filter((item) => item.type === "false_negative").length,
    suggestions: feedback.filter((item) => item.type === "suggestion").length,
    bugReports: feedback.filter((item) => item.type === "bug_report").length,
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "false_positive":
        return <Badge variant="destructive">False Positive</Badge>
      case "false_negative":
        return <Badge variant="default">False Negative</Badge>
      case "suggestion":
        return <Badge variant="secondary">Suggestion</Badge>
      case "bug_report":
        return <Badge variant="outline">Bug Report</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "reviewed":
        return <Badge variant="secondary">Reviewed</Badge>
      case "implemented":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Implemented
          </Badge>
        )
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case "critical":
        return (
          <Badge variant="destructive" className="bg-red-600">
            Critical
          </Badge>
        )
      case "dangerous":
        return <Badge variant="destructive">Dangerous</Badge>
      case "suspicious":
        return <Badge variant="default">Suspicious</Badge>
      case "safe":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Safe
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const updateFeedbackStatus = (id: string, status: "pending" | "reviewed" | "implemented" | "rejected") => {
    setFeedback((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)))
  }

  const updateFeedbackNotes = (id: string, notes: string) => {
    setFeedback((prev) => prev.map((item) => (item.id === id ? { ...item, adminNotes: notes } : item)))
  }

  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feedback Management</h1>
        <p className="text-muted-foreground">Review and process user feedback to improve the system</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{feedbackStats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">False Positives</CardTitle>
            <ThumbsDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{feedbackStats.falsePositives}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">False Negatives</CardTitle>
            <ThumbsUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{feedbackStats.falseNegatives}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suggestions</CardTitle>
            <MessageCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{feedbackStats.suggestions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bug Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{feedbackStats.bugReports}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Feedback</TabsTrigger>
          <TabsTrigger value="false_positives">False Positives</TabsTrigger>
          <TabsTrigger value="false_negatives">False Negatives</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search feedback..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="false_positive">False Positives</SelectItem>
                    <SelectItem value="false_negative">False Negatives</SelectItem>
                    <SelectItem value="suggestion">Suggestions</SelectItem>
                    <SelectItem value="bug_report">Bug Reports</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="implemented">Implemented</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{selectedItems.length} item(s) selected</span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Tag className="h-4 w-4 mr-2" />
                      Tag Selected
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Selected
                    </Button>
                    <Button variant="outline" size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Reviewed
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback Table */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback Items ({filteredFeedback.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Original Verdict</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedback.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => toggleItemSelection(item.id)}
                        />
                      </TableCell>
                      <TableCell>{getTypeBadge(item.type)}</TableCell>
                      <TableCell className="font-medium max-w-xs truncate">{item.subject || "No subject"}</TableCell>
                      <TableCell>{item.submittedBy}</TableCell>
                      <TableCell>{getVerdictBadge(item.originalVerdict)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{formatDate(item.submittedAt)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedFeedback(item)}>
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Feedback Details</DialogTitle>
                                <DialogDescription>Review and process feedback</DialogDescription>
                              </DialogHeader>
                              {selectedFeedback && (
                                <FeedbackDetailView
                                  feedback={selectedFeedback}
                                  onUpdateStatus={(status) => updateFeedbackStatus(selectedFeedback.id, status)}
                                  onUpdateNotes={(notes) => updateFeedbackNotes(selectedFeedback.id, notes)}
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="false_positives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>False Positive Reports</CardTitle>
              <CardDescription>
                Messages that were flagged as threats but reported as legitimate by users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead>Original Verdict</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedback
                    .filter((item) => item.type === "false_positive")
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.subject}</TableCell>
                        <TableCell>{item.sender}</TableCell>
                        <TableCell>{getVerdictBadge(item.originalVerdict)}</TableCell>
                        <TableCell>{item.submittedBy}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Select
                              value={item.status}
                              onValueChange={(value: "pending" | "reviewed" | "implemented" | "rejected") =>
                                updateFeedbackStatus(item.id, value)
                              }
                            >
                              <SelectTrigger className="w-[120px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="reviewed">Reviewed</SelectItem>
                                <SelectItem value="implemented">Implemented</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="false_negatives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>False Negative Reports</CardTitle>
              <CardDescription>Messages that were marked as safe but reported as threats by users</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead>Original Verdict</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedback
                    .filter((item) => item.type === "false_negative")
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.subject}</TableCell>
                        <TableCell>{item.sender}</TableCell>
                        <TableCell>{getVerdictBadge(item.originalVerdict)}</TableCell>
                        <TableCell>{item.submittedBy}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Select
                              value={item.status}
                              onValueChange={(value: "pending" | "reviewed" | "implemented" | "rejected") =>
                                updateFeedbackStatus(item.id, value)
                              }
                            >
                              <SelectTrigger className="w-[120px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="reviewed">Reviewed</SelectItem>
                                <SelectItem value="implemented">Implemented</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Suggestions & Bug Reports</CardTitle>
              <CardDescription>User-submitted ideas and issues</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedback
                    .filter((item) => item.type === "suggestion" || item.type === "bug_report")
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{getTypeBadge(item.type)}</TableCell>
                        <TableCell className="font-medium">{item.subject || item.userComment.slice(0, 50)}</TableCell>
                        <TableCell>{item.submittedBy}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>{formatDate(item.submittedAt)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Select
                              value={item.status}
                              onValueChange={(value: "pending" | "reviewed" | "implemented" | "rejected") =>
                                updateFeedbackStatus(item.id, value)
                              }
                            >
                              <SelectTrigger className="w-[120px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="reviewed">Reviewed</SelectItem>
                                <SelectItem value="implemented">Implemented</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Analytics</CardTitle>
              <CardDescription>Insights from user feedback to improve the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Feedback by Type</h3>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border">
                    <p className="text-gray-500">Pie chart visualization would appear here</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Feedback Over Time</h3>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border">
                    <p className="text-gray-500">Line chart visualization would appear here</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Common Tags</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className="px-3 py-1">phishing (23)</Badge>
                  <Badge className="px-3 py-1">banking (18)</Badge>
                  <Badge className="px-3 py-1">urgent (15)</Badge>
                  <Badge className="px-3 py-1">delivery (12)</Badge>
                  <Badge className="px-3 py-1">internal (10)</Badge>
                  <Badge className="px-3 py-1">feature (8)</Badge>
                  <Badge className="px-3 py-1">bug (7)</Badge>
                  <Badge className="px-3 py-1">newsletter (6)</Badge>
                  <Badge className="px-3 py-1">invoice (5)</Badge>
                  <Badge className="px-3 py-1">account (5)</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Model Improvement Recommendations</h3>
                <div className="space-y-2">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Improve detection of legitimate delivery emails</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Based on 12 false positive reports related to delivery notifications.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Enhance detection of spoofed internal emails</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Based on 8 false negative reports of emails appearing to come from internal domains.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Add bulk analysis feature</h4>
                    <p className="text-sm text-gray-600 mt-1">Requested by 5 different users in feature suggestions.</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Export Analytics Report
                </Button>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function FeedbackDetailView({
  feedback,
  onUpdateStatus,
  onUpdateNotes,
}: {
  feedback: FeedbackItem
  onUpdateStatus: (status: "pending" | "reviewed" | "implemented" | "rejected") => void
  onUpdateNotes: (notes: string) => void
}) {
  const [adminNotes, setAdminNotes] = useState(feedback.adminNotes || "")
  const [tags, setTags] = useState<string[]>(feedback.tags || [])
  const [newTag, setNewTag] = useState("")

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case "critical":
        return (
          <Badge variant="destructive" className="bg-red-600">
            Critical
          </Badge>
        )
      case "dangerous":
        return <Badge variant="destructive">Dangerous</Badge>
      case "suspicious":
        return <Badge variant="default">Suspicious</Badge>
      case "safe":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Safe
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Feedback Type</Label>
          <p className="text-lg font-medium">
            {feedback.type === "false_positive"
              ? "False Positive Report"
              : feedback.type === "false_negative"
                ? "False Negative Report"
                : feedback.type === "suggestion"
                  ? "Feature Suggestion"
                  : "Bug Report"}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Status</Label>
          <div className="mt-1">
            <Select
              value={feedback.status}
              onValueChange={(value: "pending" | "reviewed" | "implemented" | "rejected") => onUpdateStatus(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="implemented">Implemented</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Submitted By</Label>
          <p>{feedback.submittedBy}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Submission Date</Label>
          <p>{new Date(feedback.submittedAt).toLocaleString()}</p>
        </div>
      </div>

      {(feedback.type === "false_positive" || feedback.type === "false_negative") && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Subject</Label>
              <p className="text-lg">{feedback.subject}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Original Verdict</Label>
              <div className="mt-1">{getVerdictBadge(feedback.originalVerdict)}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Sender</Label>
              <p>{feedback.sender}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Recipient</Label>
              <p>{feedback.recipient}</p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-500">Message ID</Label>
            <p className="font-mono text-sm">{feedback.messageId}</p>
          </div>
        </div>
      )}

      <div>
        <Label className="text-sm font-medium text-gray-500">User Comment</Label>
        <div className="mt-2 p-3 bg-gray-50 rounded border">{feedback.userComment}</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adminNotes">Admin Notes</Label>
        <Textarea
          id="adminNotes"
          placeholder="Add notes about this feedback..."
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="flex items-center gap-1 px-3 py-1">
              {tag}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
          />
          <Button type="button" onClick={handleAddTag} variant="outline">
            Add
          </Button>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline">View Original Message</Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => onUpdateNotes(adminNotes)}>
            Save Notes
          </Button>
          <Button onClick={() => onUpdateStatus("reviewed")}>Mark as Reviewed</Button>
        </div>
      </div>
    </div>
  )
}
