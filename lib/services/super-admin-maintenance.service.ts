/**
 * Super Admin Maintenance Service
 * Handles maintenance request management across all properties
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type { ApiResponse, PaginatedResponse, MaintenanceRequest } from "../api-types";

export interface SuperAdminMaintenanceStatistics {
  total_requests: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  urgent_count: number;
  completed_count: number;
  completion_rate: number;
  avg_resolution_time_hours: number | null;
  by_category: Array<{
    category: string;
    count: number;
  }>;
  recent_requests: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    created_at: string;
    tenant: {
      id: string;
      name: string;
    };
    property: {
      id: string;
      name: string;
    };
    category: {
      id: string;
      name: string;
    };
  }>;
}

export interface SuperAdminMaintenanceQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  priority?: string;
  category_id?: string;
  landlord_id?: string;
  tenant_id?: string;
  property_id?: string;
}

export interface ApproveRejectData {
  action: 'approve' | 'reject';
  rejection_reason?: string;
  assigned_to?: string;
}

class SuperAdminMaintenanceService {
  private static instance: SuperAdminMaintenanceService;

  private constructor() {}

  static getInstance(): SuperAdminMaintenanceService {
    if (!SuperAdminMaintenanceService.instance) {
      SuperAdminMaintenanceService.instance = new SuperAdminMaintenanceService();
    }
    return SuperAdminMaintenanceService.instance;
  }

  /**
   * Get all maintenance requests
   */
  async getAllMaintenanceRequests(
    params?: SuperAdminMaintenanceQueryParams
  ): Promise<PaginatedResponse<MaintenanceRequest>> {
    const url = buildUrl("/super-admin/maintenance", params);
    return apiClient.get<PaginatedResponse<MaintenanceRequest>>(url);
  }

  /**
   * Get a specific maintenance request
   */
  async getMaintenanceRequest(requestId: string): Promise<ApiResponse<MaintenanceRequest>> {
    return apiClient.get<ApiResponse<MaintenanceRequest>>(
      `/super-admin/maintenance/${requestId}`
    );
  }

  /**
   * Approve or reject a maintenance request
   */
  async approveRejectRequest(
    requestId: string,
    data: ApproveRejectData
  ): Promise<ApiResponse<MaintenanceRequest>> {
    return apiClient.patch<ApiResponse<MaintenanceRequest>>(
      `/super-admin/maintenance/${requestId}/approve-reject`,
      data
    );
  }

  /**
   * Get maintenance statistics
   */
  async getStatistics(): Promise<ApiResponse<SuperAdminMaintenanceStatistics>> {
    return apiClient.get<ApiResponse<SuperAdminMaintenanceStatistics>>(
      "/super-admin/maintenance/statistics"
    );
  }

  /**
   * Get categories for filtering
   */
  async getCategories(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description?: string;
  }>>> {
    return apiClient.get("/super-admin/maintenance/categories");
  }

  /**
   * Get caretakers for assignment
   */
  async getCaretakers(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    email: string;
  }>>> {
    return apiClient.get("/super-admin/maintenance/caretakers");
  }
}

export const superAdminMaintenanceService = SuperAdminMaintenanceService.getInstance();
export default superAdminMaintenanceService;
