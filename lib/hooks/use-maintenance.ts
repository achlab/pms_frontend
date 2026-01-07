/**
 * useMaintenance Hooks
 * Custom hooks for maintenance operations
 */

import { useApiQuery } from "./use-api-query";
import { useApiMutation } from "./use-api-mutation";
import maintenanceService from "../services/maintenance.service";
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
  UpdateMaintenanceStatusPayload,
} from "../api-types";

/**
 * Hook to fetch maintenance categories
 */
export function useMaintenanceCategories(enabled: boolean = true) {
  return useApiQuery<ApiResponse<MaintenanceCategory[]>>(
    ["maintenance-categories"],
    () => maintenanceService.getCategories(),
    {
      enabled,
    }
  );
}

/**
 * Hook to fetch maintenance requests with optional filters
 */
export function useMaintenanceRequests(params?: MaintenanceQueryParams, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<MaintenanceRequest>>(
    ["maintenance-requests", params],
    () => maintenanceService.getMaintenanceRequests(params),
    {
      enabled,
    }
  );
}

/**
 * Hook to fetch a specific maintenance request by ID
 */
export function useMaintenanceRequest(requestId: string, enabled: boolean = true) {
  return useApiQuery<ApiResponse<MaintenanceRequest>>(
    ["maintenance-request", requestId],
    () => maintenanceService.getMaintenanceRequest(requestId),
    {
      enabled: enabled && !!requestId,
    }
  );
}

/**
 * Hook to fetch maintenance statistics
 */
export function useMaintenanceStatistics(enabled: boolean = true) {
  return useApiQuery<ApiResponse<MaintenanceStatistics>>(
    ["maintenance-statistics"],
    () => maintenanceService.getStatistics(),
    {
      enabled,
    }
  );
}

/**
 * Hook to create a maintenance request
 */
export function useCreateMaintenanceRequest() {
  return useApiMutation<ApiResponse<MaintenanceRequest>, CreateMaintenanceRequest>(
    async (data) => {
      return maintenanceService.createMaintenanceRequest(data);
    },
    {
      onSuccess: (data) => {
        console.log('✅ Maintenance request created successfully:', data);
      },
      onError: (error) => {
        console.error('❌ Failed to create maintenance request:', error);
      },
    }
  );
}

/**
 * Hook to add a note to a maintenance request
 */
export function useAddMaintenanceNote() {
  return useApiMutation<
    ApiResponse<any>,
    { requestId: string; data: AddMaintenanceNoteRequest }
  >(async ({ requestId, data }) => {
    return maintenanceService.addNote(requestId, data);
  });
}

/**
 * Hook to mark a maintenance request as resolved/unresolved (Tenant only)
 */
export function useMarkMaintenanceResolution() {
  return useApiMutation<
    ApiResponse<MaintenanceRequest>,
    { requestId: string; isResolved: boolean; resolutionNote?: string; photos?: File[] }
  >(async ({ requestId, isResolved, resolutionNote, photos }) => {
    return maintenanceService.markResolution(requestId, isResolved, resolutionNote, photos);
  });
}

/**
 * Hook to review completion of a maintenance request (by tenant or landlord)
 */
export function useReviewCompletion() {
  return useApiMutation<
    ApiResponse<MaintenanceRequest>,
    { requestId: string; data: ReviewCompletionRequest }
  >(async ({ requestId, data }) => {
    return maintenanceService.reviewCompletion(requestId, data);
  });
}

/**
 * Hook to update maintenance status directly
 */
export function useUpdateMaintenanceStatus() {
  return useApiMutation<
    ApiResponse<MaintenanceRequest>,
    { requestId: string; data: UpdateMaintenanceStatusPayload }
  >(async ({ requestId, data }) => {
    return maintenanceService.updateStatus(requestId, data);
  });
}

export default useMaintenanceRequests;

