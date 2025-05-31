/**
 * API Client Service
 *
 * This module provides functions to interact with the backend API.
 * It handles various API calls for email analysis, verdict generation,
 * notification management, and more.
 */

import { API_BASE_URL, DEFAULT_HEADERS, ENDPOINTS, REQUEST_TIMEOUT } from './config';
import type {
  EmailPayload,
  TextPayload,
  VerdictRequest,
  VerdictResponse,
  NotificationListResponse,
  NotificationActionResponse,
  ParsedEmail,
  LinkAnalysis,
} from './types';

/**
 * Base API request function that handles common logic for all API calls
 *
 * @param endpoint - API endpoint path
 * @param options - Fetch API options
 * @returns Promise with response data
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: DEFAULT_HEADERS,
    method: 'GET',
  };

  // Build headers as a plain object, only including string key/values
  const mergedHeaders = Object.assign({}, DEFAULT_HEADERS, options.headers || {});
  // Remove any non-string keys (e.g., accidental array merges)
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(mergedHeaders)) {
    if (typeof value === 'string') headers[key] = value;
  }
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail ?? `API Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${REQUEST_TIMEOUT}ms`);
    }
    throw error;
  }
}

/**
 * API service for interacting with phishing detection endpoints
 */
export const apiService = {
  /**
   * Check the API status
   */
  checkStatus: async () => {
    return apiRequest<{ status: string }>(ENDPOINTS.STATUS);
  },

  /**
   * Scan an email for phishing threats
   *
   * @param emailData - Email data including subject, sender, body
   */
  scanEmail: async (emailData: EmailPayload) => {
    return apiRequest<{
      subject: string;
      sender: string;
      recipient: string;
      verdict: string;
      confidence: number;
      details: {
        subject_analysis: any;
        body_analysis: any;
        links_analysis: any;
        sender_analysis: any;
        combined_risk_score: number;
      };
    }>(ENDPOINTS.SCAN_EMAIL, {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  },

  /**
   * Get a comprehensive verdict for an email
   *
   * @param requestData - Email data and notification preferences
   */
  getVerdict: async (requestData: VerdictRequest) => {
    return apiRequest<VerdictResponse>(ENDPOINTS.VERDICT, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  /**
   * Classify text for phishing indicators
   *
   * @param textData - Text data and optional context
   */
  classifyText: async (textData: TextPayload) => {
    return apiRequest<{
      is_phishing: boolean;
      confidence: number;
      verdict: 'phishing' | 'safe';
      risk_score: number;
      context?: string;
    }>(ENDPOINTS.CLASSIFY_TEXT, {
      method: 'POST',
      body: JSON.stringify(textData),
    });
  },

  /**
   * Parse an EML file
   *
   * @param emlFile - EML file to parse
   */
  parseEmlFile: async (emlFile: File) => {
    const formData = new FormData();
    formData.append('file', emlFile);

    return apiRequest<ParsedEmail>(ENDPOINTS.PARSE_EML, {
      method: 'POST',
      headers: {
        // Don't set Content-Type here, let the browser set it with the boundary for FormData
      },
      body: formData,
    });
  },

  /**
   * Analyze a URL for phishing indicators
   *
   * @param url - URL to analyze
   */
  analyzeUrl: async (url: string) => {
    return apiRequest<{
      url: string;
      domain: string;
      risk_score: number;
      is_suspicious: boolean;
      analysis: {
        virustotal: any;
        abuseipdb: any;
        domain_age: any;
      };
    }>(ENDPOINTS.ANALYZE_URL, {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },

  /**
   * Extract and analyze links from text
   *
   * @param text - Text containing URLs to analyze
   */
  analyzeLinks: async (text: string) => {
    return apiRequest<LinkAnalysis>(ENDPOINTS.ANALYZE_LINKS, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  /**
   * List notifications for a user
   *
   * @param userId - User ID
   * @param limit - Maximum number of notifications to return
   * @param offset - Offset for pagination
   */
  listNotifications: async (userId: string, limit = 10, offset = 0) => {
    return apiRequest<NotificationListResponse>(ENDPOINTS.NOTIFICATIONS_LIST, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, limit, offset }),
    });
  },

  /**
   * Perform an action on a notification (mark as read, delete)
   *
   * @param notificationId - Notification ID
   * @param action - Action to perform ('read' or 'delete')
   */
  notificationAction: async (notificationId: string, action: 'read' | 'delete') => {
    return apiRequest<NotificationActionResponse>(ENDPOINTS.NOTIFICATION_ACTION, {
      method: 'POST',
      body: JSON.stringify({ notification_id: notificationId, action }),
    });
  },

  /**
   * List all notifications (admin)
   *
   * @returns All notifications in the system
   */
  listAllNotifications: async () => {
    return apiRequest<NotificationListResponse>(ENDPOINTS.NOTIFICATIONS_ALL, {
      method: 'GET',
    });
  },

  /**
   * Submit admin feedback for a notification
   *
   * @param notificationId - Notification ID
   * @param feedback - Feedback type ('true_positive', 'false_positive', 'needs_review')
   * @param notes - Optional admin notes
   */
  submitAdminFeedback: async (
    notificationId: string,
    feedback: 'true_positive' | 'false_positive' | 'needs_review',
    notes?: string
  ) => {
    return apiRequest<{
      status: string;
      notification_id: string;
      feedback: string;
      notes?: string;
    }>(ENDPOINTS.NOTIFICATIONS_FEEDBACK, {
      method: 'POST',
      body: JSON.stringify({ notification_id: notificationId, feedback, notes }),
    });
  },
};
