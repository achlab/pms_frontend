/**
 * Caretaker Maintenance Service
 * Handles all caretaker-specific maintenance operations
 * Following Single Responsibility Principle & SOLID
 */

import apiClient from "../api-client";
import { buildUrl, createFormData } from "../api-utils";
import type {
  CaretakerMaintenanceRequest,
  CaretakerMaintenanceQueryParams,
  UpdateMaintenanceStatusRequest,
  AddMaintenanceNoteWithMediaRequest,
  CaretakerStatistics,
  MaintenanceCategory,
  PaginatedResponse,
  ApiResponse,
} from "../api-types";

class CaretakerMaintenanceService {
  private static instance: CaretakerMaintenanceService;

  private constructor() {}

  static getInstance(): CaretakerMaintenanceService {
    if (!CaretakerMaintenanceService.instance) {
      CaretakerMaintenanceService.instance = new CaretakerMaintenanceService();
    }
    return CaretakerMaintenanceService.instance;
  }

  // ============================================
  // MAINTENANCE REQUESTS - READ OPERATIONS
  // ============================================

  /**
   * Get all maintenance requests assigned to the caretaker
   * Supports filtering by status, priority, property, search, etc.
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of maintenance requests
   */
  async getMaintenanceRequests(
    params?: CaretakerMaintenanceQueryParams
  ): Promise<PaginatedResponse<CaretakerMaintenanceRequest>> {
    const url = buildUrl("/maintenance/requests", params);
    return apiClient.get<PaginatedResponse<CaretakerMaintenanceRequest>>(url);
  }

  /**
   * Get a specific maintenance request by ID
   * 
   * @param requestId - UUID of the maintenance request
   * @returns Single maintenance request details
   */
  async getMaintenanceRequest(
    requestId: string
  ): Promise<ApiResponse<CaretakerMaintenanceRequest>> {
    return apiClient.get<ApiResponse<CaretakerMaintenanceRequest>>(
      `/maintenance/requests/${requestId}`
    );
  }

  /**
   * Get maintenance requests filtered by status
   * 
   * @param status - Status to filter by
   * @param params - Additional query parameters
   * @returns Paginated list of requests with specified status
   */
  async getRequestsByStatus(
    status: string,
    params?: CaretakerMaintenanceQueryParams
  ): Promise<PaginatedResponse<CaretakerMaintenanceRequest>> {
    return this.getMaintenanceRequests({ ...params, status: status as any });
  }

  /**
   * Get maintenance requests filtered by priority
   * 
   * @param priority - Priority level to filter by
   * @param params - Additional query parameters
   * @returns Paginated list of requests with specified priority
   */
  async getRequestsByPriority(
    priority: string,
    params?: CaretakerMaintenanceQueryParams
  ): Promise<PaginatedResponse<CaretakerMaintenanceRequest>> {
    return this.getMaintenanceRequests({ ...params, priority: priority as any });
  }

  /**
   * Get maintenance requests filtered by property
   * 
   * @param propertyId - UUID of the property
   * @param params - Additional query parameters
   * @returns Paginated list of requests for specified property
   */
  async getRequestsByProperty(
    propertyId: string,
    params?: CaretakerMaintenanceQueryParams
  ): Promise<PaginatedResponse<CaretakerMaintenanceRequest>> {
    return this.getMaintenanceRequests({ ...params, property_id: propertyId });
  }

  // ============================================
  // CONVENIENCE METHODS - COMMON FILTERS
  // ============================================

  /**
   * Get all assigned requests (ready to start)
   */
  async getAssignedRequests(
    params?: CaretakerMaintenanceQueryParams
  ): Promise<PaginatedResponse<CaretakerMaintenanceRequest>> {
    return this.getRequestsByStatus("assigned", params);
  }

  /**
   * Get all in-progress requests
   */
  async getInProgressRequests(
    params?: CaretakerMaintenanceQueryParams
  ): Promise<PaginatedResponse<CaretakerMaintenanceRequest>> {
    return this.getRequestsByStatus("in_progress", params);
  }

  /**
   * Get requests pending landlord approval
   */
  async getPendingApprovalRequests(
    params?: CaretakerMaintenanceQueryParams
  ): Promise<PaginatedResponse<CaretakerMaintenanceRequest>> {
    return this.getRequestsByStatus("pending_approval", params);
  }

  /**
   * Get resolved requests
   */
  async getResolvedRequests(
    params?: CaretakerMaintenanceQueryParams
  ): Promise<PaginatedResponse<CaretakerMaintenanceRequest>> {
    return this.getRequestsByStatus("resolved", params);
  }

  /**
   * Get emergency priority requests
   */
  async getEmergencyRequests(
    params?: CaretakerMaintenanceQueryParams
  ): Promise<PaginatedResponse<CaretakerMaintenanceRequest>> {
    return this.getRequestsByPriority("emergency", params);
  }

  /**
   * Get high priority requests
   */
  async getHighPriorityRequests(
    params?: CaretakerMaintenanceQueryParams
  ): Promise<PaginatedResponse<CaretakerMaintenanceRequest>> {
    return this.getRequestsByPriority("high", params);
  }

  // ============================================
  // MAINTENANCE REQUESTS - WRITE OPERATIONS
  // ============================================

  /**
   * Update the status of a maintenance request
   * Validates status transitions and handles approval workflows
   * 
   * @param requestId - UUID of the maintenance request
   * @param data - Status update data including new status, notes, costs
   * @returns Updated maintenance request
   */
  async updateMaintenanceStatus(
    requestId: string,
    data: UpdateMaintenanceStatusRequest
  ): Promise<ApiResponse<CaretakerMaintenanceRequest>> {
    return apiClient.patch<ApiResponse<CaretakerMaintenanceRequest>>(
      `/maintenance/requests/${requestId}/status`,
      data
    );
  }

  /**
   * Add a note to a maintenance request
   * Optionally includes media attachments
   * 
   * @param requestId - UUID of the maintenance request
   * @param data - Note text and optional media files
   * @returns Updated maintenance request
   */
  async addNote(
    requestId: string,
    data: AddMaintenanceNoteWithMediaRequest
  ): Promise<ApiResponse<CaretakerMaintenanceRequest>> {
    // Check if there are files to upload
    const hasFiles = data.media && data.media.length > 0;

    if (hasFiles) {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("note", data.note);

      // Append each media file
      if (data.media) {
        data.media.forEach((file) => {
          formData.append("media[]", file);
        });
      }

      return apiClient.postFormData<ApiResponse<CaretakerMaintenanceRequest>>(
        `/maintenance/requests/${requestId}/notes`,
        formData
      );
    } else {
      // Send as JSON if no files
      return apiClient.post<ApiResponse<CaretakerMaintenanceRequest>>(
        `/maintenance/requests/${requestId}/notes`,
        { note: data.note }
      );
    }
  }

  // ============================================
  // WORKFLOW HELPERS
  // ============================================

  /**
   * Start work on a request (change status to in_progress)
   * 
   * @param requestId - UUID of the maintenance request
   * @param note - Optional note about starting work
   * @param estimatedCompletionDate - Optional estimated completion date
   * @returns Updated maintenance request
   */
  async startWork(
    requestId: string,
    note?: string,
    estimatedCompletionDate?: string
  ): Promise<ApiResponse<CaretakerMaintenanceRequest>> {
    return this.updateMaintenanceStatus(requestId, {
      status: "in_progress",
      note: note || "Started working on this request",
      estimated_completion_date: estimatedCompletionDate,
    });
  }

  /**
   * Mark a request as resolved
   * 
   * @param requestId - UUID of the maintenance request
   * @param actualCost - Actual cost of the work
   * @param note - Completion note
   * @returns Updated maintenance request
   */
  async markAsResolved(
    requestId: string,
    actualCost?: number,
    note?: string
  ): Promise<ApiResponse<CaretakerMaintenanceRequest>> {
    return this.updateMaintenanceStatus(requestId, {
      status: "resolved",
      actual_cost: actualCost,
      note: note || "Work completed successfully",
    });
  }

  /**
   * Request landlord approval for a request
   * Typically used when estimated cost exceeds auto-approval limit
   * 
   * @param requestId - UUID of the maintenance request
   * @param estimatedCost - Estimated cost requiring approval
   * @param costDescription - Description of costs
   * @param note - Additional notes for landlord
   * @returns Updated maintenance request
   */
  async requestApproval(
    requestId: string,
    estimatedCost: number,
    costDescription?: string,
    note?: string
  ): Promise<ApiResponse<CaretakerMaintenanceRequest>> {
    return this.updateMaintenanceStatus(requestId, {
      status: "pending_approval",
      estimated_cost: estimatedCost,
      cost_description: costDescription,
      note: note || "Requesting approval for this repair",
    });
  }

  /**
   * Cancel a maintenance request
   * 
   * @param requestId - UUID of the maintenance request
   * @param reason - Reason for cancellation
   * @returns Updated maintenance request
   */
  async cancelRequest(
    requestId: string,
    reason: string
  ): Promise<ApiResponse<CaretakerMaintenanceRequest>> {
    return this.updateMaintenanceStatus(requestId, {
      status: "cancelled",
      note: reason,
    });
  }

  // ============================================
  // STATISTICS & ANALYTICS
  // ============================================

  /**
   * Get caretaker statistics
   * Returns overview of all assigned requests by status and priority
   * 
   * @returns Statistics summary
   */
  async getStatistics(): Promise<ApiResponse<CaretakerStatistics>> {
    return apiClient.get<ApiResponse<CaretakerStatistics>>(
      "/maintenance/requests/statistics"
    );
  }

  // ============================================
  // CATEGORIES
  // ============================================

  /**
   * Get all maintenance categories
   * Useful for understanding expected resolution times and approval requirements
   * 
   * @returns List of maintenance categories
   */
  async getCategories(): Promise<ApiResponse<MaintenanceCategory[]>> {
    return apiClient.get<ApiResponse<MaintenanceCategory[]>>(
      "/maintenance/categories"
    );
  }

  /**
   * Get a specific category by ID
   * 
   * @param categoryId - UUID of the category
   * @returns Category details
   */
  async getCategory(categoryId: string): Promise<ApiResponse<MaintenanceCategory>> {
    return apiClient.get<ApiResponse<MaintenanceCategory>>(
      `/maintenance/categories/${categoryId}`
    );
  }

  // ============================================
  // SEARCH & FILTERING
  // ============================================

  /**
   * Search maintenance requests by keyword
   * Searches in title, description, and request number
   * 
   * @param searchTerm - Search keyword
   * @param params - Additional query parameters
   * @returns Paginated search results
   */
  async searchRequests(
    searchTerm: string,
    params?: CaretakerMaintenanceQueryParams
  ): Promise<PaginatedResponse<CaretakerMaintenanceRequest>> {
    return this.getMaintenanceRequests({ ...params, search: searchTerm });
  }
}

// Export singleton instance
export const caretakerMaintenanceService = CaretakerMaintenanceService.getInstance();
export default caretakerMaintenanceService;

