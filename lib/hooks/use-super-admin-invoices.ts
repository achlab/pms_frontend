/**
 * Super Admin Invoice Management Hooks
 * React hooks for system-wide invoice oversight
 */

import { useState, useEffect, useCallback } from "react";
import { superAdminInvoiceService } from "../services";
import type {
  SystemInvoice,
  SuperAdminInvoiceQueryParams,
  InvoiceStatus,
  PaginatedResponse,
} from "../api-types";

// ============================================
// INVOICE QUERIES
// ============================================

/**
 * Hook to fetch all invoices
 */
export function useSuperAdminInvoices(params?: SuperAdminInvoiceQueryParams) {
  const [data, setData] = useState<PaginatedResponse<SystemInvoice> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminInvoiceService.getAllInvoices(params);
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { data, loading, error, refetch: fetchInvoices };
}

/**
 * Hook to fetch a single invoice
 */
export function useSuperAdminInvoice(invoiceId: string | null) {
  const [data, setData] = useState<SystemInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceId) {
      setLoading(false);
      return;
    }

    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminInvoiceService.getInvoiceDetails(invoiceId);
        setData(response.data!);
      } catch (err: any) {
        setError(err.message || "Failed to fetch invoice");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  return { data, loading, error };
}

/**
 * Hook to fetch invoices by landlord
 */
export function useSuperAdminInvoicesByLandlord(landlordId: string) {
  const [data, setData] = useState<PaginatedResponse<SystemInvoice> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminInvoiceService.getInvoicesByLandlord(landlordId);
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  }, [landlordId]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { data, loading, error, refetch: fetchInvoices };
}

/**
 * Hook to fetch overdue invoices
 */
export function useSuperAdminOverdueInvoices() {
  const [data, setData] = useState<PaginatedResponse<SystemInvoice> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminInvoiceService.getOverdueInvoices();
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch overdue invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { data, loading, error, refetch: fetchInvoices };
}

// ============================================
// INVOICE STATISTICS
// ============================================

/**
 * Hook to fetch invoice statistics
 */
export function useSuperAdminInvoiceStatistics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminInvoiceService.getInvoiceStatistics();
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
 * Hook to fetch revenue by landlord
 */
export function useSuperAdminRevenueByLandlord(startDate?: string, endDate?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminInvoiceService.getRevenueByLandlord(
          startDate,
          endDate
        );
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch revenue data");
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [startDate, endDate]);

  return { data, loading, error };
}

