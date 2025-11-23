/**
 * Caretaker Property & Unit Hooks
 * React hooks for caretaker property and unit operations (read-only)
 * Following SOLID principles and React best practices
 */

import { useQuery } from "@tanstack/react-query";
import { caretakerPropertyService, type UnitQueryParams } from "../services/caretaker-property.service";
import type {
  CaretakerProperty,
  CaretakerUnit,
  ApiResponse,
  PaginatedResponse,
} from "../api-types";

// ============================================
// QUERY KEYS
// ============================================

export const caretakerPropertyKeys = {
  all: ["caretaker-properties"] as const,
  lists: () => [...caretakerPropertyKeys.all, "list"] as const,
  list: () => [...caretakerPropertyKeys.lists()] as const,
  details: () => [...caretakerPropertyKeys.all, "detail"] as const,
  detail: (id: string) => [...caretakerPropertyKeys.details(), id] as const,
  units: () => [...caretakerPropertyKeys.all, "units"] as const,
  propertyUnits: (propertyId: string) => 
    [...caretakerPropertyKeys.units(), "property", propertyId] as const,
  unitList: (params?: UnitQueryParams) => 
    [...caretakerPropertyKeys.units(), "list", params] as const,
  unitDetail: (id: string) => [...caretakerPropertyKeys.units(), "detail", id] as const,
};

// ============================================
// PROPERTY HOOKS
// ============================================

/**
 * Get all properties assigned to the caretaker
 */
export function useCaretakerProperties(options?: { 
  enabled?: boolean;
  refetchInterval?: number;
}) {
  return useQuery<ApiResponse<CaretakerProperty[]>>({
    queryKey: caretakerPropertyKeys.list(),
    queryFn: () => caretakerPropertyService.getProperties(),
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
}

/**
 * Get a single property by ID
 */
export function useCaretakerProperty(
  propertyId: string,
  options?: { enabled?: boolean }
) {
  return useQuery<ApiResponse<CaretakerProperty>>({
    queryKey: caretakerPropertyKeys.detail(propertyId),
    queryFn: () => caretakerPropertyService.getProperty(propertyId),
    enabled: options?.enabled !== false && !!propertyId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get units in a specific property
 */
export function usePropertyUnits(
  propertyId: string,
  options?: { enabled?: boolean }
) {
  return useQuery<ApiResponse<CaretakerUnit[]>>({
    queryKey: caretakerPropertyKeys.propertyUnits(propertyId),
    queryFn: () => caretakerPropertyService.getPropertyUnits(propertyId),
    enabled: options?.enabled !== false && !!propertyId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get property summary with calculated stats
 */
export function usePropertySummary(
  propertyId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...caretakerPropertyKeys.detail(propertyId), "summary"],
    queryFn: () => caretakerPropertyService.getPropertySummary(propertyId),
    enabled: options?.enabled !== false && !!propertyId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get landlord contact for a property
 */
export function useLandlordContact(
  propertyId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...caretakerPropertyKeys.detail(propertyId), "landlord"],
    queryFn: () => caretakerPropertyService.getLandlordContact(propertyId),
    enabled: options?.enabled !== false && !!propertyId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// ============================================
// UNIT HOOKS
// ============================================

/**
 * Get all units assigned to the caretaker
 */
export function useCaretakerUnits(
  params?: UnitQueryParams,
  options?: { 
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery<PaginatedResponse<CaretakerUnit>>({
    queryKey: caretakerPropertyKeys.unitList(params),
    queryFn: () => caretakerPropertyService.getUnits(params),
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get a single unit by ID
 */
export function useCaretakerUnit(
  unitId: string,
  options?: { enabled?: boolean }
) {
  return useQuery<ApiResponse<CaretakerUnit>>({
    queryKey: caretakerPropertyKeys.unitDetail(unitId),
    queryFn: () => caretakerPropertyService.getUnit(unitId),
    enabled: options?.enabled !== false && !!unitId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get occupied units only
 */
export function useOccupiedUnits(
  params?: UnitQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery<PaginatedResponse<CaretakerUnit>>({
    queryKey: caretakerPropertyKeys.unitList({ ...params, is_occupied: true }),
    queryFn: () => caretakerPropertyService.getOccupiedUnits(params),
    enabled: options?.enabled,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get vacant units only
 */
export function useVacantUnits(
  params?: UnitQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery<PaginatedResponse<CaretakerUnit>>({
    queryKey: caretakerPropertyKeys.unitList({ ...params, is_occupied: false }),
    queryFn: () => caretakerPropertyService.getVacantUnits(params),
    enabled: options?.enabled,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get units by property ID
 */
export function useUnitsByProperty(
  propertyId: string,
  params?: UnitQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery<PaginatedResponse<CaretakerUnit>>({
    queryKey: caretakerPropertyKeys.unitList({ ...params, property_id: propertyId }),
    queryFn: () => caretakerPropertyService.getUnitsByProperty(propertyId, params),
    enabled: options?.enabled !== false && !!propertyId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get active units only
 */
export function useActiveUnits(
  params?: UnitQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery<PaginatedResponse<CaretakerUnit>>({
    queryKey: caretakerPropertyKeys.unitList({ ...params, is_active: true }),
    queryFn: () => caretakerPropertyService.getActiveUnits(params),
    enabled: options?.enabled,
    staleTime: 2 * 60 * 1000,
  });
}

