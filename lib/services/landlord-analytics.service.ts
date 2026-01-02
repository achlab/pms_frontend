/**
 * Landlord Analytics Service
 * Handles comprehensive analytics and dashboard data for landlords
 * Following Single Responsibility Principle & SOLID
 */

import apiClient from "../api-client";
import type {
  LandlordDashboardOverview,
  FinancialSummary,
  RevenueTrends,
  OccupancyAnalytics,
  PropertyPerformance,
  MaintenanceAnalytics,
  TenantAnalytics,
  ApiResponse,
} from "../api-types";

/**
 * Query parameters for analytics
 */
export interface AnalyticsQueryParams {
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  property_id?: string;
  period?: "daily" | "weekly" | "monthly" | "yearly";
}

class LandlordAnalyticsService {
  private static instance: LandlordAnalyticsService;

  private constructor() {}

  static getInstance(): LandlordAnalyticsService {
    if (!LandlordAnalyticsService.instance) {
      LandlordAnalyticsService.instance = new LandlordAnalyticsService();
    }
    return LandlordAnalyticsService.instance;
  }

  // ============================================
  // DASHBOARD OVERVIEW
  // ============================================

  /**
   * Get comprehensive dashboard overview
   * Includes all key metrics, charts, and summaries
   *
   * @returns Complete dashboard data
   */
  async getDashboardOverview(): Promise<ApiResponse<LandlordDashboardOverview>> {
    return apiClient.get<ApiResponse<LandlordDashboardOverview>>("/landlord/dashboard");
  }

  /**
   * Get dashboard summary (lighter version)
   * For quick loading of essential metrics
   * 
   * @returns Essential dashboard metrics
   */
  async getDashboardSummary(): Promise<ApiResponse<{
    total_properties: number;
    total_units: number;
    occupied_units: number;
    total_tenants: number;
    monthly_revenue: number;
    pending_maintenance: number;
  }>> {
    return apiClient.get("/dashboard/summary");
  }

  // ============================================
  // FINANCIAL ANALYTICS
  // ============================================

  /**
   * Get comprehensive financial summary
   * Includes revenue, expenses, profit, and comparisons
   * 
   * @param params - Query parameters for date range
   * @returns Financial summary
   */
  async getFinancialSummary(
    params?: AnalyticsQueryParams
  ): Promise<ApiResponse<FinancialSummary>> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : "";
    return apiClient.get<ApiResponse<FinancialSummary>>(
      `/analytics/financial/summary${queryString}`
    );
  }

  /**
   * Get revenue trends over time
   * 
   * @param months - Number of months to analyze (default: 12)
   * @returns Revenue trends data
   */
  async getRevenueTrends(months: number = 12): Promise<ApiResponse<RevenueTrends>> {
    return apiClient.get<ApiResponse<RevenueTrends>>(
      `/analytics/financial/revenue-trends?months=${months}`
    );
  }

  /**
   * Get revenue breakdown by property
   * 
   * @param params - Query parameters for date range
   * @returns Revenue by property
   */
  async getRevenueByProperty(
    params?: AnalyticsQueryParams
  ): Promise<ApiResponse<{
    properties: Array<{
      property_id: string;
      property_name: string;
      total_revenue: number;
      units_count: number;
      average_revenue_per_unit: number;
    }>;
    total_revenue: number;
  }>> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : "";
    return apiClient.get(
      `/analytics/financial/revenue-by-property${queryString}`
    );
  }

  /**
   * Get expense breakdown
   * 
   * @param params - Query parameters for date range
   * @returns Expense breakdown
   */
  async getExpenseBreakdown(
    params?: AnalyticsQueryParams
  ): Promise<ApiResponse<{
    total_expenses: number;
    by_category: {
      maintenance: number;
      utilities: number;
      management: number;
      other: number;
    };
    by_property: Record<string, number>;
  }>> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : "";
    return apiClient.get(
      `/analytics/financial/expenses${queryString}`
    );
  }

  /**
   * Get profit & loss statement
   * 
   * @param params - Query parameters for date range
   * @returns P&L statement
   */
  async getProfitAndLoss(
    params?: AnalyticsQueryParams
  ): Promise<ApiResponse<{
    total_revenue: number;
    total_expenses: number;
    net_profit: number;
    profit_margin: number;
    breakdown: {
      rental_income: number;
      other_income: number;
      maintenance_costs: number;
      operational_costs: number;
    };
  }>> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : "";
    return apiClient.get(
      `/analytics/financial/profit-loss${queryString}`
    );
  }

  // ============================================
  // OCCUPANCY ANALYTICS
  // ============================================

  /**
   * Get comprehensive occupancy analytics
   * 
   * @returns Occupancy data and trends
   */
  async getOccupancyAnalytics(): Promise<ApiResponse<OccupancyAnalytics>> {
    return apiClient.get<ApiResponse<OccupancyAnalytics>>(
      "/analytics/occupancy"
    );
  }

  /**
   * Get occupancy rate over time
   * 
   * @param months - Number of months to analyze
   * @returns Occupancy trends
   */
  async getOccupancyTrends(months: number = 12): Promise<ApiResponse<{
    monthly_rates: Array<{
      month: string;
      occupancy_rate: number;
      occupied_units: number;
      total_units: number;
    }>;
    average_rate: number;
    trend: "increasing" | "decreasing" | "stable";
  }>> {
    return apiClient.get(
      `/analytics/occupancy/trends?months=${months}`
    );
  }

  /**
   * Get vacancy analysis
   * 
   * @returns Vacancy data
   */
  async getVacancyAnalysis(): Promise<ApiResponse<{
    total_vacant_units: number;
    average_vacancy_duration: number;
    longest_vacant_unit: {
      unit_id: string;
      unit_number: string;
      property_name: string;
      days_vacant: number;
    };
    by_property: Array<{
      property_id: string;
      property_name: string;
      vacant_units: number;
      total_units: number;
      vacancy_rate: number;
    }>;
  }>> {
    return apiClient.get("/analytics/occupancy/vacancy");
  }

  // ============================================
  // PROPERTY PERFORMANCE
  // ============================================

  /**
   * Get performance analytics for all properties
   * 
   * @returns Property performance data
   */
  async getPropertyPerformance(): Promise<ApiResponse<PropertyPerformance[]>> {
    return apiClient.get<ApiResponse<PropertyPerformance[]>>(
      "/analytics/properties/performance"
    );
  }

  /**
   * Get performance for a specific property
   * 
   * @param propertyId - UUID of the property
   * @returns Property-specific performance
   */
  async getPropertyPerformanceById(
    propertyId: string
  ): Promise<ApiResponse<PropertyPerformance>> {
    return apiClient.get<ApiResponse<PropertyPerformance>>(
      `/analytics/properties/${propertyId}/performance`
    );
  }

  /**
   * Get top performing properties
   * 
   * @param limit - Number of properties to return
   * @returns Top properties by revenue
   */
  async getTopPerformingProperties(
    limit: number = 5
  ): Promise<ApiResponse<PropertyPerformance[]>> {
    return apiClient.get<ApiResponse<PropertyPerformance[]>>(
      `/analytics/properties/top-performers?limit=${limit}`
    );
  }

  /**
   * Get underperforming properties
   * 
   * @param limit - Number of properties to return
   * @returns Underperforming properties
   */
  async getUnderperformingProperties(
    limit: number = 5
  ): Promise<ApiResponse<PropertyPerformance[]>> {
    return apiClient.get<ApiResponse<PropertyPerformance[]>>(
      `/analytics/properties/underperforming?limit=${limit}`
    );
  }

  // ============================================
  // MAINTENANCE ANALYTICS
  // ============================================

  /**
   * Get comprehensive maintenance analytics
   * 
   * @returns Maintenance analytics data
   */
  async getMaintenanceAnalytics(): Promise<ApiResponse<MaintenanceAnalytics>> {
    return apiClient.get<ApiResponse<MaintenanceAnalytics>>(
      "/analytics/maintenance"
    );
  }

  /**
   * Get maintenance cost trends
   * 
   * @param months - Number of months to analyze
   * @returns Maintenance cost trends
   */
  async getMaintenanceCostTrends(months: number = 12): Promise<ApiResponse<{
    monthly_costs: Array<{
      month: string;
      total_cost: number;
      request_count: number;
      average_cost_per_request: number;
    }>;
    total_cost: number;
    average_monthly_cost: number;
  }>> {
    return apiClient.get(
      `/analytics/maintenance/cost-trends?months=${months}`
    );
  }

  /**
   * Get maintenance response time analytics
   * 
   * @returns Response time data
   */
  async getMaintenanceResponseTimes(): Promise<ApiResponse<{
    average_response_time: number;
    average_completion_time: number;
    by_priority: {
      emergency: number;
      high: number;
      medium: number;
      low: number;
    };
    by_property: Record<string, number>;
  }>> {
    return apiClient.get("/analytics/maintenance/response-times");
  }

  // ============================================
  // TENANT ANALYTICS
  // ============================================

  /**
   * Get comprehensive tenant analytics
   * 
   * @returns Tenant analytics data
   */
  async getTenantAnalytics(): Promise<ApiResponse<TenantAnalytics>> {
    return apiClient.get<ApiResponse<TenantAnalytics>>(
      "/analytics/tenants"
    );
  }

  /**
   * Get tenant retention rate
   * 
   * @returns Retention data
   */
  async getTenantRetention(): Promise<ApiResponse<{
    overall_retention_rate: number;
    average_tenancy_duration: number;
    by_property: Array<{
      property_id: string;
      property_name: string;
      retention_rate: number;
      average_duration: number;
    }>;
  }>> {
    return apiClient.get("/analytics/tenants/retention");
  }

  /**
   * Get tenant payment behavior
   * 
   * @returns Payment behavior analytics
   */
  async getTenantPaymentBehavior(): Promise<ApiResponse<{
    on_time_payment_rate: number;
    late_payment_rate: number;
    default_rate: number;
    average_days_late: number;
    by_tenant: Array<{
      tenant_id: string;
      tenant_name: string;
      on_time_payments: number;
      late_payments: number;
      total_payments: number;
      payment_score: number;
    }>;
  }>> {
    return apiClient.get("/analytics/tenants/payment-behavior");
  }

  // ============================================
  // COMPARATIVE ANALYTICS
  // ============================================

  /**
   * Compare current period with previous period
   * 
   * @param metric - Metric to compare (revenue, occupancy, maintenance)
   * @param params - Query parameters for date range
   * @returns Comparison data
   */
  async comparePeriods(
    metric: "revenue" | "occupancy" | "maintenance",
    params?: AnalyticsQueryParams
  ): Promise<ApiResponse<{
    current_period: {
      value: number;
      start_date: string;
      end_date: string;
    };
    previous_period: {
      value: number;
      start_date: string;
      end_date: string;
    };
    change_percentage: number;
    change_direction: "increase" | "decrease" | "stable";
  }>> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : "";
    return apiClient.get(
      `/analytics/compare/${metric}${queryString}`
    );
  }

  /**
   * Get year-over-year comparison
   * 
   * @param year - Year to compare (defaults to current year)
   * @returns YoY comparison
   */
  async getYearOverYear(year?: number): Promise<ApiResponse<{
    current_year: {
      revenue: number;
      occupancy_rate: number;
      maintenance_cost: number;
    };
    previous_year: {
      revenue: number;
      occupancy_rate: number;
      maintenance_cost: number;
    };
    changes: {
      revenue_change: number;
      occupancy_change: number;
      maintenance_change: number;
    };
  }>> {
    const queryString = year ? `?year=${year}` : "";
    return apiClient.get(
      `/analytics/year-over-year${queryString}`
    );
  }

  // ============================================
  // EXPORT & REPORTING
  // ============================================

  /**
   * Export analytics report
   * 
   * @param reportType - Type of report to generate
   * @param params - Query parameters for date range
   * @param format - Export format (pdf, excel, csv)
   * @returns Download URL
   */
  async exportReport(
    reportType: "financial" | "occupancy" | "maintenance" | "comprehensive",
    params?: AnalyticsQueryParams,
    format: "pdf" | "excel" | "csv" = "pdf"
  ): Promise<ApiResponse<{
    report_url: string;
    download_url: string;
    expires_at: string;
  }>> {
    const queryParams = {
      ...params,
      format,
    } as any;

    const queryString = new URLSearchParams(queryParams).toString();
    
    return apiClient.post<ApiResponse<{
      report_url: string;
      download_url: string;
      expires_at: string;
    }>>(`/analytics/export/${reportType}?${queryString}`);
  }

  /**
   * Schedule recurring report
   * 
   * @param reportType - Type of report
   * @param frequency - Report frequency
   * @param recipients - Email addresses
   * @returns Scheduled report confirmation
   */
  async scheduleReport(
    reportType: "financial" | "occupancy" | "maintenance" | "comprehensive",
    frequency: "daily" | "weekly" | "monthly",
    recipients: string[]
  ): Promise<ApiResponse<{
    schedule_id: string;
    next_run: string;
    status: string;
  }>> {
    return apiClient.post<ApiResponse<{
      schedule_id: string;
      next_run: string;
      status: string;
    }>>("/analytics/reports/schedule", {
      report_type: reportType,
      frequency,
      recipients,
    });
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get quick stats for dashboard widgets
   * 
   * @returns Essential metrics
   */
  async getQuickStats(): Promise<{
    revenue_this_month: number;
    revenue_growth: number;
    occupancy_rate: number;
    occupancy_trend: "up" | "down" | "stable";
    pending_maintenance: number;
    overdue_invoices: number;
  }> {
    const overview = await this.getDashboardOverview();
    const data = overview.data!;

    return {
      revenue_this_month: data.financial_summary.total_revenue,
      revenue_growth: data.financial_summary.growth_percentage,
      occupancy_rate: data.occupancy_analytics.overall_occupancy_rate,
      occupancy_trend: data.occupancy_analytics.trend,
      pending_maintenance: data.maintenance_analytics.total_open_requests,
      overdue_invoices: 0, // Would need to calculate from actual data
    };
  }

  /**
   * Calculate portfolio health score
   * 
   * @returns Health score (0-100)
   */
  async getPortfolioHealthScore(): Promise<number> {
    const overview = await this.getDashboardOverview();
    const data = overview.data!;

    // Calculate weighted health score
    const occupancyScore = data.occupancy_analytics.overall_occupancy_rate;
    const maintenanceScore = Math.max(
      0,
      100 - (data.maintenance_analytics.total_open_requests / 10) * 100
    );
    const financialScore =
      data.financial_summary.growth_percentage > 0 ? 80 : 60;

    return Math.round(
      (occupancyScore * 0.4 + maintenanceScore * 0.3 + financialScore * 0.3)
    );
  }
}

// Export singleton instance
export const landlordAnalyticsService = LandlordAnalyticsService.getInstance();
export default landlordAnalyticsService;

