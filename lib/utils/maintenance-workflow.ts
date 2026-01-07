/**
 * Maintenance Workflow Validation
 * Handles status transitions, role permissions, and workflow rules
 * Based on MAINTENANCE_WORKFLOW_DESIGN.md
 */

import type { MaintenanceStatus, UserRole } from "../api-types";

// ============================================
// STATUS TRANSITION RULES
// ============================================

/**
 * Valid status transitions based on current status
 * Defines what statuses can be reached from each status
 */
export const STATUS_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  pending: ["under_review", "rejected", "cancelled", "in_progress"],
  under_review: ["approved", "rejected", "pending"], // Can go back to pending if more info needed
  approved: ["assigned", "rejected", "cancelled"], // Can still reject after approval
  rejected: ["closed"], // Terminal after rejection
  assigned: ["in_progress", "assigned"], // Can reassign, or accept and go to in_progress
  in_progress: ["completed_pending_review", "completed", "assigned"], // Can reassign if needed
  completed_pending_review: ["awaiting_tenant_confirmation", "in_progress", "rework_required"],
  awaiting_tenant_confirmation: ["closed", "in_progress", "rework_required"],
  completed: ["closed", "rework_required"], // Quality review outcome
  rework_required: ["in_progress", "escalated"], // Go back to work or escalate
  closed: [], // Terminal state
  escalated: ["assigned", "in_progress", "closed"], // Landlord handles
  cancelled: [], // Terminal state
};

/**
 * Role-based status transition permissions
 * Defines which roles can perform which transitions
 */
export const ROLE_TRANSITION_PERMISSIONS: Record<
  UserRole,
  Partial<Record<MaintenanceStatus, MaintenanceStatus[]>>
> = {
  tenant: {
    // Tenants can only cancel their own requests
    pending: ["cancelled"],
    under_review: ["cancelled"],
    awaiting_tenant_confirmation: ["closed", "in_progress"],
  },
  landlord: {
    // Landlords can review, approve, reject, assign, and review completion
    pending: ["under_review"],
    under_review: ["approved", "rejected", "pending"],
    approved: ["assigned", "rejected"],
    assigned: ["assigned"], // Can reassign
    in_progress: ["completed_pending_review", "assigned"],
    completed_pending_review: ["awaiting_tenant_confirmation", "in_progress"],
    awaiting_tenant_confirmation: ["closed", "in_progress"],
    completed: ["closed", "rework_required"],
    rework_required: ["escalated", "assigned"],
    escalated: ["assigned", "in_progress", "closed"],
  },
  caretaker: {
    // Caretakers can accept/reject assignments and update work status
    assigned: ["in_progress"], // Accept assignment
    in_progress: ["completed_pending_review", "completed", "assigned"], // Complete work or reassign
    rework_required: ["in_progress"], // Fix issues
  },
  super_admin: {
    // Super admin can do everything
    pending: ["under_review", "rejected", "cancelled"],
    under_review: ["approved", "rejected", "pending"],
    approved: ["assigned", "rejected", "cancelled"],
    rejected: ["closed"],
    assigned: ["in_progress", "assigned"],
    in_progress: ["completed_pending_review", "completed", "assigned"],
    completed_pending_review: ["awaiting_tenant_confirmation", "in_progress"],
    awaiting_tenant_confirmation: ["closed", "in_progress"],
    completed: ["closed", "rework_required"],
    rework_required: ["in_progress", "escalated"],
    escalated: ["assigned", "in_progress", "closed"],
    closed: [],
    cancelled: [],
  },
};

// Artisan has same permissions as caretaker
export const ARTISAN_TRANSITION_PERMISSIONS = ROLE_TRANSITION_PERMISSIONS.caretaker;

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Check if a status transition is valid based on workflow rules
 */
export function isValidTransition(
  fromStatus: MaintenanceStatus,
  toStatus: MaintenanceStatus
): boolean {
  const allowedTransitions = STATUS_TRANSITIONS[fromStatus] || [];
  return allowedTransitions.includes(toStatus);
}

/**
 * Check if a role can perform a specific status transition
 */
export function canRoleTransition(
  role: UserRole,
  fromStatus: MaintenanceStatus,
  toStatus: MaintenanceStatus,
  isAssignee: boolean = false
): boolean {
  // Super admin can do everything
  if (role === "super_admin") {
    return isValidTransition(fromStatus, toStatus);
  }

  // Get role-specific permissions
  const rolePermissions = ROLE_TRANSITION_PERMISSIONS[role] || {};

  // Check if this transition is allowed for this role
  const allowedStatuses = rolePermissions[fromStatus] || [];

  // Special case: Caretakers/Artisans can only transition if they're assigned
  if ((role === "caretaker" || role === "artisan") && !isAssignee) {
    // Can only accept assignments if not already assigned
    if (fromStatus === "assigned" && toStatus === "in_progress") {
      return false; // Must be assigned to them
    }
    return false; // Can't transition if not assigned
  }

  return allowedStatuses.includes(toStatus) && isValidTransition(fromStatus, toStatus);
}

/**
 * Get allowed next statuses for a role from current status
 */
export function getAllowedNextStatuses(
  role: UserRole,
  currentStatus: MaintenanceStatus,
  isAssignee: boolean = false
): MaintenanceStatus[] {
  // Super admin can do everything
  if (role === "super_admin") {
    return STATUS_TRANSITIONS[currentStatus] || [];
  }

  const rolePermissions = ROLE_TRANSITION_PERMISSIONS[role] || {};
  const allowedStatuses = rolePermissions[currentStatus] || [];

  // Filter by valid transitions
  return allowedStatuses.filter((status) =>
    isValidTransition(currentStatus, status)
  );
}

/**
 * Check if a status is terminal (cannot transition from)
 */
export function isTerminalStatus(status: MaintenanceStatus): boolean {
  return STATUS_TRANSITIONS[status].length === 0;
}

/**
 * Check if a status requires action from a specific role
 */
export function getRequiredRoleForStatus(status: MaintenanceStatus): UserRole | null {
  switch (status) {
    case "under_review":
    case "approved":
    case "rejected":
      return "landlord";
    case "assigned":
      return "landlord";
    case "in_progress":
    case "completed":
      return "caretaker"; // Or artisan
    case "closed":
      return "landlord"; // Or tenant approval
    default:
      return null;
  }
}

// ============================================
// WORKFLOW HELPERS
// ============================================

/**
 * Check if request can be assigned
 */
export function canAssignRequest(status: MaintenanceStatus): boolean {
  return status === "approved" || status === "assigned" || status === "in_progress";
}

/**
 * Check if assignment can be accepted
 */
export function canAcceptAssignment(status: MaintenanceStatus): boolean {
  return status === "assigned";
}

/**
 * Check if work can be marked as completed
 */
export function canCompleteWork(status: MaintenanceStatus): boolean {
  return status === "in_progress" || status === "rework_required";
}

/**
 * Check if completion can be reviewed
 */
export function canReviewCompletion(status: MaintenanceStatus): boolean {
  return status === "completed";
}

/**
 * Check if request should be escalated
 */
export function shouldEscalate(reworkCount: number): boolean {
  return reworkCount >= 2; // After 2-3 reworks
}

/**
 * Check if request needs rework
 */
export function needsRework(
  completionApprovedByTenant: boolean | null,
  completionApprovedByLandlord: boolean | null
): boolean {
  // If either tenant or landlord rejected, needs rework
  return (
    completionApprovedByTenant === false || completionApprovedByLandlord === false
  );
}

// ============================================
// STATUS DISPLAY HELPERS
// ============================================

/**
 * Status display labels
 */
export const STATUS_LABELS: Record<MaintenanceStatus, string> = {
  pending: "Pending",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  assigned: "Assigned",
  in_progress: "In Progress",
  completed_pending_review: "Pending Landlord Review",
  awaiting_tenant_confirmation: "Awaiting Tenant Confirmation",
  completed: "Completed",
  rework_required: "Rework Required",
  closed: "Closed",
  escalated: "Escalated",
  cancelled: "Cancelled",
};

/**
 * Status badge colors for UI
 */
export const STATUS_BADGE_COLORS: Record<MaintenanceStatus, string> = {
  pending: "default",
  under_review: "info",
  approved: "success",
  rejected: "destructive",
  assigned: "warning",
  in_progress: "warning",
  completed_pending_review: "info",
  awaiting_tenant_confirmation: "secondary",
  completed: "success",
  rework_required: "destructive",
  closed: "default",
  escalated: "destructive",
  cancelled: "default",
};

/**
 * Get status color class for UI
 */
export function getStatusColor(status: MaintenanceStatus): string {
  const colorMap: Record<MaintenanceStatus, string> = {
    pending: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    under_review: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    assigned: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    in_progress: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    completed_pending_review: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    awaiting_tenant_confirmation: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    rework_required: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    escalated: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };
  return colorMap[status] || colorMap.pending;
}

/**
 * Priority badge colors
 */
export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  normal: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  urgent: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  emergency: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

