/**
 * Unit Hooks
 * React hooks for unit data management
 */

import { useApiQuery } from "./use-api-query";
import { unitService } from "../services/unit.service";
import type { Unit, ApiResponse } from "../api-types";

/**
 * Hook to fetch tenant's current unit(s)
 * @param tenantId - Tenant user ID
 * @param options - Query options
 * @returns Query result with unit data
 */
export function useMyUnit(
  tenantId: string,
  options?: { enabled?: boolean }
) {
  return useApiQuery<ApiResponse<Unit[]>>(
    ["my-unit", tenantId],
    () => unitService.getMyUnit(tenantId),
    {
      enabled: options?.enabled !== false && !!tenantId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to fetch unit details by ID
 * @param unitId - Unit ID
 * @param options - Query options
 * @returns Query result with unit details
 */
export function useUnitDetails(
  unitId: string,
  options?: { enabled?: boolean }
) {
  return useApiQuery<ApiResponse<Unit>>(
    ["unit-details", unitId],
    () => unitService.getUnitDetails(unitId),
    {
      enabled: options?.enabled !== false && !!unitId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

