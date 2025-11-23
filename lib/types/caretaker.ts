/**
 * Caretaker-specific types and constants
 * Separate module for better organization and maintainability
 * Following Single Responsibility Principle
 */

import type { MaintenanceStatus } from "../api-types";

// ============================================
// STATUS TRANSITION RULES
// ============================================

/**
 * Valid status transitions for caretakers
 * Based on API documentation workflow rules
 */
export const STATUS_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  received: ["assigned", "in_progress", "pending_approval", "resolved", "cancelled"],
  assigned: ["in_progress", "pending_approval", "resolved", "cancelled"],
  in_progress: ["pending_approval", "resolved", "cancelled"],
  pending_approval: ["rejected", "resolved", "in_progress"], // Note: 'approved' requires landlord
  approved: ["in_progress", "resolved"], // After landlord approval
  rejected: ["in_progress", "cancelled"],
  resolved: ["closed", "in_progress"], // Can reopen if needed
  closed: [], // Terminal state
  cancelled: [], // Terminal state
};

/**
 * Check if a status transition is valid
 */
export function isValidTransition(
  fromStatus: MaintenanceStatus,
  toStatus: MaintenanceStatus
): boolean {
  const allowedTransitions = STATUS_TRANSITIONS[fromStatus];
  return allowedTransitions.includes(toStatus);
}

/**
 * Get allowed next statuses for current status
 */
export function getAllowedNextStatuses(
  currentStatus: MaintenanceStatus
): MaintenanceStatus[] {
  return STATUS_TRANSITIONS[currentStatus] || [];
}

// ============================================
// STATUS & PRIORITY MAPPINGS
// ============================================

/**
 * Status to badge color mapping for UI
 */
export const STATUS_BADGE_COLORS: Record<MaintenanceStatus, string> = {
  received: "info",
  assigned: "warning",
  in_progress: "warning",
  pending_approval: "info",
  approved: "success",
  rejected: "danger",
  resolved: "success",
  closed: "default",
  cancelled: "default",
};

/**
 * Priority to badge color mapping for UI
 */
export const PRIORITY_BADGE_COLORS: Record<string, string> = {
  low: "default",
  medium: "warning",
  high: "danger",
  emergency: "error",
};

/**
 * Status display labels
 */
export const STATUS_LABELS: Record<MaintenanceStatus, string> = {
  received: "Received",
  assigned: "Assigned",
  in_progress: "In Progress",
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  resolved: "Resolved",
  closed: "Closed",
  cancelled: "Cancelled",
};

/**
 * Priority display labels
 */
export const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  emergency: "Emergency",
};

// ============================================
// PERMISSIONS & VALIDATIONS
// ============================================

/**
 * Actions that caretakers CANNOT perform
 */
export const FORBIDDEN_CARETAKER_ACTIONS = {
  // Cannot approve requests requiring landlord approval
  cannotApprove: (requiresApproval: boolean) => requiresApproval,
  
  // Cannot create maintenance requests (tenant only)
  cannotCreate: true,
  
  // Cannot delete requests
  cannotDelete: true,
  
  // Cannot modify certain fields
  restrictedFields: [
    "tenant_id",
    "landlord_id",
    "property_id",
    "unit_id",
  ] as const,
};

/**
 * Statuses that require landlord approval
 */
export const LANDLORD_APPROVAL_STATUSES: MaintenanceStatus[] = [
  "approved",
];

/**
 * Terminal statuses (cannot be changed)
 */
export const TERMINAL_STATUSES: MaintenanceStatus[] = [
  "closed",
  "cancelled",
];

/**
 * Check if status is terminal
 */
export function isTerminalStatus(status: MaintenanceStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/**
 * Check if status requires landlord action
 */
export function requiresLandlordApproval(status: MaintenanceStatus): boolean {
  return LANDLORD_APPROVAL_STATUSES.includes(status);
}

// ============================================
// WORKFLOW HELPERS
// ============================================

/**
 * Priority order for sorting (highest to lowest)
 */
export const PRIORITY_ORDER: Record<string, number> = {
  emergency: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Status order for workflow display
 */
export const STATUS_WORKFLOW_ORDER: MaintenanceStatus[] = [
  "received",
  "assigned",
  "in_progress",
  "pending_approval",
  "approved",
  "resolved",
  "closed",
];

/**
 * Determine if a request is overdue based on expected resolution time
 */
export function isRequestOverdue(
  createdAt: string,
  expectedResolutionHours: number,
  currentStatus: MaintenanceStatus
): boolean {
  // Don't mark as overdue if already resolved or closed
  if (["resolved", "closed", "cancelled"].includes(currentStatus)) {
    return false;
  }

  const createdDate = new Date(createdAt);
  const now = new Date();
  const hoursSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
  
  return hoursSinceCreation > expectedResolutionHours;
}

/**
 * Calculate estimated resolution time
 */
export function calculateEstimatedResolution(
  createdAt: string,
  expectedResolutionHours: number
): Date {
  const createdDate = new Date(createdAt);
  return new Date(createdDate.getTime() + expectedResolutionHours * 60 * 60 * 1000);
}

// ============================================
// FILTER & SORT OPTIONS
// ============================================

/**
 * Available filter options for maintenance requests
 */
export const MAINTENANCE_FILTERS = {
  statuses: [
    { value: "received", label: "Received" },
    { value: "assigned", label: "Assigned" },
    { value: "in_progress", label: "In Progress" },
    { value: "pending_approval", label: "Pending Approval" },
    { value: "approved", label: "Approved" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
    { value: "cancelled", label: "Cancelled" },
  ],
  priorities: [
    { value: "emergency", label: "Emergency" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ],
  sortOptions: [
    { value: "created_at", label: "Date Created" },
    { value: "priority", label: "Priority" },
    { value: "status", label: "Status" },
    { value: "scheduled_date", label: "Scheduled Date" },
  ],
} as const;

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Type guard to check if value is a valid maintenance status
 */
export function isMaintenanceStatus(value: string): value is MaintenanceStatus {
  const validStatuses: MaintenanceStatus[] = [
    "received",
    "assigned",
    "in_progress",
    "pending_approval",
    "approved",
    "rejected",
    "resolved",
    "closed",
    "cancelled",
  ];
  return validStatuses.includes(value as MaintenanceStatus);
}

/**
 * Type guard to check if user can update a request
 */
export function canCaretakerUpdateRequest(
  currentStatus: MaintenanceStatus,
  requiresApproval: boolean,
  targetStatus?: MaintenanceStatus
): boolean {
  // Cannot update terminal statuses
  if (isTerminalStatus(currentStatus)) {
    return false;
  }

  // Cannot approve if requires landlord approval
  if (targetStatus === "approved" && requiresApproval) {
    return false;
  }

  // Must be valid transition
  if (targetStatus && !isValidTransition(currentStatus, targetStatus)) {
    return false;
  }

  return true;
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION = {
  per_page: 15,
  max_per_page: 50,
} as const;

/**
 * File upload constraints
 */
export const FILE_UPLOAD_LIMITS = {
  maxFileSize: 2 * 1024 * 1024, // 2MB
  maxFiles: 5,
  allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/gif"],
} as const;

/**
 * Date format for API
 */
export const API_DATE_FORMAT = "YYYY-MM-DD";

/**
 * Time thresholds
 */
export const TIME_THRESHOLDS = {
  emergencyResponseHours: 2,
  highPriorityResponseHours: 24,
  mediumPriorityResponseHours: 48,
  lowPriorityResponseHours: 168, // 1 week
} as const;

