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

export type PaymentMethod = "cash" | "mtn_momo" | "vodafone_cash" | "bank_transfer";
export type PaymentStatus = "completed" | "pending" | "failed";

export type MaintenanceStatus = 
  | "received" 
  | "assigned" 
  | "in_progress" 
  | "pending_approval" 
  | "approved" 
  | "rejected"
  | "resolved" 
  | "closed"
  | "cancelled";

export type MaintenancePriority = "low" | "normal" | "urgent" | "emergency";
export type MaintenanceUrgencyLevel = "low" | "normal" | "urgent" | "emergency";
export type MaintenanceUpdateType = "status_change" | "note" | "assignment" | "cost_update";

export type NotificationType = "maintenance_request_submitted" | "maintenance_request_status_updated";

// Status badge colors for UI
export type StatusBadgeColor = "default" | "warning" | "success" | "danger" | "info";
export type PriorityBadgeColor = "default" | "warning" | "danger" | "error";

export type PropertyType = "apartment" | "house" | "townhouse" | "condo" | "commercial";
export type UnitType = "studio" | "one_bedroom" | "two_bedroom" | "three_bedroom" | "four_bedroom" | "penthouse" | "shop" | "office";

export type UtilityResponsibility = "tenant" | "landlord" | "shared";

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  data: {
    request_id: string;
    request_number: string;
    property_name: string;
    unit_number: string;
    category?: string;
    priority: MaintenancePriority;
    title: string;
    tenant_name?: string;
    old_status?: MaintenanceStatus;
    new_status?: MaintenanceStatus;
    updated_by?: string;
    updated_by_role?: UserRole;
    note?: string;
    estimated_cost?: number;
    completion_date?: string;
    requires_approval?: boolean;
    preferred_start_date?: string;
    submitted_at?: string;
    updated_at?: string;
  };
  action_url: string;
  priority: MaintenancePriority;
}

export interface Notification {
  ID: string;
  Type: string; // Full class name like "MaintenanceRequestSubmittedNotification"
  Data: NotificationData;
  ReadAt: string | null;
  IsRead: boolean;
  CreatedAt: string;
  TimeAgo: string;
  Title: string;
  Message: string;
  Icon: string;
  ActionUrl: string | null;
}

export interface NotificationStats {
  UnreadCount: number;
}

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
  profile_picture_url?: string | null; // Full URL to profile picture
  bio: string | null;
  is_verified: boolean;
  email_verified_at: string | null;
  landlord_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  requires_password_change?: boolean;
  success?: boolean;
  message?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  address?: string;
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

export interface ProfilePictureResponse {
  profile_picture: string;
  profile_picture_url: string;
}

export interface UploadProfilePictureRequest {
  profile_picture: File;
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
    cash: number;
    mtn_momo: number;
    vodafone_cash: number;
    bank_transfer: number;
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

/**
 * Media file for maintenance requests
 */
export interface MaintenanceMedia {
  id: string;
  file_path: string;
  file_url: string;
  file_type: "image" | "document" | "video";
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  uploaded_by: {
    id: string;
    name: string;
    role: UserRole;
  };
}

export interface MaintenanceRequestEvent {
  id: string;
  event_type: string;
  title: string;
  description: string;
  rejection_reason?: string | null;
  created_at: string;
  user?: {
    id: string;
    name: string;
    role: string;
  };
  metadata?: any;
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
    landlord_id?: string;
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
  landlord_id?: string;
  caretaker?: {
    id: string;
    name: string;
    phone: string;
  };
  assigned_to?: {
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
    expected_resolution_hours?: number;
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
  media: MaintenanceMedia[];
  events?: MaintenanceRequestEvent[];
}

export interface CreateMaintenanceRequest {
  title: string;
  description: string;
  priority: MaintenancePriority;
  category_id: string;
  property_id: string;
  property_unit_id?: string;
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
    cash: number;
    mtn_momo: number;
    vodafone_cash: number;
    bank_transfer: number;
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
// CARETAKER-SPECIFIC TYPES
// ============================================

/**
 * Caretaker maintenance request with additional workflow fields
 * Extends base MaintenanceRequest with caretaker-specific data
 */
export interface CaretakerMaintenanceRequest extends MaintenanceRequest {
  status_badge_color: StatusBadgeColor;
  priority_badge_color: PriorityBadgeColor;
  is_overdue: boolean;
  estimated_resolution_time: string | null;
  next_allowed_statuses: MaintenanceStatus[];
  can_be_updated: boolean;
  assigned_at: string | null;
}

/**
 * Update maintenance request status (Caretaker action)
 */
export interface UpdateMaintenanceStatusRequest {
  status: MaintenanceStatus;
  note?: string;
  estimated_cost?: number;
  actual_cost?: number;
  cost_description?: string;
  estimated_completion_date?: string;
}

/**
 * Add note to maintenance request with optional media
 */
export interface AddMaintenanceNoteWithMediaRequest {
  note: string;
  media?: File[];
}

/**
 * Caretaker statistics for dashboard
 */
export interface CaretakerStatistics {
  total: number;
  by_status: {
    received: number;
    assigned: number;
    in_progress: number;
    pending_approval: number;
    approved: number;
    resolved: number;
    closed: number;
    cancelled?: number;
  };
  by_priority: {
    low: number;
    medium: number;
    high: number;
    emergency: number;
  };
  overdue: number;
  this_month: number;
  average_resolution_time: number;
}

/**
 * Property with caretaker assignment info
 */
export interface CaretakerProperty extends Property {
  landlord: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  caretaker: {
    id: string;
    name: string;
    phone: string;
  };
  total_units: number;
  occupied_units: number;
  verification_status: string;
}

/**
 * Unit with caretaker assignment
 */
export interface CaretakerUnit extends Unit {
  property: {
    id: string;
    name: string;
    address: string;
  };
  is_occupied: boolean;
  rental_amount: number;
}

/**
 * Lease information for caretakers (read-only)
 */
export interface CaretakerLease extends Lease {
  lease_number: string;
  days_until_expiration: number;
  is_expiring_soon: boolean;
  is_active: boolean;
}

/**
 * Query parameters for caretaker maintenance requests
 */
export interface CaretakerMaintenanceQueryParams extends MaintenanceQueryParams {
  property_id?: string;
  search?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}

/**
 * Status transition rules for validation
 */
export interface StatusTransitionRule {
  from: MaintenanceStatus;
  to: MaintenanceStatus[];
  requiresApproval?: boolean;
  requiresNote?: boolean;
  requiresCost?: boolean;
}

// ============================================
// LANDLORD-SPECIFIC TYPES
// ============================================

/**
 * Landlord property with full management capabilities
 */
export interface LandlordProperty extends Property {
  landlord: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  caretaker?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  units?: Array<{
    id: string;
    unit_number: string;
    unit_type: string;
    rental_amount: number;
    is_occupied: boolean;
    is_active: boolean;
    tenant_id?: string;
    tenant?: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  }>;
  analytics?: {
    total_units: number;
    occupied_units: number;
    vacant_units: number;
    occupancy_rate: number;
    monthly_revenue: number;
    expected_monthly_revenue: number;
    revenue_efficiency: number;
  };
  financial_summary?: {
    total_revenue_ytd: number;
    expenses_ytd: number;
    net_income_ytd: number;
    monthly_trends: Array<{
      month: string;
      revenue: number;
    }>;
  };
  total_units: number;
  occupied_units: number;
  vacant_units?: number;
  active_leases?: number;
  verification_status: "pending" | "verified" | "rejected";
  ghana_post_gps_address?: string;
  street_address: string;
}

// Financial analytics interface
export interface PropertyFinancials {
  monthly_revenue: number;
  yearly_revenue: number;
  expenses: {
    maintenance: number;
    utilities: number;
    management: number;
    total: number;
  };
  net_income: number;
  revenue_trends: Array<{
    month: string;
    revenue: number;
  }>;
  occupancy_trends: Array<{
    month: string;
    rate: number;
  }>;
}

// Available tenant interface
export interface AvailableTenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_available: boolean;
}

/**
 * Create property request
 */
export interface CreatePropertyRequest {
  name: string;
  description?: string;
  street_address: string;
  ghana_post_gps_address?: string;
  caretaker_id?: string;
}

/**
 * Update property request
 */
export interface UpdatePropertyRequest {
  name?: string;
  description?: string;
  street_address?: string;
  ghana_post_gps_address?: string;
  caretaker_id?: string;
}

/**
 * Landlord unit with full management capabilities
 */
export interface LandlordUnit extends Unit {
  property: {
    id: string;
    name: string;
    address: string;
  };
  tenant?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  caretaker?: {
    id: string;
    name: string;
    phone: string;
  };
  is_occupied: boolean;
  rental_amount: number;
  disabled_reason?: string;
}

/**
 * Create unit request
 */
export interface CreateUnitRequest {
  property_id: string;
  unit_number: string;
  description?: string;
  unit_type: UnitType;
  floor_number?: number;
  rental_amount: number;
  caretaker_id?: string;
}

/**
 * Update unit request
 */
export interface UpdateUnitRequest {
  description?: string;
  unit_type?: UnitType;
  floor_number?: number;
  rental_amount?: number;
  caretaker_id?: string;
}

/**
 * Unit assignment request
 */
export interface AssignUnitRequest {
  tenant_id?: string | null;
  caretaker_id?: string | null;
}

/**
 * Unit statistics
 */
export interface UnitStatistics {
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  active_units: number;
  disabled_units: number;
  occupancy_rate: number;
  by_property: {
    property_id: string;
    property_name: string;
    total: number;
    occupied: number;
    occupancy_rate: number;
  }[];
}

/**
 * Landlord lease with full management capabilities
 */
export interface LandlordLease extends Lease {
  lease_number: string;
  lease_document_url?: string;
  can_renew: boolean;
  can_terminate: boolean;
}

/**
 * Create lease request
 */
export interface CreateLeaseRequest {
  tenant_id: string;
  unit_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  advance_rent_months?: number;
  payment_due_day?: number;
  late_payment_penalty_percentage?: number;
  late_payment_grace_days?: number;
  termination_notice_days?: number;
  special_terms?: string;
  utilities_responsibility?: UtilitiesResponsibility;
}

/**
 * Update lease request
 */
export interface UpdateLeaseRequest {
  end_date?: string;
  monthly_rent?: number;
  payment_due_day?: number;
  late_payment_penalty_percentage?: number;
  late_payment_grace_days?: number;
  special_terms?: string;
}

/**
 * Terminate lease request
 */
export interface TerminateLeaseRequest {
  termination_date: string;
  reason: string;
}

/**
 * Renew lease request
 */
export interface RenewLeaseRequest {
  new_start_date: string;
  new_end_date: string;
  new_monthly_rent?: number;
}

/**
 * Landlord invoice with full management capabilities
 */
export interface LandlordInvoice extends Invoice {
  can_edit: boolean;
  can_delete: boolean;
  can_send_reminder: boolean;
}

/**
 * Create invoice request
 */
export interface CreateInvoiceRequest {
  tenant_id: string;
  unit_id: string;
  invoice_date: string;
  due_date: string;
  period_start: string;
  period_end: string;
  base_rent_amount: number;
  additional_charges?: number;
  invoice_type?: InvoiceType;
  notes?: string;
}

/**
 * Update invoice request
 */
export interface UpdateInvoiceRequest {
  due_date?: string;
  base_rent_amount?: number;
  additional_charges?: number;
  notes?: string;
}

/**
 * Bulk invoice generation request
 */
export interface BulkInvoiceGenerationRequest {
  property_ids?: string[];
  unit_ids?: string[];
  invoice_date: string;
  due_date: string;
  period_start: string;
  period_end: string;
  additional_charges?: {
    description: string;
    amount: number;
  }[];
  notes?: string;
}

export interface InvoiceStatistics {
  total_invoices: number;
  pending_invoices: number;
  paid_invoices: number;
  overdue_invoices: number;
  total_amount: number;
  total_paid: number;
  total_outstanding: number;
  collection_rate: number;
}

/**
 * Landlord payment with full capabilities
 */
export interface LandlordPayment extends Payment {
  can_edit: boolean;
  can_delete: boolean;
}

/**
 * Record payment request (landlord version with more fields)
 */
export interface LandlordRecordPaymentRequest extends RecordPaymentRequest {
  invoice_id?: string;
  tenant_id?: string;
}

/**
 * Update payment request
 */
export interface UpdatePaymentRequest {
  amount?: number;
  payment_method?: PaymentMethod;
  payment_reference?: string;
  payment_date?: string;
  notes?: string;
}

/**
 * Payment trends data
 */
export interface PaymentTrends {
  monthly_trends: {
    month: string;
    total_amount: number;
    total_payments: number;
    average_payment: number;
  }[];
  by_method: {
    method: PaymentMethod;
    total_amount: number;
    count: number;
  }[];
}

/**
 * Create user request (for caretakers/tenants)
 */
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  address?: string;
  role: "caretaker" | "tenant";
  bio?: string;
}

/**
 * Update user request
 */
export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  address?: string;
  bio?: string;
  is_active?: boolean;
}

/**
 * Landlord maintenance request with approval capabilities
 */
export interface LandlordMaintenanceRequest extends CaretakerMaintenanceRequest {
  can_approve: boolean;
  can_reject: boolean;
  can_assign: boolean;
}

/**
 * Assign maintenance request
 */
export interface AssignMaintenanceRequest {
  caretaker_id: string;
  note?: string;
  scheduled_date?: string;
}

/**
 * Approve/Reject maintenance request
 */
export interface ApproveRejectMaintenanceRequest {
  action: "approve" | "reject";
  note?: string;
  approved_cost?: number;
}

/**
 * Landlord dashboard overview
 */
export interface LandlordDashboardOverview {
  total_properties: number;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  occupancy_rate: number;
  active_leases: number;
  expiring_leases_30_days: number;
  total_revenue_this_month: number;
  total_revenue_last_month: number;
  revenue_growth_percentage: number;
  pending_payments: number;
  overdue_invoices: number;
  total_outstanding: number;
  active_maintenance_requests: number;
  pending_approval_requests: number;
}

/**
 * Financial summary
 */
export interface FinancialSummary {
  total_revenue: number;
  collected_rent: number;
  pending_rent: number;
  overdue_amount: number;
  expenses: number;
  net_income: number;
  collection_rate: number;
}

/**
 * Revenue trends
 */
export interface RevenueTrends {
  monthly_revenue: {
    month: string;
    revenue: number;
    collected: number;
    pending: number;
  }[];
  year_over_year: {
    current_year: number;
    previous_year: number;
    growth_percentage: number;
  };
}

/**
 * Occupancy analytics
 */
export interface OccupancyAnalytics {
  overall_occupancy_rate: number;
  by_property: {
    property_id: string;
    property_name: string;
    total_units: number;
    occupied_units: number;
    occupancy_rate: number;
  }[];
  trends: {
    month: string;
    occupancy_rate: number;
  }[];
}

/**
 * Property performance
 */
export interface PropertyPerformance {
  property_id: string;
  property_name: string;
  total_units: number;
  occupied_units: number;
  occupancy_rate: number;
  monthly_revenue: number;
  collection_rate: number;
  maintenance_requests: number;
  average_rent: number;
}

/**
 * Maintenance analytics
 */
export interface MaintenanceAnalytics {
  total_requests: number;
  by_status: Record<MaintenanceStatus, number>;
  by_priority: Record<string, number>;
  average_resolution_time: number;
  overdue_count: number;
  pending_approval_count: number;
}

/**
 * Tenant analytics
 */
export interface TenantAnalytics {
  total_tenants: number;
  active_tenants: number;
  payment_compliance_rate: number;
  average_lease_duration: number;
  tenant_retention_rate: number;
}

// ============================================
// SUPER ADMIN TYPES
// ============================================

/**
 * Super Admin User Management
 * Super admins can create ALL user roles
 */

export interface SuperAdminCreateUserRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  address?: string;
  role: "super_admin" | "landlord" | "caretaker" | "tenant";
  landlord_id?: string; // Required for caretaker and tenant
  emergency_contact?: string;
}

export interface SuperAdminUser extends User {
  landlord?: {
    id: string;
    name: string;
    email: string;
  };
  properties_count?: number; // For landlords
  assigned_properties?: number; // For caretakers
  active_lease?: boolean; // For tenants
}

/**
 * System-Wide Data Types
 * All entities include cross-landlord context
 */

export interface SystemProperty {
  id: string;
  name: string;
  description?: string;
  street_address: string;
  ghana_post_gps_address?: string;
  landlord: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  caretaker?: {
    id: string;
    name: string;
    phone: string;
  };
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  occupancy_rate: number;
  monthly_revenue: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SystemUnit {
  id: string;
  unit_number: string;
  property: {
    id: string;
    name: string;
    landlord: {
      id: string;
      name: string;
    };
  };
  unit_type: string;
  size_sqft?: number;
  bedrooms: number;
  bathrooms: number;
  floor_number?: number;
  monthly_rent: number;
  is_occupied: boolean;
  is_active: boolean;
  current_tenant?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  created_at: string;
}

export interface SystemLease {
  id: string;
  property: {
    id: string;
    name: string;
    landlord: {
      id: string;
      name: string;
    };
  };
  unit: {
    id: string;
    unit_number: string;
  };
  tenant: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  status: LeaseStatus;
  lease_terms?: string;
  total_rent_paid: number;
  outstanding_balance: number;
  is_active: boolean;
  created_at: string;
}

export interface SystemInvoice {
  id: string;
  invoice_number: string;
  landlord: {
    id: string;
    name: string;
  };
  property: {
    id: string;
    name: string;
  };
  unit: {
    id: string;
    unit_number: string;
  };
  tenant: {
    id: string;
    name: string;
    email: string;
  };
  invoice_type: InvoiceType;
  amount: number;
  total_amount: number;
  amount_paid: number;
  balance: number;
  due_date: string;
  status: InvoiceStatus;
  description?: string;
  created_at: string;
  is_overdue: boolean;
}

export interface SystemPayment {
  id: string;
  payment_number: string;
  landlord: {
    id: string;
    name: string;
  };
  tenant: {
    id: string;
    name: string;
  };
  invoice?: {
    id: string;
    invoice_number: string;
  };
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  payment_reference: string;
  status: PaymentStatus;
  notes?: string;
  created_at: string;
}

export interface SystemMaintenanceRequest {
  id: string;
  title: string;
  description: string;
  landlord: {
    id: string;
    name: string;
  };
  property: {
    id: string;
    name: string;
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
  assigned_caretaker?: {
    id: string;
    name: string;
    phone: string;
  };
  category: {
    id: string;
    name: string;
  };
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  estimated_cost?: number;
  actual_cost?: number;
  scheduled_date?: string;
  completed_date?: string;
  media: MaintenanceMedia[];
  created_at: string;
  updated_at: string;
}

/**
 * Super Admin Analytics & Dashboard
 */

export interface SystemDashboard {
  overview: SystemOverview;
  financial: SystemFinancialSummary;
  occupancy: OccupancyOverview;
  maintenance: MaintenanceOverview;
  activities: SystemActivity[];
  top_landlords: TopLandlordMetrics[];
}

export interface SystemOverview {
  total_landlords: number;
  total_caretakers: number;
  total_tenants: number;
  total_properties: number;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  overall_occupancy_rate: number;
  active_leases: number;
  total_monthly_revenue: number;
}

export interface UserRoleStatistics {
  super_admins: {
    total: number;
    active: number;
  };
  landlords: {
    total: number;
    active: number;
    with_properties: number;
    without_properties: number;
  };
  caretakers: {
    total: number;
    active: number;
    assigned: number;
    unassigned: number;
  };
  tenants: {
    total: number;
    active: number;
    with_lease: number;
    without_lease: number;
  };
  total_users: number;
  active_users: number;
  inactive_users: number;
}

export interface SystemFinancialSummary {
  total_revenue: number;
  total_revenue_this_month: number;
  total_revenue_last_month: number;
  revenue_growth_percentage: number;
  total_outstanding: number;
  total_overdue: number;
  collection_rate: number;
  by_landlord: LandlordRevenue[];
  payment_methods_breakdown: {
    cash: number;
    mtn_momo: number;
    vodafone_cash: number;
    bank_transfer: number;
  };
}

export interface LandlordRevenue {
  landlord_id: string;
  landlord_name: string;
  total_properties: number;
  total_units: number;
  monthly_revenue: number;
  collection_rate: number;
  outstanding_amount: number;
}

export interface PropertyOverview {
  total_properties: number;
  active_properties: number;
  inactive_properties: number;
  by_landlord: {
    landlord_id: string;
    landlord_name: string;
    properties_count: number;
    units_count: number;
  }[];
  average_units_per_property: number;
}

export interface OccupancyOverview {
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  overall_occupancy_rate: number;
  by_landlord: {
    landlord_id: string;
    landlord_name: string;
    total_units: number;
    occupied_units: number;
    occupancy_rate: number;
  }[];
  occupancy_trend: "increasing" | "decreasing" | "stable";
}

export interface MaintenanceOverview {
  total_requests: number;
  open_requests: number;
  in_progress_requests: number;
  completed_requests: number;
  overdue_requests: number;
  by_priority: {
    low: number;
    medium: number;
    high: number;
    emergency: number;
  };
  by_status: Record<MaintenanceStatus, number>;
  average_resolution_time: number; // in hours
  by_landlord: {
    landlord_id: string;
    landlord_name: string;
    total_requests: number;
    open_requests: number;
    completion_rate: number;
  }[];
}

export interface SystemActivity {
  id: string;
  type: "user_created" | "property_created" | "lease_created" | "payment_received" | "maintenance_created";
  description: string;
  user: {
    id: string;
    name: string;
    role: UserRole;
  };
  landlord?: {
    id: string;
    name: string;
  };
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface TopLandlordMetrics {
  landlord_id: string;
  landlord_name: string;
  total_properties: number;
  total_units: number;
  occupied_units: number;
  occupancy_rate: number;
  monthly_revenue: number;
  collection_rate: number;
  maintenance_requests: number;
  performance_score: number; // 0-100
}

/**
 * Query Parameters for Super Admin
 */

export interface SuperAdminUserQueryParams extends QueryParams {
  role?: UserRole;
  landlord_id?: string;
  is_active?: boolean;
  has_properties?: boolean; // For landlords
  is_assigned?: boolean; // For caretakers
  has_lease?: boolean; // For tenants
  search?: string;
}

export interface SuperAdminPropertyQueryParams extends QueryParams {
  landlord_id?: string;
  is_active?: boolean;
  has_caretaker?: boolean;
  min_units?: number;
  max_units?: number;
  min_occupancy_rate?: number;
  search?: string;
}

export interface SuperAdminUnitQueryParams extends QueryParams {
  property_id?: string;
  landlord_id?: string;
  is_occupied?: boolean;
  is_active?: boolean;
  min_rent?: number;
  max_rent?: number;
  bedrooms?: number;
}

export interface SuperAdminLeaseQueryParams extends QueryParams {
  landlord_id?: string;
  property_id?: string;
  tenant_id?: string;
  status?: LeaseStatus;
  expiring_in_days?: number;
}

export interface SuperAdminInvoiceQueryParams extends QueryParams {
  landlord_id?: string;
  tenant_id?: string;
  status?: InvoiceStatus;
  invoice_type?: InvoiceType;
  is_overdue?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface SuperAdminPaymentQueryParams extends QueryParams {
  landlord_id?: string;
  tenant_id?: string;
  payment_method?: PaymentMethod;
  start_date?: string;
  end_date?: string;
}

export interface SuperAdminMaintenanceQueryParams extends QueryParams {
  landlord_id?: string;
  property_id?: string;
  caretaker_id?: string;
  priority?: MaintenancePriority;
  status?: MaintenanceStatus;
  is_overdue?: boolean;
}

/**
 * Statistics & Reporting
 */

export interface UserStatistics {
  total_users: number;
  by_role: {
    super_admin: number;
    landlord: number;
    caretaker: number;
    tenant: number;
  };
  active_users: number;
  inactive_users: number;
  recently_created: number; // Last 30 days
}

export interface CrossLandlordComparison {
  landlords: {
    landlord_id: string;
    landlord_name: string;
    metrics: {
      properties_count: number;
      units_count: number;
      occupancy_rate: number;
      monthly_revenue: number;
      collection_rate: number;
      maintenance_efficiency: number;
      tenant_satisfaction: number;
    };
  }[];
  system_averages: {
    avg_occupancy_rate: number;
    avg_collection_rate: number;
    avg_maintenance_efficiency: number;
  };
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

