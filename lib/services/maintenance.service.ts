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
  ReviewCompletionRequest,
  MaintenanceRequestEvent,
  Caretaker,
  UpdateMaintenanceStatusPayload,
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
  async getMaintenanceRequests(
    params?: MaintenanceQueryParams
  ): Promise<PaginatedResponse<MaintenanceRequest>> {
    const url = buildUrl("/maintenance/requests", params);
    return apiClient.get<PaginatedResponse<MaintenanceRequest>>(url);
  }

  /**
   * Get open maintenance requests (super admin overview)
   */
  async getOpenMaintenanceRequests(
    params?: MaintenanceQueryParams
  ): Promise<PaginatedResponse<MaintenanceRequest>> {
    const url = buildUrl("/maintenance/requests/open", params);
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
  async createMaintenanceRequest(
    data: CreateMaintenanceRequest
  ): Promise<ApiResponse<MaintenanceRequest>> {
    const hasFiles = data.media && data.media.length > 0;

    if (hasFiles) {
      const formData = createFormData(data);
      return apiClient.postFormData<ApiResponse<MaintenanceRequest>>(
        "/maintenance/requests",
        formData
      );
    }

    const { media, ...jsonData } = data;
    return apiClient.post<ApiResponse<MaintenanceRequest>>(
      "/maintenance/requests",
      jsonData
    );
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
   * Mark maintenance request as resolved/unresolved (Tenant only)
   */
  async markResolution(
    requestId: string,
    isResolved: boolean,
    resolutionNote?: string,
    photos?: File[]
  ): Promise<ApiResponse<MaintenanceRequest>> {
    if (!photos || photos.length === 0) {
      return apiClient.patch<ApiResponse<MaintenanceRequest>>(
        `/maintenance/requests/${requestId}/mark-resolution`,
        {
          is_resolved: isResolved,
          resolution_note: resolutionNote,
        }
      );
    }

    const formData = new FormData();
    formData.append("is_resolved", isResolved ? "1" : "0");

    if (resolutionNote) {
      formData.append("resolution_note", resolutionNote);
    }

    photos.forEach((photo) => {
      formData.append("photos[]", photo);
    });

    return apiClient.post<ApiResponse<MaintenanceRequest>>(
      `/maintenance/requests/${requestId}/mark-resolution?_method=PATCH`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  /**
   * Get maintenance statistics
   */
  async getStatistics(): Promise<ApiResponse<MaintenanceStatistics>> {
    return apiClient.get<ApiResponse<MaintenanceStatistics>>("/maintenance/requests/statistics");
  }

  /**
   * Update maintenance request status (caretaker/landlord/super admin)
   */
  async updateStatus(
    requestId: string,
    data: UpdateMaintenanceStatusPayload
  ): Promise<ApiResponse<MaintenanceRequest>> {
    return apiClient.patch<ApiResponse<MaintenanceRequest>>(
      `/maintenance/requests/${requestId}/status`,
      data
    );
  }

  /**
   * Review completion of a maintenance request (by tenant or landlord)
   */
  async reviewCompletion(
    requestId: string,
    data: ReviewCompletionRequest
  ): Promise<ApiResponse<MaintenanceRequest>> {
    return apiClient.post<ApiResponse<MaintenanceRequest>>(
      `/maintenance/requests/${requestId}/review-completion`,
      data
    );
  }

  /**
   * Get maintenance request events
   */
  async getRequestEvents(
    requestId: string
  ): Promise<ApiResponse<MaintenanceRequestEvent[]>> {
    return apiClient.get<ApiResponse<MaintenanceRequestEvent[]>>(
      `/maintenance/requests/${requestId}/events`
    );
  }

  /**
   * Get available caretakers for assignment
   */
  async getCaretakers(): Promise<ApiResponse<Caretaker[]>> {
    return apiClient.get<ApiResponse<Caretaker[]>>(
      "/maintenance/requests/caretakers"
    );
  }
}

// Export singleton instance
export const maintenanceService = MaintenanceService.getInstance();
export default maintenanceService;

