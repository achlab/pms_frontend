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
   * Routes to appropriate dashboard based on user role
   */
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    // Import tokenManager to get current user
    const { tokenManager } = await import('../api-client');
    const user = tokenManager.getUserData();

    if (!user) {
      throw new Error("User not authenticated");
    }

    let endpoint = "/analytics/dashboard"; // fallback

    // Route to appropriate dashboard endpoint based on role
    switch (user.role) {
      case 'super_admin':
        endpoint = "/super-admin/dashboard";
        break;
      case 'landlord':
        endpoint = "/landlord/dashboard";
        break;
      case 'tenant':
        endpoint = "/tenant/dashboard";
        break;
      case 'caretaker':
        // Caretakers might use a different endpoint or fallback to analytics
        endpoint = "/analytics/dashboard";
        break;
      default:
        endpoint = "/analytics/dashboard";
    }

    return apiClient.get<ApiResponse<DashboardData>>(endpoint);
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

