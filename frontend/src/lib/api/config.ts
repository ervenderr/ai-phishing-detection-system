/**
 * API Configuration
 *
 * This file contains configuration for API requests including:
 * - Base URL for API endpoints
 * - Default headers
 * - Request timeout settings
 */

// Base URL for API requests (can be updated based on environment)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Default request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000;

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// API Endpoints
export const ENDPOINTS = {
  // Analysis endpoints
  SCAN_EMAIL: '/scan-email',
  VERDICT: '/verdict',
  CLASSIFY_TEXT: '/classify-text',
  PARSE_EML: '/parse-eml',
  ANALYZE_URL: '/analyze-url',
  ANALYZE_LINKS: '/analyze-links',

  // Notification endpoints
  NOTIFICATIONS_LIST: '/notifications/list',
  NOTIFICATION_ACTION: '/notifications/action',
  NOTIFICATIONS_ALL: '/notifications/all', // Added endpoint for admin to fetch all notifications
  NOTIFICATIONS_FEEDBACK: '/notifications/feedback', // Added endpoint for admin feedback submission

  // Status endpoint
  STATUS: '/status',
};
