/**
 * Super Admin Payment Service
 * Handles payment oversight across ALL landlords
 * Following Single Responsibility Principle & SOLID
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  SystemPayment,
  SuperAdminPaymentQueryParams,
  PaymentMethod,
  ApiResponse,
  PaginatedResponse,
} from "../api-types";

class SuperAdminPaymentService {
  private static instance: SuperAdminPaymentService;

  private constructor() {}

  static getInstance(): SuperAdminPaymentService {
    if (!SuperAdminPaymentService.instance) {
      SuperAdminPaymentService.instance = new SuperAdminPaymentService();
    }
    return SuperAdminPaymentService.instance;
  }

  // ============================================
  // SYSTEM-WIDE PAYMENT QUERIES
  // ============================================

  /**
   * Get all payments across ALL landlords
   * System-wide view with complete context
   * 
   * @param params - Query parameters for filtering
   * @returns Paginated list of all payments
   */
  async getAllPayments(
    params?: SuperAdminPaymentQueryParams
  ): Promise<PaginatedResponse<SystemPayment>> {
    const url = buildUrl("/payments/history", params);
    return apiClient.get<PaginatedResponse<SystemPayment>>(url);
  }

  /**
   * Get a specific payment by ID
   * 
   * @param paymentId - UUID of the payment
   * @returns Payment details with full context
   */
  async getPaymentDetails(
    paymentId: string
  ): Promise<ApiResponse<SystemPayment>> {
    return apiClient.get<ApiResponse<SystemPayment>>(`/payments/${paymentId}`);
  }

  /**
   * Get payments by landlord
   * 
   * @param landlordId - UUID of the landlord
   * @param params - Additional query parameters
   * @returns Payments for specified landlord
   */
  async getPaymentsByLandlord(
    landlordId: string,
    params?: SuperAdminPaymentQueryParams
  ): Promise<PaginatedResponse<SystemPayment>> {
    return this.getAllPayments({ ...params, landlord_id: landlordId });
  }

  /**
   * Get payments by tenant
   * 
   * @param tenantId - UUID of the tenant
   * @param params - Additional query parameters
   * @returns Payments made by specified tenant
   */
  async getPaymentsByTenant(
    tenantId: string,
    params?: SuperAdminPaymentQueryParams
  ): Promise<PaginatedResponse<SystemPayment>> {
    return this.getAllPayments({ ...params, tenant_id: tenantId });
  }

  /**
   * Get payments by payment method
   * 
   * @param method - Payment method
   * @param params - Additional query parameters
   * @returns Payments using specified method
   */
  async getPaymentsByMethod(
    method: PaymentMethod,
    params?: SuperAdminPaymentQueryParams
  ): Promise<PaginatedResponse<SystemPayment>> {
    return this.getAllPayments({ ...params, payment_method: method });
  }

  /**
   * Get payments by date range
   * 
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param params - Additional query parameters
   * @returns Payments within date range
   */
  async getPaymentsByDateRange(
    startDate: string,
    endDate: string,
    params?: SuperAdminPaymentQueryParams
  ): Promise<PaginatedResponse<SystemPayment>> {
    return this.getAllPayments({
      ...params,
      start_date: startDate,
      end_date: endDate,
    });
  }

  /**
   * Get recent payments
   * 
   * @param limit - Number of recent payments
   * @returns Recent payments across system
   */
  async getRecentPayments(
    limit: number = 50
  ): Promise<PaginatedResponse<SystemPayment>> {
    return this.getAllPayments({ per_page: limit, page: 1 });
  }

  // ============================================
  // PAYMENT STATISTICS
  // ============================================

  /**
   * Get comprehensive payment statistics
   * 
   * @returns System-wide payment statistics
   */
  async getPaymentStatistics(): Promise<ApiResponse<{
    total_payments: number;
    total_amount: number;
    this_month_amount: number;
    last_month_amount: number;
    growth_percentage: number;
    by_landlord: {
      landlord_id: string;
      landlord_name: string;
      total_payments: number;
      total_amount: number;
      average_payment: number;
    }[];
    by_method: Record<PaymentMethod, {
      count: number;
      total_amount: number;
      percentage: number;
    }>;
    average_payment: number;
    largest_payment: number;
  }>> {
    return apiClient.get("/payments/statistics");
  }

  /**
   * Get payment statistics for a landlord
   * 
   * @param landlordId - UUID of the landlord
   * @returns Landlord-specific payment statistics
   */
  async getLandlordPaymentStatistics(
    landlordId: string
  ): Promise<ApiResponse<{
    total_payments: number;
    total_amount: number;
    average_payment: number;
    by_method: Record<PaymentMethod, number>;
  }>> {
    return apiClient.get(`/landlords/${landlordId}/payments/statistics`);
  }

  /**
   * Get payment trends over time
   * 
   * @param months - Number of months to analyze
   * @returns Payment trends data
   */
  async getPaymentTrends(months: number = 12): Promise<ApiResponse<{
    monthly_data: {
      month: string;
      total_payments: number;
      total_amount: number;
      average_payment: number;
    }[];
    trend: "increasing" | "decreasing" | "stable";
    growth_rate: number;
  }>> {
    return apiClient.get(`/payments/trends?months=${months}`);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get payment summary with key information
   * 
   * @param paymentId - UUID of the payment
   * @returns Simplified payment summary
   */
  async getPaymentSummary(paymentId: string): Promise<{
    id: string;
    payment_number: string;
    landlord_name: string;
    tenant_name: string;
    amount: number;
    payment_method: PaymentMethod;
    payment_date: string;
    payment_reference: string;
    invoice_number?: string;
  }> {
    const response = await this.getPaymentDetails(paymentId);
    const payment = response.data!;

    return {
      id: payment.id,
      payment_number: payment.payment_number,
      landlord_name: payment.landlord.name,
      tenant_name: payment.tenant.name,
      amount: payment.amount,
      payment_method: payment.payment_method,
      payment_date: payment.payment_date,
      payment_reference: payment.payment_reference,
      invoice_number: payment.invoice?.invoice_number,
    };
  }

  /**
   * Get total payment count
   * 
   * @returns Total number of payments in system
   */
  async getTotalPaymentCount(): Promise<number> {
    const response = await this.getAllPayments({ per_page: 1 });
    return response.meta?.total || 0;
  }

  /**
   * Get payment count by landlord
   * 
   * @param landlordId - UUID of the landlord
   * @returns Number of payments for landlord
   */
  async getPaymentCountByLandlord(landlordId: string): Promise<number> {
    const response = await this.getPaymentsByLandlord(landlordId, { per_page: 1 });
    return response.meta?.total || 0;
  }

  /**
   * Calculate total payment amount
   * 
   * @returns Total payment amount across all payments
   */
  async calculateTotalPaymentAmount(): Promise<number> {
    const stats = await this.getPaymentStatistics();
    return stats.data!.total_amount;
  }

  /**
   * Calculate average payment amount
   * 
   * @returns Average payment amount
   */
  async calculateAveragePaymentAmount(): Promise<number> {
    const stats = await this.getPaymentStatistics();
    return stats.data!.average_payment;
  }

  /**
   * Get landlord for payment
   * 
   * @param paymentId - UUID of the payment
   * @returns Landlord information
   */
  async getPaymentLandlord(paymentId: string): Promise<{
    id: string;
    name: string;
  }> {
    const payment = await this.getPaymentDetails(paymentId);
    return payment.data!.landlord;
  }

  /**
   * Get tenant for payment
   * 
   * @param paymentId - UUID of the payment
   * @returns Tenant information
   */
  async getPaymentTenant(paymentId: string): Promise<{
    id: string;
    name: string;
  }> {
    const payment = await this.getPaymentDetails(paymentId);
    return payment.data!.tenant;
  }

  // ============================================
  // COMPARATIVE ANALYSIS
  // ============================================

  /**
   * Compare payments by landlord
   * 
   * @returns Landlord comparison data
   */
  async compareLandlordPayments(): Promise<ApiResponse<{
    landlords: {
      landlord_id: string;
      landlord_name: string;
      total_payments: number;
      total_amount: number;
      average_payment: number;
      preferred_method: PaymentMethod;
    }[];
    system_averages: {
      avg_payment_amount: number;
      avg_payments_per_landlord: number;
    };
  }>> {
    return apiClient.get("/payments/landlord-comparison");
  }

  /**
   * Get payment method distribution
   * 
   * @returns Payment method breakdown
   */
  async getPaymentMethodDistribution(): Promise<ApiResponse<{
    methods: {
      method: PaymentMethod;
      count: number;
      total_amount: number;
      percentage: number;
    }[];
    most_popular: PaymentMethod;
  }>> {
    return apiClient.get("/payments/method-distribution");
  }

  /**
   * Get high-value payments
   * 
   * @param limit - Number of payments to return
   * @returns Top high-value payments
   */
  async getHighValuePayments(
    limit: number = 10
  ): Promise<ApiResponse<SystemPayment[]>> {
    return apiClient.get<ApiResponse<SystemPayment[]>>(
      `/payments/high-value?limit=${limit}`
    );
  }

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  /**
   * Validate payment data
   * 
   * @param data - Payment data to validate
   * @returns Validation result
   */
  validatePaymentData(data: {
    amount?: number;
    payment_date?: string;
  }): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (data.amount !== undefined && data.amount <= 0) {
      errors.push("Payment amount must be greater than 0");
    }

    if (data.payment_date) {
      const paymentDate = new Date(data.payment_date);
      const today = new Date();

      if (paymentDate > today) {
        errors.push("Payment date cannot be in the future");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const superAdminPaymentService = SuperAdminPaymentService.getInstance();
export default superAdminPaymentService;

