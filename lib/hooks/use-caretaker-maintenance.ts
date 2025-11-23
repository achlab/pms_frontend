/**
 * Caretaker Maintenance Hooks
 * React hooks for caretaker maintenance operations
 * Following SOLID principles and React best practices
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { caretakerMaintenanceService } from "../services";
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

// ============================================
// QUERY KEYS
// ============================================

export const caretakerMaintenanceKeys = {
  all: ["caretaker-maintenance"] as const,
  lists: () => [...caretakerMaintenanceKeys.all, "list"] as const,
  list: (params?: CaretakerMaintenanceQueryParams) =>
    [...caretakerMaintenanceKeys.lists(), params] as const,
  details: () => [...caretakerMaintenanceKeys.all, "detail"] as const,
  detail: (id: string) => [...caretakerMaintenanceKeys.details(), id] as const,
  statistics: () => [...caretakerMaintenanceKeys.all, "statistics"] as const,
  categories: () => [...caretakerMaintenanceKeys.all, "categories"] as const,
  category: (id: string) => [...caretakerMaintenanceKeys.categories(), id] as const,
};

// ============================================
// READ HOOKS - MAINTENANCE REQUESTS
// ============================================

/**
 * Get all maintenance requests assigned to caretaker
 * Supports filtering, sorting, and pagination
 */
export function useCaretakerMaintenanceRequests(
  params?: CaretakerMaintenanceQueryParams,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery<PaginatedResponse<CaretakerMaintenanceRequest>>({
    queryKey: caretakerMaintenanceKeys.list(params),
    queryFn: () => caretakerMaintenanceService.getMaintenanceRequests(params),
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Get a single maintenance request by ID
 */
export function useCaretakerMaintenanceRequest(
  requestId: string,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery<ApiResponse<CaretakerMaintenanceRequest>>({
    queryKey: caretakerMaintenanceKeys.detail(requestId),
    queryFn: () => caretakerMaintenanceService.getMaintenanceRequest(requestId),
    enabled: options?.enabled !== false && !!requestId,
  });
}

/**
 * Get assigned requests (ready to start)
 */
export function useAssignedRequests(
  params?: CaretakerMaintenanceQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery<PaginatedResponse<CaretakerMaintenanceRequest>>({
    queryKey: caretakerMaintenanceKeys.list({ ...params, status: "assigned" }),
    queryFn: () => caretakerMaintenanceService.getAssignedRequests(params),
    enabled: options?.enabled,
  });
}

/**
 * Get in-progress requests
 */
export function useInProgressRequests(
  params?: CaretakerMaintenanceQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery<PaginatedResponse<CaretakerMaintenanceRequest>>({
    queryKey: caretakerMaintenanceKeys.list({ ...params, status: "in_progress" }),
    queryFn: () => caretakerMaintenanceService.getInProgressRequests(params),
    enabled: options?.enabled,
  });
}

/**
 * Get requests pending landlord approval
 */
export function usePendingApprovalRequests(
  params?: CaretakerMaintenanceQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery<PaginatedResponse<CaretakerMaintenanceRequest>>({
    queryKey: caretakerMaintenanceKeys.list({ ...params, status: "pending_approval" }),
    queryFn: () => caretakerMaintenanceService.getPendingApprovalRequests(params),
    enabled: options?.enabled,
  });
}

/**
 * Get emergency priority requests
 */
export function useEmergencyRequests(
  params?: CaretakerMaintenanceQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery<PaginatedResponse<CaretakerMaintenanceRequest>>({
    queryKey: caretakerMaintenanceKeys.list({ ...params, priority: "emergency" }),
    queryFn: () => caretakerMaintenanceService.getEmergencyRequests(params),
    enabled: options?.enabled,
  });
}

/**
 * Get high priority requests
 */
export function useHighPriorityRequests(
  params?: CaretakerMaintenanceQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery<PaginatedResponse<CaretakerMaintenanceRequest>>({
    queryKey: caretakerMaintenanceKeys.list({ ...params, priority: "high" }),
    queryFn: () => caretakerMaintenanceService.getHighPriorityRequests(params),
    enabled: options?.enabled,
  });
}

// ============================================
// STATISTICS & CATEGORIES
// ============================================

/**
 * Get caretaker statistics
 * Overview of all maintenance requests by status and priority
 */
export function useCaretakerStatistics(options?: { 
  enabled?: boolean;
  refetchInterval?: number;
}) {
  return useQuery<ApiResponse<CaretakerStatistics>>({
    queryKey: caretakerMaintenanceKeys.statistics(),
    queryFn: () => caretakerMaintenanceService.getStatistics(),
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Get all maintenance categories
 */
export function useMaintenanceCategories(options?: { enabled?: boolean }) {
  return useQuery<ApiResponse<MaintenanceCategory[]>>({
    queryKey: caretakerMaintenanceKeys.categories(),
    queryFn: () => caretakerMaintenanceService.getCategories(),
    enabled: options?.enabled,
    staleTime: 5 * 60 * 1000, // Categories don't change often, cache for 5 minutes
  });
}

/**
 * Get a single maintenance category
 */
export function useMaintenanceCategory(
  categoryId: string,
  options?: { enabled?: boolean }
) {
  return useQuery<ApiResponse<MaintenanceCategory>>({
    queryKey: caretakerMaintenanceKeys.category(categoryId),
    queryFn: () => caretakerMaintenanceService.getCategory(categoryId),
    enabled: options?.enabled !== false && !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// MUTATION HOOKS - STATUS UPDATES
// ============================================

/**
 * Update maintenance request status
 * Invalidates related queries on success
 */
export function useUpdateMaintenanceStatus(options?: {
  onSuccess?: (data: ApiResponse<CaretakerMaintenanceRequest>) => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: string;
      data: UpdateMaintenanceStatusRequest;
    }) => caretakerMaintenanceService.updateMaintenanceStatus(requestId, data),
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: caretakerMaintenanceKeys.lists() });
      queryClient.invalidateQueries({ 
        queryKey: caretakerMaintenanceKeys.detail(data.data!.id) 
      });
      queryClient.invalidateQueries({ queryKey: caretakerMaintenanceKeys.statistics() });
      
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Add note to maintenance request
 * Supports media file uploads
 */
export function useAddMaintenanceNote(options?: {
  onSuccess?: (data: ApiResponse<CaretakerMaintenanceRequest>) => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: string;
      data: AddMaintenanceNoteWithMediaRequest;
    }) => caretakerMaintenanceService.addNote(requestId, data),
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ 
        queryKey: caretakerMaintenanceKeys.detail(data.data!.id) 
      });
      
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

// ============================================
// WORKFLOW HELPER HOOKS
// ============================================

/**
 * Start work on a maintenance request
 * Convenience hook for common workflow action
 */
export function useStartWork(options?: {
  onSuccess?: (data: ApiResponse<CaretakerMaintenanceRequest>) => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      note,
      estimatedCompletionDate,
    }: {
      requestId: string;
      note?: string;
      estimatedCompletionDate?: string;
    }) => caretakerMaintenanceService.startWork(requestId, note, estimatedCompletionDate),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: caretakerMaintenanceKeys.lists() });
      queryClient.invalidateQueries({ 
        queryKey: caretakerMaintenanceKeys.detail(data.data!.id) 
      });
      queryClient.invalidateQueries({ queryKey: caretakerMaintenanceKeys.statistics() });
      
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Mark maintenance request as resolved
 * Convenience hook for completing work
 */
export function useMarkAsResolved(options?: {
  onSuccess?: (data: ApiResponse<CaretakerMaintenanceRequest>) => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      actualCost,
      note,
    }: {
      requestId: string;
      actualCost?: number;
      note?: string;
    }) => caretakerMaintenanceService.markAsResolved(requestId, actualCost, note),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: caretakerMaintenanceKeys.lists() });
      queryClient.invalidateQueries({ 
        queryKey: caretakerMaintenanceKeys.detail(data.data!.id) 
      });
      queryClient.invalidateQueries({ queryKey: caretakerMaintenanceKeys.statistics() });
      
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Request landlord approval
 * Used when cost exceeds auto-approval limit
 */
export function useRequestApproval(options?: {
  onSuccess?: (data: ApiResponse<CaretakerMaintenanceRequest>) => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      estimatedCost,
      costDescription,
      note,
    }: {
      requestId: string;
      estimatedCost: number;
      costDescription?: string;
      note?: string;
    }) =>
      caretakerMaintenanceService.requestApproval(
        requestId,
        estimatedCost,
        costDescription,
        note
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: caretakerMaintenanceKeys.lists() });
      queryClient.invalidateQueries({ 
        queryKey: caretakerMaintenanceKeys.detail(data.data!.id) 
      });
      queryClient.invalidateQueries({ queryKey: caretakerMaintenanceKeys.statistics() });
      
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Cancel a maintenance request
 */
export function useCancelRequest(options?: {
  onSuccess?: (data: ApiResponse<CaretakerMaintenanceRequest>) => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      reason,
    }: {
      requestId: string;
      reason: string;
    }) => caretakerMaintenanceService.cancelRequest(requestId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: caretakerMaintenanceKeys.lists() });
      queryClient.invalidateQueries({ 
        queryKey: caretakerMaintenanceKeys.detail(data.data!.id) 
      });
      queryClient.invalidateQueries({ queryKey: caretakerMaintenanceKeys.statistics() });
      
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

// ============================================
// SEARCH HOOK
// ============================================

/**
 * Search maintenance requests
 */
export function useSearchMaintenanceRequests(
  searchTerm: string,
  params?: CaretakerMaintenanceQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery<PaginatedResponse<CaretakerMaintenanceRequest>>({
    queryKey: caretakerMaintenanceKeys.list({ ...params, search: searchTerm }),
    queryFn: () => caretakerMaintenanceService.searchRequests(searchTerm, params),
    enabled: options?.enabled !== false && !!searchTerm && searchTerm.length > 0,
  });
}

