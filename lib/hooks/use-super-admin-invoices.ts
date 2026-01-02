/**
 * Super Admin Invoices Hooks
 * React hooks for invoice management across all landlords and tenants
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { superAdminInvoicesService } from "../services/super-admin-invoices.service";
import type { 
  SuperAdminInvoicesQueryParams, 
  CreateInvoiceData 
} from "../services/super-admin-invoices.service";
import { toast } from "sonner";

/**
 * Hook to fetch all invoices
 */
export function useSuperAdminInvoices(params?: SuperAdminInvoicesQueryParams) {
  return useQuery({
    queryKey: ['super-admin-invoices', params],
    queryFn: async () => {
      const response = await superAdminInvoicesService.getAllInvoices(params);
      return response;
    },
  });
}

/**
 * Hook to fetch a single invoice
 */
export function useSuperAdminInvoice(invoiceId: string) {
  return useQuery({
    queryKey: ['super-admin-invoice', invoiceId],
    queryFn: async () => {
      const response = await superAdminInvoicesService.getInvoice(invoiceId);
      return response.data;
    },
    enabled: !!invoiceId,
  });
}

/**
 * Hook to fetch invoice statistics
 */
export function useSuperAdminInvoiceStatistics() {
  return useQuery({
    queryKey: ['super-admin-invoice-statistics'],
    queryFn: async () => {
      const response = await superAdminInvoicesService.getStatistics();
      return response.data;
    },
  });
}

/**
 * Hook to fetch tenants for invoice creation
 */
export function useSuperAdminInvoiceTenants() {
  return useQuery({
    queryKey: ['super-admin-invoice-tenants'],
    queryFn: async () => {
      const response = await superAdminInvoicesService.getTenants();
      return response.data;
    },
  });
}

/**
 * Hook to fetch tenant leases
 */
export function useSuperAdminTenantLeases(tenantId: string) {
  return useQuery({
    queryKey: ['super-admin-tenant-leases', tenantId],
    queryFn: async () => {
      const response = await superAdminInvoicesService.getTenantLeases(tenantId);
      return response.data;
    },
    enabled: !!tenantId,
  });
}

/**
 * Hook to create invoice
 */
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceData) => 
      superAdminInvoicesService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-invoice-statistics'] });
      toast.success('Invoice created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    },
  });
}

/**
 * Hook to update invoice status
 */
export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, status }: { invoiceId: string; status: 'pending' | 'paid' | 'overdue' | 'cancelled' }) => 
      superAdminInvoicesService.updateInvoiceStatus(invoiceId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-invoice'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-invoice-statistics'] });
      toast.success('Invoice status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update invoice status');
    },
  });
}
