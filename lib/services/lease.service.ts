/**
 * Lease Service
 * Handles all lease-related API calls
 * Following Single Responsibility Principle
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  Lease,
  LeaseQueryParams,
  ExpiringLeasesParams,
  PaginatedResponse,
  ApiResponse,
} from "../api-types";

class LeaseService {
  private static instance: LeaseService;

  private constructor() {}

  static getInstance(): LeaseService {
    if (!LeaseService.instance) {
      LeaseService.instance = new LeaseService();
    }
    return LeaseService.instance;
  }

  /**
   * Get all leases for current tenant with optional filters
   */
  async getLeases(params?: LeaseQueryParams): Promise<PaginatedResponse<Lease>> {
    const url = buildUrl("/leases", params);
    return apiClient.get<PaginatedResponse<Lease>>(url);
  }

  /**
   * Get specific lease by ID
   */
  async getLease(leaseId: string): Promise<ApiResponse<Lease>> {
    return apiClient.get<ApiResponse<Lease>>(`/leases/${leaseId}`);
  }

  /**
   * Get leases expiring soon
   */
  async getExpiringLeases(params?: ExpiringLeasesParams): Promise<PaginatedResponse<Lease>> {
    const url = buildUrl("/leases/expiring-soon", params);
    return apiClient.get<PaginatedResponse<Lease>>(url);
  }

  /**
   * Get active leases
   */
  async getActiveLeases(params?: LeaseQueryParams): Promise<PaginatedResponse<Lease>> {
    return this.getLeases({ ...params, status: "active" });
  }

  /**
   * Get expired leases
   */
  async getExpiredLeases(params?: LeaseQueryParams): Promise<PaginatedResponse<Lease>> {
    return this.getLeases({ ...params, status: "expired" });
  }

  /**
   * Get terminated leases
   */
  async getTerminatedLeases(params?: LeaseQueryParams): Promise<PaginatedResponse<Lease>> {
    return this.getLeases({ ...params, status: "terminated" });
  }
}

// Export singleton instance
export const leaseService = LeaseService.getInstance();
export default leaseService;

