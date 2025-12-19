import { apiClient } from '@/lib/api-client';
import { ApiResponse, MaintenanceRequest } from '@/lib/api-types';

export interface ApproveRejectData {
  action: 'approve' | 'reject';
  rejection_reason?: string;
}

export interface ApproveRejectResponse {
  maintenance_request: MaintenanceRequest;
  event: {
    id: string;
    type: string;
    title: string;
    description: string;
    rejection_reason?: string;
    created_at: string;
  };
}

export const maintenanceApprovalService = {
  /**
   * Approve or reject a maintenance request
   */
  approveReject: async (requestId: string, data: ApproveRejectData): Promise<ApiResponse<ApproveRejectResponse>> => {
    console.log('📡 maintenanceApprovalService.approveReject called', { requestId, data });
    const response = await apiClient.patch(`/maintenance/requests/${requestId}/approve-reject`, data);
    console.log('📥 maintenanceApprovalService.approveReject response', response);
    return response;
  },

  /**
   * Get maintenance request events
   */
  getEvents: async (requestId: string): Promise<ApiResponse<MaintenanceEvent[]>> => {
    return apiClient.get(`/maintenance/requests/${requestId}/events`);
  },
};

export interface MaintenanceEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  rejection_reason?: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
  metadata?: any;
  created_at: string;
  time_ago: string;
};
