/**
 * API Type Definitions
 *
 * This module contains TypeScript interfaces for API requests and responses.
 */

// Email payload interface
export interface EmailPayload {
  subject: string;
  sender: string;
  recipient: string;
  body: string;
  raw?: string;
  user_id?: string;
}

// Text classification payload
export interface TextPayload {
  text: string;
  context?: string;
}

// URL analysis payload
export interface UrlAnalysisPayload {
  url: string;
}

// Verdict request interface
export interface VerdictRequest {
  email: EmailPayload;
  send_notification?: boolean;
  user_email?: string;
}

// Analysis result interfaces
export interface SubjectAnalysis {
  is_phishing: boolean;
  confidence: number;
  verdict: 'phishing' | 'safe';
  risk_score: number;
}

export interface BodyAnalysis {
  is_phishing: boolean;
  confidence: number;
  verdict: 'phishing' | 'safe';
  risk_score: number;
}

export interface LinkAnalysis {
  urls_found: number;
  has_suspicious_urls: boolean;
  max_risk_score: number;
  results: LinkResult[];
}

export interface LinkResult {
  url: string;
  domain: string;
  risk_score: number;
  is_suspicious: boolean;
  analysis: {
    virustotal: any;
    abuseipdb: any;
    domain_age: any;
  };
}

export interface SenderAnalysis {
  domain: string;
  domain_age: {
    status: string;
    creation_date?: string;
    domain_age_days?: number;
    is_new_domain?: boolean;
    error?: string;
  };
  abuse_report: {
    status: string;
    abuse_score?: number;
    reports_count?: number;
    last_reported_at?: string;
    domain_exists?: boolean;
    error?: string;
  };
}

// Verdict response interface
export interface VerdictResponse {
  verdict: 'safe' | 'suspicious' | 'dangerous' | 'critical';
  risk_score: number;
  description: string;
  recommended_action: string;
  evidence: Evidence[];
  notification: {
    notification_sent: boolean;
    alert_emailed?: boolean;
    notification_id?: string;
    error?: string;
    reason?: string;
  };
  analysis_details: {
    ml_subject_score: number;
    ml_body_score: number;
    link_score: number;
    sender_score: number;
    weights: {
      ml_subject: number;
      ml_body: number;
      link_analysis: number;
      sender_domain: number;
    };
  };
  actionable_insights: ActionableInsight[];
}

export interface Evidence {
  type: 'subject' | 'content' | 'links' | 'sender';
  description: string;
  score: number;
  weight: number;
  suspicious_urls?: string[];
}

export interface ActionableInsight {
  type: 'info' | 'warning' | 'danger';
  message: string;
}

// Notification interfaces
export interface Notification {
  id: string;
  user_id: string;
  timestamp: string;
  read: boolean;
  email_id: string;
  subject: string;
  sender: string;
  verdict: 'safe' | 'suspicious' | 'dangerous' | 'critical';
  risk_score: number;
  description: string;
  action: string;
  color_code: string;
}

export interface NotificationListRequest {
  user_id: string;
  limit?: number;
  offset?: number;
}

export interface NotificationListResponse {
  user_id: string;
  count: number;
  notifications: Notification[];
}

export interface NotificationActionRequest {
  notification_id: string;
  action: 'read' | 'delete';
}

export interface NotificationActionResponse {
  status: 'success' | 'error';
  notification_id: string;
  action: string;
  result: boolean;
}

// Email parsing response
export interface ParsedEmail {
  subject: string;
  from: {
    email: string;
    name: string;
  }[];
  to: {
    email: string;
    name: string;
  }[];
  date: string;
  body: string;
  attachments: string[];
}
