/**
 * Landlord Maintenance Service
 * Handles maintenance request oversight, approval, and caretaker assignment for landlords
 * Following Single Responsibility Principle & SOLID
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  LandlordMaintenanceRequest,
  AssignMaintenanceRequest,
  ApproveRejectMaintenanceRequest,
  MaintenanceQueryParams,
  MaintenanceCategory,
  ApiResponse,
  PaginatedResponse,
} from "../api-types";

class LandlordMaintenanceService {
  private static instance: LandlordMaintenanceService;

  private constructor() {}

  static getInstance(): LandlordMaintenanceService {
    if (!LandlordMaintenanceService.instance) {
      LandlordMaintenanceService.instance = new LandlordMaintenanceService();
    }
    return LandlordMaintenanceService.instance;
  }

  // ============================================
  // MAINTENANCE REQUEST OVERSIGHT
  // ============================================

  /**
   * Get all maintenance requests across all properties
   * Supports comprehensive filtering and pagination
   * 
   * @param params - Query parameters for filtering
   * @returns Paginated list of maintenance requests
   */
  async getAllMaintenanceRequests(
    params?: MaintenanceQueryParams
  ): Promise<PaginatedResponse<LandlordMaintenanceRequest>> {
    const url = buildUrl("/maintenance/all", params);
    return apiClient.get<PaginatedResponse<LandlordMaintenanceRequest>>(url);
  }

  /**
   * Get detailed information about a specific maintenance request
   * 
   * @param requestId - UUID of the maintenance request
   * @returns Maintenance request details
   */
  async getMaintenanceRequest(
    requestId: string
  ): Promise<ApiResponse<LandlordMaintenanceRequest>> {
    return apiClient.get<ApiResponse<LandlordMaintenanceRequest>>(
      `/maintenance/${requestId}`
    );
  }

  // ============================================
  // MAINTENANCE REQUEST ASSIGNMENT
  // ============================================

  /**
   * Assign a maintenance request to a caretaker
   * 
   * @param requestId - UUID of the maintenance request
   * @param data - Assignment data
   * @returns Updated maintenance request
   */
  async assignMaintenanceRequest(
    requestId: string,
    data: AssignMaintenanceRequest
  ): Promise<ApiResponse<LandlordMaintenanceRequest>> {
    return apiClient.post<ApiResponse<LandlordMaintenanceRequest>>(
      `/maintenance/${requestId}/assign`,
      data
    );
  }

  /**
   * Reassign a maintenance request to a different caretaker
   * 
   * @param requestId - UUID of the maintenance request
   * @param data - Reassignment data
   * @returns Updated maintenance request
   */
  async reassignMaintenanceRequest(
    requestId: string,
    data: AssignMaintenanceRequest
  ): Promise<ApiResponse<LandlordMaintenanceRequest>> {
    return this.assignMaintenanceRequest(requestId, data);
  }

  /**
   * Auto-assign maintenance request to available caretaker
   * 
   * @param requestId - UUID of the maintenance request
   * @returns Updated maintenance request
   */
  async autoAssignMaintenanceRequest(
    requestId: string
  ): Promise<ApiResponse<LandlordMaintenanceRequest>> {
    return apiClient.post<ApiResponse<LandlordMaintenanceRequest>>(
      `/maintenance/${requestId}/auto-assign`
    );
  }

  // ============================================
  // APPROVAL & REJECTION
  // ============================================

  /**
   * Approve a maintenance request
   * 
   * @param requestId - UUID of the maintenance request
   * @param data - Approval data (optional notes/comments)
   * @returns Updated maintenance request
   */
  async approveMaintenanceRequest(
    requestId: string,
    data?: ApproveRejectMaintenanceRequest
  ): Promise<ApiResponse<LandlordMaintenanceRequest>> {
    return apiClient.post<ApiResponse<LandlordMaintenanceRequest>>(
      `/maintenance/${requestId}/approve`,
      data || {}
    );
  }

  /**
   * Reject a maintenance request
   * 
   * @param requestId - UUID of the maintenance request
   * @param data - Rejection data (reason required)
   * @returns Updated maintenance request
   */
  async rejectMaintenanceRequest(
    requestId: string,
    data: ApproveRejectMaintenanceRequest
  ): Promise<ApiResponse<LandlordMaintenanceRequest>> {
    return apiClient.post<ApiResponse<LandlordMaintenanceRequest>>(
      `/maintenance/${requestId}/reject`,
      data
    );
  }

  // ============================================
  // MAINTENANCE QUERIES BY STATUS
  // ============================================

  /**
   * Get pending maintenance requests (awaiting landlord approval)
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of pending requests
   */
  async getPendingRequests(
    params?: MaintenanceQueryParams
  ): Promise<PaginatedResponse<LandlordMaintenanceRequest>> {
    return this.getAllMaintenanceRequests({ ...params, status: "pending" });
  }

  /**
   * Get in-progress maintenance requests
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of in-progress requests
   */
  async getInProgressRequests(
    params?: MaintenanceQueryParams
  ): Promise<PaginatedResponse<LandlordMaintenanceRequest>> {
    return this.getAllMaintenanceRequests({ ...params, status: "in_progress" });
  }

  /**
   * Get completed maintenance requests
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of completed requests
   */
  async getCompletedRequests(
    params?: MaintenanceQueryParams
  ): Promise<PaginatedResponse<LandlordMaintenanceRequest>> {
    return this.getAllMaintenanceRequests({ ...params, status: "completed" });
  }

  /**
   * Get rejected maintenance requests
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of rejected requests
   */
  async getRejectedRequests(
    params?: MaintenanceQueryParams
  ): Promise<PaginatedResponse<LandlordMaintenanceRequest>> {
    return this.getAllMaintenanceRequests({ ...params, status: "rejected" });
  }

  // ============================================
  // MAINTENANCE QUERIES BY PRIORITY
  // ============================================

  /**
   * Get emergency maintenance requests
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of emergency requests
   */
  async getEmergencyRequests(
    params?: MaintenanceQueryParams
  ): Promise<PaginatedResponse<LandlordMaintenanceRequest>> {
    return this.getAllMaintenanceRequests({ ...params, priority: "emergency" });
  }

  /**
   * Get high priority maintenance requests
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of high priority requests
   */
  async getHighPriorityRequests(
    params?: MaintenanceQueryParams
  ): Promise<PaginatedResponse<LandlordMaintenanceRequest>> {
    return this.getAllMaintenanceRequests({ ...params, priority: "high" });
  }

  /**
   * Get unassigned maintenance requests
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of unassigned requests
   */
  async getUnassignedRequests(
    params?: MaintenanceQueryParams
  ): Promise<PaginatedResponse<LandlordMaintenanceRequest>> {
    return apiClient.get<PaginatedResponse<LandlordMaintenanceRequest>>(
      buildUrl("/maintenance/unassigned", params)
    );
  }

  // ============================================
  // MAINTENANCE QUERIES BY PROPERTY
  // ============================================

  /**
   * Get maintenance requests for a specific property
   * 
   * @param propertyId - UUID of the property
   * @param params - Additional query parameters
   * @returns Paginated list of maintenance requests
   */
  async getMaintenanceByProperty(
    propertyId: string,
    params?: MaintenanceQueryParams
  ): Promise<PaginatedResponse<LandlordMaintenanceRequest>> {
    return this.getAllMaintenanceRequests({ ...params, property_id: propertyId });
  }

  /**
   * Get maintenance requests by caretaker
   * 
   * @param caretakerId - UUID of the caretaker
   * @param params - Additional query parameters
   * @returns Paginated list of maintenance requests
   */
  async getMaintenanceByCaretaker(
    caretakerId: string,
    params?: MaintenanceQueryParams
  ): Promise<PaginatedResponse<LandlordMaintenanceRequest>> {
    return apiClient.get<PaginatedResponse<LandlordMaintenanceRequest>>(
      buildUrl(`/maintenance/caretaker/${caretakerId}`, params)
    );
  }

  // ============================================
  // MAINTENANCE CATEGORIES
  // ============================================

  /**
   * Get all maintenance categories
   * 
   * @returns List of maintenance categories
   */
  async getCategories(): Promise<ApiResponse<MaintenanceCategory[]>> {
    return apiClient.get<ApiResponse<MaintenanceCategory[]>>(
      "/maintenance/categories"
    );
  }

  /**
   * Get active maintenance categories
   * 
   * @returns List of active categories
   */
  async getActiveCategories(): Promise<ApiResponse<MaintenanceCategory[]>> {
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
   * @returns Maintenance statistics
   */
  async getStatistics(): Promise<ApiResponse<{
    total_requests: number;
    by_status: {
      pending: number;
      assigned: number;
      in_progress: number;
      completed: number;
      rejected: number;
      cancelled: number;
    };
    by_priority: {
      low: number;
      medium: number;
      high: number;
      emergency: number;
    };
    unassigned_count: number;
    average_completion_time: number;
    overdue_count: number;
  }>> {
    return apiClient.get("/maintenance/statistics");
  }

  /**
   * Get maintenance statistics for a specific property
   * 
   * @param propertyId - UUID of the property
   * @returns Property-specific statistics
   */
  async getPropertyStatistics(propertyId: string): Promise<ApiResponse<{
    total_requests: number;
    pending_requests: number;
    in_progress_requests: number;
    completed_requests: number;
    average_response_time: number;
  }>> {
    return apiClient.get(`/properties/${propertyId}/maintenance/statistics`);
  }

  /**
   * Get maintenance statistics for a caretaker
   * 
   * @param caretakerId - UUID of the caretaker
   * @returns Caretaker performance statistics
   */
  async getCaretakerStatistics(caretakerId: string): Promise<ApiResponse<{
    total_assigned: number;
    completed: number;
    in_progress: number;
    average_completion_time: number;
    performance_rating: number;
  }>> {
    return apiClient.get(`/maintenance/caretaker/${caretakerId}/statistics`);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get maintenance request summary
   * 
   * @param requestId - UUID of the maintenance request
   * @returns Simplified maintenance request summary
   */
  async getRequestSummary(requestId: string): Promise<{
    id: string;
    title: string;
    status: string;
    priority: string;
    property_name: string;
    unit_number: string;
    tenant_name: string;
    caretaker_name?: string;
    created_at: string;
    updated_at: string;
  }> {
    const response = await this.getMaintenanceRequest(requestId);
    const request = response.data!;

    return {
      id: request.id,
      title: request.title,
      status: request.status,
      priority: request.priority,
      property_name: request.property.name,
      unit_number: request.unit.unit_number,
      tenant_name: request.tenant.name,
      caretaker_name: request.assigned_caretaker?.name,
      created_at: request.created_at,
      updated_at: request.updated_at,
    };
  }

  /**
   * Check if maintenance request needs attention
   * 
   * @param requestId - UUID of the maintenance request
   * @returns Boolean indicating if request needs attention
   */
  async needsAttention(requestId: string): Promise<boolean> {
    const response = await this.getMaintenanceRequest(requestId);
    const request = response.data!;

    return (
      request.status === "pending" ||
      (request.priority === "emergency" && request.status !== "completed") ||
      !request.assigned_caretaker
    );
  }

  /**
   * Get overdue maintenance requests
   * 
   * @param params - Additional query parameters
   * @returns List of overdue requests
   */
  async getOverdueRequests(
    params?: MaintenanceQueryParams
  ): Promise<PaginatedResponse<LandlordMaintenanceRequest>> {
    return apiClient.get<PaginatedResponse<LandlordMaintenanceRequest>>(
      buildUrl("/maintenance/overdue", params)
    );
  }

  /**
   * Calculate maintenance cost for a period
   * 
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Total maintenance cost
   */
  async getMaintenanceCost(
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<{
    total_cost: number;
    by_category: Record<string, number>;
    by_property: Record<string, number>;
  }>> {
    return apiClient.get(
      `/maintenance/costs?start_date=${startDate}&end_date=${endDate}`
    );
  }

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  /**
   * Validate assignment data
   * 
   * @param data - Assignment data to validate
   * @returns Validation result
   */
  validateAssignment(data: AssignMaintenanceRequest): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.caretaker_id) {
      errors.push("Caretaker ID is required");
    }

    if (data.notes && data.notes.length < 5) {
      errors.push("Assignment notes must be at least 5 characters");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate approval/rejection data
   * 
   * @param data - Approval/rejection data to validate
   * @param isRejection - Whether this is a rejection (requires notes)
   * @returns Validation result
   */
  validateApprovalRejection(
    data: ApproveRejectMaintenanceRequest,
    isRejection: boolean = false
  ): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (isRejection && !data.notes) {
      errors.push("Rejection reason is required");
    }

    if (data.notes && data.notes.length < 10) {
      errors.push("Notes must be at least 10 characters");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const landlordMaintenanceService = LandlordMaintenanceService.getInstance();
export default landlordMaintenanceService;

