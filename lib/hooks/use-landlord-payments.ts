/**
 * Landlord Payment Hooks
 * React hooks for payment management with loading states
 * Following Hook Pattern & Separation of Concerns
 */

import { useState, useEffect, useCallback } from "react";
import { landlordPaymentService } from "../services";
import type {
  LandlordPayment,
  LandlordRecordPaymentRequest,
  UpdatePaymentRequest,
  PaymentQueryParams,
  PaymentTrends,
  PaginatedResponse,
} from "../api-types";

// ============================================
// QUERY HOOKS (Data Fetching)
// ============================================

/**
 * Hook to fetch payment history with loading state
 * 
 * @param params - Query parameters for filtering
 * @returns Payments data, loading state, and error
 */
export function useLandlordPayments(params?: PaymentQueryParams) {
  const [data, setData] = useState<PaginatedResponse<LandlordPayment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordPaymentService.getPaymentHistory(params);
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
 * Hook to fetch a single payment by ID
 * 
 * @param paymentId - UUID of the payment
 * @returns Payment data, loading state, and error
 */
export function useLandlordPayment(paymentId: string) {
  const [data, setData] = useState<LandlordPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordPaymentService.getPayment(paymentId);
      setData(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch payment");
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    if (paymentId) {
      fetchPayment();
    }
  }, [fetchPayment, paymentId]);

  return { data, loading, error, refetch: fetchPayment };
}

/**
 * Hook to fetch recent payments
 * 
 * @param limit - Number of recent payments
 * @returns Recent payments data
 */
export function useRecentPayments(limit: number = 10) {
  const [data, setData] = useState<LandlordPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordPaymentService.getRecentPayments(limit);
        setData(response.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch recent payments");
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, [limit]);

  return { data, loading, error };
}

/**
 * Hook to fetch payments by tenant
 * 
 * @param tenantId - UUID of the tenant
 * @param params - Additional query parameters
 * @returns Tenant payments data
 */
export function usePaymentsByTenant(tenantId: string, params?: PaymentQueryParams) {
  const [data, setData] = useState<PaginatedResponse<LandlordPayment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!tenantId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await landlordPaymentService.getPaymentsByTenant(
          tenantId,
          params
        );
        setData(response);
      } catch (err: any) {
        setError(err.message || "Failed to fetch tenant payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [tenantId, params]);

  return { data, loading, error };
}

/**
 * Hook to fetch payment statistics
 * 
 * @returns Payment statistics
 */
export function usePaymentStatistics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordPaymentService.getStatistics();
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch payment statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { data, loading, error };
}

/**
 * Hook to fetch payment trends
 * 
 * @param months - Number of months to analyze
 * @returns Payment trends data
 */
export function usePaymentTrends(months: number = 12) {
  const [data, setData] = useState<PaymentTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordPaymentService.getPaymentTrends(months);
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

// ============================================
// MUTATION HOOKS (Data Modification)
// ============================================

/**
 * Hook to record a new payment
 * 
 * @returns Record function, loading state, and error
 */
export function useRecordPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordPayment = useCallback(
    async (data: LandlordRecordPaymentRequest): Promise<LandlordPayment | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordPaymentService.recordPayment(data);
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to record payment");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { recordPayment, loading, error };
}

/**
 * Hook to update a payment
 * 
 * @returns Update function, loading state, and error
 */
export function useUpdatePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePayment = useCallback(
    async (
      paymentId: string,
      data: UpdatePaymentRequest
    ): Promise<LandlordPayment | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordPaymentService.updatePayment(paymentId, data);
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to update payment");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updatePayment, loading, error };
}

/**
 * Hook to delete a payment
 * 
 * @returns Delete function, loading state, and error
 */
export function useDeletePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePayment = useCallback(async (paymentId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await landlordPaymentService.deletePayment(paymentId);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to delete payment");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deletePayment, loading, error };
}

// ============================================
// HELPER HOOKS
// ============================================

/**
 * Hook to get payment summary
 * 
 * @param paymentId - UUID of the payment
 * @returns Payment summary
 */
export function usePaymentSummary(paymentId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const summary = await landlordPaymentService.getPaymentSummary(paymentId);
        setData(summary);
      } catch (err: any) {
        setError(err.message || "Failed to fetch payment summary");
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) {
      fetchSummary();
    }
  }, [paymentId]);

  return { data, loading, error };
}

/**
 * Hook to calculate total payments for a tenant
 * 
 * @param tenantId - UUID of the tenant
 * @returns Total payment amount
 */
export function useTenantTotalPayments(tenantId: string) {
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateTotal = async () => {
      try {
        setLoading(true);
        setError(null);
        const totalAmount = await landlordPaymentService.getTenantTotalPayments(
          tenantId
        );
        setTotal(totalAmount);
      } catch (err: any) {
        setError(err.message || "Failed to calculate total payments");
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      calculateTotal();
    }
  }, [tenantId]);

  return { total, loading, error };
}

/**
 * Hook to get tenant's last payment
 * 
 * @param tenantId - UUID of the tenant
 * @returns Last payment
 */
export function useTenantLastPayment(tenantId: string) {
  const [payment, setPayment] = useState<LandlordPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLastPayment = async () => {
      try {
        setLoading(true);
        setError(null);
        const lastPayment = await landlordPaymentService.getTenantLastPayment(
          tenantId
        );
        setPayment(lastPayment);
      } catch (err: any) {
        setError(err.message || "Failed to fetch last payment");
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchLastPayment();
    }
  }, [tenantId]);

  return { payment, loading, error };
}

/**
 * Hook to check if payment can be edited
 * 
 * @param paymentId - UUID of the payment
 * @returns Editable status
 */
export function useCanEditPayment(paymentId: string) {
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkEditable = async () => {
      try {
        setLoading(true);
        setError(null);
        const editable = await landlordPaymentService.canEditPayment(paymentId);
        setCanEdit(editable);
      } catch (err: any) {
        setError(err.message || "Failed to check edit permission");
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) {
      checkEditable();
    }
  }, [paymentId]);

  return { canEdit, loading, error };
}

/**
 * Hook to check if payment can be deleted
 * 
 * @param paymentId - UUID of the payment
 * @returns Deletable status
 */
export function useCanDeletePayment(paymentId: string) {
  const [canDelete, setCanDelete] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkDeletable = async () => {
      try {
        setLoading(true);
        setError(null);
        const deletable = await landlordPaymentService.canDeletePayment(paymentId);
        setCanDelete(deletable);
      } catch (err: any) {
        setError(err.message || "Failed to check delete permission");
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) {
      checkDeletable();
    }
  }, [paymentId]);

  return { canDelete, loading, error };
}

/**
 * Hook to generate payment receipt
 * 
 * @param paymentId - UUID of the payment
 * @returns Generate receipt function, loading state, and error
 */
export function useGeneratePaymentReceipt() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReceipt = useCallback(
    async (paymentId: string): Promise<string | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordPaymentService.generateReceipt(paymentId);
        return response.data?.receipt_url || null;
      } catch (err: any) {
        setError(err.message || "Failed to generate receipt");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { generateReceipt, loading, error };
}

