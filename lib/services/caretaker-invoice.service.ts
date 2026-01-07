/**
 * Caretaker Invoice Service
 * Handles invoice operations for caretakers (Read-only access to managed properties)
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  Invoice,
  InvoiceQueryParams,
  ApiResponse,
  PaginatedResponse,
} from "../api-types";

class CaretakerInvoiceService {
  private static instance: CaretakerInvoiceService;

  private constructor() {}

  static getInstance(): CaretakerInvoiceService {
    if (!CaretakerInvoiceService.instance) {
      CaretakerInvoiceService.instance = new CaretakerInvoiceService();
    }
    return CaretakerInvoiceService.instance;
  }

  // ============================================
  // READ OPERATIONS (Caretakers have read-only access)
  // ============================================

  /**
   * Get all invoices for properties managed by the caretaker
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of invoices
   */
  async getInvoices(
    params?: InvoiceQueryParams
  ): Promise<PaginatedResponse<Invoice>> {
    const url = buildUrl("/invoices", params);
    return apiClient.get<PaginatedResponse<Invoice>>(url);
  }

  /**
   * Get detailed information about a specific invoice
   * 
   * @param invoiceId - UUID of the invoice
   * @returns Invoice details
   */
  async getInvoice(invoiceId: string): Promise<ApiResponse<Invoice>> {
    return apiClient.get<ApiResponse<Invoice>>(`/invoices/${invoiceId}`);
  }

  // ============================================
  // FILTERED QUERIES
  // ============================================

  /**
   * Get overdue invoices for managed properties
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of overdue invoices
   */
  async getOverdueInvoices(
    params?: InvoiceQueryParams
  ): Promise<PaginatedResponse<Invoice>> {
    return this.getInvoices({ ...params, status: "overdue" });
  }

  /**
   * Get pending invoices for managed properties
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of pending invoices
   */
  async getPendingInvoices(
    params?: InvoiceQueryParams
  ): Promise<PaginatedResponse<Invoice>> {
    return this.getInvoices({ ...params, status: "pending" });
  }

  /**
   * Get paid invoices for managed properties
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of paid invoices
   */
  async getPaidInvoices(
    params?: InvoiceQueryParams
  ): Promise<PaginatedResponse<Invoice>> {
    return this.getInvoices({ ...params, status: "paid" });
  }

  /**
   * Get invoices for a specific property (if managed by caretaker)
   * 
   * @param propertyId - UUID of the property
   * @param params - Additional query parameters
   * @returns Paginated list of invoices
   */
  async getInvoicesByProperty(
    propertyId: string,
    params?: InvoiceQueryParams
  ): Promise<PaginatedResponse<Invoice>> {
    const url = buildUrl("/invoices", { ...params, property_id: propertyId });
    return apiClient.get<PaginatedResponse<Invoice>>(url);
  }

  /**
   * Get invoices for a specific tenant in managed properties
   * 
   * @param tenantId - UUID of the tenant
   * @param params - Additional query parameters
   * @returns Paginated list of invoices
   */
  async getInvoicesByTenant(
    tenantId: string,
    params?: InvoiceQueryParams
  ): Promise<PaginatedResponse<Invoice>> {
    const url = buildUrl("/invoices", { ...params, tenant_id: tenantId });
    return apiClient.get<PaginatedResponse<Invoice>>(url);
  }

  // ============================================
  // STATISTICS (Read-only)
  // ============================================

  /**
   * Get invoice statistics for managed properties
   * 
   * @returns Invoice statistics
   */
  async getStatistics(): Promise<ApiResponse<{
    total_invoices: number;
    pending_invoices: number;
    paid_invoices: number;
    overdue_invoices: number;
    total_amount: number;
    total_paid: number;
    total_outstanding: number;
    collection_rate: number;
  }>> {
    const cacheBuster = Date.now();
    return apiClient.get(`/invoices/statistics?_=${cacheBuster}`);
  }

  /**
   * Get invoice statistics for a specific period
   * 
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Period statistics
   */
  async getStatisticsForPeriod(
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<{
    total_invoices: number;
    total_amount: number;
    total_paid: number;
    total_outstanding: number;
  }>> {
    const cacheBuster = Date.now();
    return apiClient.get(
      `/invoices/statistics?start_date=${startDate}&end_date=${endDate}&_=${cacheBuster}`
    );
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get invoice summary with key information
   * 
   * @param invoiceId - UUID of the invoice
   * @returns Simplified invoice summary
   */
  async getInvoiceSummary(invoiceId: string): Promise<{
    id: string;
    invoice_number: string;
    tenant_name: string;
    property_name: string;
    unit_number: string;
    total_amount: number;
    outstanding_balance: number;
    due_date: string;
    status: string;
    is_overdue: boolean;
    days_overdue: number;
  }> {
    const response = await this.getInvoice(invoiceId);
    const invoice = response.data!;

    return {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      tenant_name: invoice.tenant.name,
      property_name: invoice.property.name,
      unit_number: invoice.unit.unit_number,
      total_amount: invoice.total_amount,
      outstanding_balance: invoice.outstanding_balance,
      due_date: invoice.due_date,
      status: invoice.status,
      is_overdue: invoice.is_overdue,
      days_overdue: invoice.days_overdue,
    };
  }

  /**
   * Calculate total outstanding for a tenant in managed properties
   * 
   * @param tenantId - UUID of the tenant
   * @returns Total outstanding amount
   */
  async getTenantOutstanding(tenantId: string): Promise<number> {
    const response = await this.getInvoicesByTenant(tenantId, {
      status: "pending",
    });
    
    return response.data.reduce(
      (total, invoice) => total + invoice.outstanding_balance,
      0
    );
  }

  /**
   * Get tenant's overdue invoices count in managed properties
   * 
   * @param tenantId - UUID of the tenant
   * @returns Count of overdue invoices
   */
  async getTenantOverdueCount(tenantId: string): Promise<number> {
    const response = await this.getInvoicesByTenant(tenantId, {
      status: "overdue",
    });
    
    return response.meta.total;
  }

  // ============================================
  // REPORTING (Read-only)
  // ============================================

  /**
   * Export invoice as PDF
   * 
   * @param invoiceId - UUID of the invoice
   * @returns PDF download URL
   */
  async exportInvoicePDF(invoiceId: string): Promise<ApiResponse<{
    pdf_url: string;
    download_url: string;
  }>> {
    return apiClient.get<ApiResponse<{
      pdf_url: string;
      download_url: string;
    }>>(`/invoices/${invoiceId}/export-pdf`);
  }

  /**
   * Generate invoice report for managed properties
   * 
   * @param startDate - Start date
   * @param endDate - End date
   * @param format - Report format (pdf, excel, csv)
   * @returns Report download URL
   */
  async generateReport(
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
    }>>("/invoices/generate-report", {
      start_date: startDate,
      end_date: endDate,
      format,
    });
  }
}

// Export singleton instance
export const caretakerInvoiceService = CaretakerInvoiceService.getInstance();
export default caretakerInvoiceService;
