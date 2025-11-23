/**
 * Landlord Payment Service
 * Handles all payment management operations for landlords (Full CRUD)
 * Following Single Responsibility Principle & SOLID
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  LandlordPayment,
  LandlordRecordPaymentRequest,
  UpdatePaymentRequest,
  PaymentQueryParams,
  PaymentTrends,
  ApiResponse,
  PaginatedResponse,
} from "../api-types";

class LandlordPaymentService {
  private static instance: LandlordPaymentService;

  private constructor() {}

  static getInstance(): LandlordPaymentService {
    if (!LandlordPaymentService.instance) {
      LandlordPaymentService.instance = new LandlordPaymentService();
    }
    return LandlordPaymentService.instance;
  }

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  /**
   * Get payment history
   * Supports filtering by date range, payment method, tenant, etc.
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of payments
   */
  async getPaymentHistory(
    params?: PaymentQueryParams
  ): Promise<PaginatedResponse<LandlordPayment>> {
    const url = buildUrl("/payments/history", params);
    return apiClient.get<PaginatedResponse<LandlordPayment>>(url);
  }

  /**
   * Record a new payment
   * 
   * @param data - Payment recording data
   * @returns Created payment record
   */
  async recordPayment(
    data: LandlordRecordPaymentRequest
  ): Promise<ApiResponse<LandlordPayment>> {
    return apiClient.post<ApiResponse<LandlordPayment>>("/payments", data);
  }

  /**
   * Get detailed information about a specific payment
   * 
   * @param paymentId - UUID of the payment
   * @returns Payment details
   */
  async getPayment(paymentId: string): Promise<ApiResponse<LandlordPayment>> {
    return apiClient.get<ApiResponse<LandlordPayment>>(`/payments/${paymentId}`);
  }

  /**
   * Update payment information
   * 
   * @param paymentId - UUID of the payment
   * @param data - Updated payment data
   * @returns Updated payment
   */
  async updatePayment(
    paymentId: string,
    data: UpdatePaymentRequest
  ): Promise<ApiResponse<LandlordPayment>> {
    return apiClient.put<ApiResponse<LandlordPayment>>(
      `/payments/${paymentId}`,
      data
    );
  }

  /**
   * Delete a payment record
   * 
   * @param paymentId - UUID of the payment
   * @returns Success response
   */
  async deletePayment(paymentId: string): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/payments/${paymentId}`);
  }

  // ============================================
  // PAYMENT QUERIES
  // ============================================

  /**
   * Get payments by tenant
   * 
   * @param tenantId - UUID of the tenant
   * @param params - Additional query parameters
   * @returns Paginated list of payments
   */
  async getPaymentsByTenant(
    tenantId: string,
    params?: PaymentQueryParams
  ): Promise<PaginatedResponse<LandlordPayment>> {
    const url = buildUrl("/payments/history", { ...params, tenant_id: tenantId });
    return apiClient.get<PaginatedResponse<LandlordPayment>>(url);
  }

  /**
   * Get payments for a specific invoice
   * 
   * @param invoiceId - UUID of the invoice
   * @returns List of payments for the invoice
   */
  async getPaymentsByInvoice(
    invoiceId: string
  ): Promise<ApiResponse<LandlordPayment[]>> {
    return apiClient.get<ApiResponse<LandlordPayment[]>>(
      `/invoices/${invoiceId}/payments`
    );
  }

  /**
   * Get payments by property
   * 
   * @param propertyId - UUID of the property
   * @param params - Additional query parameters
   * @returns Paginated list of payments
   */
  async getPaymentsByProperty(
    propertyId: string,
    params?: PaymentQueryParams
  ): Promise<PaginatedResponse<LandlordPayment>> {
    const url = buildUrl("/payments/history", { ...params, property_id: propertyId });
    return apiClient.get<PaginatedResponse<LandlordPayment>>(url);
  }

  /**
   * Get payments by payment method
   * 
   * @param method - Payment method
   * @param params - Additional query parameters
   * @returns Paginated list of payments
   */
  async getPaymentsByMethod(
    method: string,
    params?: PaymentQueryParams
  ): Promise<PaginatedResponse<LandlordPayment>> {
    return this.getPaymentHistory({ ...params, payment_method: method as any });
  }

  /**
   * Get recent payments
   * 
   * @param limit - Number of recent payments to retrieve
   * @returns List of recent payments
   */
  async getRecentPayments(
    limit: number = 10
  ): Promise<PaginatedResponse<LandlordPayment>> {
    return this.getPaymentHistory({ per_page: limit, page: 1 });
  }

  // ============================================
  // PAYMENT STATISTICS
  // ============================================

  /**
   * Get comprehensive payment statistics
   * 
   * @returns Payment statistics
   */
  async getStatistics(): Promise<ApiResponse<{
    total_payments: number;
    total_amount: number;
    this_month_amount: number;
    last_month_amount: number;
    growth_percentage: number;
    by_method: {
      mobile_money: number;
      bank_transfer: number;
      cash: number;
      cheque: number;
    };
    average_payment: number;
  }>> {
    return apiClient.get("/payments/statistics");
  }

  /**
   * Get payment trends over time
   * 
   * @param months - Number of months to analyze (default: 12)
   * @returns Payment trends data
   */
  async getPaymentTrends(months: number = 12): Promise<ApiResponse<PaymentTrends>> {
    return apiClient.get<ApiResponse<PaymentTrends>>(
      `/payments/trends?months=${months}`
    );
  }

  /**
   * Get payment statistics for a specific period
   * 
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Period statistics
   */
  async getStatisticsForPeriod(
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<{
    total_payments: number;
    total_amount: number;
    average_payment: number;
    by_method: Record<string, number>;
  }>> {
    return apiClient.get(
      `/payments/statistics?start_date=${startDate}&end_date=${endDate}`
    );
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
    tenant_name: string;
    amount: number;
    payment_method: string;
    payment_date: string;
    status: string;
    invoice_number?: string;
  }> {
    const response = await this.getPayment(paymentId);
    const payment = response.data!;

    return {
      id: payment.id,
      payment_number: payment.payment_number,
      tenant_name: payment.tenant.name,
      amount: payment.amount,
      payment_method: payment.payment_method,
      payment_date: payment.payment_date,
      status: payment.status,
      invoice_number: payment.invoice?.invoice_number,
    };
  }

  /**
   * Calculate total payments for a tenant
   * 
   * @param tenantId - UUID of the tenant
   * @returns Total payment amount
   */
  async getTenantTotalPayments(tenantId: string): Promise<number> {
    const response = await this.getPaymentsByTenant(tenantId);
    
    return response.data.reduce(
      (total, payment) => total + payment.amount,
      0
    );
  }

  /**
   * Get tenant's last payment
   * 
   * @param tenantId - UUID of the tenant
   * @returns Last payment or null
   */
  async getTenantLastPayment(tenantId: string): Promise<LandlordPayment | null> {
    const response = await this.getPaymentsByTenant(tenantId, { per_page: 1 });
    return response.data.length > 0 ? response.data[0] : null;
  }

  /**
   * Check if payment can be edited
   * 
   * @param paymentId - UUID of the payment
   * @returns Boolean indicating if payment can be edited
   */
  async canEditPayment(paymentId: string): Promise<boolean> {
    const response = await this.getPayment(paymentId);
    return response.data!.can_edit;
  }

  /**
   * Check if payment can be deleted
   * 
   * @param paymentId - UUID of the payment
   * @returns Boolean indicating if payment can be deleted
   */
  async canDeletePayment(paymentId: string): Promise<boolean> {
    const response = await this.getPayment(paymentId);
    return response.data!.can_delete;
  }

  // ============================================
  // REPORTING
  // ============================================

  /**
   * Export payment report for a period
   * 
   * @param startDate - Start date
   * @param endDate - End date
   * @param format - Report format (pdf, excel, csv)
   * @returns Report download URL
   */
  async exportReport(
    startDate: string,
    endDate: string,
    format: "pdf" | "excel" | "csv" = "pdf"
  ): Promise<ApiResponse<{
    report_url: string;
    download_url: string;
  }>> {
    return apiClient.post<ApiResponse<{
      report_url: string;
      download_url: string;
    }>>("/payments/export", {
      start_date: startDate,
      end_date: endDate,
      format,
    });
  }

  /**
   * Generate payment receipt
   * 
   * @param paymentId - UUID of the payment
   * @returns Receipt download URL
   */
  async generateReceipt(paymentId: string): Promise<ApiResponse<{
    receipt_url: string;
    download_url: string;
  }>> {
    return apiClient.get<ApiResponse<{
      receipt_url: string;
      download_url: string;
    }>>(`/payments/${paymentId}/receipt`);
  }

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  /**
   * Validate payment data before creation/update
   * 
   * @param data - Payment data to validate
   * @returns Validation result
   */
  validatePaymentData(data: LandlordRecordPaymentRequest | UpdatePaymentRequest): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if ('amount' in data && data.amount !== undefined) {
      if (data.amount <= 0) {
        errors.push("Payment amount must be greater than 0");
      }
    }

    if ('payment_reference' in data && data.payment_reference) {
      if (data.payment_reference.length < 3) {
        errors.push("Payment reference must be at least 3 characters");
      }
    }

    if ('payment_date' in data && data.payment_date) {
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
export const landlordPaymentService = LandlordPaymentService.getInstance();
export default landlordPaymentService;

