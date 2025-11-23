/**
 * Caretaker Lease Service
 * Handles lease information viewing for caretakers (read-only)
 * Following Single Responsibility Principle & SOLID
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  CaretakerLease,
  LeaseQueryParams,
  ExpiringLeasesParams,
  ApiResponse,
  PaginatedResponse,
} from "../api-types";

class CaretakerLeaseService {
  private static instance: CaretakerLeaseService;

  private constructor() {}

  static getInstance(): CaretakerLeaseService {
    if (!CaretakerLeaseService.instance) {
      CaretakerLeaseService.instance = new CaretakerLeaseService();
    }
    return CaretakerLeaseService.instance;
  }

  // ============================================
  // LEASE OPERATIONS (READ-ONLY)
  // ============================================

  /**
   * Get all leases for properties managed by the caretaker
   * Supports filtering by status, property, and unit
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of leases
   */
  async getLeases(
    params?: LeaseQueryParams
  ): Promise<PaginatedResponse<CaretakerLease>> {
    const url = buildUrl("/leases", params);
    return apiClient.get<PaginatedResponse<CaretakerLease>>(url);
  }

  /**
   * Get detailed information about a specific lease
   * 
   * @param leaseId - UUID of the lease
   * @returns Lease details
   */
  async getLease(leaseId: string): Promise<ApiResponse<CaretakerLease>> {
    return apiClient.get<ApiResponse<CaretakerLease>>(`/leases/${leaseId}`);
  }

  /**
   * Get leases expiring soon
   * Useful for planning and tenant communication
   * 
   * @param params - Days threshold (default: 30 days)
   * @returns List of expiring leases
   */
  async getExpiringLeases(
    params?: ExpiringLeasesParams
  ): Promise<ApiResponse<CaretakerLease[]>> {
    const url = buildUrl("/leases/expiring-soon", params);
    return apiClient.get<ApiResponse<CaretakerLease[]>>(url);
  }

  // ============================================
  // FILTERING HELPERS
  // ============================================

  /**
   * Get active leases only
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of active leases
   */
  async getActiveLeases(
    params?: LeaseQueryParams
  ): Promise<PaginatedResponse<CaretakerLease>> {
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
  ): Promise<PaginatedResponse<CaretakerLease>> {
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
  ): Promise<PaginatedResponse<CaretakerLease>> {
    return this.getLeases({ ...params, status: "terminated" });
  }

  /**
   * Get leases for a specific property
   * 
   * @param propertyId - UUID of the property
   * @param params - Additional query parameters
   * @returns Paginated list of leases for the property
   */
  async getLeasesByProperty(
    propertyId: string,
    params?: LeaseQueryParams
  ): Promise<PaginatedResponse<CaretakerLease>> {
    const url = buildUrl("/leases", { ...params, property_id: propertyId });
    return apiClient.get<PaginatedResponse<CaretakerLease>>(url);
  }

  /**
   * Get lease for a specific unit
   * 
   * @param unitId - UUID of the unit
   * @param params - Additional query parameters
   * @returns Paginated list of leases for the unit
   */
  async getLeasesByUnit(
    unitId: string,
    params?: LeaseQueryParams
  ): Promise<PaginatedResponse<CaretakerLease>> {
    const url = buildUrl("/leases", { ...params, unit_id: unitId });
    return apiClient.get<PaginatedResponse<CaretakerLease>>(url);
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get tenant contact information from a lease
   * Useful for communication about maintenance
   * 
   * @param leaseId - UUID of the lease
   * @returns Tenant contact details
   */
  async getTenantContact(leaseId: string): Promise<{
    id: string;
    name: string;
    phone: string;
  }> {
    const response = await this.getLease(leaseId);
    return response.data!.tenant;
  }

  /**
   * Get landlord contact information from a lease
   * Useful for escalations and approvals
   * 
   * @param leaseId - UUID of the lease
   * @returns Landlord contact details
   */
  async getLandlordContact(leaseId: string): Promise<{
    id: string;
    name: string;
    email: string;
    phone: string;
  }> {
    const response = await this.getLease(leaseId);
    return response.data!.landlord;
  }

  /**
   * Check if a lease is expiring soon
   * 
   * @param leaseId - UUID of the lease
   * @returns Boolean indicating if lease is expiring soon
   */
  async isLeaseExpiringSoon(leaseId: string): Promise<boolean> {
    const response = await this.getLease(leaseId);
    return response.data!.is_expiring_soon;
  }

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
   * Get all leases expiring within a specific number of days
   * 
   * @param days - Number of days to look ahead (default: 30)
   * @returns List of leases expiring within the specified period
   */
  async getExpiringWithinDays(
    days: number = 30
  ): Promise<ApiResponse<CaretakerLease[]>> {
    return this.getExpiringLeases({ days });
  }

  /**
   * Get critical expiration alerts (leases expiring within 7 days)
   * 
   * @returns List of critically expiring leases
   */
  async getCriticalExpirationAlerts(): Promise<ApiResponse<CaretakerLease[]>> {
    return this.getExpiringWithinDays(7);
  }
}

// Export singleton instance
export const caretakerLeaseService = CaretakerLeaseService.getInstance();
export default caretakerLeaseService;

