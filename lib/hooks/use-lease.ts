/**
 * useLease Hooks
 * Custom hooks for lease management operations
 */

import { useApiQuery } from "./use-api-query";
import leaseService from "../services/lease.service";
import type {
  Lease,
  LeaseQueryParams,
  ExpiringLeasesParams,
  PaginatedResponse,
  ApiResponse,
} from "../api-types";

/**
 * Hook to fetch all leases with optional filters
 */
export function useLeases(params?: LeaseQueryParams, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<Lease>>(
    ["leases", params],
    () => leaseService.getLeases(params),
    {
      enabled,
    }
  );
}

/**
 * Hook to fetch a specific lease by ID
 */
export function useLease(leaseId: string, enabled: boolean = true) {
  return useApiQuery<ApiResponse<Lease>>(
    ["lease", leaseId],
    () => leaseService.getLease(leaseId),
    {
      enabled: enabled && !!leaseId,
    }
  );
}

/**
 * Hook to fetch leases expiring soon
 */
export function useExpiringLeases(params?: ExpiringLeasesParams, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<Lease>>(
    ["leases-expiring", params],
    () => leaseService.getExpiringLeases(params),
    {
      enabled,
    }
  );
}

/**
 * Hook to fetch active leases
 */
export function useActiveLeases(params?: LeaseQueryParams, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<Lease>>(
    ["leases", "active", params],
    () => leaseService.getActiveLeases(params),
    {
      enabled,
    }
  );
}

/**
 * Hook to fetch expired leases
 */
export function useExpiredLeases(params?: LeaseQueryParams, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<Lease>>(
    ["leases", "expired", params],
    () => leaseService.getExpiredLeases(params),
    {
      enabled,
    }
  );
}

/**
 * Hook to fetch terminated leases
 */
export function useTerminatedLeases(params?: LeaseQueryParams, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<Lease>>(
    ["leases", "terminated", params],
    () => leaseService.getTerminatedLeases(params),
    {
      enabled,
    }
  );
}

export default useLeases;

