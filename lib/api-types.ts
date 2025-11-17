/**
 * API Types for Property Management System - Tenant Portal
 * Based on: TENANT_API_ENDPOINTS.md
 * Following SOLID principles with proper type safety
 */

// ============================================
// BASE TYPES & ENUMS
// ============================================

export type UserRole = "tenant" | "caretaker" | "landlord" | "super_admin";

export type LeaseStatus = "active" | "expired" | "terminated";
export type LeaseType = "new" | "renewal";
export type SecurityDepositStatus = "held" | "returned" | "forfeited";

export type InvoiceStatus = "pending" | "paid" | "overdue" | "partially_paid";
export type InvoiceType = "rent" | "utility" | "maintenance" | "other";

export type PaymentMethod = "mobile_money" | "bank_transfer" | "cash" | "cheque";
export type PaymentStatus = "completed" | "pending" | "failed";

export type MaintenanceStatus = 
  | "received" 
  | "assigned" 
  | "in_progress" 
  | "pending_approval" 
  | "approved" 
  | "resolved" 
  | "closed";

export type MaintenancePriority = "low" | "normal" | "urgent" | "emergency";
export type MaintenanceUrgencyLevel = "low" | "normal" | "urgent" | "emergency";
export type MaintenanceUpdateType = "status_change" | "note" | "assignment" | "cost_update";

export type PropertyType = "apartment" | "house" | "townhouse" | "condo" | "commercial";
export type UnitType = "studio" | "1bedroom" | "2bedroom" | "3bedroom" | "4bedroom" | "penthouse";

export type UtilityResponsibility = "tenant" | "landlord" | "shared";

// ============================================
// API RESPONSE WRAPPERS
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page?: number;
  };
  summary?: any;
}

// ============================================
// USER & AUTHENTICATION
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address: string;
  profile_picture: string | null;
  bio: string | null;
  is_verified: boolean;
  email_verified_at: string | null;
  landlord_id: string | null;
  created_at: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  role?: "tenant" | "landlord";
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface VerifyPasswordRequest {
  password: string;
}

// ============================================
// PROFILE
// ============================================

export interface Profile extends User {
  landlord?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  address?: string;
  bio?: string;
}

// ============================================
// PROPERTY & UNIT
// ============================================

export interface Property {
  id: string;
  name: string;
  address: string;
  property_type: PropertyType;
  gps_code?: string;
  region?: string;
  city?: string;
  country?: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Caretaker {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface Unit {
  id: string;
  property_id: string;
  unit_number: string;
  floor: string;
  unit_type: UnitType;
  bedrooms: number;
  bathrooms: number;
  square_footage: number;
  monthly_rent: number;
  is_available: boolean;
  is_active: boolean;
  features?: string[];
  description?: string;
  property?: Property;
  tenant?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  caretaker?: Caretaker;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// LEASE
// ============================================

export interface UtilitiesResponsibility {
  electricity: UtilityResponsibility;
  water: UtilityResponsibility;
  gas: UtilityResponsibility;
  internet: UtilityResponsibility;
}

export interface Lease {
  id: string;
  property: Property;
  unit: Unit;
  tenant: {
    id: string;
    name: string;
    phone: string;
  };
  landlord: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  advance_rent_months: number;
  total_advance_rent: number;
  payment_due_day: number;
  status: LeaseStatus;
  lease_type: LeaseType;
  security_deposit_status: SecurityDepositStatus;
  security_deposit_paid_at: string | null;
  utilities_responsibility: UtilitiesResponsibility;
  late_payment_penalty_percentage: number;
  late_payment_grace_days: number;
  termination_notice_days: number;
  special_terms: string | null;
  document_url: string | null;
  days_until_expiration: number;
  is_expiring_soon: boolean;
  is_active: boolean;
  ghana_rent_act_compliant: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// INVOICE & PAYMENT
// ============================================

export interface Invoice {
  id: string;
  invoice_number: string;
  property: {
    id: string;
    name: string;
    address: string;
  };
  unit: {
    id: string;
    unit_number: string;
  };
  tenant: {
    id: string;
    name: string;
  };
  landlord: {
    id: string;
    name: string;
  };
  invoice_date: string;
  due_date: string;
  period_start: string;
  period_end: string;
  base_rent_amount: number;
  additional_charges: number;
  total_amount: number;
  outstanding_balance: number;
  status: InvoiceStatus;
  invoice_type?: InvoiceType;
  paid_at: string | null;
  notes: string | null;
  is_overdue: boolean;
  days_overdue: number;
  payments?: Payment[];
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  payment_number: string;
  invoice?: {
    id: string;
    invoice_number: string;
    total_amount: number;
  };
  tenant: {
    id: string;
    name: string;
  };
  landlord: {
    id: string;
    name: string;
  };
  amount: number;
  payment_method: PaymentMethod;
  payment_reference: string;
  payment_date: string;
  status: PaymentStatus;
  notes: string | null;
  recorded_by?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at?: string;
}

export interface RecordPaymentRequest {
  amount: number;
  payment_method: PaymentMethod;
  payment_reference: string;
  payment_date: string;
  notes?: string;
}

export interface PaymentHistorySummary {
  total_payments: number;
  total_amount_paid: number;
  payment_methods_breakdown: {
    mobile_money: number;
    bank_transfer: number;
    cash: number;
    cheque?: number;
  };
}

// ============================================
// MAINTENANCE
// ============================================

export interface MaintenanceCategory {
  id: string;
  name: string;
  description: string;
  urgency_level: MaintenanceUrgencyLevel;
  icon: string;
  color: string;
  expected_resolution_hours: number;
  requires_landlord_approval: boolean;
  auto_approval_limit: number;
  is_active: boolean;
  sort_order: number;
}

export interface MaintenanceUpdate {
  id: string;
  update_type: MaintenanceUpdateType;
  previous_status?: MaintenanceStatus;
  new_status?: MaintenanceStatus;
  note: string;
  created_by: {
    id: string;
    name: string;
    role: UserRole;
  };
  is_internal: boolean;
  created_at: string;
}

export interface MaintenanceRequest {
  id: string;
  request_number: string;
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  property: {
    id: string;
    name: string;
    address: string;
  };
  unit: {
    id: string;
    unit_number: string;
  };
  tenant: {
    id: string;
    name: string;
    phone: string;
  };
  landlord: {
    id: string;
    name: string;
  };
  caretaker?: {
    id: string;
    name: string;
    phone: string;
  };
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
    urgency_level: MaintenanceUrgencyLevel;
  };
  estimated_cost: number | null;
  actual_cost: number | null;
  requires_approval: boolean;
  approved_at: string | null;
  preferred_start_date: string | null;
  scheduled_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  resolved_at: string | null;
  resolution_time_hours: number | null;
  tenant_rating: number | null;
  tenant_feedback: string | null;
  created_at: string;
  updated_at: string;
  updates: MaintenanceUpdate[];
  media: any[];
}

export interface CreateMaintenanceRequest {
  title: string;
  description: string;
  priority: MaintenancePriority;
  category_id: string;
  unit_id?: string;
  preferred_start_date?: string;
  media?: File[];
}

export interface AddMaintenanceNoteRequest {
  note: string;
  is_internal?: boolean;
}

export interface MaintenanceStatistics {
  total_requests: number;
  by_status: {
    received: number;
    assigned: number;
    in_progress: number;
    pending_approval: number;
    approved: number;
    resolved: number;
    closed: number;
  };
  by_priority: {
    low: number;
    normal: number;
    urgent: number;
    emergency: number;
  };
  average_resolution_time_hours: number;
  response_rate: string;
  satisfaction_rating: number;
}

// ============================================
// DASHBOARD & ANALYTICS
// ============================================

export interface DashboardOverview {
  total_invoices: number;
  paid_invoices: number;
  pending_invoices: number;
  overdue_invoices: number;
  total_amount_paid: number;
  outstanding_balance: number;
}

export interface CurrentLeaseInfo {
  id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  status: LeaseStatus;
  days_until_expiration: number;
  property: {
    name: string;
    address: string;
  };
  unit: {
    unit_number: string;
    bedrooms: number;
    bathrooms: number;
  };
}

export interface MaintenanceRequestsOverview {
  total: number;
  received: number;
  in_progress: number;
  resolved: number;
  urgent_count: number;
}

export interface RecentPayment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
}

export interface DashboardData {
  overview: DashboardOverview;
  current_lease: CurrentLeaseInfo | null;
  maintenance_requests: MaintenanceRequestsOverview;
  recent_payments: RecentPayment[];
  upcoming_due_date: string | null;
}

export interface PaymentTrendItem {
  month: string;
  amount: number;
  status: string;
}

export interface PaymentAnalytics {
  total_paid: number;
  total_invoices: number;
  average_payment: number;
  payment_trend: PaymentTrendItem[];
  payment_methods: {
    mobile_money: number;
    bank_transfer: number;
    cash: number;
    cheque?: number;
  };
}

// ============================================
// QUERY PARAMETERS
// ============================================

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface LeaseQueryParams extends PaginationParams {
  status?: LeaseStatus;
}

export interface InvoiceQueryParams extends PaginationParams {
  status?: InvoiceStatus;
  invoice_type?: InvoiceType;
  start_date?: string;
  end_date?: string;
}

export interface PaymentQueryParams extends PaginationParams {
  start_date?: string;
  end_date?: string;
  payment_method?: PaymentMethod;
}

export interface MaintenanceQueryParams extends PaginationParams {
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
  category_id?: string;
}

export interface PaymentAnalyticsParams {
  period?: "month" | "quarter" | "year";
  start_date?: string;
  end_date?: string;
}

export interface ExpiringLeasesParams {
  days?: number;
}

// ============================================
// ERROR HANDLING
// ============================================

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface ValidationError {
  field: string;
  messages: string[];
}

