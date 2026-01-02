/**
 * Super Admin Maintenance Hooks
 * React hooks for maintenance management across all properties
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { superAdminMaintenanceService } from "../services/super-admin-maintenance.service";
import type { 
  SuperAdminMaintenanceQueryParams, 
  ApproveRejectData 
} from "../services/super-admin-maintenance.service";
import { toast } from "sonner";

/**
 * Hook to fetch all maintenance requests
 */
export function useSuperAdminMaintenanceRequests(params?: SuperAdminMaintenanceQueryParams) {
  return useQuery({
    queryKey: ['super-admin-maintenance-requests', params],
    queryFn: async () => {
      const response = await superAdminMaintenanceService.getAllMaintenanceRequests(params);
      return response;
    },
  });
}

/**
 * Hook to fetch a single maintenance request
 */
export function useSuperAdminMaintenanceRequest(requestId: string) {
  return useQuery({
    queryKey: ['super-admin-maintenance-request', requestId],
    queryFn: async () => {
      const response = await superAdminMaintenanceService.getMaintenanceRequest(requestId);
      return response.data;
    },
    enabled: !!requestId,
  });
}

/**
 * Hook to fetch maintenance statistics
 */
export function useSuperAdminMaintenanceStatistics() {
  return useQuery({
    queryKey: ['super-admin-maintenance-statistics'],
    queryFn: async () => {
      const response = await superAdminMaintenanceService.getStatistics();
      return response.data;
    },
  });
}

/**
 * Hook to fetch categories
 */
export function useSuperAdminMaintenanceCategories() {
  return useQuery({
    queryKey: ['super-admin-maintenance-categories'],
    queryFn: async () => {
      const response = await superAdminMaintenanceService.getCategories();
      return response.data;
    },
  });
}

/**
 * Hook to fetch caretakers
 */
export function useSuperAdminMaintenanceCaretakers() {
  return useQuery({
    queryKey: ['super-admin-maintenance-caretakers'],
    queryFn: async () => {
      const response = await superAdminMaintenanceService.getCaretakers();
      return response.data;
    },
  });
}

/**
 * Hook to approve/reject maintenance request
 */
export function useApproveRejectMaintenanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: ApproveRejectData }) => 
      superAdminMaintenanceService.approveRejectRequest(requestId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-maintenance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-maintenance-request'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-maintenance-statistics'] });
      
      const action = variables.data.action === 'approve' ? 'approved' : 'rejected';
      toast.success(`Maintenance request ${action} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process maintenance request');
    },
  });
}

/**
 * Hook to fetch emergency maintenance requests
 */
export function useSuperAdminEmergencyRequests() {
  return useQuery({
    queryKey: ['super-admin-emergency-requests'],
    queryFn: async () => {
      const response = await superAdminMaintenanceService.getAllMaintenanceRequests({
        priority: 'emergency',
        status: 'received',
      });
      return response;
    },
  });
}

/**
 * Hook to fetch open maintenance requests (pending approval)
 */
export function useSuperAdminOpenRequests() {
  return useQuery({
    queryKey: ['super-admin-open-requests'],
    queryFn: async () => {
      const response = await superAdminMaintenanceService.getAllMaintenanceRequests({
        status: 'received',
      });
      return response;
    },
  });
}
