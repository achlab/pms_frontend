/**
 * Super Admin Payments Hooks
 * React hooks for payment tracking across all landlords and tenants
 */

import { useQuery } from "@tanstack/react-query";
import { superAdminPaymentsService } from "../services/super-admin-payments.service";
import type { SuperAdminPaymentsQueryParams } from "../services/super-admin-payments.service";

/**
 * Hook to fetch all payments
 */
export function useSuperAdminPayments(params?: SuperAdminPaymentsQueryParams) {
  return useQuery({
    queryKey: ['super-admin-payments', params],
    queryFn: async () => {
      const response = await superAdminPaymentsService.getAllPayments(params);
      return response;
    },
  });
}

/**
 * Hook to fetch a single payment
 */
export function useSuperAdminPayment(paymentId: string) {
  return useQuery({
    queryKey: ['super-admin-payment', paymentId],
    queryFn: async () => {
      const response = await superAdminPaymentsService.getPayment(paymentId);
      return response.data;
    },
    enabled: !!paymentId,
  });
}

/**
 * Hook to fetch payment statistics
 */
export function useSuperAdminPaymentStatistics() {
  return useQuery({
    queryKey: ['super-admin-payment-statistics'],
    queryFn: async () => {
      const response = await superAdminPaymentsService.getStatistics();
      return response.data;
    },
  });
}

/**
 * Hook to fetch properties for filtering
 */
export function useSuperAdminPaymentProperties() {
  return useQuery({
    queryKey: ['super-admin-payment-properties'],
    queryFn: async () => {
      const response = await superAdminPaymentsService.getProperties();
      return response.data;
    },
  });
}

/**
 * Hook to fetch payment methods for filtering
 */
export function useSuperAdminPaymentMethods() {
  return useQuery({
    queryKey: ['super-admin-payment-methods'],
    queryFn: async () => {
      const response = await superAdminPaymentsService.getPaymentMethods();
      return response.data;
    },
  });
}
