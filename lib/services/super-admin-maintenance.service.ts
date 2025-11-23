/**
 * Super Admin Maintenance Service
 * Handles maintenance request oversight across ALL landlords
 * Following Single Responsibility Principle & SOLID
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  SystemMaintenanceRequest,
  SuperAdminMaintenanceQueryParams,
  MaintenanceStatus,
  MaintenancePriority,
  MaintenanceCategory,
  ApiResponse,
  PaginatedResponse,
} from "../api-types";

class SuperAdminMaintenanceService {
  private static instance: SuperAdminMaintenanceService;

  private constructor() {}

  static getInstance(): SuperAdminMaintenanceService {
    if (!SuperAdminMaintenanceService.instance) {
      SuperAdminMaintenanceService.instance = new SuperAdminMaintenanceService();
    }
    return SuperAdminMaintenanceService.instance;
  }

  // ============================================
  // SYSTEM-WIDE MAINTENANCE QUERIES
  // ============================================

  /**
   * Get all maintenance requests across ALL landlords
   * System-wide view with complete context
   * 
   * @param params - Query parameters for filtering
   * @returns Paginated list of all maintenance requests
   */
  async getAllMaintenanceRequests(
    params?: SuperAdminMaintenanceQueryParams
  ): Promise<PaginatedResponse<SystemMaintenanceRequest>> {
    const url = buildUrl("/maintenance/requests", params);
    return apiClient.get<PaginatedResponse<SystemMaintenanceRequest>>(url);
  }

  /**
   * Get a specific maintenance request by ID
   * 
   * @param requestId - UUID of the maintenance request
   * @returns Maintenance request details with full context
   */
  async getMaintenanceRequestDetails(
    requestId: string
  ): Promise<ApiResponse<SystemMaintenanceRequest>> {
    return apiClient.get<ApiResponse<SystemMaintenanceRequest>>(
      `/maintenance/requests/${requestId}`
    );
  }

  /**
   * Get maintenance requests by landlord
   * 
   * @param landlordId - UUID of the landlord
   * @param params - Additional query parameters
   * @returns Maintenance requests for specified landlord
   */
  async getMaintenanceRequestsByLandlord(
    landlordId: string,
    params?: SuperAdminMaintenanceQueryParams
  ): Promise<PaginatedResponse<SystemMaintenanceRequest>> {
    return this.getAllMaintenanceRequests({ ...params, landlord_id: landlordId });
  }

  /**
   * Get maintenance requests by property
   * 
   * @param propertyId - UUID of the property
   * @param params - Additional query parameters
   * @returns Maintenance requests for specified property
   */
  async getMaintenanceRequestsByProperty(
    propertyId: string,
    params?: SuperAdminMaintenanceQueryParams
  ): Promise<PaginatedResponse<SystemMaintenanceRequest>> {
    return this.getAllMaintenanceRequests({ ...params, property_id: propertyId });
  }

  /**
   * Get maintenance requests by caretaker
   * 
   * @param caretakerId - UUID of the caretaker
   * @param params - Additional query parameters
   * @returns Maintenance requests assigned to caretaker
   */
  async getMaintenanceRequestsByCaretaker(
    caretakerId: string,
    params?: SuperAdminMaintenanceQueryParams
  ): Promise<PaginatedResponse<SystemMaintenanceRequest>> {
    return this.getAllMaintenanceRequests({ ...params, caretaker_id: caretakerId });
  }

  /**
   * Get maintenance requests by status
   * 
   * @param status - Maintenance status
   * @param params - Additional query parameters
   * @returns Requests with specified status
   */
  async getMaintenanceRequestsByStatus(
    status: MaintenanceStatus,
    params?: SuperAdminMaintenanceQueryParams
  ): Promise<PaginatedResponse<SystemMaintenanceRequest>> {
    return this.getAllMaintenanceRequests({ ...params, status });
  }

  /**
   * Get maintenance requests by priority
   * 
   * @param priority - Maintenance priority
   * @param params - Additional query parameters
   * @returns Requests with specified priority
   */
  async getMaintenanceRequestsByPriority(
    priority: MaintenancePriority,
    params?: SuperAdminMaintenanceQueryParams
  ): Promise<PaginatedResponse<SystemMaintenanceRequest>> {
    return this.getAllMaintenanceRequests({ ...params, priority });
  }

  /**
   * Get emergency maintenance requests
   * 
   * @param params - Additional query parameters
   * @returns Emergency requests across system
   */
  async getEmergencyRequests(
    params?: SuperAdminMaintenanceQueryParams
  ): Promise<PaginatedResponse<SystemMaintenanceRequest>> {
    return this.getMaintenanceRequestsByPriority("emergency", params);
  }

  /**
   * Get open maintenance requests
   * 
   * @param params - Additional query parameters
   * @returns Open requests (received, assigned, in_progress)
   */
  async getOpenRequests(
    params?: SuperAdminMaintenanceQueryParams
  ): Promise<PaginatedResponse<SystemMaintenanceRequest>> {
    return apiClient.get<PaginatedResponse<SystemMaintenanceRequest>>(
      buildUrl("/maintenance/requests/open", params)
    );
  }

  /**
   * Get overdue maintenance requests
   * 
   * @param params - Additional query parameters
   * @returns Overdue requests
   */
  async getOverdueRequests(
    params?: SuperAdminMaintenanceQueryParams
  ): Promise<PaginatedResponse<SystemMaintenanceRequest>> {
    return this.getAllMaintenanceRequests({ ...params, is_overdue: true });
  }

  /**
   * Get completed maintenance requests
   * 
   * @param params - Additional query parameters
   * @returns Completed requests
   */
  async getCompletedRequests(
    params?: SuperAdminMaintenanceQueryParams
  ): Promise<PaginatedResponse<SystemMaintenanceRequest>> {
    return this.getMaintenanceRequestsByStatus("resolved", params);
  }

  // ============================================
  // MAINTENANCE CATEGORIES
  // ============================================

  /**
   * Get all maintenance categories
   * 
   * @returns List of maintenance categories
   */
  async getMaintenanceCategories(): Promise<ApiResponse<MaintenanceCategory[]>> {
    return apiClient.get<ApiResponse<MaintenanceCategory[]>>(
      "/maintenance/categories"
    );
  }

  /**
   * Get active maintenance categories
   * 
   * @returns List of active categories
   */
  async getActiveMaintenanceCategories(): Promise<ApiResponse<MaintenanceCategory[]>> {
    return apiClient.get<ApiResponse<MaintenanceCategory[]>>(
      "/maintenance/categories?is_active=true"
    );
  }

  // ============================================
  // MAINTENANCE STATISTICS
  // ============================================

  /**
   * Get comprehensive maintenance statistics
   * 
   * @returns System-wide maintenance statistics
   */
  async getMaintenanceStatistics(): Promise<ApiResponse<{
    total_requests: number;
    open_requests: number;
    in_progress_requests: number;
    completed_requests: number;
    overdue_requests: number;
    by_landlord: {
      landlord_id: string;
      landlord_name: string;
      total_requests: number;
      open_requests: number;
      completed_requests: number;
      completion_rate: number;
    }[];
    by_priority: Record<MaintenancePriority, number>;
    by_status: Record<MaintenanceStatus, number>;
    by_category: {
      category_id: string;
      category_name: string;
      request_count: number;
    }[];
    average_resolution_time: number; // in hours
    total_estimated_cost: number;
    total_actual_cost: number;
  }>> {
    return apiClient.get("/maintenance/statistics");
  }

  /**
   * Get maintenance statistics for a landlord
   * 
   * @param landlordId - UUID of the landlord
   * @returns Landlord-specific maintenance statistics
   */
  async getLandlordMaintenanceStatistics(
    landlordId: string
  ): Promise<ApiResponse<{
    total_requests: number;
    open_requests: number;
    completed_requests: number;
    average_resolution_time: number;
    total_cost: number;
  }>> {
    return apiClient.get(`/landlords/${landlordId}/maintenance/statistics`);
  }

  /**
   * Get caretaker performance statistics
   * 
   * @param caretakerId - UUID of the caretaker
   * @returns Caretaker performance data
   */
  async getCaretakerPerformance(
    caretakerId: string
  ): Promise<ApiResponse<{
    total_assigned: number;
    completed: number;
    in_progress: number;
    average_resolution_time: number;
    completion_rate: number;
    performance_score: number;
  }>> {
    return apiClient.get(`/maintenance/caretakers/${caretakerId}/performance`);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get maintenance request summary with key information
   * 
   * @param requestId - UUID of the maintenance request
   * @returns Simplified request summary
   */
  async getMaintenanceRequestSummary(requestId: string): Promise<{
    id: string;
    title: string;
    landlord_name: string;
    property_name: string;
    unit_number: string;
    tenant_name: string;
    caretaker_name?: string;
    priority: MaintenancePriority;
    status: MaintenanceStatus;
    estimated_cost?: number;
    actual_cost?: number;
    created_at: string;
  }> {
    const response = await this.getMaintenanceRequestDetails(requestId);
    const request = response.data!;

    return {
      id: request.id,
      title: request.title,
      landlord_name: request.landlord.name,
      property_name: request.property.name,
      unit_number: request.unit.unit_number,
      tenant_name: request.tenant.name,
      caretaker_name: request.assigned_caretaker?.name,
      priority: request.priority,
      status: request.status,
      estimated_cost: request.estimated_cost,
      actual_cost: request.actual_cost,
      created_at: request.created_at,
    };
  }

  /**
   * Get total maintenance request count
   * 
   * @returns Total number of maintenance requests in system
   */
  async getTotalMaintenanceRequestCount(): Promise<number> {
    const response = await this.getAllMaintenanceRequests({ per_page: 1 });
    return response.meta?.total || 0;
  }

  /**
   * Get maintenance request count by landlord
   * 
   * @param landlordId - UUID of the landlord
   * @returns Number of requests for landlord
   */
  async getMaintenanceRequestCountByLandlord(landlordId: string): Promise<number> {
    const response = await this.getMaintenanceRequestsByLandlord(landlordId, {
      per_page: 1,
    });
    return response.meta?.total || 0;
  }

  /**
   * Get open request count
   * 
   * @returns Number of open requests in system
   */
  async getOpenRequestCount(): Promise<number> {
    const response = await this.getOpenRequests({ per_page: 1 });
    return response.meta?.total || 0;
  }

  /**
   * Calculate total maintenance cost
   * 
   * @returns Total cost of all completed maintenance
   */
  async calculateTotalMaintenanceCost(): Promise<number> {
    const stats = await this.getMaintenanceStatistics();
    return stats.data!.total_actual_cost;
  }

  /**
   * Get landlord for maintenance request
   * 
   * @param requestId - UUID of the maintenance request
   * @returns Landlord information
   */
  async getMaintenanceRequestLandlord(requestId: string): Promise<{
    id: string;
    name: string;
  }> {
    const request = await this.getMaintenanceRequestDetails(requestId);
    return request.data!.landlord;
  }

  /**
   * Get caretaker for maintenance request
   * 
   * @param requestId - UUID of the maintenance request
   * @returns Caretaker information or null
   */
  async getMaintenanceRequestCaretaker(requestId: string): Promise<{
    id: string;
    name: string;
    phone: string;
  } | null> {
    const request = await this.getMaintenanceRequestDetails(requestId);
    return request.data!.assigned_caretaker || null;
  }

  // ============================================
  // COMPARATIVE ANALYSIS
  // ============================================

  /**
   * Compare maintenance by landlord
   * 
   * @returns Landlord comparison data
   */
  async compareLandlordMaintenance(): Promise<ApiResponse<{
    landlords: {
      landlord_id: string;
      landlord_name: string;
      total_requests: number;
      open_requests: number;
      completed_requests: number;
      average_resolution_time: number;
      total_cost: number;
      completion_rate: number;
    }[];
    system_averages: {
      avg_resolution_time: number;
      avg_completion_rate: number;
    };
  }>> {
    return apiClient.get("/maintenance/landlord-comparison");
  }

  /**
   * Get maintenance requests needing attention
   * 
   * @returns Requests requiring attention (overdue, emergency, unassigned)
   */
  async getMaintenanceRequestsNeedingAttention(): Promise<
    ApiResponse<SystemMaintenanceRequest[]>
  > {
    return apiClient.get<ApiResponse<SystemMaintenanceRequest[]>>(
      "/maintenance/needs-attention"
    );
  }

  /**
   * Get top caretakers by performance
   * 
   * @param limit - Number of caretakers to return
   * @returns Top performing caretakers
   */
  async getTopPerformingCaretakers(limit: number = 10): Promise<ApiResponse<{
    caretakers: {
      caretaker_id: string;
      caretaker_name: string;
      total_completed: number;
      average_resolution_time: number;
      completion_rate: number;
      performance_score: number;
    }[];
  }>> {
    return apiClient.get(`/maintenance/top-caretakers?limit=${limit}`);
  }

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  /**
   * Validate maintenance data
   * 
   * @param data - Maintenance data to validate
   * @returns Validation result
   */
  validateMaintenanceData(data: {
    title?: string;
    estimated_cost?: number;
    actual_cost?: number;
  }): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (data.title && data.title.length < 5) {
      errors.push("Title must be at least 5 characters");
    }

    if (data.estimated_cost !== undefined && data.estimated_cost < 0) {
      errors.push("Estimated cost cannot be negative");
    }

    if (data.actual_cost !== undefined && data.actual_cost < 0) {
      errors.push("Actual cost cannot be negative");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const superAdminMaintenanceService = SuperAdminMaintenanceService.getInstance();
export default superAdminMaintenanceService;

