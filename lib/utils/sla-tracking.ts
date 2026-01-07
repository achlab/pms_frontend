/**
 * SLA Tracking Utilities
 * Handles calculation and tracking of Service Level Agreement deadlines
 */

import type { MaintenanceRequest, MaintenancePriority } from "@/lib/api-types";

// ============================================
// SLA CONFIGURATION
// ============================================
// Change these values for testing vs production
// TESTING: Use minutes for quick testing
// PRODUCTION: Use hours (24h, 48h, etc.)

const IS_TESTING = true; // Set to false for production

export const SLA_CONFIG = {
  // Response SLA: Landlord must respond to request
  RESPONSE_HOURS: IS_TESTING ? 2 / 60 : 24, // 2 minutes (test) or 24 hours (prod)
  
  // Assignment SLA: Landlord must assign after approval
  ASSIGNMENT_HOURS: IS_TESTING ? 4 / 60 : 48, // 4 minutes (test) or 48 hours (prod)
  
  // Acceptance SLA: Assignee must accept assignment
  ACCEPTANCE_HOURS: IS_TESTING ? 2 / 60 : 24, // 2 minutes (test) or 24 hours (prod)
  
  // Completion SLA: Based on priority
  COMPLETION: {
    emergency: IS_TESTING ? 0.5 / 60 : 4,    // 30 seconds (test) or 4 hours (prod)
    urgent: IS_TESTING ? 2 / 60 : 24,         // 2 minutes (test) or 24 hours (prod)
    normal: IS_TESTING ? 6 / 60 : 72,         // 6 minutes (test) or 72 hours (prod)
    low: IS_TESTING ? 14 / 60 : 168,          // 14 minutes (test) or 168 hours (prod)
  },
};

export type SLAStatus = "on_time" | "approaching" | "overdue" | "met" | "not_applicable";

export interface SLADeadline {
  type: "response" | "assignment" | "acceptance" | "completion";
  deadline: Date | null;
  status: SLAStatus;
  timeRemaining: number | null; // milliseconds
  percentageElapsed: number; // 0-100
  isMet: boolean | null;
}

/**
 * Calculate completion deadline based on priority
 */
export function getCompletionDeadlineHours(priority: MaintenancePriority): number {
  return SLA_CONFIG.COMPLETION[priority] || SLA_CONFIG.COMPLETION.normal;
}

/**
 * Calculate SLA deadlines for a maintenance request
 */
export function calculateSLADeadlines(request: MaintenanceRequest): {
  response: SLADeadline;
  assignment: SLADeadline;
  acceptance: SLADeadline;
  completion: SLADeadline;
} {
  const now = new Date();
  const createdAt = new Date(request.created_at);
  const approvedAt = request.approved_at ? new Date(request.approved_at) : null;
  const assignedAt = request.assigned_at ? new Date(request.assigned_at) : null;
  const acceptedAt = request.accepted_at ? new Date(request.accepted_at) : null;

  // Response Deadline: From creation
  const responseDeadline = new Date(createdAt);
  responseDeadline.setHours(responseDeadline.getHours() + SLA_CONFIG.RESPONSE_HOURS);
  const responseStatus = getSLAStatus(responseDeadline, now, request.sla_response_met);

  // Assignment Deadline: From approval (if approved)
  let assignmentDeadline: Date | null = null;
  if (approvedAt) {
    assignmentDeadline = new Date(approvedAt);
    assignmentDeadline.setHours(assignmentDeadline.getHours() + SLA_CONFIG.ASSIGNMENT_HOURS);
  }
  const assignmentStatus = assignmentDeadline
    ? getSLAStatus(assignmentDeadline, now, request.sla_assignment_met)
    : "not_applicable";

  // Acceptance Deadline: From assignment (if assigned)
  let acceptanceDeadline: Date | null = null;
  if (assignedAt) {
    acceptanceDeadline = new Date(assignedAt);
    acceptanceDeadline.setHours(acceptanceDeadline.getHours() + SLA_CONFIG.ACCEPTANCE_HOURS);
  }
  const acceptanceStatus = acceptanceDeadline
    ? getSLAStatus(acceptanceDeadline, now, null)
    : "not_applicable";

  // Completion Deadline: Based on priority, from acceptance or assignment
  let completionDeadline: Date | null = null;
  if (acceptedAt || assignedAt) {
    const startTime = acceptedAt || assignedAt;
    const hours = getCompletionDeadlineHours(request.priority);
    completionDeadline = new Date(startTime!);
    completionDeadline.setHours(completionDeadline.getHours() + hours);
  }
  const completionStatus = completionDeadline
    ? getSLAStatus(completionDeadline, now, request.sla_completion_met)
    : "not_applicable";

  return {
    response: {
      type: "response",
      deadline: responseDeadline,
      status: responseStatus,
      timeRemaining: calculateTimeRemaining(responseDeadline, now),
      percentageElapsed: calculatePercentageElapsed(createdAt, responseDeadline, now),
      isMet: request.sla_response_met ?? null,
    },
    assignment: {
      type: "assignment",
      deadline: assignmentDeadline,
      status: assignmentStatus as SLAStatus,
      timeRemaining: assignmentDeadline ? calculateTimeRemaining(assignmentDeadline, now) : null,
      percentageElapsed: approvedAt && assignmentDeadline
        ? calculatePercentageElapsed(approvedAt, assignmentDeadline, now)
        : 0,
      isMet: request.sla_assignment_met ?? null,
    },
    acceptance: {
      type: "acceptance",
      deadline: acceptanceDeadline,
      status: acceptanceStatus as SLAStatus,
      timeRemaining: acceptanceDeadline ? calculateTimeRemaining(acceptanceDeadline, now) : null,
      percentageElapsed: assignedAt && acceptanceDeadline
        ? calculatePercentageElapsed(assignedAt, acceptanceDeadline, now)
        : 0,
      isMet: acceptedAt ? true : null,
    },
    completion: {
      type: "completion",
      deadline: completionDeadline,
      status: completionStatus,
      timeRemaining: completionDeadline ? calculateTimeRemaining(completionDeadline, now) : null,
      percentageElapsed: (acceptedAt || assignedAt) && completionDeadline
        ? calculatePercentageElapsed(acceptedAt || assignedAt!, completionDeadline, now)
        : 0,
      isMet: request.sla_completion_met ?? null,
    },
  };
}

/**
 * Get SLA status based on deadline and current time
 */
function getSLAStatus(
  deadline: Date,
  now: Date,
  isMet: boolean | null | undefined
): SLAStatus {
  // If already met, return met status
  if (isMet === true) return "met";

  // If deadline has passed
  if (now > deadline) return "overdue";

  // Calculate percentage of time elapsed
  const timeElapsed = now.getTime() - (deadline.getTime() - (24 * 60 * 60 * 1000)); // Assuming 24h window
  const totalTime = 24 * 60 * 60 * 1000;
  const percentageElapsed = Math.max(0, Math.min(100, (timeElapsed / totalTime) * 100));

  // If 80% or more elapsed, approaching deadline
  if (percentageElapsed >= 80) return "approaching";

  return "on_time";
}

/**
 * Calculate time remaining until deadline
 */
function calculateTimeRemaining(deadline: Date, now: Date): number {
  return Math.max(0, deadline.getTime() - now.getTime());
}

/**
 * Calculate percentage of time elapsed
 */
function calculatePercentageElapsed(start: Date, end: Date, now: Date): number {
  const total = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  return Math.max(0, Math.min(100, (elapsed / total) * 100));
}

/**
 * Get color class for SLA status
 */
export function getSLAStatusColor(status: SLAStatus): string {
  switch (status) {
    case "on_time":
      return "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800";
    case "approaching":
      return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800";
    case "overdue":
      return "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800";
    case "met":
      return "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800";
    case "not_applicable":
      return "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-900/20 dark:border-gray-800";
  }
}

/**
 * Get label for SLA status
 */
export function getSLAStatusLabel(status: SLAStatus): string {
  switch (status) {
    case "on_time":
      return "On Time";
    case "approaching":
      return "Approaching Deadline";
    case "overdue":
      return "Overdue";
    case "met":
      return "SLA Met";
    case "not_applicable":
      return "N/A";
  }
}

/**
 * Format time remaining as human-readable string
 */
export function formatTimeRemaining(milliseconds: number | null): string {
  if (milliseconds === null || milliseconds <= 0) return "Overdue";

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h remaining`;
  if (hours > 0) return `${hours}h ${minutes % 60}m remaining`;
  if (minutes > 0) return `${minutes}m remaining`;
  return "Less than a minute";
}

/**
 * Check if request should be escalated based on rework count
 */
export function shouldEscalate(reworkCount: number | undefined | null): boolean {
  return (reworkCount ?? 0) >= 2; // Escalate after 2 reworks
}

/**
 * Get escalation status
 */
export function getEscalationStatus(request: MaintenanceRequest): {
  isEscalated: boolean;
  shouldEscalate: boolean;
  reworkCount: number;
} {
  const reworkCount = request.rework_count ?? 0;
  return {
    isEscalated: request.escalated === true,
    shouldEscalate: shouldEscalate(reworkCount) && !request.escalated,
    reworkCount,
  };
}

