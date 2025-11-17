/**
 * useDashboard Hook
 * Custom hooks for dashboard and analytics operations
 */

import { useApiQuery } from "./use-api-query";
import dashboardService from "../services/dashboard.service";
import type {
  DashboardData,
  PaymentAnalytics,
  PaymentAnalyticsParams,
  ApiResponse,
} from "../api-types";

/**
 * Hook to fetch dashboard data
 */
export function useDashboard(enabled: boolean = true) {
  return useApiQuery<ApiResponse<DashboardData>>(
    ["dashboard"],
    () => dashboardService.getDashboard(),
    {
      enabled,
      refetchOnWindowFocus: true,
    }
  );
}

/**
 * Hook to fetch payment analytics
 */
export function usePaymentAnalytics(params?: PaymentAnalyticsParams, enabled: boolean = true) {
  return useApiQuery<ApiResponse<PaymentAnalytics>>(
    ["payment-analytics", params],
    () => dashboardService.getPaymentAnalytics(params),
    {
      enabled,
    }
  );
}

export default useDashboard;

