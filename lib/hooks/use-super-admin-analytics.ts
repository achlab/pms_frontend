/**
 * Super Admin Analytics Hooks
 * React hooks for system-wide analytics and dashboard
 */

import { useState, useEffect, useCallback } from "react";
import { superAdminAnalyticsService } from "../services";
import type {
  SystemDashboard,
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
  const dashboard = useSuperAdminDashboard();

  return {
    data: dashboard.data?.overview || null,
    loading: dashboard.loading,
    error: dashboard.error,
    refetch: dashboard.refetch,
  };
}

// ============================================
// FINANCIAL ANALYTICS
// ============================================

/**
 * Hook to fetch financial summary
 */
export function useSuperAdminFinancialSummary(startDate?: string, endDate?: string) {
  const dashboard = useSuperAdminDashboard();

  return {
    data: dashboard.data?.financial || null,
    loading: dashboard.loading,
    error: dashboard.error,
    refetch: dashboard.refetch,
  };
}


// ============================================
// PROPERTY & OCCUPANCY ANALYTICS
// ============================================

/**
 * Hook to fetch occupancy analytics
 */
export function useSuperAdminOccupancyAnalytics() {
  const dashboard = useSuperAdminDashboard();

  return {
    data: dashboard.data?.occupancy || null,
    loading: dashboard.loading,
    error: dashboard.error,
    refetch: dashboard.refetch,
  };
}

// ============================================
// MAINTENANCE ANALYTICS
// ============================================

/**
 * Hook to fetch maintenance overview
 */
export function useSuperAdminMaintenanceOverview() {
  const dashboard = useSuperAdminDashboard();

  return {
    data: dashboard.data?.maintenance || null,
    loading: dashboard.loading,
    error: dashboard.error,
    refetch: dashboard.refetch,
  };
}

// ============================================
// USER & TENANT ANALYTICS
// ============================================


// ============================================
// LANDLORD PERFORMANCE
// ============================================

/**
 * Hook to fetch top landlords
 */
export function useSuperAdminTopLandlords(limit: number = 10) {
  const dashboard = useSuperAdminDashboard();

  return {
    data: dashboard.data?.top_landlords?.slice(0, limit) || [],
    loading: dashboard.loading,
    error: dashboard.error,
    refetch: dashboard.refetch,
  };
}


// ============================================
// SYSTEM ACTIVITY
// ============================================

/**
 * Hook to fetch recent activities
 */
export function useSuperAdminRecentActivities(limit: number = 50) {
  const dashboard = useSuperAdminDashboard();

  return {
    data: dashboard.data?.activities?.slice(0, limit) || [],
    loading: dashboard.loading,
    error: dashboard.error,
    refetch: dashboard.refetch,
  };
}

// ============================================
// SYSTEM HEALTH
// ============================================

/**
 * Hook to calculate system health score
 */
export function useSuperAdminHealthScore() {
  const dashboard = useSuperAdminDashboard();

  const score = dashboard.data ? (() => {
    // Calculate composite health score
    const occupancyScore = dashboard.data.overview?.occupancy_rate || 0;
    const collectionScore = dashboard.data.financial?.collection_rate || 0;
    const maintenanceScore = dashboard.data.maintenance ? Math.max(0, 100 - (dashboard.data.maintenance.open_requests / 10) * 100) : 0;

    return Math.round(((occupancyScore + collectionScore + maintenanceScore) / 3) * 10) / 10;
  })() : null;

  return {
    score,
    loading: dashboard.loading,
    error: dashboard.error,
  };
}


