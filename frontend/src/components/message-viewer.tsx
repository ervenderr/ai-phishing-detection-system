'use client';

import { useState } from 'react';
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
  Search,
  AlertTriangle,
  CheckCircle,
  Shield,
  Eye,
  Download,
  Archive,
  Trash2,
  Calendar,
} from 'lucide-react';
import { apiService } from '@/lib/api';

interface Message {
  id: string;
  subject: string;
  sender: string;
  threatLevel: string; // "high", "medium", "low" for UI
  confidence: number;
  timestamp: string;
  reasons: string[];
  status: 'pending' | 'reviewed' | 'archived';
}

interface MessageViewerProps {
  threats: Message[];
  onArchive?: (messageId: string) => Promise<void>;
  onDelete?: (messageId: string) => Promise<void>;
}

export function MessageViewer({ threats, onArchive, onDelete }: MessageViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [actionInProgress, setActionInProgress] = useState<Record<string, boolean>>({});

  const filteredMessages = threats.filter((message) => {
    const matchesSearch =
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || message.threatLevel === filterLevel;
    const matchesStatus = filterStatus === 'all' || message.status === filterStatus;

    return matchesSearch && matchesLevel && matchesStatus;
  });

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getThreatIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Shield className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const toggleMessageSelection = (messageId: string) => {
    setSelectedMessages((prev) =>
      prev.includes(messageId) ? prev.filter((id) => id !== messageId) : [...prev, messageId]
    );
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleArchive = async (messageId: string) => {
    if (!onArchive) return;

    setActionInProgress((prev) => ({ ...prev, [messageId]: true }));
    try {
      await onArchive(messageId);
      // The parent component should handle updating the messages list
    } catch (error) {
      console.error('Error archiving message:', error);
    } finally {
      setActionInProgress((prev) => ({ ...prev, [messageId]: false }));
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!onDelete) return;

    setActionInProgress((prev) => ({ ...prev, [messageId]: true }));
    try {
      await onDelete(messageId);
      // The parent component should handle updating the messages list
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setActionInProgress((prev) => ({ ...prev, [messageId]: false }));
    }
  };

  const handleBulkAction = async (action: 'archive' | 'delete') => {
    if (selectedMessages.length === 0) return;

    const actionMethod = action === 'archive' ? onArchive : onDelete;
    if (!actionMethod) return;

    // Mark all selected messages as being processed
    const inProgressUpdates = selectedMessages.reduce(
      (acc, id) => ({
        ...acc,
        [id]: true,
      }),
      {}
    );
    setActionInProgress((prev) => ({ ...prev, ...inProgressUpdates }));

    try {
      // Process messages in sequence
      for (const messageId of selectedMessages) {
        await actionMethod(messageId);
      }
      // Clear selection after successful operation
      setSelectedMessages([]);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
    } finally {
      // Reset in-progress status
      const completedUpdates = selectedMessages.reduce(
        (acc, id) => ({
          ...acc,
          [id]: false,
        }),
        {}
      );
      setActionInProgress((prev) => ({ ...prev, ...completedUpdates }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Message Analysis History
          </CardTitle>
          <CardDescription>
            Review and manage analyzed messages and threat detections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
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
              <span className="text-sm text-gray-600">
                {selectedMessages.length} message(s) selected
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('archive')}
                  disabled={!onArchive}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button variant="outline" size="sm" disabled={true}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  disabled={!onDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages found matching your criteria</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedMessages.includes(message.id)}
                      onChange={() => toggleMessageSelection(message.id)}
                      className="mt-1"
                    />

                    <div className={`p-2 rounded-full ${getThreatColor(message.threatLevel)}`}>
                      {getThreatIcon(message.threatLevel)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 truncate">{message.subject}</h4>
                          <p className="text-sm text-gray-600 mt-1">From: {message.sender}</p>

                          <div className="flex items-center space-x-4 mt-2">
                            <Badge
                              variant={
                                message.threatLevel === 'high'
                                  ? 'destructive'
                                  : message.threatLevel === 'medium'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {message.threatLevel.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Confidence: {(message.confidence * 100).toFixed(1)}%
                            </span>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatTimestamp(message.timestamp)}
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-1">Detection reasons:</p>
                            <div className="flex flex-wrap gap-1">
                              {message.reasons.slice(0, 3).map((reason, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {reason}
                                </Badge>
                              ))}
                              {message.reasons.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{message.reasons.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {onArchive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleArchive(message.id)}
                              disabled={actionInProgress[message.id]}
                            >
                              {actionInProgress[message.id] ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-gray-400" />
                              ) : (
                                <Archive className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredMessages.length > 0 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <span className="text-sm text-gray-600">Page 1 of 1</span>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
