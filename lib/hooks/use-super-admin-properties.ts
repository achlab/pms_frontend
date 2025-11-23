/**
 * Super Admin Property Management Hooks
 * React hooks for system-wide property oversight
 */

import { useState, useEffect, useCallback } from "react";
import { superAdminPropertyService } from "../services";
import type {
  SystemProperty,
  SuperAdminPropertyQueryParams,
  PaginatedResponse,
} from "../api-types";

// ============================================
// PROPERTY QUERIES
// ============================================

/**
 * Hook to fetch all properties
 */
export function useSuperAdminProperties(params?: SuperAdminPropertyQueryParams) {
  const [data, setData] = useState<PaginatedResponse<SystemProperty> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminPropertyService.getAllProperties(params);
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { data, loading, error, refetch: fetchProperties };
}

/**
 * Hook to fetch a single property
 */
export function useSuperAdminProperty(propertyId: string | null) {
  const [data, setData] = useState<SystemProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) {
      setLoading(false);
      return;
    }

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminPropertyService.getPropertyDetails(propertyId);
        setData(response.data!);
      } catch (err: any) {
        setError(err.message || "Failed to fetch property");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  return { data, loading, error };
}

/**
 * Hook to fetch properties by landlord
 */
export function useSuperAdminPropertiesByLandlord(landlordId: string) {
  const [data, setData] = useState<PaginatedResponse<SystemProperty> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminPropertyService.getPropertiesByLandlord(landlordId);
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  }, [landlordId]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { data, loading, error, refetch: fetchProperties };
}

/**
 * Hook to fetch active properties
 */
export function useSuperAdminActiveProperties() {
  const [data, setData] = useState<PaginatedResponse<SystemProperty> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminPropertyService.getActiveProperties();
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch active properties");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { data, loading, error, refetch: fetchProperties };
}

// ============================================
// PROPERTY STATISTICS
// ============================================

/**
 * Hook to fetch property statistics
 */
export function useSuperAdminPropertyStatistics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminPropertyService.getPropertyStatistics();
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

/**
 * Hook to fetch landlord property statistics
 */
export function useSuperAdminLandlordPropertyStats(landlordId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminPropertyService.getLandlordPropertyStatistics(
          landlordId
        );
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch landlord statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [landlordId]);

  return { data, loading, error };
}

/**
 * Hook to fetch top performing properties
 */
export function useSuperAdminTopProperties(limit: number = 10) {
  const [data, setData] = useState<SystemProperty[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminPropertyService.getTopPerformingProperties(
          limit
        );
        setData(response.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch top properties");
      } finally {
        setLoading(false);
      }
    };

    fetchTopProperties();
  }, [limit]);

  return { data, loading, error };
}

