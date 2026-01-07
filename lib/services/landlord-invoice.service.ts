/**
 * Landlord Invoice Service
 * Handles all invoice management operations for landlords (Full CRUD)
 * Following Single Responsibility Principle & SOLID
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  LandlordInvoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  BulkInvoiceGenerationRequest,
  InvoiceQueryParams,
  ApiResponse,
  PaginatedResponse,
} from "../api-types";

class LandlordInvoiceService {
  private static instance: LandlordInvoiceService;

  private constructor() {}

  static getInstance(): LandlordInvoiceService {
    if (!LandlordInvoiceService.instance) {
      LandlordInvoiceService.instance = new LandlordInvoiceService();
    }
    return LandlordInvoiceService.instance;
  }

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  /**
   * Get all invoices
   * Supports filtering by status, type, date range, etc.
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of invoices
   */
  async getInvoices(
    params?: InvoiceQueryParams
  ): Promise<PaginatedResponse<LandlordInvoice>> {
    const url = buildUrl("/invoices", params);
    return apiClient.get<PaginatedResponse<LandlordInvoice>>(url);
  }

  /**
   * Create a new invoice
   * 
   * @param data - Invoice creation data
   * @returns Created invoice
   */
  async createInvoice(
    data: CreateInvoiceRequest
  ): Promise<ApiResponse<LandlordInvoice>> {
    return apiClient.post<ApiResponse<LandlordInvoice>>("/invoices", data);
  }

  /**
   * Get detailed information about a specific invoice
   * 
   * @param invoiceId - UUID of the invoice
   * @returns Invoice details with payment history
   */
  async getInvoice(invoiceId: string): Promise<ApiResponse<LandlordInvoice>> {
    return apiClient.get<ApiResponse<LandlordInvoice>>(`/invoices/${invoiceId}`);
  }

  /**
   * Update invoice information
   * 
   * @param invoiceId - UUID of the invoice
   * @param data - Updated invoice data
   * @returns Updated invoice
   */
  async updateInvoice(
    invoiceId: string,
    data: UpdateInvoiceRequest
  ): Promise<ApiResponse<LandlordInvoice>> {
    return apiClient.put<ApiResponse<LandlordInvoice>>(
      `/invoices/${invoiceId}`,
      data
    );
  }

  /**
   * Delete an invoice
   * 
   * @param invoiceId - UUID of the invoice
   * @returns Success response
   */
  async deleteInvoice(invoiceId: string): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/invoices/${invoiceId}`);
  }

  // ============================================
  // INVOICE STATUS MANAGEMENT
  // ============================================

  /**
   * Mark invoice as paid
   * 
   * @param invoiceId - UUID of the invoice
   * @returns Updated invoice
   */
  async markAsPaid(invoiceId: string): Promise<ApiResponse<LandlordInvoice>> {
    return apiClient.patch<ApiResponse<LandlordInvoice>>(
      `/invoices/${invoiceId}/mark-paid`
    );
  }

  /**
   * Send invoice reminder to tenant
   * 
   * @param invoiceId - UUID of the invoice
   * @returns Success response
   */
  async sendReminder(invoiceId: string): Promise<ApiResponse<{
    sent: boolean;
    message: string;
  }>> {
    return apiClient.post<ApiResponse<{
      sent: boolean;
      message: string;
    }>>(`/invoices/${invoiceId}/send-reminder`);
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  /**
   * Generate invoices in bulk for a period
   * Useful for monthly rent invoice generation
   * 
   * @param data - Bulk generation parameters
   * @returns List of generated invoices
   */
  async bulkGenerate(
    data: BulkInvoiceGenerationRequest
  ): Promise<ApiResponse<LandlordInvoice[]>> {
    return apiClient.post<ApiResponse<LandlordInvoice[]>>("/invoices/bulk-generate", data);
  }

  /**
   * Send reminders for multiple overdue invoices
   * 
   * @param invoiceIds - Array of invoice UUIDs
   * @returns Results of reminder sending
   */
  async bulkSendReminders(invoiceIds: string[]): Promise<ApiResponse<{
    sent: string[];
    failed: { id: string; error: string }[];
  }>> {
    return apiClient.post<ApiResponse<{
      sent: string[];
      failed: { id: string; error: string }[];
    }>>("/invoices/bulk-send-reminders", { invoice_ids: invoiceIds });
  }

  // ============================================
  // INVOICE QUERIES
  // ============================================

  /**
   * Get overdue invoices
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of overdue invoices
   */
  async getOverdueInvoices(
    params?: InvoiceQueryParams
  ): Promise<PaginatedResponse<LandlordInvoice>> {
    return this.getInvoices({ ...params, status: "overdue" });
  }

  /**
   * Get pending invoices
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of pending invoices
   */
  async getPendingInvoices(
    params?: InvoiceQueryParams
  ): Promise<PaginatedResponse<LandlordInvoice>> {
    return this.getInvoices({ ...params, status: "pending" });
  }

  /**
   * Get paid invoices
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of paid invoices
   */
  async getPaidInvoices(
    params?: InvoiceQueryParams
  ): Promise<PaginatedResponse<LandlordInvoice>> {
    return this.getInvoices({ ...params, status: "paid" });
  }

  /**
   * Get invoices by type
   * 
   * @param type - Invoice type (rent, utility, maintenance, other)
   * @param params - Additional query parameters
   * @returns Paginated list of invoices
   */
  async getInvoicesByType(
    type: string,
    params?: InvoiceQueryParams
  ): Promise<PaginatedResponse<LandlordInvoice>> {
    return this.getInvoices({ ...params, invoice_type: type as any });
  }

  /**
   * Get invoices for a specific tenant
   * 
   * @param tenantId - UUID of the tenant
   * @param params - Additional query parameters
   * @returns Paginated list of invoices
   */
  async getInvoicesByTenant(
    tenantId: string,
    params?: InvoiceQueryParams
  ): Promise<PaginatedResponse<LandlordInvoice>> {
    const url = buildUrl("/invoices", { ...params, tenant_id: tenantId });
    return apiClient.get<PaginatedResponse<LandlordInvoice>>(url);
  }

  /**
   * Get invoices for a specific property
   * 
   * @param propertyId - UUID of the property
   * @param params - Additional query parameters
   * @returns Paginated list of invoices
   */
  async getInvoicesByProperty(
    propertyId: string,
    params?: InvoiceQueryParams
  ): Promise<PaginatedResponse<LandlordInvoice>> {
    const url = buildUrl("/invoices", { ...params, property_id: propertyId });
    return apiClient.get<PaginatedResponse<LandlordInvoice>>(url);
  }

  // ============================================
  // INVOICE STATISTICS
  // ============================================

  /**
   * Get comprehensive invoice statistics
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
    collected_amount: number;
    outstanding_amount: number;
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
   * Calculate total outstanding for a tenant
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
   * Get tenant's overdue invoices count
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

  /**
   * Check if invoice can be edited
   * 
   * @param invoiceId - UUID of the invoice
   * @returns Boolean indicating if invoice can be edited
   */
  async canEditInvoice(invoiceId: string): Promise<boolean> {
    const response = await this.getInvoice(invoiceId);
    return response.data!.can_edit;
  }

  /**
   * Check if invoice can be deleted
   * 
   * @param invoiceId - UUID of the invoice
   * @returns Boolean indicating if invoice can be deleted
   */
  async canDeleteInvoice(invoiceId: string): Promise<boolean> {
    const response = await this.getInvoice(invoiceId);
    return response.data!.can_delete;
  }

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  /**
   * Validate invoice dates
   * 
   * @param invoiceDate - Invoice date
   * @param dueDate - Due date
   * @returns Validation result
   */
  validateInvoiceDates(invoiceDate: string, dueDate: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const invoice = new Date(invoiceDate);
    const due = new Date(dueDate);

    if (isNaN(invoice.getTime())) {
      errors.push("Invalid invoice date");
    }

    if (isNaN(due.getTime())) {
      errors.push("Invalid due date");
    }

    if (invoice > due) {
      errors.push("Due date must be on or after invoice date");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate invoice data before creation/update
   * 
   * @param data - Invoice data to validate
   * @returns Validation result
   */
  validateInvoiceData(data: CreateInvoiceRequest | UpdateInvoiceRequest): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if ('base_rent_amount' in data && data.base_rent_amount !== undefined) {
      if (data.base_rent_amount <= 0) {
        errors.push("Base rent amount must be greater than 0");
      }
    }

    if ('additional_charges' in data && data.additional_charges !== undefined) {
      if (data.additional_charges < 0) {
        errors.push("Additional charges cannot be negative");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // ============================================
  // EXPORT & REPORTING
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
   * Generate invoice report for a period
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
export const landlordInvoiceService = LandlordInvoiceService.getInstance();
export default landlordInvoiceService;

