'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Search,
  Eye,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Flag,
  Mail,
  Shield,
  Loader2,
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserMessage {
  id: string;
  subject: string;
  sender: string;
  timestamp: string;
  status: 'blocked' | 'delivered' | 'quarantined';
  verdict: 'safe' | 'suspicious' | 'dangerous' | 'critical';
  confidence: number;
  reasons: string[];
  content: string;
  userReported?: boolean;
  analysisDetails: {
    subjectAnalysis: {
      score: number;
      indicators: string[];
    };
    bodyAnalysis: {
      score: number;
      indicators: string[];
    };
    linkAnalysis: {
      suspiciousLinks: number;
      totalLinks: number;
      details: string[];
    };
    senderAnalysis: {
      domainReputation: string;
      spfStatus: string;
      dkimStatus: string;
    };
  };
}

export default function UserMessagesPage() {
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterThreat, setFilterThreat] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<UserMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock user ID for testing - in a real app, would come from authentication
  const userId = 'user123';

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the notifications API to fetch messages
        const response = await apiService.listNotifications(userId, 20, 0);

        // Transform notifications into the format expected by our component
        const transformedMessages: UserMessage[] = response.notifications.map((notification) => ({
          id: notification.id,
          subject: notification.subject,
          sender: notification.sender,
          timestamp: notification.timestamp,
          status: 'delivered', // Default status - could extend API to include this
          verdict: notification.verdict,
          confidence: notification.risk_score / 100, // Convert score to 0-1 range
          reasons: [notification.description], // Use description as reason
          content: '', // Could add full content from API if needed
          analysisDetails: {
            subjectAnalysis: {
              score: 0.5,
              indicators: [],
            },
            bodyAnalysis: {
              score: 0.5,
              indicators: [],
            },
            linkAnalysis: {
              suspiciousLinks: 0,
              totalLinks: 0,
              details: [],
            },
            senderAnalysis: {
              domainReputation: 'Unknown',
              spfStatus: 'Unknown',
              dkimStatus: 'Unknown',
            },
          },
        }));

        setMessages(transformedMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
        setError('Failed to load messages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || message.status === filterStatus;
    const matchesThreat = filterThreat === 'all' || message.verdict === filterThreat;

    return matchesSearch && matchesStatus && matchesThreat;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'blocked':
        return <Badge variant="destructive">Blocked</Badge>;
      case 'delivered':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Delivered
          </Badge>
        );
      case 'quarantined':
        return <Badge variant="default">Quarantined</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'critical':
        return (
          <Badge variant="destructive" className="bg-red-600">
            Critical
          </Badge>
        );
      case 'dangerous':
        return <Badge variant="destructive">Dangerous</Badge>;
      case 'suspicious':
        return <Badge variant="default">Suspicious</Badge>;
      case 'safe':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Safe
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getThreatIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'safe':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleFalsePositiveReport = (messageId: string, reason: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, userReported: true } : msg))
    );
    // Here you would send the report to the admin system
    console.log('False positive reported:', { messageId, reason });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Messages</h1>
        <p className="text-muted-foreground">View your email security history and report issues</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {messages.filter((m) => m.status === 'blocked').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {messages.filter((m) => m.status === 'delivered').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quarantined</CardTitle>
            <Shield className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {messages.filter((m) => m.status === 'quarantined').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Messages</CardTitle>
          <CardDescription>Search and filter your email history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by subject or sender..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="quarantined">Quarantined</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterThreat} onValueChange={setFilterThreat}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Threat Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="dangerous">Dangerous</SelectItem>
                <SelectItem value="suspicious">Suspicious</SelectItem>
                <SelectItem value="safe">Safe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Message History ({filteredMessages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Threat Level</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getThreatIcon(message.verdict)}
                      <span className="font-medium max-w-xs truncate">{message.subject}</span>
                      {message.userReported && (
                        <div className="flex items-center" title="Reported by user">
                          <Flag className="h-3 w-3 text-blue-500" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{message.sender}</TableCell>
                  <TableCell>{getStatusBadge(message.status)}</TableCell>
                  <TableCell>{getVerdictBadge(message.verdict)}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(message.timestamp).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedMessage(message)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Message Details</DialogTitle>
                          <DialogDescription>
                            View message analysis and report issues
                          </DialogDescription>
                        </DialogHeader>
                        {selectedMessage && (
                          <UserMessageDetailView
                            message={selectedMessage}
                            onReportFalsePositive={handleFalsePositiveReport}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function UserMessageDetailView({
  message,
  onReportFalsePositive,
}: {
  message: UserMessage;
  onReportFalsePositive: (id: string, reason: string) => void;
}) {
  const [reportReason, setReportReason] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);

  const handleReport = () => {
    onReportFalsePositive(message.id, reportReason);
    setShowReportForm(false);
    setReportReason('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Subject</Label>
          <p className="text-lg">{message.subject}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Status</Label>
          <div className="mt-1">
            {message.status === 'blocked' && <Badge variant="destructive">Blocked</Badge>}
            {message.status === 'delivered' && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Delivered
              </Badge>
            )}
            {message.status === 'quarantined' && <Badge variant="default">Quarantined</Badge>}
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Sender</Label>
          <p>{message.sender}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Threat Level</Label>
          <div className="mt-1">
            {message.verdict === 'critical' && (
              <Badge variant="destructive" className="bg-red-600">
                Critical
              </Badge>
            )}
            {message.verdict === 'dangerous' && <Badge variant="destructive">Dangerous</Badge>}
            {message.verdict === 'suspicious' && <Badge variant="default">Suspicious</Badge>}
            {message.verdict === 'safe' && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Safe
              </Badge>
            )}
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Confidence Score</Label>
          <p>{(message.confidence * 100).toFixed(1)}%</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Date</Label>
          <p>{new Date(message.timestamp).toLocaleString()}</p>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-500">Why was this flagged?</Label>
        <ul className="mt-2 space-y-1">
          {message.reasons.map((reason, index) => (
            <li key={index} className="flex items-center text-sm">
              <AlertTriangle className="h-3 w-3 mr-2 text-yellow-500" />
              {reason}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-500">Message Preview</Label>
        <div className="mt-2 p-3 bg-gray-50 rounded border text-sm">{message.content}</div>
      </div>

      {!message.userReported && (
        <div className="border-t pt-4">
          {!showReportForm ? (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowReportForm(true)}>
                <Flag className="h-4 w-4 mr-2" />
                Report as False Positive
              </Button>
              <Button variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report as Missed Threat
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="reportReason">
                  Why do you think this was incorrectly classified?
                </Label>
                <Textarea
                  id="reportReason"
                  placeholder="Please explain why you believe this message was incorrectly flagged..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleReport} disabled={!reportReason.trim()}>
                  Submit Report
                </Button>
                <Button variant="outline" onClick={() => setShowReportForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {message.userReported && (
        <div className="border-t pt-4">
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <Flag className="h-4 w-4" />
            <span>You have reported this message. Thank you for your feedback!</span>
          </div>
        </div>
      )}
    </div>
  );
}
