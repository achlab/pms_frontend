/**
 * Super Admin Payments Service
 * Handles payment tracking across all landlords and tenants
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type { ApiResponse, PaginatedResponse } from "../api-types";

export interface SuperAdminPayment {
  id: string;
  tenant_id: string;
  landlord_id: string;
  property_id: string;
  unit_id: string;
  invoice_id?: string;
  lease_id?: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  payment_status: 'recorded' | 'pending' | 'failed';
  transaction_reference?: string;
  notes?: string;
  created_at: string;
  tenant?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  landlord?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
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
  invoice?: {
    id: string;
    invoice_number: string;
    amount: number;
    due_date: string;
    invoice_type: string;
  };
  lease?: {
    id: string;
    start_date: string;
    end_date: string;
    monthly_rent: number;
  };
}

export interface PaymentStatistics {
  total_payments: number;
  total_amount: number;
  pending_amount: number;
  failed_amount: number;
  recorded_count: number;
  pending_count: number;
  failed_count: number;
  today_payments: number;
  monthly_payments: number;
  yearly_payments: number;
  by_payment_method: Array<{
    payment_method: string;
    count: number;
    total: number;
  }>;
  top_tenants: Array<{
    tenant_id: string;
    total_paid: number;
    payment_count: number;
    tenant?: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  top_landlords: Array<{
    landlord_id: string;
    total_revenue: number;
    payment_count: number;
    landlord?: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  monthly_trend: Array<{
    month: string;
    amount: number;
  }>;
}

export interface SuperAdminPaymentsQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: 'recorded' | 'pending' | 'failed';
  payment_method?: string;
  landlord_id?: string;
  tenant_id?: string;
  property_id?: string;
  start_date?: string;
  end_date?: string;
}

class SuperAdminPaymentsService {
  private static instance: SuperAdminPaymentsService;

  private constructor() {}

  static getInstance(): SuperAdminPaymentsService {
    if (!SuperAdminPaymentsService.instance) {
      SuperAdminPaymentsService.instance = new SuperAdminPaymentsService();
    }
    return SuperAdminPaymentsService.instance;
  }

  /**
   * Get all payments
   */
  async getAllPayments(
    params?: SuperAdminPaymentsQueryParams
  ): Promise<PaginatedResponse<SuperAdminPayment>> {
    const url = buildUrl("/super-admin/payments", params);
    return apiClient.get<PaginatedResponse<SuperAdminPayment>>(url);
  }

  /**
   * Get a specific payment
   */
  async getPayment(paymentId: string): Promise<ApiResponse<SuperAdminPayment>> {
    return apiClient.get<ApiResponse<SuperAdminPayment>>(
      `/super-admin/payments/${paymentId}`
    );
  }

  /**
   * Get payment statistics
   */
  async getStatistics(): Promise<ApiResponse<PaymentStatistics>> {
    return apiClient.get<ApiResponse<PaymentStatistics>>(
      "/super-admin/payments/statistics"
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
    return apiClient.get("/super-admin/payments/properties");
  }

  /**
   * Get payment methods for filtering
   */
  async getPaymentMethods(): Promise<ApiResponse<string[]>> {
    return apiClient.get("/super-admin/payments/payment-methods");
  }
}

export const superAdminPaymentsService = SuperAdminPaymentsService.getInstance();
export default superAdminPaymentsService;

