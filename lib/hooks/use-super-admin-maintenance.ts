/**
 * Super Admin Maintenance Management Hooks
 * React hooks for system-wide maintenance oversight
 */

import { useState, useEffect, useCallback } from "react";
import { superAdminMaintenanceService } from "../services";
import type {
  SystemMaintenanceRequest,
  SuperAdminMaintenanceQueryParams,
  MaintenanceStatus,
  MaintenancePriority,
  MaintenanceCategory,
  PaginatedResponse,
} from "../api-types";

// ============================================
// MAINTENANCE QUERIES
// ============================================

/**
 * Hook to fetch all maintenance requests
 */
export function useSuperAdminMaintenanceRequests(
  params?: SuperAdminMaintenanceQueryParams
) {
  const [data, setData] = useState<PaginatedResponse<SystemMaintenanceRequest> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminMaintenanceService.getAllMaintenanceRequests(
        params
      );
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch maintenance requests");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { data, loading, error, refetch: fetchRequests };
}

/**
 * Hook to fetch a single maintenance request
 */
export function useSuperAdminMaintenanceRequest(requestId: string | null) {
  const [data, setData] = useState<SystemMaintenanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) {
      setLoading(false);
      return;
    }

    const fetchRequest = async () => {
      try {
        setLoading(true);
        setError(null);
        const response =
          await superAdminMaintenanceService.getMaintenanceRequestDetails(requestId);
        setData(response.data!);
      } catch (err: any) {
        setError(err.message || "Failed to fetch maintenance request");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [requestId]);

  return { data, loading, error };
}

/**
 * Hook to fetch maintenance requests by landlord
 */
export function useSuperAdminMaintenanceByLandlord(landlordId: string) {
  const [data, setData] = useState<PaginatedResponse<SystemMaintenanceRequest> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response =
        await superAdminMaintenanceService.getMaintenanceRequestsByLandlord(landlordId);
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch maintenance requests");
    } finally {
      setLoading(false);
    }
  }, [landlordId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { data, loading, error, refetch: fetchRequests };
}

/**
 * Hook to fetch emergency maintenance requests
 */
export function useSuperAdminEmergencyRequests() {
  const [data, setData] = useState<PaginatedResponse<SystemMaintenanceRequest> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminMaintenanceService.getEmergencyRequests();
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch emergency requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { data, loading, error, refetch: fetchRequests };
}

/**
 * Hook to fetch open maintenance requests
 */
export function useSuperAdminOpenRequests() {
  const [data, setData] = useState<PaginatedResponse<SystemMaintenanceRequest> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminMaintenanceService.getOpenRequests();
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch open requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { data, loading, error, refetch: fetchRequests };
}

// ============================================
// MAINTENANCE CATEGORIES
// ============================================

/**
 * Hook to fetch maintenance categories
 */
export function useSuperAdminMaintenanceCategories() {
  const [data, setData] = useState<MaintenanceCategory[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminMaintenanceService.getMaintenanceCategories();
        setData(response.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { data, loading, error };
}

// ============================================
// MAINTENANCE STATISTICS
// ============================================

/**
 * Hook to fetch maintenance statistics
 */
export function useSuperAdminMaintenanceStatistics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminMaintenanceService.getMaintenanceStatistics();
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
 * Hook to fetch caretaker performance
 */
export function useSuperAdminCaretakerPerformance(caretakerId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminMaintenanceService.getCaretakerPerformance(
          caretakerId
        );
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch caretaker performance");
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [caretakerId]);

  return { data, loading, error };
}

