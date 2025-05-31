'use client';

import { useState, useEffect } from 'react';
import { MessageViewer } from '@/components/message-viewer';
import { apiService } from '@/lib/api';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock user ID for testing - in a real app, would come from authentication
  const userId = 'user123';

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.listNotifications(userId, 50, 0);
        const transformedMessages: UserMessage[] = response.notifications.map((notification) => {
          let status: 'blocked' | 'delivered' | 'quarantined';
          if (notification.verdict === 'critical' || notification.verdict === 'dangerous') {
            status = 'blocked';
          } else if (notification.verdict === 'suspicious') {
            status = 'quarantined';
          } else {
            status = 'delivered';
          }
          return {
            id: notification.id,
            subject: notification.subject,
            sender: notification.sender,
            timestamp: notification.timestamp,
            status,
            verdict: notification.verdict,
            confidence: notification.risk_score / 100,
            reasons: [notification.description],
            content: '',
            analysisDetails: {
              subjectAnalysis: { score: 0.5, indicators: [] },
              bodyAnalysis: { score: 0.5, indicators: [] },
              linkAnalysis: { suspiciousLinks: 0, totalLinks: 0, details: [] },
              senderAnalysis: {
                domainReputation: 'Unknown',
                spfStatus: 'Unknown',
                dkimStatus: 'Unknown',
              },
            },
          };
        });
        setMessages(transformedMessages);
      } catch (e: unknown) {
        setError(
          e instanceof Error ? e.message : 'Failed to load messages. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  // Map UserMessage to MessageViewer's Message type
  const mapToViewerMessage = (msg: UserMessage) => {
    let threatLevel: 'high' | 'medium' | 'low';
    if (msg.verdict === 'critical' || msg.verdict === 'dangerous') {
      threatLevel = 'high';
    } else if (msg.verdict === 'suspicious') {
      threatLevel = 'medium';
    } else {
      threatLevel = 'low';
    }
    // Map status to allowed union type
    const status: 'pending' | 'reviewed' | 'archived' = 'pending';
    return {
      id: msg.id,
      subject: msg.subject,
      sender: msg.sender,
      threatLevel,
      confidence: msg.confidence,
      timestamp: msg.timestamp,
      reasons: msg.reasons,
      status,
    };
  };

  const viewerMessages = messages.map(mapToViewerMessage);

  // Optionally, implement archive/delete handlers
  const handleArchive = async (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };
  const handleDelete = async (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span>Loading...</span>
      </div>
    );
  }
  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Messages</h1>
      <MessageViewer threats={viewerMessages} onArchive={handleArchive} onDelete={handleDelete} />
    </div>
  );
}
