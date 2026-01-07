/**
 * API Utilities
 * Helper functions for API responses, error handling, and data transformation
 * Following DRY and KISS principles
 */

import type { ApiResponse, PaginatedResponse, ValidationError } from "./api-types";
import { ApiClientError } from "./api-client";

// ============================================
// RESPONSE HELPERS
// ============================================

/**
 * Check if API response was successful
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true } {
  return response.success === true;
}

/**
 * Extract data from API response safely
 */
export function extractData<T>(response: ApiResponse<T>): T | null {
  if (isSuccessResponse(response) && response.data) {
    return response.data;
  }
  return null;
}

/**
 * Extract paginated data
 */
export function extractPaginatedData<T>(response: PaginatedResponse<T>): T[] {
  return response.data || [];
}

/**
 * Get pagination meta information
 */
export function getPaginationMeta(response: PaginatedResponse<any>) {
  return response.meta || { current_page: 1, per_page: 15, total: 0 };
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Convert API error to user-friendly message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Get first validation error message
 */
export function getFirstValidationError(error: unknown): string {
  if (error instanceof ApiClientError && error.isValidationError) {
    return error.getFirstError();
  }
  return getErrorMessage(error);
}

/**
 * Extract all validation errors
 */
export function getValidationErrors(error: unknown): ValidationError[] {
  if (error instanceof ApiClientError && error.isValidationError) {
    const errors = error.getValidationErrors();
    return Object.entries(errors).map(([field, messages]) => ({
      field,
      messages,
    }));
  }
  return [];
}

/**
 * Format validation errors for form display
 */
export function formatValidationErrors(error: unknown): Record<string, string> {
  const validationErrors = getValidationErrors(error);
  const formatted: Record<string, string> = {};

  validationErrors.forEach(({ field, messages }) => {
    formatted[field] = messages[0] || "";
  });

  return formatted;
}

/**
 * Check if error is authentication related
 */
export function isAuthError(error: unknown): boolean {
  return error instanceof ApiClientError && error.isAuthError;
}

/**
 * Check if error is validation related
 */
export function isValidationError(error: unknown): boolean {
  return error instanceof ApiClientError && error.isValidationError;
}

/**
 * Check if error is network related
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiClientError && error.isNetworkError;
}

// ============================================
// QUERY PARAMETER HELPERS
// ============================================

/**
 * Build query string from params object
 * Handles array parameters (e.g., status[]=pending&status[]=approved)
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    // Handle array parameters (e.g., status[], priority[])
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          searchParams.append(key, String(item));
        }
      });
    } else {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Merge URL with query parameters
 */
export function buildUrl(baseUrl: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }
  return `${baseUrl}${buildQueryString(params)}`;
}

// ============================================
// DATA TRANSFORMATION
// ============================================

/**
 * Format date for API (YYYY-MM-DD)
 */
export function formatDateForApi(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse API date to Date object
 */
export function parseApiDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount?: number | null, currency: string = "GHS"): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(0);
  }
  
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date?: Date | string | null): string {
  if (!date) return 'N/A';
  
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    return new Intl.DateTimeFormat("en-GH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Get relative time (e.g., "2 days ago")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return formatDate(d);
}

// ============================================
// FILE HANDLING
// ============================================

/**
 * Convert files to FormData
 */
export function createFormData(data: Record<string, any>): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    // Handle array of files
    if (key === "media" && Array.isArray(value)) {
      value.forEach((file) => {
        formData.append(`${key}[]`, file);
      });
      return;
    }

    // Handle single file
    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      value.forEach((item) => {
        formData.append(`${key}[]`, String(item));
      });
      return;
    }

    // Handle objects
    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
      return;
    }

    // Handle primitives
    formData.append(key, String(value));
  });

  return formData;
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some((type) => {
    if (type.endsWith("/*")) {
      const baseType = type.split("/")[0];
      return file.type.startsWith(`${baseType}/`);
    }
    return file.type === type;
  });
}

// ============================================
// STATUS HELPERS
// ============================================

/**
 * Get status color for badges
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // Invoice statuses
    pending: "yellow",
    paid: "green",
    overdue: "red",
    partially_paid: "orange",

    // Payment statuses
    completed: "green",
    failed: "red",

    // Lease statuses
    active: "green",
    expired: "gray",
    terminated: "red",

    // Maintenance statuses
    received: "blue",
    assigned: "purple",
    in_progress: "yellow",
    pending_approval: "orange",
    approved: "green",
    completed_pending_review: "green",
    awaiting_tenant_confirmation: "indigo",
    resolved: "green",
    closed: "gray",

    // Priority levels
    low: "gray",
    normal: "blue",
    urgent: "orange",
    emergency: "red",
  };

  return statusColors[status.toLowerCase()] || "gray";
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format status for display
 */
export function formatStatus(status?: string | null): string {
  if (!status) return 'N/A';
  
  // Custom status labels
  const statusLabels: Record<string, string> = {
    'completed': 'Full Payment / Rent Paid',
    'partially_paid': 'Partial Payment',
    'pending': 'Pending Approval',
    'recorded': 'Recorded',
    'failed': 'Failed / Rejected',
    'paid': 'Paid',
    'overdue': 'Overdue',
    'completed_pending_review': 'Pending Review',
    'awaiting_tenant_confirmation': 'Awaiting Tenant Confirmation',
  };
  
  return statusLabels[status] || status
    .split("_")
    .map(word => capitalize(word))
    .join(" ");
}

// ============================================
// DEBOUNCE & THROTTLE
// ============================================

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

