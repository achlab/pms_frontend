/**
 * Super Admin Payment Management Hooks
 * React hooks for system-wide payment oversight
 */

import { useState, useEffect, useCallback } from "react";
import { superAdminPaymentService } from "../services";
import type {
  SystemPayment,
  SuperAdminPaymentQueryParams,
  PaginatedResponse,
} from "../api-types";

// ============================================
// PAYMENT QUERIES
// ============================================

/**
 * Hook to fetch all payments
 */
export function useSuperAdminPayments(params?: SuperAdminPaymentQueryParams) {
  const [data, setData] = useState<PaginatedResponse<SystemPayment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminPaymentService.getAllPayments(params);
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { data, loading, error, refetch: fetchPayments };
}

/**
 * Hook to fetch a single payment
 */
export function useSuperAdminPayment(paymentId: string | null) {
  const [data, setData] = useState<SystemPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) {
      setLoading(false);
      return;
    }

    const fetchPayment = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminPaymentService.getPaymentDetails(paymentId);
        setData(response.data!);
      } catch (err: any) {
        setError(err.message || "Failed to fetch payment");
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId]);

  return { data, loading, error };
}

/**
 * Hook to fetch payments by landlord
 */
export function useSuperAdminPaymentsByLandlord(landlordId: string) {
  const [data, setData] = useState<PaginatedResponse<SystemPayment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminPaymentService.getPaymentsByLandlord(landlordId);
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  }, [landlordId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { data, loading, error, refetch: fetchPayments };
}

/**
 * Hook to fetch recent payments
 */
export function useSuperAdminRecentPayments(limit: number = 50) {
  const [data, setData] = useState<PaginatedResponse<SystemPayment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminPaymentService.getRecentPayments(limit);
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch recent payments");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { data, loading, error, refetch: fetchPayments };
}

// ============================================
// PAYMENT STATISTICS
// ============================================

/**
 * Hook to fetch payment statistics
 */
export function useSuperAdminPaymentStatistics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminPaymentService.getPaymentStatistics();
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
 * Hook to fetch payment trends
 */
export function useSuperAdminPaymentTrends(months: number = 12) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminPaymentService.getPaymentTrends(months);
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch payment trends");
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [months]);

  return { data, loading, error };
}

