/**
 * Landlord Analytics Hooks
 * React hooks for analytics and dashboard data with loading states
 * Following Hook Pattern & Separation of Concerns
 */

import { useState, useEffect, useCallback } from "react";
import {
  landlordAnalyticsService,
  type AnalyticsQueryParams,
} from "../services/landlord-analytics.service";
import type {
  LandlordDashboardOverview,
  FinancialSummary,
  RevenueTrends,
  OccupancyAnalytics,
  PropertyPerformance,
  MaintenanceAnalytics,
  TenantAnalytics,
} from "../api-types";

// ============================================
// DASHBOARD HOOKS
// ============================================

/**
 * Hook to fetch complete dashboard overview
 * 
 * @returns Dashboard data, loading state, and error
 */
export function useLandlordDashboard() {
  const [data, setData] = useState<LandlordDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordAnalyticsService.getDashboardOverview();
      setData(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, refetch: fetchDashboard };
}

/**
 * Hook to fetch dashboard summary (lightweight)
 * 
 * @returns Dashboard summary
 */
export function useDashboardSummary() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordAnalyticsService.getDashboardSummary();
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch dashboard summary");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return { data, loading, error };
}

/**
 * Hook to fetch quick stats for dashboard widgets
 * 
 * @returns Quick stats
 */
export function useQuickStats() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const stats = await landlordAnalyticsService.getQuickStats();
        setData(stats);
      } catch (err: any) {
        setError(err.message || "Failed to fetch quick stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { data, loading, error };
}

/**
 * Hook to calculate portfolio health score
 * 
 * @returns Health score
 */
export function usePortfolioHealthScore() {
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        setLoading(true);
        setError(null);
        const healthScore = await landlordAnalyticsService.getPortfolioHealthScore();
        setScore(healthScore);
      } catch (err: any) {
        setError(err.message || "Failed to calculate health score");
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, []);

  return { score, loading, error };
}

// ============================================
// FINANCIAL ANALYTICS HOOKS
// ============================================

/**
 * Hook to fetch financial summary
 * 
 * @param params - Query parameters for date range
 * @returns Financial summary
 */
export function useFinancialSummary(params?: AnalyticsQueryParams) {
  const [data, setData] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordAnalyticsService.getFinancialSummary(params);
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch financial summary");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [params]);

  return { data, loading, error };
}

/**
 * Hook to fetch revenue trends
 * 
 * @param months - Number of months to analyze
 * @returns Revenue trends
 */
export function useRevenueTrends(months: number = 12) {
  const [data, setData] = useState<RevenueTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordAnalyticsService.getRevenueTrends(months);
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch revenue trends");
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [months]);

  return { data, loading, error };
}

/**
 * Hook to fetch revenue by property
 * 
 * @param params - Query parameters
 * @returns Revenue by property
 */
export function useRevenueByProperty(params?: AnalyticsQueryParams) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordAnalyticsService.getRevenueByProperty(params);
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch revenue by property");
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [params]);

  return { data, loading, error };
}

/**
 * Hook to fetch expense breakdown
 * 
 * @param params - Query parameters
 * @returns Expense breakdown
 */
export function useExpenseBreakdown(params?: AnalyticsQueryParams) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordAnalyticsService.getExpenseBreakdown(params);
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch expense breakdown");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [params]);

  return { data, loading, error };
}

/**
 * Hook to fetch profit & loss statement
 * 
 * @param params - Query parameters
 * @returns P&L statement
 */
export function useProfitAndLoss(params?: AnalyticsQueryParams) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPL = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordAnalyticsService.getProfitAndLoss(params);
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch P&L statement");
      } finally {
        setLoading(false);
      }
    };

    fetchPL();
  }, [params]);

  return { data, loading, error };
}

// ============================================
// OCCUPANCY ANALYTICS HOOKS
// ============================================

/**
 * Hook to fetch occupancy analytics
 * 
 * @returns Occupancy analytics
 */
export function useOccupancyAnalytics() {
  const [data, setData] = useState<OccupancyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordAnalyticsService.getOccupancyAnalytics();
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch occupancy analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return { data, loading, error };
}

/**
 * Hook to fetch occupancy trends
 * 
 * @param months - Number of months to analyze
 * @returns Occupancy trends
 */
export function useOccupancyTrends(months: number = 12) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordAnalyticsService.getOccupancyTrends(months);
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch occupancy trends");
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [months]);

  return { data, loading, error };
}

/**
 * Hook to fetch vacancy analysis
 * 
 * @returns Vacancy analysis
 */
export function useVacancyAnalysis() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordAnalyticsService.getVacancyAnalysis();
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch vacancy analysis");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  return { data, loading, error };
}

// ============================================
// PROPERTY PERFORMANCE HOOKS
// ============================================

/**
 * Hook to fetch property performance analytics
 * 
 * @returns Property performance data
 */
export function usePropertyPerformance() {
  const [data, setData] = useState<PropertyPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordAnalyticsService.getPropertyPerformance();
        setData(response.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch property performance");
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  return { data, loading, error };
}

/**
 * Hook to fetch top performing properties
 * 
 * @param limit - Number of properties to return
 * @returns Top properties
 */
export function useTopPerformingProperties(limit: number = 5) {
  const [data, setData] = useState<PropertyPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordAnalyticsService.getTopPerformingProperties(
          limit
        );
        setData(response.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch top properties");
      } finally {
        setLoading(false);
      }
    };

    fetchTop();
  }, [limit]);

  return { data, loading, error };
}

// ============================================
// MAINTENANCE ANALYTICS HOOKS
// ============================================

/**
 * Hook to fetch maintenance analytics
 * 
 * @returns Maintenance analytics
 */
export function useLandlordMaintenanceAnalytics() {
  const [data, setData] = useState<MaintenanceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordAnalyticsService.getMaintenanceAnalytics();
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch maintenance analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return { data, loading, error };
}

/**
 * Hook to fetch maintenance cost trends
 * 
 * @param months - Number of months to analyze
 * @returns Cost trends
 */
export function useMaintenanceCostTrends(months: number = 12) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordAnalyticsService.getMaintenanceCostTrends(
          months
        );
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch maintenance cost trends");
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [months]);

  return { data, loading, error };
}

// ============================================
// TENANT ANALYTICS HOOKS
// ============================================

/**
 * Hook to fetch tenant analytics
 * 
 * @returns Tenant analytics
 */
export function useTenantAnalytics() {
  const [data, setData] = useState<TenantAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordAnalyticsService.getTenantAnalytics();
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch tenant analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return { data, loading, error };
}

/**
 * Hook to fetch tenant retention data
 * 
 * @returns Retention data
 */
export function useTenantRetention() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRetention = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordAnalyticsService.getTenantRetention();
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch tenant retention");
      } finally {
        setLoading(false);
      }
    };

    fetchRetention();
  }, []);

  return { data, loading, error };
}

// ============================================
// COMPARATIVE ANALYTICS HOOKS
// ============================================

/**
 * Hook to compare periods
 * 
 * @param metric - Metric to compare
 * @param params - Query parameters
 * @returns Comparison data
 */
export function useComparePeriods(
  metric: "revenue" | "occupancy" | "maintenance",
  params?: AnalyticsQueryParams
) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordAnalyticsService.comparePeriods(metric, params);
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to compare periods");
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [metric, params]);

  return { data, loading, error };
}

/**
 * Hook to fetch year-over-year comparison
 * 
 * @param year - Year to compare
 * @returns YoY comparison
 */
export function useYearOverYear(year?: number) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchYoY = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordAnalyticsService.getYearOverYear(year);
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch YoY comparison");
      } finally {
        setLoading(false);
      }
    };

    fetchYoY();
  }, [year]);

  return { data, loading, error };
}

// ============================================
// EXPORT HOOKS
// ============================================

/**
 * Hook to export analytics report
 * 
 * @returns Export function, loading state, and error
 */
export function useExportAnalyticsReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportReport = useCallback(
    async (
      reportType: "financial" | "occupancy" | "maintenance" | "comprehensive",
      params?: AnalyticsQueryParams,
      format: "pdf" | "excel" | "csv" = "pdf"
    ): Promise<string | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordAnalyticsService.exportReport(
          reportType,
          params,
          format
        );
        return response.data?.download_url || null;
      } catch (err: any) {
        setError(err.message || "Failed to export report");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { exportReport, loading, error };
}

