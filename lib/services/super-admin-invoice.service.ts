/**
 * Super Admin Invoice Service
 * Handles invoice oversight across ALL landlords
 * Following Single Responsibility Principle & SOLID
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  SystemInvoice,
  SuperAdminInvoiceQueryParams,
  InvoiceStatus,
  InvoiceType,
  ApiResponse,
  PaginatedResponse,
} from "../api-types";

class SuperAdminInvoiceService {
  private static instance: SuperAdminInvoiceService;

  private constructor() {}

  static getInstance(): SuperAdminInvoiceService {
    if (!SuperAdminInvoiceService.instance) {
      SuperAdminInvoiceService.instance = new SuperAdminInvoiceService();
    }
    return SuperAdminInvoiceService.instance;
  }

  // ============================================
  // SYSTEM-WIDE INVOICE QUERIES
  // ============================================

  /**
   * Get all invoices across ALL landlords
   * System-wide view with complete context
   * 
   * @param params - Query parameters for filtering
   * @returns Paginated list of all invoices
   */
  async getAllInvoices(
    params?: SuperAdminInvoiceQueryParams
  ): Promise<PaginatedResponse<SystemInvoice>> {
    const url = buildUrl("/invoices", params);
    return apiClient.get<PaginatedResponse<SystemInvoice>>(url);
  }

  /**
   * Get a specific invoice by ID
   * 
   * @param invoiceId - UUID of the invoice
   * @returns Invoice details with full context
   */
  async getInvoiceDetails(
    invoiceId: string
  ): Promise<ApiResponse<SystemInvoice>> {
    return apiClient.get<ApiResponse<SystemInvoice>>(`/invoices/${invoiceId}`);
  }

  /**
   * Get invoices by landlord
   * 
   * @param landlordId - UUID of the landlord
   * @param params - Additional query parameters
   * @returns Invoices for specified landlord
   */
  async getInvoicesByLandlord(
    landlordId: string,
    params?: SuperAdminInvoiceQueryParams
  ): Promise<PaginatedResponse<SystemInvoice>> {
    return this.getAllInvoices({ ...params, landlord_id: landlordId });
  }

  /**
   * Get invoices by tenant
   * 
   * @param tenantId - UUID of the tenant
   * @param params - Additional query parameters
   * @returns Invoices for specified tenant
   */
  async getInvoicesByTenant(
    tenantId: string,
    params?: SuperAdminInvoiceQueryParams
  ): Promise<PaginatedResponse<SystemInvoice>> {
    return this.getAllInvoices({ ...params, tenant_id: tenantId });
  }

  /**
   * Get invoices by status
   * 
   * @param status - Invoice status
   * @param params - Additional query parameters
   * @returns Invoices with specified status
   */
  async getInvoicesByStatus(
    status: InvoiceStatus,
    params?: SuperAdminInvoiceQueryParams
  ): Promise<PaginatedResponse<SystemInvoice>> {
    return this.getAllInvoices({ ...params, status });
  }

  /**
   * Get invoices by type
   * 
   * @param type - Invoice type
   * @param params - Additional query parameters
   * @returns Invoices of specified type
   */
  async getInvoicesByType(
    type: InvoiceType,
    params?: SuperAdminInvoiceQueryParams
  ): Promise<PaginatedResponse<SystemInvoice>> {
    return this.getAllInvoices({ ...params, invoice_type: type });
  }

  /**
   * Get pending invoices
   * 
   * @param params - Additional query parameters
   * @returns All pending invoices across system
   */
  async getPendingInvoices(
    params?: SuperAdminInvoiceQueryParams
  ): Promise<PaginatedResponse<SystemInvoice>> {
    return this.getInvoicesByStatus("pending", params);
  }

  /**
   * Get paid invoices
   * 
   * @param params - Additional query parameters
   * @returns All paid invoices
   */
  async getPaidInvoices(
    params?: SuperAdminInvoiceQueryParams
  ): Promise<PaginatedResponse<SystemInvoice>> {
    return this.getInvoicesByStatus("paid", params);
  }

  /**
   * Get overdue invoices
   * 
   * @param params - Additional query parameters
   * @returns All overdue invoices across system
   */
  async getOverdueInvoices(
    params?: SuperAdminInvoiceQueryParams
  ): Promise<PaginatedResponse<SystemInvoice>> {
    return this.getAllInvoices({ ...params, is_overdue: true });
  }

  /**
   * Get partially paid invoices
   * 
   * @param params - Additional query parameters
   * @returns All partially paid invoices
   */
  async getPartiallyPaidInvoices(
    params?: SuperAdminInvoiceQueryParams
  ): Promise<PaginatedResponse<SystemInvoice>> {
    return this.getInvoicesByStatus("partially_paid", params);
  }

  /**
   * Get invoices by date range
   * 
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param params - Additional query parameters
   * @returns Invoices within date range
   */
  async getInvoicesByDateRange(
    startDate: string,
    endDate: string,
    params?: SuperAdminInvoiceQueryParams
  ): Promise<PaginatedResponse<SystemInvoice>> {
    return this.getAllInvoices({
      ...params,
      start_date: startDate,
      end_date: endDate,
    });
  }

  // ============================================
  // INVOICE STATISTICS
  // ============================================

  /**
   * Get comprehensive invoice statistics
   * 
   * @returns System-wide invoice statistics
   */
  async getInvoiceStatistics(): Promise<ApiResponse<{
    total_invoices: number;
    pending_invoices: number;
    paid_invoices: number;
    overdue_invoices: number;
    partially_paid_invoices: number;
    total_amount: number;
    total_paid: number;
    total_outstanding: number;
    by_landlord: {
      landlord_id: string;
      landlord_name: string;
      total_invoices: number;
      total_amount: number;
      total_paid: number;
      total_outstanding: number;
      collection_rate: number;
    }[];
    by_type: Record<InvoiceType, {
      count: number;
      total_amount: number;
    }>;
    collection_rate: number;
  }>> {
    return apiClient.get("/invoices/statistics");
  }

  /**
   * Get invoice statistics for a landlord
   * 
   * @param landlordId - UUID of the landlord
   * @returns Landlord-specific invoice statistics
   */
  async getLandlordInvoiceStatistics(
    landlordId: string
  ): Promise<ApiResponse<{
    total_invoices: number;
    pending_invoices: number;
    paid_invoices: number;
    overdue_invoices: number;
    total_amount: number;
    total_paid: number;
    total_outstanding: number;
    collection_rate: number;
  }>> {
    return apiClient.get(`/landlords/${landlordId}/invoices/statistics`);
  }

  /**
   * Get revenue by landlord
   * 
   * @param startDate - Start date (optional)
   * @param endDate - End date (optional)
   * @returns Revenue breakdown by landlord
   */
  async getRevenueByLandlord(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<{
    landlords: {
      landlord_id: string;
      landlord_name: string;
      total_revenue: number;
      pending_revenue: number;
      collection_rate: number;
    }[];
    total_system_revenue: number;
    average_collection_rate: number;
  }>> {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const url = buildUrl("/invoices/revenue-by-landlord", params);
    return apiClient.get(url);
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
    landlord_name: string;
    tenant_name: string;
    property_name: string;
    unit_number: string;
    total_amount: number;
    amount_paid: number;
    balance: number;
    due_date: string;
    status: InvoiceStatus;
    is_overdue: boolean;
  }> {
    const response = await this.getInvoiceDetails(invoiceId);
    const invoice = response.data!;

    return {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      landlord_name: invoice.landlord.name,
      tenant_name: invoice.tenant.name,
      property_name: invoice.property.name,
      unit_number: invoice.unit.unit_number,
      total_amount: invoice.total_amount,
      amount_paid: invoice.amount_paid,
      balance: invoice.balance,
      due_date: invoice.due_date,
      status: invoice.status,
      is_overdue: invoice.is_overdue,
    };
  }

  /**
   * Get total invoice count
   * 
   * @returns Total number of invoices in system
   */
  async getTotalInvoiceCount(): Promise<number> {
    const response = await this.getAllInvoices({ per_page: 1 });
    return response.meta?.total || 0;
  }

  /**
   * Get invoice count by landlord
   * 
   * @param landlordId - UUID of the landlord
   * @returns Number of invoices for landlord
   */
  async getInvoiceCountByLandlord(landlordId: string): Promise<number> {
    const response = await this.getInvoicesByLandlord(landlordId, { per_page: 1 });
    return response.meta?.total || 0;
  }

  /**
   * Get overdue invoice count
   * 
   * @returns Number of overdue invoices in system
   */
  async getOverdueInvoiceCount(): Promise<number> {
    const response = await this.getOverdueInvoices({ per_page: 1 });
    return response.meta?.total || 0;
  }

  /**
   * Calculate total outstanding amount
   * 
   * @returns Total outstanding amount across all invoices
   */
  async calculateTotalOutstanding(): Promise<number> {
    const stats = await this.getInvoiceStatistics();
    return stats.data!.total_outstanding;
  }

  /**
   * Calculate system collection rate
   * 
   * @returns Overall collection rate percentage
   */
  async calculateCollectionRate(): Promise<number> {
    const stats = await this.getInvoiceStatistics();
    const data = stats.data!;

    if (data.total_amount === 0) return 100;
    return Math.round((data.total_paid / data.total_amount) * 100 * 10) / 10;
  }

  /**
   * Check if invoice is overdue
   * 
   * @param invoiceId - UUID of the invoice
   * @returns Boolean indicating if invoice is overdue
   */
  async isInvoiceOverdue(invoiceId: string): Promise<boolean> {
    const invoice = await this.getInvoiceDetails(invoiceId);
    return invoice.data!.is_overdue;
  }

  /**
   * Get days overdue for invoice
   * 
   * @param invoiceId - UUID of the invoice
   * @returns Number of days overdue (0 if not overdue)
   */
  async getDaysOverdue(invoiceId: string): Promise<number> {
    const invoice = await this.getInvoiceDetails(invoiceId);
    const data = invoice.data!;

    if (!data.is_overdue) return 0;

    const dueDate = new Date(data.due_date);
    const today = new Date();
    return Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Get landlord for invoice
   * 
   * @param invoiceId - UUID of the invoice
   * @returns Landlord information
   */
  async getInvoiceLandlord(invoiceId: string): Promise<{
    id: string;
    name: string;
  }> {
    const invoice = await this.getInvoiceDetails(invoiceId);
    return invoice.data!.landlord;
  }

  /**
   * Get tenant for invoice
   * 
   * @param invoiceId - UUID of the invoice
   * @returns Tenant information
   */
  async getInvoiceTenant(invoiceId: string): Promise<{
    id: string;
    name: string;
    email: string;
  }> {
    const invoice = await this.getInvoiceDetails(invoiceId);
    return invoice.data!.tenant;
  }

  // ============================================
  // COMPARATIVE ANALYSIS
  // ============================================

  /**
   * Compare invoices by landlord
   * 
   * @returns Landlord comparison data
   */
  async compareLandlordInvoices(): Promise<ApiResponse<{
    landlords: {
      landlord_id: string;
      landlord_name: string;
      total_invoices: number;
      total_amount: number;
      total_paid: number;
      total_outstanding: number;
      overdue_count: number;
      collection_rate: number;
    }[];
    system_averages: {
      avg_collection_rate: number;
      avg_invoice_amount: number;
    };
  }>> {
    return apiClient.get("/invoices/landlord-comparison");
  }

  /**
   * Get invoices needing attention (overdue, high balance, etc.)
   * 
   * @returns Invoices requiring attention
   */
  async getInvoicesNeedingAttention(): Promise<ApiResponse<SystemInvoice[]>> {
    return apiClient.get<ApiResponse<SystemInvoice[]>>("/invoices/needs-attention");
  }

  /**
   * Get high-value invoices
   * 
   * @param limit - Number of invoices to return
   * @returns Top high-value invoices
   */
  async getHighValueInvoices(
    limit: number = 10
  ): Promise<ApiResponse<SystemInvoice[]>> {
    return apiClient.get<ApiResponse<SystemInvoice[]>>(
      `/invoices/high-value?limit=${limit}`
    );
  }

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  /**
   * Validate invoice data
   * 
   * @param data - Invoice data to validate
   * @returns Validation result
   */
  validateInvoiceData(data: {
    amount?: number;
    due_date?: string;
  }): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (data.amount !== undefined && data.amount <= 0) {
      errors.push("Invoice amount must be greater than 0");
    }

    if (data.due_date) {
      const dueDate = new Date(data.due_date);
      if (isNaN(dueDate.getTime())) {
        errors.push("Invalid due date format");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const superAdminInvoiceService = SuperAdminInvoiceService.getInstance();
export default superAdminInvoiceService;

