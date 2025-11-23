/**
 * Landlord Lease Hooks
 * React hooks for lease management with loading states
 * Following Hook Pattern & Separation of Concerns
 */

import { useState, useEffect, useCallback } from "react";
import { landlordLeaseService } from "../services";
import type {
  LandlordLease,
  CreateLeaseRequest,
  UpdateLeaseRequest,
  TerminateLeaseRequest,
  RenewLeaseRequest,
  LeaseQueryParams,
  PaginatedResponse,
} from "../api-types";

// ============================================
// QUERY HOOKS (Data Fetching)
// ============================================

/**
 * Hook to fetch all leases with loading state
 * 
 * @param params - Query parameters for filtering
 * @returns Leases data, loading state, and error
 */
export function useLandlordLeases(params?: LeaseQueryParams) {
  const [data, setData] = useState<PaginatedResponse<LandlordLease> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordLeaseService.getAllLeases(params);
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
 * Hook to fetch a single lease by ID
 * 
 * @param leaseId - UUID of the lease
 * @returns Lease data, loading state, and error
 */
export function useLandlordLease(leaseId: string) {
  const [data, setData] = useState<LandlordLease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLease = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordLeaseService.getLeaseDetails(leaseId);
      setData(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch lease");
    } finally {
      setLoading(false);
    }
  }, [leaseId]);

  useEffect(() => {
    if (leaseId) {
      fetchLease();
    }
  }, [fetchLease, leaseId]);

  return { data, loading, error, refetch: fetchLease };
}

/**
 * Hook to fetch active leases
 * 
 * @param params - Additional query parameters
 * @returns Active leases data
 */
export function useActiveLeases(params?: LeaseQueryParams) {
  return useLandlordLeases({ ...params, status: "active" });
}

/**
 * Hook to fetch expiring leases
 * 
 * @param daysAhead - Number of days to look ahead
 * @returns Expiring leases data
 */
export function useExpiringLeases(daysAhead: number = 30) {
  const [data, setData] = useState<LandlordLease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpiringLeases = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordLeaseService.getExpiringLeases(daysAhead);
        setData(response.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch expiring leases");
      } finally {
        setLoading(false);
      }
    };

    fetchExpiringLeases();
  }, [daysAhead]);

  return { data, loading, error };
}

/**
 * Hook to fetch upcoming lease starts
 * 
 * @param daysAhead - Number of days to look ahead
 * @returns Upcoming leases
 */
export function useUpcomingLeaseStarts(daysAhead: number = 30) {
  const [data, setData] = useState<LandlordLease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordLeaseService.getUpcomingLeaseStarts(daysAhead);
        setData(response.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch upcoming leases");
      } finally {
        setLoading(false);
      }
    };

    fetchUpcoming();
  }, [daysAhead]);

  return { data, loading, error };
}

/**
 * Hook to fetch lease statistics
 * 
 * @returns Lease statistics
 */
export function useLeaseStatistics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordLeaseService.getLeaseStatistics();
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch lease statistics");
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
 * Hook to create a new lease
 * 
 * @returns Create function, loading state, and error
 */
export function useCreateLease() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLease = useCallback(
    async (data: CreateLeaseRequest): Promise<LandlordLease | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordLeaseService.createLease(data);
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to create lease");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createLease, loading, error };
}

/**
 * Hook to update a lease
 * 
 * @returns Update function, loading state, and error
 */
export function useUpdateLease() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateLease = useCallback(
    async (
      leaseId: string,
      data: UpdateLeaseRequest
    ): Promise<LandlordLease | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordLeaseService.updateLease(leaseId, data);
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to update lease");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateLease, loading, error };
}

/**
 * Hook to terminate a lease
 * 
 * @returns Terminate function, loading state, and error
 */
export function useTerminateLease() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const terminateLease = useCallback(
    async (
      leaseId: string,
      data: TerminateLeaseRequest
    ): Promise<LandlordLease | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordLeaseService.terminateLease(leaseId, data);
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to terminate lease");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { terminateLease, loading, error };
}

/**
 * Hook to renew a lease
 * 
 * @returns Renew function, loading state, and error
 */
export function useRenewLease() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renewLease = useCallback(
    async (
      leaseId: string,
      data: RenewLeaseRequest
    ): Promise<LandlordLease | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordLeaseService.renewLease(leaseId, data);
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to renew lease");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { renewLease, loading, error };
}

// ============================================
// DOCUMENT HOOKS
// ============================================

/**
 * Hook to export lease document
 * 
 * @param leaseId - UUID of the lease
 * @returns Export function, loading state, and error
 */
export function useExportLeaseDocument() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportDocument = useCallback(
    async (leaseId: string): Promise<string | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordLeaseService.exportLeaseDocument(leaseId);
        return response.data?.document_url || null;
      } catch (err: any) {
        setError(err.message || "Failed to export lease document");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { exportDocument, loading, error };
}

// ============================================
// HELPER HOOKS
// ============================================

/**
 * Hook to get lease summary
 * 
 * @param leaseId - UUID of the lease
 * @returns Lease summary
 */
export function useLeaseSummary(leaseId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const summary = await landlordLeaseService.getLeaseSummary(leaseId);
        setData(summary);
      } catch (err: any) {
        setError(err.message || "Failed to fetch lease summary");
      } finally {
        setLoading(false);
      }
    };

    if (leaseId) {
      fetchSummary();
    }
  }, [leaseId]);

  return { data, loading, error };
}

/**
 * Hook to check if lease is active
 * 
 * @param leaseId - UUID of the lease
 * @returns Active status
 */
export function useIsLeaseActive(leaseId: string) {
  const [active, setActive] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkActive = async () => {
      try {
        setLoading(true);
        setError(null);
        const isActive = await landlordLeaseService.isLeaseActive(leaseId);
        setActive(isActive);
      } catch (err: any) {
        setError(err.message || "Failed to check lease status");
      } finally {
        setLoading(false);
      }
    };

    if (leaseId) {
      checkActive();
    }
  }, [leaseId]);

  return { active, loading, error };
}

/**
 * Hook to check if lease is expiring soon
 * 
 * @param leaseId - UUID of the lease
 * @param daysThreshold - Days threshold for "expiring soon"
 * @returns Expiring status
 */
export function useIsLeaseExpiringSoon(leaseId: string, daysThreshold: number = 30) {
  const [expiring, setExpiring] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkExpiring = async () => {
      try {
        setLoading(true);
        setError(null);
        const isExpiring = await landlordLeaseService.isLeaseExpiringSoon(
          leaseId,
          daysThreshold
        );
        setExpiring(isExpiring);
      } catch (err: any) {
        setError(err.message || "Failed to check lease expiration");
      } finally {
        setLoading(false);
      }
    };

    if (leaseId) {
      checkExpiring();
    }
  }, [leaseId, daysThreshold]);

  return { expiring, loading, error };
}

/**
 * Hook to get days until lease expires
 * 
 * @param leaseId - UUID of the lease
 * @returns Days until expiration
 */
export function useDaysUntilExpiration(leaseId: string) {
  const [days, setDays] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateDays = async () => {
      try {
        setLoading(true);
        setError(null);
        const daysRemaining = await landlordLeaseService.getDaysUntilExpiration(
          leaseId
        );
        setDays(daysRemaining);
      } catch (err: any) {
        setError(err.message || "Failed to calculate expiration");
      } finally {
        setLoading(false);
      }
    };

    if (leaseId) {
      calculateDays();
    }
  }, [leaseId]);

  return { days, loading, error };
}

/**
 * Hook to calculate total lease cost
 * 
 * @param leaseId - UUID of the lease
 * @returns Total lease cost
 */
export function useTotalLeaseCost(leaseId: string) {
  const [cost, setCost] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateCost = async () => {
      try {
        setLoading(true);
        setError(null);
        const totalCost = await landlordLeaseService.calculateTotalLeaseCost(
          leaseId
        );
        setCost(totalCost);
      } catch (err: any) {
        setError(err.message || "Failed to calculate lease cost");
      } finally {
        setLoading(false);
      }
    };

    if (leaseId) {
      calculateCost();
    }
  }, [leaseId]);

  return { cost, loading, error };
}

