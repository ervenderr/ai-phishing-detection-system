/**
 * API module exports
 *
 * Centralizes API service exports for easier imports throughout the application
 */

export * from './client';
export * from './config';

// Re-export apiService as default for convenient imports
import { apiService } from './client';
export default apiService;
