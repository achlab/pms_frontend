/**
 * Invoice Service
 * Handles all invoice-related API calls
 * Following Single Responsibility Principle
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  Invoice,
  InvoiceQueryParams,
  PaginatedResponse,
  ApiResponse,
} from "../api-types";

class InvoiceService {
  private static instance: InvoiceService;

  private constructor() {}

  static getInstance(): InvoiceService {
    if (!InvoiceService.instance) {
      InvoiceService.instance = new InvoiceService();
    }
    return InvoiceService.instance;
  }

  /**
   * Get all invoices with optional filters
   */
  async getInvoices(params?: InvoiceQueryParams): Promise<PaginatedResponse<Invoice>> {
    const url = buildUrl("/invoices", params);
    return apiClient.get<PaginatedResponse<Invoice>>(url);
  }

  /**
   * Get specific invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<ApiResponse<Invoice>> {
    return apiClient.get<ApiResponse<Invoice>>(`/invoices/${invoiceId}`);
  }

  /**
   * Get pending invoices
   */
  async getPendingInvoices(params?: InvoiceQueryParams): Promise<PaginatedResponse<Invoice>> {
    return this.getInvoices({ ...params, status: "pending" });
  }

  /**
   * Get paid invoices
   */
  async getPaidInvoices(params?: InvoiceQueryParams): Promise<PaginatedResponse<Invoice>> {
    return this.getInvoices({ ...params, status: "paid" });
  }

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(params?: InvoiceQueryParams): Promise<PaginatedResponse<Invoice>> {
    return this.getInvoices({ ...params, status: "overdue" });
  }

  /**
   * Get partially paid invoices
   */
  async getPartiallyPaidInvoices(params?: InvoiceQueryParams): Promise<PaginatedResponse<Invoice>> {
    return this.getInvoices({ ...params, status: "partially_paid" });
  }

  /**
   * Get invoices by type
   */
  async getInvoicesByType(type: string, params?: InvoiceQueryParams): Promise<PaginatedResponse<Invoice>> {
    return this.getInvoices({ ...params, invoice_type: type as any });
  }
}

// Export singleton instance
export const invoiceService = InvoiceService.getInstance();
export default invoiceService;

