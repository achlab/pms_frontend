/**
 * Super Admin Tenants Service
 * Handles tenant management across all properties
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type { ApiResponse, PaginatedResponse } from "../api-types";

export interface SuperAdminTenant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  leases_count: number;
  active_leases_count: number;
  payments_count: number;
  maintenance_requests_count: number;
  total_paid: number;
  pending_amount: number;
  current_lease?: {
    id: string;
    property: {
      id: string;
      name: string;
      address: string;
    };
    unit: {
      id: string;
      unit_number: string;
    };
    start_date: string;
    end_date: string;
    monthly_rent: number;
    status: string;
  };
}

export interface TenantDetails {
  tenant: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    created_at: string;
  };
  leases: Array<{
    id: string;
    property: {
      id: string;
      name: string;
      address: string;
      landlord_id: string;
      landlord: {
        id: string;
        name: string;
        email: string;
      };
    };
    unit: {
      id: string;
      unit_number: string;
    };
    start_date: string;
    end_date: string;
    monthly_rent: number;
    status: string;
  }>;
  payments: {
    records: Array<{
      id: string;
      amount: number;
      payment_date: string;
      payment_method: string;
      payment_status: string;
      property?: {
        id: string;
        name: string;
      };
      unit?: {
        id: string;
        unit_number: string;
      };
    }>;
    total_paid: number;
    total_invoiced: number;
    pending_amount: number;
    payment_score: number;
    on_time_payments: number;
    completed_payments: number;
  };
  maintenance_requests: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    created_at: string;
    property?: {
      id: string;
      name: string;
    };
    category?: {
      id: string;
      name: string;
    };
  }>;
}

export interface TenantStatistics {
  total_tenants: number;
  tenants_with_active_leases: number;
  tenants_without_leases: number;
  tenants_with_overdue_payments: number;
  total_revenue: number;
  monthly_revenue: number;
}

export interface SuperAdminTenantsQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'no_lease';
  property_id?: string;
  landlord_id?: string;
}

class SuperAdminTenantsService {
  private static instance: SuperAdminTenantsService;

  private constructor() {}

  static getInstance(): SuperAdminTenantsService {
    if (!SuperAdminTenantsService.instance) {
      SuperAdminTenantsService.instance = new SuperAdminTenantsService();
    }
    return SuperAdminTenantsService.instance;
  }

  /**
   * Get all tenants
   */
  async getAllTenants(
    params?: SuperAdminTenantsQueryParams
  ): Promise<PaginatedResponse<SuperAdminTenant>> {
    const url = buildUrl("/super-admin/tenants", params);
    return apiClient.get<PaginatedResponse<SuperAdminTenant>>(url);
  }

  /**
   * Get a specific tenant with full details
   */
  async getTenant(tenantId: string): Promise<ApiResponse<TenantDetails>> {
    return apiClient.get<ApiResponse<TenantDetails>>(
      `/super-admin/tenants/${tenantId}`
    );
  }

  /**
   * Get tenant statistics
   */
  async getStatistics(): Promise<ApiResponse<TenantStatistics>> {
    return apiClient.get<ApiResponse<TenantStatistics>>(
      "/super-admin/tenants/statistics"
    );
  }

  /**
   * Get properties for filtering
   */
  async getProperties(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    address: string;
  }>>> {
    return apiClient.get("/super-admin/tenants/properties");
  }
}

export const superAdminTenantsService = SuperAdminTenantsService.getInstance();
export default superAdminTenantsService;

