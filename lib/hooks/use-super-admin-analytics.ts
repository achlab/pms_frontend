/**
 * Super Admin Analytics Hooks
 * React hooks for system-wide analytics and dashboard
 */

import { useState, useEffect, useCallback } from "react";
import { superAdminAnalyticsService } from "../services";
import type {
  SystemDashboard,
  SystemOverview,
  SystemFinancialSummary,
  PropertyOverview,
  OccupancyOverview,
  MaintenanceOverview,
  SystemActivity,
  TopLandlordMetrics,
  CrossLandlordComparison,
} from "../api-types";

// ============================================
// DASHBOARD HOOKS
// ============================================

/**
 * Hook to fetch complete system dashboard
 */
export function useSuperAdminDashboard() {
  const [data, setData] = useState<SystemDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminAnalyticsService.getSystemDashboard();
      setData(response.data!);
    } catch (err: any) {
      setError(err.message || "Failed to fetch dashboard");
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
 * Hook to fetch system overview
 */
export function useSuperAdminOverview() {
  const [data, setData] = useState<SystemOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminAnalyticsService.getSystemOverview();
      setData(response.data!);
    } catch (err: any) {
      setError(err.message || "Failed to fetch overview");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { data, loading, error, refetch: fetchOverview };
}

// ============================================
// FINANCIAL ANALYTICS
// ============================================

/**
 * Hook to fetch financial summary
 */
export function useSuperAdminFinancialSummary(startDate?: string, endDate?: string) {
  const [data, setData] = useState<SystemFinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminAnalyticsService.getSystemFinancialSummary(
          startDate,
          endDate
        );
        setData(response.data!);
      } catch (err: any) {
        setError(err.message || "Failed to fetch financial summary");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [startDate, endDate]);

  return { data, loading, error };
}

/**
 * Hook to fetch revenue trends
 */
export function useSuperAdminRevenueTrends(months: number = 12) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminAnalyticsService.getRevenueTrends(months);
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
 * Hook to fetch collection rate trends
 */
export function useSuperAdminCollectionRateTrends(months: number = 12) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminAnalyticsService.getCollectionRateTrends(
          months
        );
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch collection rate trends");
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [months]);

  return { data, loading, error };
}

// ============================================
// PROPERTY & OCCUPANCY ANALYTICS
// ============================================

/**
 * Hook to fetch property overview
 */
export function useSuperAdminPropertyOverview() {
  const [data, setData] = useState<PropertyOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminAnalyticsService.getPropertyOverview();
      setData(response.data!);
    } catch (err: any) {
      setError(err.message || "Failed to fetch property overview");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { data, loading, error, refetch: fetchOverview };
}

/**
 * Hook to fetch occupancy analytics
 */
export function useSuperAdminOccupancyAnalytics() {
  const [data, setData] = useState<OccupancyOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOccupancy = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminAnalyticsService.getOccupancyAnalytics();
      setData(response.data!);
    } catch (err: any) {
      setError(err.message || "Failed to fetch occupancy analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOccupancy();
  }, [fetchOccupancy]);

  return { data, loading, error, refetch: fetchOccupancy };
}

/**
 * Hook to fetch occupancy trends
 */
export function useSuperAdminOccupancyTrends(months: number = 12) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminAnalyticsService.getOccupancyTrends(months);
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

// ============================================
// MAINTENANCE ANALYTICS
// ============================================

/**
 * Hook to fetch maintenance overview
 */
export function useSuperAdminMaintenanceOverview() {
  const [data, setData] = useState<MaintenanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminAnalyticsService.getMaintenanceOverview();
      setData(response.data!);
    } catch (err: any) {
      setError(err.message || "Failed to fetch maintenance overview");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { data, loading, error, refetch: fetchOverview };
}

// ============================================
// USER & TENANT ANALYTICS
// ============================================

/**
 * Hook to fetch user distribution
 */
export function useSuperAdminUserDistribution() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDistribution = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminAnalyticsService.getUserDistribution();
      setData(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch user distribution");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDistribution();
  }, [fetchDistribution]);

  return { data, loading, error, refetch: fetchDistribution };
}

/**
 * Hook to fetch tenant analytics
 */
export function useSuperAdminTenantAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminAnalyticsService.getTenantAnalytics();
      setData(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch tenant analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, error, refetch: fetchAnalytics };
}

// ============================================
// LANDLORD PERFORMANCE
// ============================================

/**
 * Hook to fetch top landlords
 */
export function useSuperAdminTopLandlords(limit: number = 10) {
  const [data, setData] = useState<TopLandlordMetrics[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopLandlords = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminAnalyticsService.getTopLandlords(limit);
        setData(response.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch top landlords");
      } finally {
        setLoading(false);
      }
    };

    fetchTopLandlords();
  }, [limit]);

  return { data, loading, error };
}

/**
 * Hook to fetch cross-landlord comparison
 */
export function useSuperAdminLandlordComparison() {
  const [data, setData] = useState<CrossLandlordComparison[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminAnalyticsService.getCrossLandlordComparison();
      setData(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch landlord comparison");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  return { data, loading, error, refetch: fetchComparison };
}

// ============================================
// SYSTEM ACTIVITY
// ============================================

/**
 * Hook to fetch recent activities
 */
export function useSuperAdminRecentActivities(limit: number = 50) {
  const [data, setData] = useState<SystemActivity[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminAnalyticsService.getRecentActivities(limit);
      setData(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { data, loading, error, refetch: fetchActivities };
}

// ============================================
// SYSTEM HEALTH
// ============================================

/**
 * Hook to calculate system health score
 */
export function useSuperAdminHealthScore() {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        setLoading(true);
        setError(null);
        const healthScore =
          await superAdminAnalyticsService.calculateSystemHealthScore();
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

/**
 * Hook to fetch performance insights
 */
export function useSuperAdminPerformanceInsights() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminAnalyticsService.getPerformanceInsights();
      setData(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch insights");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return { data, loading, error, refetch: fetchInsights };
}

