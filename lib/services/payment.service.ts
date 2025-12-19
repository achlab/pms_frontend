/**
 * Payment Service
 * Handles all payment-related API calls
 * Following Single Responsibility Principle
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  Payment,
  RecordPaymentRequest,
  PaymentQueryParams,
  PaginatedResponse,
  ApiResponse,
} from "../api-types";

class PaymentService {
  private static instance: PaymentService;

  private constructor() {}

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Get payment history with optional filters
   */
  async getPaymentHistory(params?: PaymentQueryParams): Promise<PaginatedResponse<Payment>> {
    const url = buildUrl("/payments/history", params);
    return apiClient.get<PaginatedResponse<Payment>>(url);
  }

  /**
   * Get payments for a specific invoice
   */
  async getInvoicePayments(invoiceId: string): Promise<ApiResponse<{
    invoice: any;
    payments: Payment[];
    total_paid: number;
    remaining_balance: number;
  }>> {
    return apiClient.get<ApiResponse<any>>(`/payments/invoices/${invoiceId}`);
  }

  /**
   * Record a payment for an invoice
   */
  async recordPayment(
    invoiceId: string,
    data: RecordPaymentRequest
  ): Promise<ApiResponse<{
    payment: Payment;
    invoice: any;
  }>> {
    return apiClient.post<ApiResponse<any>>(
      `/payments/invoices/${invoiceId}/record`,
      data
    );
  }

  /**
   * Update payment status (landlord confirms/rejects)
   */
  async updatePaymentStatus(
    paymentId: string,
    status: 'completed' | 'pending' | 'failed' | 'recorded' | 'partially_paid'
  ): Promise<ApiResponse<Payment>> {
    return apiClient.patch<ApiResponse<Payment>>(
      `/payments/${paymentId}/status`,
      { status }
    );
  }

  /**
   * Get single payment details
   */
  async getPaymentDetails(paymentId: string): Promise<ApiResponse<Payment>> {
    return apiClient.get<ApiResponse<Payment>>(`/payments/${paymentId}`);
  }
}

// Export singleton instance
export const paymentService = PaymentService.getInstance();
export default paymentService;

