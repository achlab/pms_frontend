/**
 * Dashboard Service
 * Handles dashboard and analytics API calls
 * Following Single Responsibility Principle
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  DashboardData,
  PaymentAnalytics,
  PaymentAnalyticsParams,
  ApiResponse,
} from "../api-types";

class DashboardService {
  private static instance: DashboardService;

  private constructor() {}

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  /**
   * Get dashboard summary with overview, lease, maintenance, and payments
   */
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    return apiClient.get<ApiResponse<DashboardData>>("/analytics/dashboard");
  }

  /**
   * Get payment analytics with trends and breakdown
   */
  async getPaymentAnalytics(params?: PaymentAnalyticsParams): Promise<ApiResponse<PaymentAnalytics>> {
    const url = buildUrl("/analytics/payments", params);
    return apiClient.get<ApiResponse<PaymentAnalytics>>(url);
  }
}

// Export singleton instance
export const dashboardService = DashboardService.getInstance();
export default dashboardService;

