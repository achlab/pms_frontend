/**
 * Landlord Lease Service
 * Handles all lease management operations for landlords (Full CRUD)
 * Following Single Responsibility Principle & SOLID
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  LandlordLease,
  CreateLeaseRequest,
  UpdateLeaseRequest,
  TerminateLeaseRequest,
  RenewLeaseRequest,
  LeaseQueryParams,
  ExpiringLeasesParams,
  ApiResponse,
  PaginatedResponse,
} from "../api-types";

class LandlordLeaseService {
  private static instance: LandlordLeaseService;

  private constructor() {}

  static getInstance(): LandlordLeaseService {
    if (!LandlordLeaseService.instance) {
      LandlordLeaseService.instance = new LandlordLeaseService();
    }
    return LandlordLeaseService.instance;
  }

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  /**
   * Get all leases owned by the landlord
   * Supports filtering by status, property, unit, etc.
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of leases
   */
  async getLeases(
    params?: LeaseQueryParams
  ): Promise<PaginatedResponse<LandlordLease>> {
    const url = buildUrl("/leases", params);
    return apiClient.get<PaginatedResponse<LandlordLease>>(url);
  }

  /**
   * Create a new lease
   * 
   * @param data - Lease creation data
   * @returns Created lease
   */
  async createLease(
    data: CreateLeaseRequest
  ): Promise<ApiResponse<LandlordLease>> {
    return apiClient.post<ApiResponse<LandlordLease>>("/leases", data);
  }

  /**
   * Get detailed information about a specific lease
   * 
   * @param leaseId - UUID of the lease
   * @returns Lease details
   */
  async getLease(leaseId: string): Promise<ApiResponse<LandlordLease>> {
    return apiClient.get<ApiResponse<LandlordLease>>(`/leases/${leaseId}`);
  }

  /**
   * Update lease information
   * 
   * @param leaseId - UUID of the lease
   * @param data - Updated lease data
   * @returns Updated lease
   */
  async updateLease(
    leaseId: string,
    data: UpdateLeaseRequest
  ): Promise<ApiResponse<LandlordLease>> {
    return apiClient.put<ApiResponse<LandlordLease>>(
      `/leases/${leaseId}`,
      data
    );
  }

  /**
   * Delete a lease
   * 
   * @param leaseId - UUID of the lease
   * @returns Success response
   */
  async deleteLease(leaseId: string): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/leases/${leaseId}`);
  }

  // ============================================
  // LEASE LIFECYCLE MANAGEMENT
  // ============================================

  /**
   * Terminate a lease before its end date
   * 
   * @param leaseId - UUID of the lease
   * @param data - Termination details
   * @returns Updated lease
   */
  async terminateLease(
    leaseId: string,
    data: TerminateLeaseRequest
  ): Promise<ApiResponse<LandlordLease>> {
    return apiClient.post<ApiResponse<LandlordLease>>(
      `/leases/${leaseId}/terminate`,
      data
    );
  }

  /**
   * Renew an existing lease
   * 
   * @param leaseId - UUID of the lease
   * @param data - Renewal details
   * @returns New lease created from renewal
   */
  async renewLease(
    leaseId: string,
    data: RenewLeaseRequest
  ): Promise<ApiResponse<LandlordLease>> {
    return apiClient.post<ApiResponse<LandlordLease>>(
      `/leases/${leaseId}/renew`,
      data
    );
  }

  // ============================================
  // LEASE QUERIES
  // ============================================

  /**
   * Get leases expiring soon
   * 
   * @param params - Days threshold (default: 30 days)
   * @returns List of expiring leases
   */
  async getExpiringLeases(
    params?: ExpiringLeasesParams
  ): Promise<ApiResponse<LandlordLease[]>> {
    const url = buildUrl("/leases/expiring-soon", params);
    return apiClient.get<ApiResponse<LandlordLease[]>>(url);
  }

  /**
   * Get upcoming lease starts
   * Leases that will start soon
   * 
   * @param days - Number of days to look ahead (default: 30)
   * @returns List of upcoming leases
   */
  async getUpcomingLeases(days: number = 30): Promise<ApiResponse<LandlordLease[]>> {
    return apiClient.get<ApiResponse<LandlordLease[]>>(
      `/leases/upcoming?days=${days}`
    );
  }

  /**
   * Export lease document/agreement
   * 
   * @param leaseId - UUID of the lease
   * @returns Lease document URL or binary data
   */
  async exportLeaseDocument(leaseId: string): Promise<ApiResponse<{
    document_url: string;
    download_url: string;
  }>> {
    return apiClient.get<ApiResponse<{
      document_url: string;
      download_url: string;
    }>>(`/leases/${leaseId}/export`);
  }

  // ============================================
  // LEASE STATISTICS
  // ============================================

  /**
   * Get comprehensive lease statistics
   * 
   * @returns Lease statistics
   */
  async getStatistics(): Promise<ApiResponse<{
    total_leases: number;
    active_leases: number;
    expired_leases: number;
    terminated_leases: number;
    upcoming_leases: number;
    expiring_soon: number;
    average_lease_duration: number;
    renewal_rate: number;
  }>> {
    return apiClient.get("/leases/statistics");
  }

  // ============================================
  // FILTERING HELPERS
  // ============================================

  /**
   * Get active leases
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of active leases
   */
  async getActiveLeases(
    params?: LeaseQueryParams
  ): Promise<PaginatedResponse<LandlordLease>> {
    return this.getLeases({ ...params, status: "active" });
  }

  /**
   * Get expired leases
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of expired leases
   */
  async getExpiredLeases(
    params?: LeaseQueryParams
  ): Promise<PaginatedResponse<LandlordLease>> {
    return this.getLeases({ ...params, status: "expired" });
  }

  /**
   * Get terminated leases
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of terminated leases
   */
  async getTerminatedLeases(
    params?: LeaseQueryParams
  ): Promise<PaginatedResponse<LandlordLease>> {
    return this.getLeases({ ...params, status: "terminated" });
  }

  /**
   * Get leases for a specific property
   * 
   * @param propertyId - UUID of the property
   * @param params - Additional query parameters
   * @returns Paginated list of leases
   */
  async getLeasesByProperty(
    propertyId: string,
    params?: LeaseQueryParams
  ): Promise<PaginatedResponse<LandlordLease>> {
    const url = buildUrl("/leases", { ...params, property_id: propertyId });
    return apiClient.get<PaginatedResponse<LandlordLease>>(url);
  }

  /**
   * Get lease for a specific unit
   * 
   * @param unitId - UUID of the unit
   * @param params - Additional query parameters
   * @returns Paginated list of leases
   */
  async getLeasesByUnit(
    unitId: string,
    params?: LeaseQueryParams
  ): Promise<PaginatedResponse<LandlordLease>> {
    const url = buildUrl("/leases", { ...params, unit_id: unitId });
    return apiClient.get<PaginatedResponse<LandlordLease>>(url);
  }

  /**
   * Get current lease for a unit
   * 
   * @param unitId - UUID of the unit
   * @returns Current active lease or null
   */
  async getCurrentLeaseForUnit(unitId: string): Promise<LandlordLease | null> {
    const response = await this.getLeasesByUnit(unitId, { status: "active" });
    return response.data.length > 0 ? response.data[0] : null;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get lease summary with key information
   * 
   * @param leaseId - UUID of the lease
   * @returns Simplified lease summary
   */
  async getLeaseSummary(leaseId: string): Promise<{
    id: string;
    lease_number: string;
    tenant_name: string;
    property_name: string;
    unit_number: string;
    monthly_rent: number;
    start_date: string;
    end_date: string;
    status: string;
    days_until_expiration: number;
    is_expiring_soon: boolean;
  }> {
    const response = await this.getLease(leaseId);
    const lease = response.data!;

    return {
      id: lease.id,
      lease_number: lease.lease_number,
      tenant_name: lease.tenant.name,
      property_name: lease.property.name,
      unit_number: lease.unit.unit_number,
      monthly_rent: lease.monthly_rent,
      start_date: lease.start_date,
      end_date: lease.end_date,
      status: lease.status,
      days_until_expiration: lease.days_until_expiration,
      is_expiring_soon: lease.is_expiring_soon,
    };
  }

  /**
   * Get tenant information from lease
   * 
   * @param leaseId - UUID of the lease
   * @returns Tenant details
   */
  async getTenantFromLease(leaseId: string): Promise<{
    id: string;
    name: string;
    phone: string;
  }> {
    const response = await this.getLease(leaseId);
    return response.data!.tenant;
  }

  /**
   * Get landlord information from lease
   * 
   * @param leaseId - UUID of the lease
   * @returns Landlord details
   */
  async getLandlordFromLease(leaseId: string): Promise<{
    id: string;
    name: string;
    email: string;
    phone: string;
  }> {
    const response = await this.getLease(leaseId);
    return response.data!.landlord;
  }

  /**
   * Check if lease is expiring soon
   * 
   * @param leaseId - UUID of the lease
   * @returns Boolean indicating if lease is expiring soon
   */
  async isLeaseExpiringSoon(leaseId: string): Promise<boolean> {
    const response = await this.getLease(leaseId);
    return response.data!.is_expiring_soon;
  }

  /**
   * Check if lease can be renewed
   * 
   * @param leaseId - UUID of the lease
   * @returns Boolean indicating if lease can be renewed
   */
  async canRenewLease(leaseId: string): Promise<boolean> {
    const response = await this.getLease(leaseId);
    return response.data!.can_renew;
  }

  /**
   * Check if lease can be terminated
   * 
   * @param leaseId - UUID of the lease
   * @returns Boolean indicating if lease can be terminated
   */
  async canTerminateLease(leaseId: string): Promise<boolean> {
    const response = await this.getLease(leaseId);
    return response.data!.can_terminate;
  }

  /**
   * Calculate total lease value
   * 
   * @param leaseId - UUID of the lease
   * @returns Total lease value including deposits and advance rent
   */
  async calculateLeaseValue(leaseId: string): Promise<number> {
    const response = await this.getLease(leaseId);
    const lease = response.data!;
    
    const totalAdvanceRent = lease.monthly_rent * lease.advance_rent_months;
    return totalAdvanceRent + lease.security_deposit;
  }

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  /**
   * Validate lease dates
   * 
   * @param startDate - Lease start date
   * @param endDate - Lease end date
   * @returns Validation result
   */
  validateLeaseDates(startDate: string, endDate: string): {
    valid: boolean;
    errors: string[];
  } {
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

    // Check minimum lease duration (Ghana Rent Act: 6 months minimum)
    const monthsDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsDiff < 6) {
      errors.push("Lease duration must be at least 6 months (Ghana Rent Act compliant)");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate lease data before creation/update
   * 
   * @param data - Lease data to validate
   * @returns Validation result
   */
  validateLeaseData(data: CreateLeaseRequest | UpdateLeaseRequest): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if ('monthly_rent' in data && data.monthly_rent !== undefined) {
      if (data.monthly_rent <= 0) {
        errors.push("Monthly rent must be greater than 0");
      }
    }

    if ('security_deposit' in data && (data as CreateLeaseRequest).security_deposit !== undefined) {
      if ((data as CreateLeaseRequest).security_deposit < 0) {
        errors.push("Security deposit cannot be negative");
      }
    }

    if ('advance_rent_months' in data && (data as CreateLeaseRequest).advance_rent_months !== undefined) {
      const months = (data as CreateLeaseRequest).advance_rent_months!;
      if (months < 0 || months > 6) {
        errors.push("Advance rent months must be between 0 and 6 (Ghana Rent Act)");
      }
    }

    if ('payment_due_day' in data && data.payment_due_day !== undefined) {
      if (data.payment_due_day < 1 || data.payment_due_day > 31) {
        errors.push("Payment due day must be between 1 and 31");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const landlordLeaseService = LandlordLeaseService.getInstance();
export default landlordLeaseService;

