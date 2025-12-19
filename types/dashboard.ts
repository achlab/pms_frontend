/**
 * Dashboard Types
 * Shared types for all dashboard components
 */

import { MaintenanceStatus, MaintenancePriority, PropertyType, UnitType } from "@/lib/api-types"

// ============================================
// ACTIVITY TYPES
// ============================================

export type ActivityType =
  | "maintenance_request"
  | "maintenance_update"
  | "maintenance_resolved"
  | "payment_confirmed"
  | "payment_recorded"
  | "lease_viewed"
  | "tenant_registration"
  | "property_added"
  | "property_verification"
  | "fraud_detection"
  | "user_created"
  | "lease_created"
  | "lease_renewed"
  | "lease_terminated"
  | "system_update"

export type ActivityStatus = "pending" | "in_progress" | "completed" | "cancelled"

export interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string
  user?: string
  timestamp: string
  status?: ActivityStatus
  metadata?: Record<string, any>
}

// ============================================
// DASHBOARD STATS
// ============================================

export interface DashboardStats {
  // Common stats
  totalProperties?: number
  totalUnits?: number
  occupiedUnits?: number
  vacantUnits?: number
  occupancyRate?: number
  
  // Financial stats
  totalRevenue?: number
  monthlyRevenue?: number
  monthlyExpectedRent?: number
  rentCollectedYTD?: number
  outstandingBalance?: number
  pendingPayments?: number
  collectedPayments?: number
  
  // User stats (Super Admin)
  totalUsers?: number
  landlords?: number
  tenants?: number
  caretakers?: number
  
  // Property stats (Super Admin)
  verifiedProperties?: number
  pendingVerification?: number
  
  // System stats (Super Admin)
  systemHealth?: number
  fraudFlags?: number
  
  // Maintenance stats
  maintenanceRequests?: number
  pendingMaintenance?: number
  completedMaintenance?: number
  
  // Tenant stats
  currentBalance?: number
  nextRentDue?: string
  nextRentAmount?: number
  lastPaymentDate?: string
  lastPaymentAmount?: number
}

// ============================================
// PROPERTY TYPES
// ============================================

export interface Property {
  id: string
  name: string
  address: string
  type: PropertyType
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  monthlyRevenue: number
  imageUrl?: string
  caretaker?: {
    id: string
    name: string
    phone?: string
    email?: string
  }
  landlord?: {
    id: string
    name: string
    phone?: string
    email?: string
  }
}

// ============================================
// MANUAL TASK TYPES
// ============================================

export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled"
export type TaskPriority = "low" | "medium" | "high" | "urgent"

export interface ManualTask {
  id: string
  title: string
  description: string
  property?: string
  unit?: string
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
  assignedTo?: string
  createdBy?: string
  createdAt: string
  completedAt?: string
}

// ============================================
// FRAUD ALERT TYPES
// ============================================

export type FraudSeverity = "low" | "medium" | "high" | "critical"
export type FraudType = 
  | "duplicate_property"
  | "suspicious_payment"
  | "identity_verification"
  | "multiple_accounts"
  | "fake_documents"
  | "payment_reversal"
  | "unusual_activity"

export interface FraudAlert {
  id: string
  propertyId: string
  landlord: string
  landlordId?: string
  issue: string
  type: FraudType
  severity: FraudSeverity
  reportedAt: string
  reviewedAt?: string
  reviewedBy?: string
  status: "pending" | "under_review" | "resolved" | "dismissed"
  details?: string
  evidence?: string[]
}

// ============================================
// MAINTENANCE SUMMARY
// ============================================

export interface MaintenanceSummary {
  total: number
  pending: number
  in_progress: number
  completed: number
  by_priority: {
    emergency: number
    urgent: number
    normal: number
    low: number
  }
  by_category?: Record<string, number>
}

// ============================================
// FINANCIAL SUMMARY
// ============================================

export interface FinancialSummary {
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  collectionRate: number
  outstandingBalance: number
  monthlyTrends?: {
    month: string
    revenue: number
    expenses: number
    netIncome: number
  }[]
}

// ============================================
// OCCUPANCY SUMMARY
// ============================================

export interface OccupancySummary {
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  occupancyRate: number
  by_property?: {
    propertyId: string
    propertyName: string
    totalUnits: number
    occupiedUnits: number
    occupancyRate: number
  }[]
}
