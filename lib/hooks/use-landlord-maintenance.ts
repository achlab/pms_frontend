/**
 * Landlord Maintenance Hooks
 * React hooks for maintenance management (oversight & approval) with loading states
 * Following Hook Pattern & Separation of Concerns
 */

import { useState, useEffect, useCallback } from "react";
import { landlordMaintenanceService } from "../services";
import type {
  LandlordMaintenanceRequest,
  AssignMaintenanceRequest,
  ApproveRejectMaintenanceRequest,
  MaintenanceQueryParams,
  MaintenanceCategory,
  PaginatedResponse,
} from "../api-types";

// ============================================
// QUERY HOOKS (Data Fetching)
// ============================================

/**
 * Hook to fetch all maintenance requests with loading state
 * 
 * @param params - Query parameters for filtering
 * @returns Maintenance requests data, loading state, and error
 */
export function useLandlordMaintenanceRequests(params?: MaintenanceQueryParams) {
  const [data, setData] = useState<PaginatedResponse<LandlordMaintenanceRequest> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordMaintenanceService.getAllMaintenanceRequests(params);
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
 * Hook to fetch a single maintenance request by ID
 * 
 * @param requestId - UUID of the maintenance request
 * @returns Maintenance request data, loading state, and error
 */
export function useLandlordMaintenanceRequest(requestId: string) {
  const [data, setData] = useState<LandlordMaintenanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordMaintenanceService.getMaintenanceRequest(requestId);
      setData(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch maintenance request");
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    if (requestId) {
      fetchRequest();
    }
  }, [fetchRequest, requestId]);

  return { data, loading, error, refetch: fetchRequest };
}

/**
 * Hook to fetch pending maintenance requests
 * 
 * @param params - Additional query parameters
 * @returns Pending requests data
 */
export function usePendingMaintenanceRequests(params?: MaintenanceQueryParams) {
  return useLandlordMaintenanceRequests({ ...params, status: "pending" });
}

/**
 * Hook to fetch in-progress maintenance requests
 * 
 * @param params - Additional query parameters
 * @returns In-progress requests data
 */
export function useInProgressMaintenanceRequests(params?: MaintenanceQueryParams) {
  return useLandlordMaintenanceRequests({ ...params, status: "in_progress" });
}

/**
 * Hook to fetch emergency maintenance requests
 * 
 * @param params - Additional query parameters
 * @returns Emergency requests data
 */
export function useEmergencyMaintenanceRequests(params?: MaintenanceQueryParams) {
  return useLandlordMaintenanceRequests({ ...params, priority: "emergency" });
}

/**
 * Hook to fetch unassigned maintenance requests
 * 
 * @param params - Additional query parameters
 * @returns Unassigned requests data
 */
export function useUnassignedMaintenanceRequests(params?: MaintenanceQueryParams) {
  const [data, setData] = useState<PaginatedResponse<LandlordMaintenanceRequest> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnassigned = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordMaintenanceService.getUnassignedRequests(params);
        setData(response);
      } catch (err: any) {
        setError(err.message || "Failed to fetch unassigned requests");
      } finally {
        setLoading(false);
      }
    };

    fetchUnassigned();
  }, [params]);

  return { data, loading, error };
}

/**
 * Hook to fetch maintenance categories
 * 
 * @returns Maintenance categories
 */
export function useMaintenanceCategories() {
  const [data, setData] = useState<MaintenanceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordMaintenanceService.getCategories();
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

/**
 * Hook to fetch maintenance statistics
 * 
 * @returns Maintenance statistics
 */
export function useLandlordMaintenanceStatistics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordMaintenanceService.getStatistics();
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch maintenance statistics");
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
 * Hook to assign a maintenance request to a caretaker
 * 
 * @returns Assign function, loading state, and error
 */
export function useAssignMaintenanceRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignRequest = useCallback(
    async (
      requestId: string,
      data: AssignMaintenanceRequest
    ): Promise<LandlordMaintenanceRequest | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordMaintenanceService.assignMaintenanceRequest(
          requestId,
          data
        );
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to assign request");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { assignRequest, loading, error };
}

/**
 * Hook to auto-assign a maintenance request
 * 
 * @returns Auto-assign function, loading state, and error
 */
export function useAutoAssignMaintenanceRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoAssign = useCallback(
    async (requestId: string): Promise<LandlordMaintenanceRequest | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordMaintenanceService.autoAssignMaintenanceRequest(
          requestId
        );
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to auto-assign request");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { autoAssign, loading, error };
}

/**
 * Hook to approve a maintenance request
 * 
 * @returns Approve function, loading state, and error
 */
export function useApproveMaintenanceRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveRequest = useCallback(
    async (
      requestId: string,
      data?: ApproveRejectMaintenanceRequest
    ): Promise<LandlordMaintenanceRequest | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordMaintenanceService.approveMaintenanceRequest(
          requestId,
          data
        );
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to approve request");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { approveRequest, loading, error };
}

/**
 * Hook to reject a maintenance request
 * 
 * @returns Reject function, loading state, and error
 */
export function useRejectMaintenanceRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rejectRequest = useCallback(
    async (
      requestId: string,
      data: ApproveRejectMaintenanceRequest
    ): Promise<LandlordMaintenanceRequest | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordMaintenanceService.rejectMaintenanceRequest(
          requestId,
          data
        );
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to reject request");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { rejectRequest, loading, error };
}

// ============================================
// HELPER HOOKS
// ============================================

/**
 * Hook to get maintenance request summary
 * 
 * @param requestId - UUID of the maintenance request
 * @returns Request summary
 */
export function useMaintenanceRequestSummary(requestId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const summary = await landlordMaintenanceService.getRequestSummary(requestId);
        setData(summary);
      } catch (err: any) {
        setError(err.message || "Failed to fetch request summary");
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchSummary();
    }
  }, [requestId]);

  return { data, loading, error };
}

/**
 * Hook to check if maintenance request needs attention
 * 
 * @param requestId - UUID of the maintenance request
 * @returns Needs attention status
 */
export function useNeedsAttention(requestId: string) {
  const [needsAttention, setNeedsAttention] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAttention = async () => {
      try {
        setLoading(true);
        setError(null);
        const needs = await landlordMaintenanceService.needsAttention(requestId);
        setNeedsAttention(needs);
      } catch (err: any) {
        setError(err.message || "Failed to check attention status");
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      checkAttention();
    }
  }, [requestId]);

  return { needsAttention, loading, error };
}

/**
 * Hook to fetch overdue maintenance requests
 * 
 * @param params - Additional query parameters
 * @returns Overdue requests data
 */
export function useOverdueMaintenanceRequests(params?: MaintenanceQueryParams) {
  const [data, setData] = useState<PaginatedResponse<LandlordMaintenanceRequest> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverdue = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordMaintenanceService.getOverdueRequests(params);
        setData(response);
      } catch (err: any) {
        setError(err.message || "Failed to fetch overdue requests");
      } finally {
        setLoading(false);
      }
    };

    fetchOverdue();
  }, [params]);

  return { data, loading, error };
}

/**
 * Hook to fetch maintenance requests by property
 * 
 * @param propertyId - UUID of the property
 * @param params - Additional query parameters
 * @returns Property maintenance requests
 */
export function usePropertyMaintenanceRequests(
  propertyId: string,
  params?: MaintenanceQueryParams
) {
  const [data, setData] = useState<PaginatedResponse<LandlordMaintenanceRequest> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!propertyId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await landlordMaintenanceService.getMaintenanceByProperty(
          propertyId,
          params
        );
        setData(response);
      } catch (err: any) {
        setError(err.message || "Failed to fetch property maintenance requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [propertyId, params]);

  return { data, loading, error };
}

/**
 * Hook to fetch maintenance requests by caretaker
 * 
 * @param caretakerId - UUID of the caretaker
 * @param params - Additional query parameters
 * @returns Caretaker maintenance requests
 */
export function useCaretakerMaintenanceRequests(
  caretakerId: string,
  params?: MaintenanceQueryParams
) {
  const [data, setData] = useState<PaginatedResponse<LandlordMaintenanceRequest> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!caretakerId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await landlordMaintenanceService.getMaintenanceByCaretaker(
          caretakerId,
          params
        );
        setData(response);
      } catch (err: any) {
        setError(err.message || "Failed to fetch caretaker maintenance requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [caretakerId, params]);

  return { data, loading, error };
}

/**
 * Hook to fetch property maintenance statistics
 * 
 * @param propertyId - UUID of the property
 * @returns Property statistics
 */
export function usePropertyMaintenanceStatistics(propertyId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordMaintenanceService.getPropertyStatistics(
          propertyId
        );
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch property statistics");
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchStats();
    }
  }, [propertyId]);

  return { data, loading, error };
}

/**
 * Hook to fetch caretaker maintenance statistics
 * 
 * @param caretakerId - UUID of the caretaker
 * @returns Caretaker statistics
 */
export function useCaretakerMaintenanceStatistics(caretakerId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordMaintenanceService.getCaretakerStatistics(
          caretakerId
        );
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch caretaker statistics");
      } finally {
        setLoading(false);
      }
    };

    if (caretakerId) {
      fetchStats();
    }
  }, [caretakerId]);

  return { data, loading, error };
}

