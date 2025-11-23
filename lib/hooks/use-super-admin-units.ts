/**
 * Super Admin Unit Management Hooks
 * React hooks for system-wide unit oversight
 */

import { useState, useEffect, useCallback } from "react";
import { superAdminUnitService } from "../services";
import type {
  SystemUnit,
  SuperAdminUnitQueryParams,
  PaginatedResponse,
} from "../api-types";

// ============================================
// UNIT QUERIES
// ============================================

/**
 * Hook to fetch all units
 */
export function useSuperAdminUnits(params?: SuperAdminUnitQueryParams) {
  const [data, setData] = useState<PaginatedResponse<SystemUnit> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminUnitService.getAllUnits(params);
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch units");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  return { data, loading, error, refetch: fetchUnits };
}

/**
 * Hook to fetch a single unit
 */
export function useSuperAdminUnit(unitId: string | null) {
  const [data, setData] = useState<SystemUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!unitId) {
      setLoading(false);
      return;
    }

    const fetchUnit = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminUnitService.getUnitDetails(unitId);
        setData(response.data!);
      } catch (err: any) {
        setError(err.message || "Failed to fetch unit");
      } finally {
        setLoading(false);
      }
    };

    fetchUnit();
  }, [unitId]);

  return { data, loading, error };
}

/**
 * Hook to fetch units by property
 */
export function useSuperAdminUnitsByProperty(propertyId: string) {
  const [data, setData] = useState<PaginatedResponse<SystemUnit> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminUnitService.getUnitsByProperty(propertyId);
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch units");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  return { data, loading, error, refetch: fetchUnits };
}

/**
 * Hook to fetch vacant units
 */
export function useSuperAdminVacantUnits() {
  const [data, setData] = useState<PaginatedResponse<SystemUnit> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminUnitService.getVacantUnits();
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch vacant units");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  return { data, loading, error, refetch: fetchUnits };
}

// ============================================
// UNIT STATISTICS
// ============================================

/**
 * Hook to fetch unit statistics
 */
export function useSuperAdminUnitStatistics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminUnitService.getUnitStatistics();
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

