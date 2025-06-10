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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, Eye, CheckCircle, Calendar, Download, Archive } from "lucide-react"

interface Message {
  id: string
  subject: string
  sender: string
  recipient: string
  threatLevel: "high" | "medium" | "low"
  confidence: number
  timestamp: string
  status: "pending" | "reviewed" | "archived"
  feedback?: "true_positive" | "false_positive" | "needs_review"
  adminNotes?: string
}

const mockMessages: Message[] = [
  {
    id: "1",
    subject: "Urgent: Verify Your Account",
    sender: "security@fake-bank.com",
    recipient: "user@company.com",
    threatLevel: "high",
    confidence: 0.94,
    timestamp: "2024-01-15T10:30:00Z",
    status: "pending",
  },
  {
    id: "2",
    subject: "Invoice #12345 - Payment Required",
    sender: "billing@suspicious-site.net",
    recipient: "finance@company.com",
    threatLevel: "medium",
    confidence: 0.76,
    timestamp: "2024-01-15T09:15:00Z",
    status: "reviewed",
    feedback: "true_positive",
    adminNotes: "Confirmed phishing attempt targeting financial information",
  },
  {
    id: "3",
    subject: "Your Package Delivery Update",
    sender: "delivery@legit-courier.com",
    recipient: "user2@company.com",
    threatLevel: "low",
    confidence: 0.23,
    timestamp: "2024-01-15T08:45:00Z",
    status: "reviewed",
    feedback: "false_positive",
    adminNotes: "Legitimate delivery notification, update whitelist",
  },
]

export default function MessagesPage() {
  const [messages, setMessages] = useState(mockMessages)
  const [selectedMessages, setSelectedMessages] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLevel, setFilterLevel] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [feedbackDialog, setFeedbackDialog] = useState(false)

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.recipient.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = filterLevel === "all" || message.threatLevel === filterLevel
    const matchesStatus = filterStatus === "all" || message.status === filterStatus

    return matchesSearch && matchesLevel && matchesStatus
  })

  const handleFeedback = (
    messageId: string,
    feedback: "true_positive" | "false_positive" | "needs_review",
    notes: string,
  ) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, feedback, adminNotes: notes, status: "reviewed" as const } : msg,
      ),
    )
    setFeedbackDialog(false)
    setSelectedMessage(null)
  }

  const getThreatBadge = (level: string) => {
    switch (level) {
      case "high":
        return <Badge variant="destructive">High Risk</Badge>
      case "medium":
        return <Badge variant="default">Medium Risk</Badge>
      case "low":
        return <Badge variant="secondary">Low Risk</Badge>
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
      case "archived":
        return <Badge variant="secondary">Archived</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getFeedbackBadge = (feedback?: string) => {
    switch (feedback) {
      case "true_positive":
        return (
          <Badge variant="destructive" className="text-xs">
            True Positive
          </Badge>
        )
      case "false_positive":
        return (
          <Badge variant="secondary" className="text-xs">
            False Positive
          </Badge>
        )
      case "needs_review":
        return (
          <Badge variant="default" className="text-xs">
            Needs Review
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Message Management</h1>
        <p className="text-muted-foreground">Review and manage flagged phishing messages</p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Messages</CardTitle>
          <CardDescription>Search and filter flagged messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by subject, sender, or recipient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Threat Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
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
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedMessages.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{selectedMessages.length} message(s) selected</span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Selected
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Flagged Messages ({filteredMessages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Threat Level</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedMessages.includes(message.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMessages([...selectedMessages, message.id])
                        } else {
                          setSelectedMessages(selectedMessages.filter((id) => id !== message.id))
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-xs truncate">{message.subject}</TableCell>
                  <TableCell className="max-w-xs truncate">{message.sender}</TableCell>
                  <TableCell className="max-w-xs truncate">{message.recipient}</TableCell>
                  <TableCell>{getThreatBadge(message.threatLevel)}</TableCell>
                  <TableCell>{(message.confidence * 100).toFixed(1)}%</TableCell>
                  <TableCell>{getStatusBadge(message.status)}</TableCell>
                  <TableCell>{getFeedbackBadge(message.feedback)}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(message.timestamp).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedMessage(message)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Message Details</DialogTitle>
                            <DialogDescription>Review message content and provide feedback</DialogDescription>
                          </DialogHeader>
                          {selectedMessage && (
                            <MessageDetailView message={selectedMessage} onFeedback={handleFeedback} />
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
    </div>
  )
}

function MessageDetailView({
  message,
  onFeedback,
}: {
  message: Message
  onFeedback: (id: string, feedback: "true_positive" | "false_positive" | "needs_review", notes: string) => void
}) {
  const [feedback, setFeedback] = useState<"true_positive" | "false_positive" | "needs_review">("true_positive")
  const [notes, setNotes] = useState(message.adminNotes || "")

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Subject</Label>
          <p className="text-lg">{message.subject}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Threat Level</Label>
          <div className="mt-1">
            {message.threatLevel === "high" && <Badge variant="destructive">High Risk</Badge>}
            {message.threatLevel === "medium" && <Badge variant="default">Medium Risk</Badge>}
            {message.threatLevel === "low" && <Badge variant="secondary">Low Risk</Badge>}
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Sender</Label>
          <p>{message.sender}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Confidence</Label>
          <p>{(message.confidence * 100).toFixed(1)}%</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Recipient</Label>
          <p>{message.recipient}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Date</Label>
          <p>{new Date(message.timestamp).toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Provide Feedback</Label>
          <Select
            value={feedback}
            onValueChange={(value: "true_positive" | "false_positive" | "needs_review") => setFeedback(value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true_positive">True Positive - Confirmed Threat</SelectItem>
              <SelectItem value="false_positive">False Positive - Safe Message</SelectItem>
              <SelectItem value="needs_review">Needs Further Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="notes" className="text-sm font-medium">
            Admin Notes
          </Label>
          <Textarea
            id="notes"
            placeholder="Add notes about this message..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-2"
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={() => onFeedback(message.id, feedback, notes)}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Submit Feedback
          </Button>
          <Button variant="outline">
            <Archive className="h-4 w-4 mr-2" />
            Archive Message
          </Button>
        </div>
      </div>
    </div>
  )
}
