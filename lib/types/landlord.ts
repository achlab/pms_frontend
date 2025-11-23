/**
 * Landlord-specific types, constants, and utilities
 * Separate module for better organization and maintainability
 * Following Single Responsibility Principle
 */

// ============================================
// PROPERTY CONSTANTS
// ============================================

/**
 * Property verification statuses
 */
export const PROPERTY_VERIFICATION_STATUSES = {
  pending: "Pending Verification",
  verified: "Verified",
  rejected: "Rejected",
} as const;

export type PropertyVerificationStatus = keyof typeof PROPERTY_VERIFICATION_STATUSES;

/**
 * Property status colors for UI
 */
export const PROPERTY_STATUS_COLORS: Record<PropertyVerificationStatus, string> = {
  pending: "warning",
  verified: "success",
  rejected: "danger",
};

// ============================================
// LEASE CONSTANTS
// ============================================

/**
 * Lease types
 */
export const LEASE_TYPES = {
  new: "New Lease",
  renewal: "Renewal",
} as const;

/**
 * Lease statuses
 */
export const LEASE_STATUSES = {
  active: "Active",
  expired: "Expired",
  terminated: "Terminated",
  upcoming: "Upcoming",
} as const;

/**
 * Security deposit statuses
 */
export const SECURITY_DEPOSIT_STATUSES = {
  held: "Held",
  returned: "Returned",
  forfeited: "Forfeited",
} as const;

/**
 * Default lease settings (Ghana Rent Act compliant)
 */
export const DEFAULT_LEASE_SETTINGS = {
  advance_rent_months: 0, // Ghana Rent Act allows 0-6 months
  payment_due_day: 1,
  late_payment_penalty_percentage: 2.0,
  late_payment_grace_days: 5,
  termination_notice_days: 30,
} as const;

/**
 * Lease duration options (in months)
 */
export const LEASE_DURATION_OPTIONS = [
  { value: 6, label: "6 Months" },
  { value: 12, label: "1 Year" },
  { value: 24, label: "2 Years" },
  { value: 36, label: "3 Years" },
] as const;

// ============================================
// INVOICE CONSTANTS
// ============================================

/**
 * Invoice statuses
 */
export const INVOICE_STATUSES = {
  pending: "Pending",
  paid: "Paid",
  overdue: "Overdue",
  partially_paid: "Partially Paid",
} as const;

/**
 * Invoice types
 */
export const INVOICE_TYPES = {
  rent: "Rent",
  utility: "Utility",
  maintenance: "Maintenance",
  other: "Other",
} as const;

/**
 * Invoice status colors
 */
export const INVOICE_STATUS_COLORS = {
  pending: "warning",
  paid: "success",
  overdue: "danger",
  partially_paid: "info",
} as const;

// ============================================
// PAYMENT CONSTANTS
// ============================================

/**
 * Payment methods
 */
export const PAYMENT_METHODS = {
  mobile_money: "Mobile Money",
  bank_transfer: "Bank Transfer",
  cash: "Cash",
  cheque: "Cheque",
} as const;

/**
 * Payment statuses
 */
export const PAYMENT_STATUSES = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
} as const;

/**
 * Payment status colors
 */
export const PAYMENT_STATUS_COLORS = {
  completed: "success",
  pending: "warning",
  failed: "danger",
} as const;

// ============================================
// UNIT CONSTANTS
// ============================================

/**
 * Unit types
 */
export const UNIT_TYPES = {
  studio: "Studio",
  one_bedroom: "1 Bedroom",
  two_bedroom: "2 Bedrooms",
  three_bedroom: "3 Bedrooms",
  four_bedroom: "4 Bedrooms",
  penthouse: "Penthouse",
  shop: "Shop",
  office: "Office",
} as const;

/**
 * Unit availability statuses
 */
export const UNIT_AVAILABILITY = {
  available: "Available",
  occupied: "Occupied",
  maintenance: "Under Maintenance",
  reserved: "Reserved",
} as const;

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate property data
 */
export function validatePropertyData(data: {
  name?: string;
  street_address?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.name && data.name.length < 3) {
    errors.push("Property name must be at least 3 characters");
  }

  if (data.street_address && data.street_address.length < 5) {
    errors.push("Street address must be at least 5 characters");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate unit data
 */
export function validateUnitData(data: {
  unit_number?: string;
  rental_amount?: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.unit_number && data.unit_number.length === 0) {
    errors.push("Unit number is required");
  }

  if (data.rental_amount !== undefined && data.rental_amount <= 0) {
    errors.push("Rental amount must be greater than 0");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate lease dates
 */
export function validateLeaseDates(
  startDate: string,
  endDate: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) {
    errors.push("Invalid start date");
  }

  if (isNaN(end.getTime())) {
    errors.push("Invalid end date");
  }

  if (start >= end) {
    errors.push("End date must be after start date");
  }

  // Check minimum lease duration (Ghana Rent Act: minimum 6 months)
  const monthsDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (monthsDiff < 6) {
    errors.push("Lease duration must be at least 6 months (Ghana Rent Act)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate invoice dates
 */
export function validateInvoiceDates(
  invoiceDate: string,
  dueDate: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const invoice = new Date(invoiceDate);
  const due = new Date(dueDate);

  if (isNaN(invoice.getTime())) {
    errors.push("Invalid invoice date");
  }

  if (isNaN(due.getTime())) {
    errors.push("Invalid due date");
  }

  if (invoice > due) {
    errors.push("Due date must be on or after invoice date");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================
// CALCULATION HELPERS
// ============================================

/**
 * Calculate occupancy rate
 */
export function calculateOccupancyRate(
  occupiedUnits: number,
  totalUnits: number
): number {
  if (totalUnits === 0) return 0;
  return Math.round((occupiedUnits / totalUnits) * 100 * 100) / 100;
}

/**
 * Calculate collection rate
 */
export function calculateCollectionRate(
  collected: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((collected / total) * 100 * 100) / 100;
}

/**
 * Calculate total lease amount (including advance rent)
 */
export function calculateTotalLeaseAmount(
  monthlyRent: number,
  securityDeposit: number,
  advanceRentMonths: number = 0
): number {
  return monthlyRent * advanceRentMonths + securityDeposit;
}

/**
 * Calculate late payment penalty
 */
export function calculateLatePaymentPenalty(
  amount: number,
  penaltyPercentage: number,
  daysLate: number,
  graceDays: number = 0
): number {
  if (daysLate <= graceDays) return 0;
  
  const effectiveDaysLate = daysLate - graceDays;
  return Math.round(amount * (penaltyPercentage / 100) * (effectiveDaysLate / 30) * 100) / 100;
}

/**
 * Calculate revenue growth percentage
 */
export function calculateRevenueGrowth(
  currentRevenue: number,
  previousRevenue: number
): number {
  if (previousRevenue === 0) return currentRevenue > 0 ? 100 : 0;
  return Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100 * 100) / 100;
}

/**
 * Calculate days until date
 */
export function calculateDaysUntil(targetDate: string): number {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if date is overdue
 */
export function isOverdue(dueDate: string): boolean {
  const now = new Date();
  const due = new Date(dueDate);
  return now > due;
}

/**
 * Check if lease is expiring soon (within 30 days)
 */
export function isLeaseExpiringSoon(endDate: string, days: number = 30): boolean {
  const daysUntil = calculateDaysUntil(endDate);
  return daysUntil > 0 && daysUntil <= days;
}

// ============================================
// FORMATTING HELPERS
// ============================================

/**
 * Format currency (Ghana Cedis)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date range
 */
export function formatDateRange(startDate: string, endDate: string): string {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// ============================================
// FILTER OPTIONS
// ============================================

/**
 * Property filters
 */
export const PROPERTY_FILTERS = {
  verificationStatuses: [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "verified", label: "Verified" },
    { value: "rejected", label: "Rejected" },
  ],
  sortOptions: [
    { value: "name", label: "Name" },
    { value: "created_at", label: "Date Created" },
    { value: "total_units", label: "Total Units" },
    { value: "occupancy_rate", label: "Occupancy Rate" },
  ],
} as const;

/**
 * Unit filters
 */
export const UNIT_FILTERS = {
  occupancyStatuses: [
    { value: "all", label: "All Units" },
    { value: "occupied", label: "Occupied" },
    { value: "vacant", label: "Vacant" },
  ],
  types: [
    { value: "all", label: "All Types" },
    { value: "studio", label: "Studio" },
    { value: "one_bedroom", label: "1 Bedroom" },
    { value: "two_bedroom", label: "2 Bedrooms" },
    { value: "three_bedroom", label: "3 Bedrooms" },
    { value: "four_bedroom", label: "4 Bedrooms" },
    { value: "penthouse", label: "Penthouse" },
    { value: "shop", label: "Shop" },
    { value: "office", label: "Office" },
  ],
} as const;

/**
 * Lease filters
 */
export const LEASE_FILTERS = {
  statuses: [
    { value: "all", label: "All Leases" },
    { value: "active", label: "Active" },
    { value: "expired", label: "Expired" },
    { value: "terminated", label: "Terminated" },
    { value: "upcoming", label: "Upcoming" },
  ],
  sortOptions: [
    { value: "start_date", label: "Start Date" },
    { value: "end_date", label: "End Date" },
    { value: "monthly_rent", label: "Monthly Rent" },
  ],
} as const;

/**
 * Invoice filters
 */
export const INVOICE_FILTERS = {
  statuses: [
    { value: "all", label: "All Invoices" },
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" },
    { value: "partially_paid", label: "Partially Paid" },
  ],
  types: [
    { value: "all", label: "All Types" },
    { value: "rent", label: "Rent" },
    { value: "utility", label: "Utility" },
    { value: "maintenance", label: "Maintenance" },
    { value: "other", label: "Other" },
  ],
} as const;

/**
 * Payment filters
 */
export const PAYMENT_FILTERS = {
  methods: [
    { value: "all", label: "All Methods" },
    { value: "mobile_money", label: "Mobile Money" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "cash", label: "Cash" },
    { value: "cheque", label: "Cheque" },
  ],
  statuses: [
    { value: "all", label: "All Statuses" },
    { value: "completed", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
  ],
} as const;

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Check if property is verified
 */
export function isPropertyVerified(
  verificationStatus: string
): verificationStatus is "verified" {
  return verificationStatus === "verified";
}

/**
 * Check if lease is active
 */
export function isLeaseActive(status: string): status is "active" {
  return status === "active";
}

/**
 * Check if invoice is paid
 */
export function isInvoicePaid(status: string): status is "paid" {
  return status === "paid";
}

/**
 * Check if payment is completed
 */
export function isPaymentCompleted(status: string): status is "completed" {
  return status === "completed";
}

// ============================================
// DASHBOARD HELPERS
// ============================================

/**
 * Get dashboard status indicator color
 */
export function getDashboardStatusColor(
  value: number,
  thresholds: { good: number; warning: number }
): "success" | "warning" | "danger" {
  if (value >= thresholds.good) return "success";
  if (value >= thresholds.warning) return "warning";
  return "danger";
}

/**
 * Get occupancy status
 */
export function getOccupancyStatus(rate: number): {
  label: string;
  color: string;
} {
  if (rate >= 90) return { label: "Excellent", color: "success" };
  if (rate >= 75) return { label: "Good", color: "success" };
  if (rate >= 60) return { label: "Fair", color: "warning" };
  return { label: "Poor", color: "danger" };
}

/**
 * Get collection status
 */
export function getCollectionStatus(rate: number): {
  label: string;
  color: string;
} {
  if (rate >= 95) return { label: "Excellent", color: "success" };
  if (rate >= 85) return { label: "Good", color: "success" };
  if (rate >= 70) return { label: "Fair", color: "warning" };
  return { label: "Poor", color: "danger" };
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION = {
  per_page: 15,
  max_per_page: 100,
} as const;

/**
 * Date formats
 */
export const DATE_FORMATS = {
  display: "MMM DD, YYYY",
  api: "YYYY-MM-DD",
  full: "MMMM DD, YYYY h:mm A",
} as const;

/**
 * Currency settings
 */
export const CURRENCY_SETTINGS = {
  code: "GHS",
  symbol: "₵",
  name: "Ghana Cedi",
} as const;

