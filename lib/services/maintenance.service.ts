/**
 * Maintenance Service
 * Handles all maintenance-related API calls
 * Following Single Responsibility Principle
 */

import apiClient from "../api-client";
import { buildUrl, createFormData } from "../api-utils";
import type {
  MaintenanceRequest,
  MaintenanceCategory,
  MaintenanceStatistics,
  CreateMaintenanceRequest,
  AddMaintenanceNoteRequest,
  MaintenanceQueryParams,
  PaginatedResponse,
  ApiResponse,
} from "../api-types";

class MaintenanceService {
  private static instance: MaintenanceService;

  private constructor() {}

  static getInstance(): MaintenanceService {
    if (!MaintenanceService.instance) {
      MaintenanceService.instance = new MaintenanceService();
    }
    return MaintenanceService.instance;
  }

  /**
   * Get maintenance categories
   */
  async getCategories(): Promise<ApiResponse<MaintenanceCategory[]>> {
    return apiClient.get<ApiResponse<MaintenanceCategory[]>>("/maintenance/categories");
  }

  /**
   * Get maintenance requests with optional filters
   */
  async getMaintenanceRequests(params?: MaintenanceQueryParams): Promise<PaginatedResponse<MaintenanceRequest>> {
    const url = buildUrl("/maintenance/requests", params);
    return apiClient.get<PaginatedResponse<MaintenanceRequest>>(url);
  }

  /**
   * Get specific maintenance request by ID
   */
  async getMaintenanceRequest(requestId: string): Promise<ApiResponse<MaintenanceRequest>> {
    return apiClient.get<ApiResponse<MaintenanceRequest>>(`/maintenance/requests/${requestId}`);
  }

  /**
   * Create maintenance request
   */
  async createMaintenanceRequest(data: CreateMaintenanceRequest): Promise<ApiResponse<MaintenanceRequest>> {
    // Check if there are files to upload
    const hasFiles = data.media && data.media.length > 0;

    if (hasFiles) {
      const formData = createFormData(data);
      return apiClient.postFormData<ApiResponse<MaintenanceRequest>>(
        "/maintenance/requests",
        formData
      );
    } else {
      // Send as JSON if no files
      const { media, ...jsonData } = data;
      return apiClient.post<ApiResponse<MaintenanceRequest>>(
        "/maintenance/requests",
        jsonData
      );
    }
  }

  /**
   * Add note to maintenance request
   */
  async addNote(
    requestId: string,
    data: AddMaintenanceNoteRequest
  ): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(
      `/maintenance/requests/${requestId}/notes`,
      data
    );
  }

  /**
   * Get maintenance statistics
   */
  async getStatistics(): Promise<ApiResponse<MaintenanceStatistics>> {
    return apiClient.get<ApiResponse<MaintenanceStatistics>>("/maintenance/requests/statistics");
  }

  /**
   * Get requests by status
   */
  async getRequestsByStatus(status: string, params?: MaintenanceQueryParams): Promise<PaginatedResponse<MaintenanceRequest>> {
    return this.getMaintenanceRequests({ ...params, status: status as any });
  }

  /**
   * Get requests by priority
   */
  async getRequestsByPriority(priority: string, params?: MaintenanceQueryParams): Promise<PaginatedResponse<MaintenanceRequest>> {
    return this.getMaintenanceRequests({ ...params, priority: priority as any });
  }

  /**
   * Get urgent requests
   */
  async getUrgentRequests(params?: MaintenanceQueryParams): Promise<PaginatedResponse<MaintenanceRequest>> {
    return this.getRequestsByPriority("urgent", params);
  }

  /**
   * Get in-progress requests
   */
  async getInProgressRequests(params?: MaintenanceQueryParams): Promise<PaginatedResponse<MaintenanceRequest>> {
    return this.getRequestsByStatus("in_progress", params);
  }
}

// Export singleton instance
export const maintenanceService = MaintenanceService.getInstance();
export default maintenanceService;

