/**
 * useInvoice Hooks
 * Custom hooks for invoice and payment operations
 */

import { useApiQuery } from "./use-api-query";
import { useApiMutation } from "./use-api-mutation";
import invoiceService from "../services/invoice.service";
import paymentService from "../services/payment.service";
import type {
  Invoice,
  Payment,
  InvoiceQueryParams,
  PaymentQueryParams,
  RecordPaymentRequest,
  PaginatedResponse,
  ApiResponse,
} from "../api-types";

/**
 * Hook to fetch all invoices with optional filters
 */
export function useInvoices(params?: InvoiceQueryParams & { refetchInterval?: number }, enabled: boolean = true) {
  const { refetchInterval, ...queryParams } = params || {};
  
  return useApiQuery<PaginatedResponse<Invoice>>(
    ["invoices", queryParams],
    () => invoiceService.getInvoices(queryParams),
    {
      enabled,
      refetchInterval: refetchInterval || false, // Enable polling if specified
    }
  );
}

/**
 * Hook to fetch a specific invoice by ID
 */
export function useInvoice(invoiceId: string, enabled: boolean = true) {
  return useApiQuery<ApiResponse<Invoice>>(
    ["invoice", invoiceId],
    () => invoiceService.getInvoice(invoiceId),
    {
      enabled: enabled && !!invoiceId,
    }
  );
}

/**
 * Hook to fetch pending invoices
 */
export function usePendingInvoices(params?: InvoiceQueryParams, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<Invoice>>(
    ["invoices", "pending", params],
    () => invoiceService.getPendingInvoices(params),
    {
      enabled,
    }
  );
}

/**
 * Hook to fetch paid invoices
 */
export function usePaidInvoices(params?: InvoiceQueryParams, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<Invoice>>(
    ["invoices", "paid", params],
    () => invoiceService.getPaidInvoices(params),
    {
      enabled,
    }
  );
}

/**
 * Hook to fetch overdue invoices
 */
export function useOverdueInvoices(params?: InvoiceQueryParams, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<Invoice>>(
    ["invoices", "overdue", params],
    () => invoiceService.getOverdueInvoices(params),
    {
      enabled,
    }
  );
}

/**
 * Hook to fetch payment history
 */
export function usePaymentHistory(params?: PaymentQueryParams, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<Payment>>(
    ["payments", "history", params],
    () => paymentService.getPaymentHistory(params),
    {
      enabled,
    }
  );
}

/**
 * Hook to fetch payments for a specific invoice
 */
export function useInvoicePayments(invoiceId: string, enabled: boolean = true) {
  return useApiQuery<ApiResponse<any>>(
    ["invoice-payments", invoiceId],
    () => paymentService.getInvoicePayments(invoiceId),
    {
      enabled: enabled && !!invoiceId,
    }
  );
}

/**
 * Hook to record a payment
 */
export function useRecordPayment() {
  return useApiMutation<
    ApiResponse<any>,
    { invoiceId: string; data: RecordPaymentRequest }
  >(async ({ invoiceId, data }) => {
    return paymentService.recordPayment(invoiceId, data);
  });
}

export default useInvoices;

