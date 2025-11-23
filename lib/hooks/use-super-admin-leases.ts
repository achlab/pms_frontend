/**
 * Super Admin Lease Management Hooks
 * React hooks for system-wide lease oversight
 */

import { useState, useEffect, useCallback } from "react";
import { superAdminLeaseService } from "../services";
import type {
  SystemLease,
  SuperAdminLeaseQueryParams,
  LeaseStatus,
  PaginatedResponse,
} from "../api-types";

// ============================================
// LEASE QUERIES
// ============================================

/**
 * Hook to fetch all leases
 */
export function useSuperAdminLeases(params?: SuperAdminLeaseQueryParams) {
  const [data, setData] = useState<PaginatedResponse<SystemLease> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminLeaseService.getAllLeases(params);
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch leases");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchLeases();
  }, [fetchLeases]);

  return { data, loading, error, refetch: fetchLeases };
}

/**
 * Hook to fetch a single lease
 */
export function useSuperAdminLease(leaseId: string | null) {
  const [data, setData] = useState<SystemLease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leaseId) {
      setLoading(false);
      return;
    }

    const fetchLease = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminLeaseService.getLeaseDetails(leaseId);
        setData(response.data!);
      } catch (err: any) {
        setError(err.message || "Failed to fetch lease");
      } finally {
        setLoading(false);
      }
    };

    fetchLease();
  }, [leaseId]);

  return { data, loading, error };
}

/**
 * Hook to fetch leases by landlord
 */
export function useSuperAdminLeasesByLandlord(landlordId: string) {
  const [data, setData] = useState<PaginatedResponse<SystemLease> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminLeaseService.getLeasesByLandlord(landlordId);
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch leases");
    } finally {
      setLoading(false);
    }
  }, [landlordId]);

  useEffect(() => {
    fetchLeases();
  }, [fetchLeases]);

  return { data, loading, error, refetch: fetchLeases };
}

/**
 * Hook to fetch active leases
 */
export function useSuperAdminActiveLeases() {
  const [data, setData] = useState<PaginatedResponse<SystemLease> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminLeaseService.getActiveLeases();
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch active leases");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeases();
  }, [fetchLeases]);

  return { data, loading, error, refetch: fetchLeases };
}

/**
 * Hook to fetch expiring leases
 */
export function useSuperAdminExpiringLeases(daysAhead: number = 30) {
  const [data, setData] = useState<SystemLease[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminLeaseService.getExpiringLeases(daysAhead);
        setData(response.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch expiring leases");
      } finally {
        setLoading(false);
      }
    };

    fetchLeases();
  }, [daysAhead]);

  return { data, loading, error };
}

// ============================================
// LEASE STATISTICS
// ============================================

/**
 * Hook to fetch lease statistics
 */
export function useSuperAdminLeaseStatistics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminLeaseService.getLeaseStatistics();
      setData(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return { data, loading, error, refetch: fetchStatistics };
}

