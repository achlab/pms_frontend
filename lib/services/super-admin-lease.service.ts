/**
 * Super Admin Lease Service
 * Handles lease oversight across ALL landlords
 * Following Single Responsibility Principle & SOLID
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  SystemLease,
  SuperAdminLeaseQueryParams,
  LeaseStatus,
  ApiResponse,
  PaginatedResponse,
} from "../api-types";

class SuperAdminLeaseService {
  private static instance: SuperAdminLeaseService;

  private constructor() {}

  static getInstance(): SuperAdminLeaseService {
    if (!SuperAdminLeaseService.instance) {
      SuperAdminLeaseService.instance = new SuperAdminLeaseService();
    }
    return SuperAdminLeaseService.instance;
  }

  // ============================================
  // SYSTEM-WIDE LEASE QUERIES
  // ============================================

  /**
   * Get all leases across ALL landlords
   * System-wide view with complete context
   * 
   * @param params - Query parameters for filtering
   * @returns Paginated list of all leases
   */
  async getAllLeases(
    params?: SuperAdminLeaseQueryParams
  ): Promise<PaginatedResponse<SystemLease>> {
    const url = buildUrl("/leases", params);
    return apiClient.get<PaginatedResponse<SystemLease>>(url);
  }

  /**
   * Get a specific lease by ID
   * 
   * @param leaseId - UUID of the lease
   * @returns Lease details with full context
   */
  async getLeaseDetails(leaseId: string): Promise<ApiResponse<SystemLease>> {
    return apiClient.get<ApiResponse<SystemLease>>(`/leases/${leaseId}`);
  }

  /**
   * Get leases by landlord
   * 
   * @param landlordId - UUID of the landlord
   * @param params - Additional query parameters
   * @returns Leases managed by specified landlord
   */
  async getLeasesByLandlord(
    landlordId: string,
    params?: SuperAdminLeaseQueryParams
  ): Promise<PaginatedResponse<SystemLease>> {
    return this.getAllLeases({ ...params, landlord_id: landlordId });
  }

  /**
   * Get leases by property
   * 
   * @param propertyId - UUID of the property
   * @param params - Additional query parameters
   * @returns Leases for specified property
   */
  async getLeasesByProperty(
    propertyId: string,
    params?: SuperAdminLeaseQueryParams
  ): Promise<PaginatedResponse<SystemLease>> {
    return this.getAllLeases({ ...params, property_id: propertyId });
  }

  /**
   * Get leases by tenant
   * 
   * @param tenantId - UUID of the tenant
   * @param params - Additional query parameters
   * @returns Leases for specified tenant
   */
  async getLeasesByTenant(
    tenantId: string,
    params?: SuperAdminLeaseQueryParams
  ): Promise<PaginatedResponse<SystemLease>> {
    return this.getAllLeases({ ...params, tenant_id: tenantId });
  }

  /**
   * Get leases by status
   * 
   * @param status - Lease status
   * @param params - Additional query parameters
   * @returns Leases with specified status
   */
  async getLeasesByStatus(
    status: LeaseStatus,
    params?: SuperAdminLeaseQueryParams
  ): Promise<PaginatedResponse<SystemLease>> {
    return this.getAllLeases({ ...params, status });
  }

  /**
   * Get active leases
   * 
   * @param params - Additional query parameters
   * @returns All active leases across system
   */
  async getActiveLeases(
    params?: SuperAdminLeaseQueryParams
  ): Promise<PaginatedResponse<SystemLease>> {
    return this.getLeasesByStatus("active", params);
  }

  /**
   * Get expired leases
   * 
   * @param params - Additional query parameters
   * @returns All expired leases
   */
  async getExpiredLeases(
    params?: SuperAdminLeaseQueryParams
  ): Promise<PaginatedResponse<SystemLease>> {
    return this.getLeasesByStatus("expired", params);
  }

  /**
   * Get terminated leases
   * 
   * @param params - Additional query parameters
   * @returns All terminated leases
   */
  async getTerminatedLeases(
    params?: SuperAdminLeaseQueryParams
  ): Promise<PaginatedResponse<SystemLease>> {
    return this.getLeasesByStatus("terminated", params);
  }

  /**
   * Get leases expiring soon
   * 
   * @param daysAhead - Number of days to look ahead (default: 30)
   * @param params - Additional query parameters
   * @returns Leases expiring within specified days
   */
  async getExpiringLeases(
    daysAhead: number = 30,
    params?: SuperAdminLeaseQueryParams
  ): Promise<ApiResponse<SystemLease[]>> {
    const url = buildUrl("/leases/expiring", {
      ...params,
      expiring_in_days: daysAhead,
    });
    return apiClient.get<ApiResponse<SystemLease[]>>(url);
  }

  /**
   * Get upcoming lease starts
   * 
   * @param daysAhead - Number of days to look ahead
   * @returns Leases starting soon
   */
  async getUpcomingLeaseStarts(
    daysAhead: number = 30
  ): Promise<ApiResponse<SystemLease[]>> {
    return apiClient.get<ApiResponse<SystemLease[]>>(
      `/leases/upcoming?days=${daysAhead}`
    );
  }

  // ============================================
  // LEASE STATISTICS
  // ============================================

  /**
   * Get comprehensive lease statistics
   * 
   * @returns System-wide lease statistics
   */
  async getLeaseStatistics(): Promise<ApiResponse<{
    total_leases: number;
    active_leases: number;
    expired_leases: number;
    terminated_leases: number;
    expiring_soon: number; // Within 30 days
    by_landlord: {
      landlord_id: string;
      landlord_name: string;
      total_leases: number;
      active_leases: number;
    }[];
    by_property: {
      property_id: string;
      property_name: string;
      landlord_name: string;
      active_leases: number;
    }[];
    average_lease_duration: number; // in months
    total_monthly_rent: number;
    total_security_deposits: number;
  }>> {
    return apiClient.get("/leases/statistics");
  }

  /**
   * Get lease statistics for a landlord
   * 
   * @param landlordId - UUID of the landlord
   * @returns Landlord-specific lease statistics
   */
  async getLandlordLeaseStatistics(
    landlordId: string
  ): Promise<ApiResponse<{
    total_leases: number;
    active_leases: number;
    expired_leases: number;
    average_duration: number;
    total_monthly_rent: number;
  }>> {
    return apiClient.get(`/landlords/${landlordId}/leases/statistics`);
  }

  /**
   * Get lease statistics for a property
   * 
   * @param propertyId - UUID of the property
   * @returns Property-specific lease statistics
   */
  async getPropertyLeaseStatistics(
    propertyId: string
  ): Promise<ApiResponse<{
    total_leases: number;
    active_leases: number;
    average_duration: number;
  }>> {
    return apiClient.get(`/properties/${propertyId}/leases/statistics`);
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
    property_name: string;
    unit_number: string;
    tenant_name: string;
    landlord_name: string;
    start_date: string;
    end_date: string;
    monthly_rent: number;
    status: LeaseStatus;
    is_active: boolean;
    outstanding_balance: number;
  }> {
    const response = await this.getLeaseDetails(leaseId);
    const lease = response.data!;

    return {
      id: lease.id,
      property_name: lease.property.name,
      unit_number: lease.unit.unit_number,
      tenant_name: lease.tenant.name,
      landlord_name: lease.property.landlord.name,
      start_date: lease.start_date,
      end_date: lease.end_date,
      monthly_rent: lease.monthly_rent,
      status: lease.status,
      is_active: lease.is_active,
      outstanding_balance: lease.outstanding_balance,
    };
  }

  /**
   * Get total lease count
   * 
   * @returns Total number of leases in system
   */
  async getTotalLeaseCount(): Promise<number> {
    const response = await this.getAllLeases({ per_page: 1 });
    return response.meta?.total || 0;
  }

  /**
   * Get lease count by landlord
   * 
   * @param landlordId - UUID of the landlord
   * @returns Number of leases managed by landlord
   */
  async getLeaseCountByLandlord(landlordId: string): Promise<number> {
    const response = await this.getLeasesByLandlord(landlordId, { per_page: 1 });
    return response.meta?.total || 0;
  }

  /**
   * Get active lease count
   * 
   * @returns Number of active leases in system
   */
  async getActiveLeaseCount(): Promise<number> {
    const response = await this.getActiveLeases({ per_page: 1 });
    return response.meta?.total || 0;
  }

  /**
   * Check if lease is active
   * 
   * @param leaseId - UUID of the lease
   * @returns Boolean indicating if lease is active
   */
  async isLeaseActive(leaseId: string): Promise<boolean> {
    const lease = await this.getLeaseDetails(leaseId);
    return lease.data!.status === "active" && lease.data!.is_active;
  }

  /**
   * Check if lease is expiring soon
   * 
   * @param leaseId - UUID of the lease
   * @param daysThreshold - Days threshold (default: 30)
   * @returns Boolean indicating if lease is expiring soon
   */
  async isLeaseExpiringSoon(
    leaseId: string,
    daysThreshold: number = 30
  ): Promise<boolean> {
    const lease = await this.getLeaseDetails(leaseId);
    const endDate = new Date(lease.data!.end_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysUntilExpiry > 0 && daysUntilExpiry <= daysThreshold;
  }

  /**
   * Get days until lease expires
   * 
   * @param leaseId - UUID of the lease
   * @returns Number of days until expiration (negative if expired)
   */
  async getDaysUntilExpiration(leaseId: string): Promise<number> {
    const lease = await this.getLeaseDetails(leaseId);
    const endDate = new Date(lease.data!.end_date);
    const today = new Date();

    return Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate total lease cost
   * 
   * @param leaseId - UUID of the lease
   * @returns Total cost of lease
   */
  async calculateTotalLeaseCost(leaseId: string): Promise<number> {
    const lease = await this.getLeaseDetails(leaseId);
    const data = lease.data!;

    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    const months = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    return months * data.monthly_rent;
  }

  /**
   * Get landlord for lease
   * 
   * @param leaseId - UUID of the lease
   * @returns Landlord information
   */
  async getLeaseLandlord(leaseId: string): Promise<{
    id: string;
    name: string;
  }> {
    const lease = await this.getLeaseDetails(leaseId);
    return lease.data!.property.landlord;
  }

  /**
   * Get tenant for lease
   * 
   * @param leaseId - UUID of the lease
   * @returns Tenant information
   */
  async getLeaseTenant(leaseId: string): Promise<{
    id: string;
    name: string;
    email: string;
    phone: string;
  }> {
    const lease = await this.getLeaseDetails(leaseId);
    return lease.data!.tenant;
  }

  // ============================================
  // COMPARATIVE ANALYSIS
  // ============================================

  /**
   * Compare leases by landlord
   * 
   * @returns Landlord comparison data
   */
  async compareLandlordLeases(): Promise<ApiResponse<{
    landlords: {
      landlord_id: string;
      landlord_name: string;
      total_leases: number;
      active_leases: number;
      expiring_soon: number;
      total_monthly_rent: number;
      average_lease_duration: number;
    }[];
    system_averages: {
      avg_lease_duration: number;
      avg_monthly_rent: number;
    };
  }>> {
    return apiClient.get("/leases/landlord-comparison");
  }

  /**
   * Get leases needing attention (expiring soon, outstanding balance, etc.)
   * 
   * @returns Leases requiring attention
   */
  async getLeasesNeedingAttention(): Promise<ApiResponse<SystemLease[]>> {
    return apiClient.get<ApiResponse<SystemLease[]>>("/leases/needs-attention");
  }

  /**
   * Get high-value leases
   * 
   * @param limit - Number of leases to return
   * @returns Top high-value leases
   */
  async getHighValueLeases(limit: number = 10): Promise<ApiResponse<SystemLease[]>> {
    return apiClient.get<ApiResponse<SystemLease[]>>(
      `/leases/high-value?limit=${limit}`
    );
  }

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  /**
   * Validate lease data
   * 
   * @param data - Lease data to validate
   * @returns Validation result
   */
  validateLeaseData(data: {
    start_date?: string;
    end_date?: string;
    monthly_rent?: number;
    security_deposit?: number;
  }): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (data.start_date && data.end_date) {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);

      if (end <= start) {
        errors.push("End date must be after start date");
      }
    }

    if (data.monthly_rent !== undefined && data.monthly_rent <= 0) {
      errors.push("Monthly rent must be greater than 0");
    }

    if (data.security_deposit !== undefined && data.security_deposit < 0) {
      errors.push("Security deposit cannot be negative");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const superAdminLeaseService = SuperAdminLeaseService.getInstance();
export default superAdminLeaseService;

