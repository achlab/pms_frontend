/**
 * Super Admin Analytics Service
 * Handles system-wide analytics and dashboard data
 * Following Single Responsibility Principle & SOLID
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  SystemDashboard,
  SystemOverview,
  SystemFinancialSummary,
  PropertyOverview,
  TopLandlordMetrics,
  CrossLandlordComparison,
  SystemActivity,
  ApiResponse,
} from "../api-types";

class SuperAdminAnalyticsService {
  private static instance: SuperAdminAnalyticsService;

  private constructor() {}

  static getInstance(): SuperAdminAnalyticsService {
    if (!SuperAdminAnalyticsService.instance) {
      SuperAdminAnalyticsService.instance = new SuperAdminAnalyticsService();
    }
    return SuperAdminAnalyticsService.instance;
  }

  // ============================================
  // SYSTEM DASHBOARD
  // ============================================

  /**
   * Get comprehensive system dashboard data
   *
   * @returns Complete system dashboard with all metrics
   */
  async getSystemDashboard(): Promise<ApiResponse<SystemDashboard>> {
    return apiClient.get<ApiResponse<SystemDashboard>>("/super-admin/dashboard");
  }

  /**
   * Get system overview metrics
   * Key performance indicators at a glance
   *
   * @returns System overview data
   */
  async getSystemOverview(): Promise<ApiResponse<SystemOverview>> {
    return apiClient.get<ApiResponse<SystemOverview>>("/super-admin/dashboard");
  }

  // ============================================
  // FINANCIAL ANALYTICS
  // ============================================

  /**
   * Get system-wide financial summary
   * 
   * @param startDate - Optional start date (YYYY-MM-DD)
   * @param endDate - Optional end date (YYYY-MM-DD)
   * @returns Financial summary across all landlords
   */
  async getSystemFinancialSummary(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<SystemFinancialSummary>> {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const url = buildUrl("/analytics/financial-summary", params);
    return apiClient.get<ApiResponse<SystemFinancialSummary>>(url);
  }

  /**
   * Get revenue trends over time
   * 
   * @param months - Number of months to analyze (default: 12)
   * @returns Revenue trends data
   */
  async getRevenueTrends(months: number = 12): Promise<ApiResponse<{
    monthly_revenue: {
      month: string;
      total_revenue: number;
      invoiced: number;
      collected: number;
      outstanding: number;
      growth_rate: number;
    }[];
    overall_trend: "increasing" | "decreasing" | "stable";
    average_monthly_revenue: number;
    total_revenue: number;
  }>> {
    return apiClient.get(`/analytics/revenue-trends?months=${months}`);
  }

  /**
   * Get collection rate trends
   * 
   * @param months - Number of months to analyze
   * @returns Collection rate over time
   */
  async getCollectionRateTrends(months: number = 12): Promise<ApiResponse<{
    monthly_data: {
      month: string;
      collection_rate: number;
      total_invoiced: number;
      total_collected: number;
    }[];
    average_collection_rate: number;
    trend: "improving" | "declining" | "stable";
  }>> {
    return apiClient.get(`/analytics/collection-rate-trends?months=${months}`);
  }

  // ============================================
  // PROPERTY & OCCUPANCY ANALYTICS
  // ============================================

  /**
   * Get property overview metrics
   * 
   * @returns Property statistics across system
   */
  async getPropertyOverview(): Promise<ApiResponse<PropertyOverview>> {
    return apiClient.get<ApiResponse<PropertyOverview>>("/analytics/property-overview");
  }


  /**
   * Get occupancy trends over time
   * 
   * @param months - Number of months to analyze
   * @returns Occupancy trends data
   */
  async getOccupancyTrends(months: number = 12): Promise<ApiResponse<{
    monthly_data: {
      month: string;
      occupancy_rate: number;
      occupied_units: number;
      vacant_units: number;
      total_units: number;
    }[];
    average_occupancy_rate: number;
    trend: "increasing" | "decreasing" | "stable";
  }>> {
    return apiClient.get(`/analytics/occupancy-trends?months=${months}`);
  }

  /**
   * Get property performance ranking
   * 
   * @param limit - Number of properties to return
   * @returns Top and bottom performing properties
   */
  async getPropertyPerformanceRanking(limit: number = 10): Promise<ApiResponse<{
    top_performers: {
      property_id: string;
      property_name: string;
      landlord_name: string;
      occupancy_rate: number;
      monthly_revenue: number;
      performance_score: number;
    }[];
    bottom_performers: {
      property_id: string;
      property_name: string;
      landlord_name: string;
      occupancy_rate: number;
      monthly_revenue: number;
      performance_score: number;
    }[];
  }>> {
    return apiClient.get(`/analytics/property-ranking?limit=${limit}`);
  }

  // ============================================
  // MAINTENANCE ANALYTICS
  // ============================================

  /**
   * Get maintenance overview
   * 
   * @returns Maintenance statistics across system
   */

  /**
   * Get maintenance trends over time
   * 
   * @param months - Number of months to analyze
   * @returns Maintenance trends data
   */
  async getMaintenanceTrends(months: number = 12): Promise<ApiResponse<{
    monthly_data: {
      month: string;
      total_requests: number;
      completed: number;
      average_resolution_time: number;
      total_cost: number;
    }[];
    average_requests_per_month: number;
    trend: "increasing" | "decreasing" | "stable";
  }>> {
    return apiClient.get(`/analytics/maintenance-trends?months=${months}`);
  }

  // ============================================
  // USER & TENANT ANALYTICS
  // ============================================

  /**
   * Get user distribution statistics
   * 
   * @returns User counts by role
   */
  async getUserDistribution(): Promise<ApiResponse<{
    total_users: number;
    by_role: {
      super_admin: number;
      landlord: number;
      caretaker: number;
      tenant: number;
    };
    active_users: number;
    inactive_users: number;
    recently_added: number;
  }>> {
    return apiClient.get("/analytics/user-distribution");
  }

  /**
   * Get tenant analytics
   * 
   * @returns Tenant statistics and trends
   */
  async getTenantAnalytics(): Promise<ApiResponse<{
    total_tenants: number;
    tenants_with_active_leases: number;
    tenants_with_overdue_payments: number;
    average_lease_duration: number;
    tenant_retention_rate: number;
    new_tenants_this_month: number;
  }>> {
    return apiClient.get("/analytics/tenant-overview");
  }

  // ============================================
  // LANDLORD PERFORMANCE
  // ============================================

  /**
   * Get top performing landlords
   * 
   * @param limit - Number of landlords to return
   * @returns Top landlords by performance
   */
  async getTopLandlords(limit: number = 10): Promise<ApiResponse<TopLandlordMetrics[]>> {
    return apiClient.get<ApiResponse<TopLandlordMetrics[]>>(
      `/analytics/top-landlords?limit=${limit}`
    );
  }

  /**
   * Get cross-landlord comparison
   * 
   * @returns Comparative metrics for all landlords
   */
  async getCrossLandlordComparison(): Promise<
    ApiResponse<CrossLandlordComparison[]>
  > {
    return apiClient.get<ApiResponse<CrossLandlordComparison[]>>(
      "/analytics/landlord-comparison"
    );
  }

  /**
   * Get landlord performance details
   * 
   * @param landlordId - UUID of the landlord
   * @returns Detailed performance metrics for landlord
   */
  async getLandlordPerformanceDetails(
    landlordId: string
  ): Promise<ApiResponse<{
    landlord_id: string;
    landlord_name: string;
    properties: number;
    units: number;
    active_leases: number;
    occupancy_rate: number;
    monthly_revenue: number;
    collection_rate: number;
    maintenance_completion_rate: number;
    performance_score: number;
    rank: number;
    percentile: number;
  }>> {
    return apiClient.get(`/analytics/landlords/${landlordId}/performance`);
  }

  // ============================================
  // SYSTEM ACTIVITY
  // ============================================

  /**
   * Get recent system activities
   * 
   * @param limit - Number of activities to return
   * @returns Recent activities across system
   */
  async getRecentActivities(
    limit: number = 50
  ): Promise<ApiResponse<SystemActivity[]>> {
    return apiClient.get<ApiResponse<SystemActivity[]>>(
      `/analytics/activities?limit=${limit}`
    );
  }

  /**
   * Get activities by type
   * 
   * @param activityType - Type of activity
   * @param limit - Number of activities to return
   * @returns Filtered activities
   */
  async getActivitiesByType(
    activityType: string,
    limit: number = 50
  ): Promise<ApiResponse<SystemActivity[]>> {
    return apiClient.get<ApiResponse<SystemActivity[]>>(
      `/analytics/activities?type=${activityType}&limit=${limit}`
    );
  }

  // ============================================
  // GROWTH & TRENDS
  // ============================================

  /**
   * Get system growth metrics
   * 
   * @param months - Number of months to analyze
   * @returns Growth metrics over time
   */
  async getSystemGrowthMetrics(months: number = 12): Promise<ApiResponse<{
    user_growth: {
      month: string;
      new_users: number;
      total_users: number;
      growth_rate: number;
    }[];
    property_growth: {
      month: string;
      new_properties: number;
      total_properties: number;
      growth_rate: number;
    }[];
    revenue_growth: {
      month: string;
      revenue: number;
      growth_rate: number;
    }[];
    overall_growth_rate: number;
  }>> {
    return apiClient.get(`/analytics/growth-metrics?months=${months}`);
  }

  // ============================================
  // EXPORT & REPORTING
  // ============================================

  /**
   * Export system report
   * 
   * @param reportType - Type of report to export
   * @param format - Export format (pdf, excel, csv)
   * @param startDate - Optional start date
   * @param endDate - Optional end date
   * @returns Blob URL for download
   */
  async exportSystemReport(
    reportType: "financial" | "occupancy" | "maintenance" | "comprehensive",
    format: "pdf" | "excel" | "csv" = "pdf",
    startDate?: string,
    endDate?: string
  ): Promise<string> {
    const params: any = { format };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const url = buildUrl(`/analytics/export/${reportType}`, params);
    const response = await apiClient.get(url, { responseType: "blob" });

    // Create blob URL for download
    const blob = new Blob([response as any], {
      type: format === "pdf" ? "application/pdf" : "application/octet-stream",
    });
    return window.URL.createObjectURL(blob);
  }

  /**
   * Get financial report
   * 
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Financial report data
   */
  async getFinancialReport(
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<{
    period: {
      start: string;
      end: string;
    };
    revenue: {
      total_invoiced: number;
      total_collected: number;
      total_outstanding: number;
      collection_rate: number;
    };
    by_landlord: {
      landlord_id: string;
      landlord_name: string;
      total_revenue: number;
      collection_rate: number;
    }[];
    by_property: {
      property_id: string;
      property_name: string;
      total_revenue: number;
    }[];
    trends: {
      revenue_growth: number;
      collection_rate_change: number;
    };
  }>> {
    return apiClient.get(
      `/analytics/reports/financial?start_date=${startDate}&end_date=${endDate}`
    );
  }

  /**
   * Get occupancy report
   * 
   * @returns Occupancy report data
   */
  async getOccupancyReport(): Promise<ApiResponse<{
    overall: {
      total_units: number;
      occupied_units: number;
      vacant_units: number;
      occupancy_rate: number;
    };
    by_landlord: {
      landlord_id: string;
      landlord_name: string;
      total_units: number;
      occupied_units: number;
      occupancy_rate: number;
    }[];
    by_property: {
      property_id: string;
      property_name: string;
      landlord_name: string;
      total_units: number;
      occupied_units: number;
      occupancy_rate: number;
    }[];
    trends: {
      change_from_last_month: number;
    };
  }>> {
    return apiClient.get("/analytics/reports/occupancy");
  }

  /**
   * Get maintenance report
   * 
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Maintenance report data
   */
  async getMaintenanceReport(
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<{
    period: {
      start: string;
      end: string;
    };
    summary: {
      total_requests: number;
      completed: number;
      in_progress: number;
      completion_rate: number;
      average_resolution_time: number;
      total_cost: number;
    };
    by_landlord: {
      landlord_id: string;
      landlord_name: string;
      total_requests: number;
      completion_rate: number;
      total_cost: number;
    }[];
    by_priority: Record<string, number>;
    by_category: {
      category: string;
      count: number;
    }[];
  }>> {
    return apiClient.get(
      `/analytics/reports/maintenance?start_date=${startDate}&end_date=${endDate}`
    );
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Calculate system health score
   * Composite metric based on multiple factors
   * 
   * @returns Health score (0-100)
   */
  async calculateSystemHealthScore(): Promise<number> {
    const overview = await this.getSystemOverview();
    const data = overview.data!;

    // Composite score calculation
    const occupancyScore = data.occupancy_rate;
    const collectionScore = data.collection_rate;
    const maintenanceScore =
      (data.maintenance_stats.completed_percentage / 100) * 100;

    const healthScore = (occupancyScore + collectionScore + maintenanceScore) / 3;
    return Math.round(healthScore * 10) / 10;
  }

  /**
   * Get performance insights
   * AI-generated insights based on analytics
   * 
   * @returns Performance insights and recommendations
   */
  async getPerformanceInsights(): Promise<ApiResponse<{
    insights: {
      type: "warning" | "success" | "info";
      title: string;
      description: string;
      metric_value: number;
      recommendation?: string;
    }[];
    overall_status: "excellent" | "good" | "needs_attention" | "critical";
  }>> {
    return apiClient.get("/analytics/insights");
  }
}

// Export singleton instance
export const superAdminAnalyticsService = SuperAdminAnalyticsService.getInstance();
export default superAdminAnalyticsService;

