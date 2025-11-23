/**
 * Super Admin Types & Utilities
 * Constants, helpers, and utility functions for Super Admin operations
 * Following SOLID principles with clear separation of concerns
 */

import type { UserRole, MaintenanceStatus, MaintenancePriority, InvoiceStatus, PaymentMethod } from "../api-types";

// ============================================
// USER ROLE CONSTANTS
// ============================================

export const USER_ROLES = {
  SUPER_ADMIN: "super_admin" as const,
  LANDLORD: "landlord" as const,
  CARETAKER: "caretaker" as const,
  TENANT: "tenant" as const,
} as const;

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  landlord: "Landlord",
  caretaker: "Caretaker",
  tenant: "Tenant",
};

export const USER_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: "Full system access and management",
  landlord: "Property owner with management capabilities",
  caretaker: "Property maintenance and oversight",
  tenant: "Property occupant",
};

// ============================================
// FILTER OPTIONS
// ============================================

export const LANDLORD_FILTER_OPTIONS = [
  { value: "all", label: "All Landlords" },
  { value: "with_properties", label: "With Properties" },
  { value: "without_properties", label: "Without Properties" },
  { value: "active", label: "Active Only" },
  { value: "inactive", label: "Inactive Only" },
];

export const USER_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "verified", label: "Verified" },
  { value: "unverified", label: "Unverified" },
];

export const PROPERTY_FILTER_OPTIONS = [
  { value: "all", label: "All Properties" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "with_caretaker", label: "With Caretaker" },
  { value: "without_caretaker", label: "Without Caretaker" },
];

export const OCCUPANCY_FILTER_OPTIONS = [
  { value: "all", label: "All Units" },
  { value: "occupied", label: "Occupied" },
  { value: "vacant", label: "Vacant" },
];

export const SYSTEM_ACTIVITY_TYPES = [
  "user_created",
  "property_created",
  "lease_created",
  "payment_received",
  "maintenance_created",
] as const;

export type SystemActivityType = typeof SYSTEM_ACTIVITY_TYPES[number];

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate super admin user creation data
 */
export function validateSuperAdminUserData(data: {
  role: UserRole;
  landlord_id?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Role-specific validation
  if (data.role === "caretaker" || data.role === "tenant") {
    if (!data.landlord_id) {
      errors.push(`${USER_ROLE_LABELS[data.role]} must be assigned to a landlord`);
    }
  }

  // Email validation
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Invalid email format");
    }
  }

  // Password validation
  if (data.password && data.password_confirmation) {
    if (data.password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (data.password !== data.password_confirmation) {
      errors.push("Password and confirmation do not match");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if a role requires a landlord assignment
 */
export function requiresLandlordAssignment(role: UserRole): boolean {
  return role === "caretaker" || role === "tenant";
}

/**
 * Get role permissions description
 */
export function getRolePermissions(role: UserRole): string[] {
  const permissions: Record<UserRole, string[]> = {
    super_admin: [
      "Full system access",
      "Create all user types",
      "View all data",
      "System analytics",
      "User management",
    ],
    landlord: [
      "Manage properties",
      "Create caretakers and tenants",
      "View financial reports",
      "Approve maintenance",
    ],
    caretaker: [
      "Manage maintenance requests",
      "View assigned properties",
      "Update request status",
    ],
    tenant: [
      "Submit maintenance requests",
      "View lease details",
      "Make payments",
      "View invoices",
    ],
  };

  return permissions[role] || [];
}

// ============================================
// CALCULATION HELPERS
// ============================================

/**
 * Calculate overall occupancy rate
 */
export function calculateOverallOccupancyRate(
  occupiedUnits: number,
  totalUnits: number
): number {
  if (totalUnits === 0) return 0;
  return Math.round((occupiedUnits / totalUnits) * 100 * 10) / 10;
}

/**
 * Calculate collection rate
 */
export function calculateCollectionRate(
  totalCollected: number,
  totalExpected: number
): number {
  if (totalExpected === 0) return 100;
  return Math.round((totalCollected / totalExpected) * 100 * 10) / 10;
}

/**
 * Calculate performance score (0-100)
 */
export function calculatePerformanceScore(metrics: {
  occupancy_rate: number;
  collection_rate: number;
  maintenance_efficiency?: number;
}): number {
  const occupancyWeight = 0.4;
  const collectionWeight = 0.4;
  const maintenanceWeight = 0.2;

  const occupancyScore = metrics.occupancy_rate;
  const collectionScore = metrics.collection_rate;
  const maintenanceScore = metrics.maintenance_efficiency || 80;

  return Math.round(
    occupancyScore * occupancyWeight +
    collectionScore * collectionWeight +
    maintenanceScore * maintenanceWeight
  );
}

/**
 * Calculate revenue growth percentage
 */
export function calculateGrowthPercentage(
  currentValue: number,
  previousValue: number
): number {
  if (previousValue === 0) return currentValue > 0 ? 100 : 0;
  return Math.round(((currentValue - previousValue) / previousValue) * 100 * 10) / 10;
}

/**
 * Determine occupancy trend
 */
export function determineOccupancyTrend(
  currentRate: number,
  previousRate: number
): "increasing" | "decreasing" | "stable" {
  const difference = currentRate - previousRate;
  if (Math.abs(difference) < 2) return "stable";
  return difference > 0 ? "increasing" : "decreasing";
}

// ============================================
// FORMATTING HELPERS
// ============================================

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = "GHS"): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers (e.g., 1000 -> 1K)
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Format user role for display
 */
export function formatUserRole(role: UserRole): string {
  return USER_ROLE_LABELS[role] || role;
}

/**
 * Format system activity description
 */
export function formatActivityDescription(
  type: SystemActivityType,
  userName: string,
  metadata?: Record<string, any>
): string {
  const descriptions: Record<SystemActivityType, string> = {
    user_created: `${userName} created a new user`,
    property_created: `${userName} created a new property`,
    lease_created: `${userName} created a new lease`,
    payment_received: `Payment received from ${userName}`,
    maintenance_created: `${userName} created a maintenance request`,
  };

  return descriptions[type] || `${userName} performed an action`;
}

// ============================================
// BADGE & STATUS HELPERS
// ============================================

/**
 * Get badge color for user role
 */
export function getUserRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    super_admin: "purple",
    landlord: "blue",
    caretaker: "green",
    tenant: "orange",
  };
  return colors[role] || "gray";
}

/**
 * Get badge color for performance score
 */
export function getPerformanceScoreBadgeColor(score: number): string {
  if (score >= 80) return "green";
  if (score >= 60) return "yellow";
  if (score >= 40) return "orange";
  return "red";
}

/**
 * Get badge color for occupancy rate
 */
export function getOccupancyBadgeColor(rate: number): string {
  if (rate >= 90) return "green";
  if (rate >= 75) return "blue";
  if (rate >= 60) return "yellow";
  return "red";
}

/**
 * Get badge color for collection rate
 */
export function getCollectionBadgeColor(rate: number): string {
  if (rate >= 95) return "green";
  if (rate >= 80) return "blue";
  if (rate >= 70) return "yellow";
  return "red";
}

/**
 * Get trend icon
 */
export function getTrendIcon(trend: "increasing" | "decreasing" | "stable"): string {
  const icons = {
    increasing: "↑",
    decreasing: "↓",
    stable: "→",
  };
  return icons[trend];
}

// ============================================
// COMPARISON HELPERS
// ============================================

/**
 * Compare two landlords by performance
 */
export function compareLandlordsByPerformance(
  a: { performance_score: number },
  b: { performance_score: number }
): number {
  return b.performance_score - a.performance_score;
}

/**
 * Compare by revenue
 */
export function compareByRevenue(
  a: { monthly_revenue: number },
  b: { monthly_revenue: number }
): number {
  return b.monthly_revenue - a.monthly_revenue;
}

/**
 * Compare by occupancy rate
 */
export function compareByOccupancyRate(
  a: { occupancy_rate: number },
  b: { occupancy_rate: number }
): number {
  return b.occupancy_rate - a.occupancy_rate;
}

// ============================================
// AGGREGATION HELPERS
// ============================================

/**
 * Calculate system-wide totals
 */
export function calculateSystemTotals(landlords: Array<{
  total_properties: number;
  total_units: number;
  occupied_units: number;
  monthly_revenue: number;
}>): {
  total_properties: number;
  total_units: number;
  occupied_units: number;
  total_revenue: number;
  average_occupancy_rate: number;
} {
  const total_properties = landlords.reduce((sum, l) => sum + l.total_properties, 0);
  const total_units = landlords.reduce((sum, l) => sum + l.total_units, 0);
  const occupied_units = landlords.reduce((sum, l) => sum + l.occupied_units, 0);
  const total_revenue = landlords.reduce((sum, l) => sum + l.monthly_revenue, 0);

  return {
    total_properties,
    total_units,
    occupied_units,
    total_revenue,
    average_occupancy_rate: calculateOverallOccupancyRate(occupied_units, total_units),
  };
}

/**
 * Get top performers
 */
export function getTopPerformers<T extends { performance_score: number }>(
  items: T[],
  limit: number = 5
): T[] {
  return [...items]
    .sort(compareLandlordsByPerformance)
    .slice(0, limit);
}

/**
 * Get bottom performers
 */
export function getBottomPerformers<T extends { performance_score: number }>(
  items: T[],
  limit: number = 5
): T[] {
  return [...items]
    .sort((a, b) => a.performance_score - b.performance_score)
    .slice(0, limit);
}

// ============================================
// FILTERING HELPERS
// ============================================

/**
 * Filter landlords by criteria
 */
export function filterLandlords(
  landlords: Array<{
    total_properties: number;
    is_active?: boolean;
  }>,
  criteria: {
    has_properties?: boolean;
    is_active?: boolean;
  }
): Array<any> {
  return landlords.filter((landlord) => {
    if (criteria.has_properties !== undefined) {
      const hasProps = landlord.total_properties > 0;
      if (hasProps !== criteria.has_properties) return false;
    }

    if (criteria.is_active !== undefined) {
      if (landlord.is_active !== criteria.is_active) return false;
    }

    return true;
  });
}

// ============================================
// DATE HELPERS
// ============================================

/**
 * Get date range for period
 */
export function getDateRangeForPeriod(period: "today" | "week" | "month" | "quarter" | "year"): {
  start_date: string;
  end_date: string;
} {
  const now = new Date();
  const end_date = now.toISOString().split("T")[0];
  let start_date: string;

  switch (period) {
    case "today":
      start_date = end_date;
      break;
    case "week":
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      start_date = weekAgo.toISOString().split("T")[0];
      break;
    case "month":
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      start_date = monthAgo.toISOString().split("T")[0];
      break;
    case "quarter":
      const quarterAgo = new Date(now);
      quarterAgo.setMonth(quarterAgo.getMonth() - 3);
      start_date = quarterAgo.toISOString().split("T")[0];
      break;
    case "year":
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      start_date = yearAgo.toISOString().split("T")[0];
      break;
    default:
      start_date = end_date;
  }

  return { start_date, end_date };
}

// ============================================
// EXPORT HELPERS
// ============================================

/**
 * Get export file name
 */
export function getExportFileName(
  reportType: string,
  format: string = "pdf"
): string {
  const timestamp = new Date().toISOString().split("T")[0];
  return `${reportType}_${timestamp}.${format}`;
}

/**
 * Get available export formats
 */
export const EXPORT_FORMATS = [
  { value: "pdf", label: "PDF Document" },
  { value: "excel", label: "Excel Spreadsheet" },
  { value: "csv", label: "CSV File" },
] as const;

export type ExportFormat = typeof EXPORT_FORMATS[number]["value"];

// ============================================
// CONSTANTS EXPORT
// ============================================

export const SUPER_ADMIN_CONSTANTS = {
  USER_ROLES,
  USER_ROLE_LABELS,
  USER_ROLE_DESCRIPTIONS,
  LANDLORD_FILTER_OPTIONS,
  USER_STATUS_OPTIONS,
  PROPERTY_FILTER_OPTIONS,
  OCCUPANCY_FILTER_OPTIONS,
  EXPORT_FORMATS,
} as const;

