/**
 * Super Admin Invoices Service
 * Handles invoice management across all landlords and tenants
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type { ApiResponse, PaginatedResponse } from "../api-types";

export interface SuperAdminInvoice {
  id: string;
  invoice_number: string;
  tenant_id: string;
  landlord_id: string;
  property_id: string;
  unit_id: string;
  lease_id?: string;
  amount: number;
  due_date: string;
  description?: string;
  invoice_type: 'rent' | 'utility' | 'maintenance' | 'other';
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  issued_at: string;
  created_at: string;
  tenant?: {
    id: string;
    name: string;
    email: string;
  };
  landlord?: {
    id: string;
    name: string;
    email: string;
  };
  property?: {
    id: string;
    name: string;
    address: string;
  };
  unit?: {
    id: string;
    unit_number: string;
  };
  lease?: {
    id: string;
    start_date: string;
    end_date: string;
    monthly_rent: number;
  };
  payments?: Array<{
    id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    payment_status: string;
  }>;
}

export interface InvoiceStatistics {
  total_invoices: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  overdue_amount: number;
  pending_count: number;
  paid_count: number;
  overdue_count: number;
  cancelled_count: number;
  monthly_invoiced: number;
  monthly_paid: number;
  collection_rate: number;
  by_type: Array<{
    invoice_type: string;
    count: number;
    total: number;
  }>;
}

export interface CreateInvoiceData {
  tenant_id: string;
  property_id: string;
  unit_id: string;
  lease_id?: string;
  amount: number;
  due_date: string;
  description?: string;
  invoice_type: 'rent' | 'utility' | 'maintenance' | 'other';
}

export interface SuperAdminInvoicesQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  landlord_id?: string;
  tenant_id?: string;
  start_date?: string;
  end_date?: string;
}

class SuperAdminInvoicesService {
  private static instance: SuperAdminInvoicesService;

  private constructor() {}

  static getInstance(): SuperAdminInvoicesService {
    if (!SuperAdminInvoicesService.instance) {
      SuperAdminInvoicesService.instance = new SuperAdminInvoicesService();
    }
    return SuperAdminInvoicesService.instance;
  }

  /**
   * Get all invoices
   */
  async getAllInvoices(
    params?: SuperAdminInvoicesQueryParams
  ): Promise<PaginatedResponse<SuperAdminInvoice>> {
    const url = buildUrl("/super-admin/invoices", params);
    return apiClient.get<PaginatedResponse<SuperAdminInvoice>>(url);
  }

  /**
   * Get a specific invoice
   */
  async getInvoice(invoiceId: string): Promise<ApiResponse<SuperAdminInvoice>> {
    return apiClient.get<ApiResponse<SuperAdminInvoice>>(
      `/super-admin/invoices/${invoiceId}`
    );
  }

  /**
   * Create a new invoice
   */
  async createInvoice(data: CreateInvoiceData): Promise<ApiResponse<SuperAdminInvoice>> {
    return apiClient.post<ApiResponse<SuperAdminInvoice>>(
      "/super-admin/invoices",
      data
    );
  }

  /**
   * Update invoice status
   */
  async updateInvoiceStatus(
    invoiceId: string,
    status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  ): Promise<ApiResponse<SuperAdminInvoice>> {
    return apiClient.patch<ApiResponse<SuperAdminInvoice>>(
      `/super-admin/invoices/${invoiceId}/status`,
      { status }
    );
  }

  /**
   * Get invoice statistics
   */
  async getStatistics(): Promise<ApiResponse<InvoiceStatistics>> {
    return apiClient.get<ApiResponse<InvoiceStatistics>>(
      "/super-admin/invoices/statistics"
    );
  }

  /**
   * Get tenants for invoice creation
   */
  async getTenants(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    email: string;
  }>>> {
    return apiClient.get("/super-admin/invoices/tenants");
  }

  /**
   * Get tenant's leases for invoice creation
   */
  async getTenantLeases(tenantId: string): Promise<ApiResponse<Array<{
    id: string;
    property_id: string;
    unit_id: string;
    monthly_rent: number;
    start_date: string;
    end_date: string;
    status: string;
    property: {
      id: string;
      name: string;
      address: string;
    };
    unit: {
      id: string;
      unit_number: string;
    };
  }>>> {
    return apiClient.get(`/super-admin/invoices/tenants/${tenantId}/leases`);
  }
}

export const superAdminInvoicesService = SuperAdminInvoicesService.getInstance();
export default superAdminInvoicesService;

