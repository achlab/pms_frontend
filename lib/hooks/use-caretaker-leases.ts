/**
 * Caretaker Lease Hooks
 * React hooks for caretaker lease operations (read-only)
 * Following SOLID principles and React best practices
 */

import { useQuery } from "@tanstack/react-query";
import { caretakerLeaseService } from "../services";
import type {
  CaretakerLease,
  LeaseQueryParams,
  ExpiringLeasesParams,
  ApiResponse,
  PaginatedResponse,
} from "../api-types";

// ============================================
// QUERY KEYS
// ============================================

export const caretakerLeaseKeys = {
  all: ["caretaker-leases"] as const,
  lists: () => [...caretakerLeaseKeys.all, "list"] as const,
  list: (params?: LeaseQueryParams) => [...caretakerLeaseKeys.lists(), params] as const,
  details: () => [...caretakerLeaseKeys.all, "detail"] as const,
  detail: (id: string) => [...caretakerLeaseKeys.details(), id] as const,
  expiring: (params?: ExpiringLeasesParams) => 
    [...caretakerLeaseKeys.all, "expiring", params] as const,
};

// ============================================
// LEASE HOOKS
// ============================================

/**
 * Get all leases for properties managed by the caretaker
 */
export function useCaretakerLeases(
  params?: LeaseQueryParams,
  options?: { 
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery<PaginatedResponse<CaretakerLease>>({
    queryKey: caretakerLeaseKeys.list(params),
    queryFn: () => caretakerLeaseService.getLeases(params),
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
}

/**
 * Get a single lease by ID
 */
export function useCaretakerLease(
  leaseId: string,
  options?: { enabled?: boolean }
) {
  return useQuery<ApiResponse<CaretakerLease>>({
    queryKey: caretakerLeaseKeys.detail(leaseId),
    queryFn: () => caretakerLeaseService.getLease(leaseId),
    enabled: options?.enabled !== false && !!leaseId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get leases expiring soon
 */
export function useExpiringLeases(
  params?: ExpiringLeasesParams,
  options?: { 
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery<ApiResponse<CaretakerLease[]>>({
    queryKey: caretakerLeaseKeys.expiring(params),
    queryFn: () => caretakerLeaseService.getExpiringLeases(params),
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// ============================================
// FILTERED LEASE HOOKS
// ============================================

/**
 * Get active leases only
 */
export function useActiveLeases(
  params?: LeaseQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery<PaginatedResponse<CaretakerLease>>({
    queryKey: caretakerLeaseKeys.list({ ...params, status: "active" }),
    queryFn: () => caretakerLeaseService.getActiveLeases(params),
    enabled: options?.enabled,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get expired leases
 */
export function useExpiredLeases(
  params?: LeaseQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery<PaginatedResponse<CaretakerLease>>({
    queryKey: caretakerLeaseKeys.list({ ...params, status: "expired" }),
    queryFn: () => caretakerLeaseService.getExpiredLeases(params),
    enabled: options?.enabled,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get terminated leases
 */
export function useTerminatedLeases(
  params?: LeaseQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery<PaginatedResponse<CaretakerLease>>({
    queryKey: caretakerLeaseKeys.list({ ...params, status: "terminated" }),
    queryFn: () => caretakerLeaseService.getTerminatedLeases(params),
    enabled: options?.enabled,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get leases for a specific property
 */
export function useLeasesByProperty(
  propertyId: string,
  params?: LeaseQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery<PaginatedResponse<CaretakerLease>>({
    queryKey: caretakerLeaseKeys.list({ ...params, property_id: propertyId }),
    queryFn: () => caretakerLeaseService.getLeasesByProperty(propertyId, params),
    enabled: options?.enabled !== false && !!propertyId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get leases for a specific unit
 */
export function useLeasesByUnit(
  unitId: string,
  params?: LeaseQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery<PaginatedResponse<CaretakerLease>>({
    queryKey: caretakerLeaseKeys.list({ ...params, unit_id: unitId }),
    queryFn: () => caretakerLeaseService.getLeasesByUnit(unitId, params),
    enabled: options?.enabled !== false && !!unitId,
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Get tenant contact from lease
 */
export function useTenantContact(
  leaseId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...caretakerLeaseKeys.detail(leaseId), "tenant"],
    queryFn: () => caretakerLeaseService.getTenantContact(leaseId),
    enabled: options?.enabled !== false && !!leaseId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Get landlord contact from lease
 */
export function useLandlordContactFromLease(
  leaseId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...caretakerLeaseKeys.detail(leaseId), "landlord"],
    queryFn: () => caretakerLeaseService.getLandlordContact(leaseId),
    enabled: options?.enabled !== false && !!leaseId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get lease summary with key information
 */
export function useLeaseSummary(
  leaseId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...caretakerLeaseKeys.detail(leaseId), "summary"],
    queryFn: () => caretakerLeaseService.getLeaseSummary(leaseId),
    enabled: options?.enabled !== false && !!leaseId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Check if lease is expiring soon
 */
export function useIsLeaseExpiringSoon(
  leaseId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...caretakerLeaseKeys.detail(leaseId), "expiring-check"],
    queryFn: () => caretakerLeaseService.isLeaseExpiringSoon(leaseId),
    enabled: options?.enabled !== false && !!leaseId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get leases expiring within specific days
 */
export function useExpiringWithinDays(
  days: number = 30,
  options?: { 
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery<ApiResponse<CaretakerLease[]>>({
    queryKey: caretakerLeaseKeys.expiring({ days }),
    queryFn: () => caretakerLeaseService.getExpiringWithinDays(days),
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get critical expiration alerts (leases expiring within 7 days)
 */
export function useCriticalExpirationAlerts(options?: { 
  enabled?: boolean;
  refetchInterval?: number;
}) {
  return useQuery<ApiResponse<CaretakerLease[]>>({
    queryKey: caretakerLeaseKeys.expiring({ days: 7 }),
    queryFn: () => caretakerLeaseService.getCriticalExpirationAlerts(),
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
    staleTime: 5 * 60 * 1000,
  });
}

