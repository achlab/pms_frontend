/**
 * Landlord Invoice Hooks
 * React hooks for invoice management with loading states
 * Following Hook Pattern & Separation of Concerns
 */

import { useState, useEffect, useCallback } from "react";
import { landlordInvoiceService } from "../services";
import type {
  LandlordInvoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  BulkInvoiceGenerationRequest,
  InvoiceQueryParams,
  PaginatedResponse,
} from "../api-types";

// ============================================
// QUERY HOOKS (Data Fetching)
// ============================================

/**
 * Hook to fetch all invoices with loading state
 * 
 * @param params - Query parameters for filtering
 * @returns Invoices data, loading state, and error
 */
export function useLandlordInvoices(params?: InvoiceQueryParams) {
  const [data, setData] = useState<PaginatedResponse<LandlordInvoice> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordInvoiceService.getAllInvoices(params);
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
 * Hook to fetch a single invoice by ID
 * 
 * @param invoiceId - UUID of the invoice
 * @returns Invoice data, loading state, and error
 */
export function useLandlordInvoice(invoiceId: string) {
  const [data, setData] = useState<LandlordInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordInvoiceService.getInvoiceDetails(invoiceId);
      setData(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch invoice");
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [fetchInvoice, invoiceId]);

  return { data, loading, error, refetch: fetchInvoice };
}

/**
 * Hook to fetch pending invoices
 * 
 * @param params - Additional query parameters
 * @returns Pending invoices data
 */
export function usePendingInvoices(params?: InvoiceQueryParams) {
  return useLandlordInvoices({ ...params, status: "pending" });
}

/**
 * Hook to fetch paid invoices
 * 
 * @param params - Additional query parameters
 * @returns Paid invoices data
 */
export function usePaidInvoices(params?: InvoiceQueryParams) {
  return useLandlordInvoices({ ...params, status: "paid" });
}

/**
 * Hook to fetch overdue invoices
 * 
 * @param params - Additional query parameters
 * @returns Overdue invoices data
 */
export function useOverdueInvoices(params?: InvoiceQueryParams) {
  const [data, setData] = useState<LandlordInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverdue = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordInvoiceService.getOverdueInvoices(params);
        setData(response.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch overdue invoices");
      } finally {
        setLoading(false);
      }
    };

    fetchOverdue();
  }, [params]);

  return { data, loading, error };
}

/**
 * Hook to fetch invoice statistics
 * 
 * @returns Invoice statistics
 */
export function useInvoiceStatistics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordInvoiceService.getInvoiceStatistics();
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch invoice statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { data, loading, error };
}

// ============================================
// MUTATION HOOKS (Data Modification)
// ============================================

/**
 * Hook to create a new invoice
 * 
 * @returns Create function, loading state, and error
 */
export function useCreateInvoice() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInvoice = useCallback(
    async (data: CreateInvoiceRequest): Promise<LandlordInvoice | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordInvoiceService.createInvoice(data);
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to create invoice");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createInvoice, loading, error };
}

/**
 * Hook to update an invoice
 * 
 * @returns Update function, loading state, and error
 */
export function useUpdateInvoice() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateInvoice = useCallback(
    async (
      invoiceId: string,
      data: UpdateInvoiceRequest
    ): Promise<LandlordInvoice | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordInvoiceService.updateInvoice(invoiceId, data);
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to update invoice");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateInvoice, loading, error };
}

/**
 * Hook to delete an invoice
 * 
 * @returns Delete function, loading state, and error
 */
export function useDeleteInvoice() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteInvoice = useCallback(async (invoiceId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await landlordInvoiceService.deleteInvoice(invoiceId);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to delete invoice");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteInvoice, loading, error };
}

/**
 * Hook to mark invoice as paid
 * 
 * @returns Mark as paid function, loading state, and error
 */
export function useMarkInvoiceAsPaid() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markAsPaid = useCallback(
    async (invoiceId: string): Promise<LandlordInvoice | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordInvoiceService.markInvoiceAsPaid(invoiceId);
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to mark invoice as paid");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { markAsPaid, loading, error };
}

/**
 * Hook to send invoice reminder
 * 
 * @returns Send reminder function, loading state, and error
 */
export function useSendInvoiceReminder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendReminder = useCallback(async (invoiceId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await landlordInvoiceService.sendInvoiceReminder(invoiceId);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to send reminder");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { sendReminder, loading, error };
}

/**
 * Hook to bulk generate invoices
 * 
 * @returns Bulk generate function, loading state, and error
 */
export function useBulkGenerateInvoices() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkGenerate = useCallback(
    async (
      data: BulkInvoiceGenerationRequest
    ): Promise<{ count: number; invoices: LandlordInvoice[] } | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordInvoiceService.bulkInvoiceGeneration(data);
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to generate invoices");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { bulkGenerate, loading, error };
}

// ============================================
// HELPER HOOKS
// ============================================

/**
 * Hook to get invoice summary
 * 
 * @param invoiceId - UUID of the invoice
 * @returns Invoice summary
 */
export function useInvoiceSummary(invoiceId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const summary = await landlordInvoiceService.getInvoiceSummary(invoiceId);
        setData(summary);
      } catch (err: any) {
        setError(err.message || "Failed to fetch invoice summary");
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchSummary();
    }
  }, [invoiceId]);

  return { data, loading, error };
}

/**
 * Hook to check if invoice is overdue
 * 
 * @param invoiceId - UUID of the invoice
 * @returns Overdue status
 */
export function useIsInvoiceOverdue(invoiceId: string) {
  const [overdue, setOverdue] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkOverdue = async () => {
      try {
        setLoading(true);
        setError(null);
        const isOverdue = await landlordInvoiceService.isInvoiceOverdue(invoiceId);
        setOverdue(isOverdue);
      } catch (err: any) {
        setError(err.message || "Failed to check invoice status");
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      checkOverdue();
    }
  }, [invoiceId]);

  return { overdue, loading, error };
}

/**
 * Hook to check if invoice can be edited
 * 
 * @param invoiceId - UUID of the invoice
 * @returns Editable status
 */
export function useCanEditInvoice(invoiceId: string) {
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkEditable = async () => {
      try {
        setLoading(true);
        setError(null);
        const editable = await landlordInvoiceService.canEditInvoice(invoiceId);
        setCanEdit(editable);
      } catch (err: any) {
        setError(err.message || "Failed to check edit permission");
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      checkEditable();
    }
  }, [invoiceId]);

  return { canEdit, loading, error };
}

/**
 * Hook to check if invoice can be deleted
 * 
 * @param invoiceId - UUID of the invoice
 * @returns Deletable status
 */
export function useCanDeleteInvoice(invoiceId: string) {
  const [canDelete, setCanDelete] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkDeletable = async () => {
      try {
        setLoading(true);
        setError(null);
        const deletable = await landlordInvoiceService.canDeleteInvoice(invoiceId);
        setCanDelete(deletable);
      } catch (err: any) {
        setError(err.message || "Failed to check delete permission");
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      checkDeletable();
    }
  }, [invoiceId]);

  return { canDelete, loading, error };
}

/**
 * Hook to calculate total amount for tenant
 * 
 * @param tenantId - UUID of the tenant
 * @returns Total amount
 */
export function useTenantTotalInvoices(tenantId: string) {
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateTotal = async () => {
      try {
        setLoading(true);
        setError(null);
        const totalAmount = await landlordInvoiceService.getTenantTotalInvoices(
          tenantId
        );
        setTotal(totalAmount);
      } catch (err: any) {
        setError(err.message || "Failed to calculate total");
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
 * Hook to get tenant's last invoice
 * 
 * @param tenantId - UUID of the tenant
 * @returns Last invoice
 */
export function useTenantLastInvoice(tenantId: string) {
  const [invoice, setInvoice] = useState<LandlordInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLastInvoice = async () => {
      try {
        setLoading(true);
        setError(null);
        const lastInvoice = await landlordInvoiceService.getTenantLastInvoice(
          tenantId
        );
        setInvoice(lastInvoice);
      } catch (err: any) {
        setError(err.message || "Failed to fetch last invoice");
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchLastInvoice();
    }
  }, [tenantId]);

  return { invoice, loading, error };
}

