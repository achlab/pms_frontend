import { apiClient } from '@/lib/api-client';
import { ApiResponse, MaintenanceRequest } from '@/lib/api-types';

export interface TenantResolutionData {
  is_resolved: boolean;
  resolution_notes?: string;
}

export const tenantResolutionService = {
  /**
   * Tenant marks maintenance request as resolved or unresolved
   */
  resolveRequest: async (requestId: string, data: TenantResolutionData): Promise<ApiResponse<MaintenanceRequest>> => {
    return apiClient.patch(`/maintenance/requests/${requestId}/resolve`, data);
  },
};
