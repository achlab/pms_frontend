/**
 * Tenant Property Hooks
 * React Query hooks for tenant property operations
 */

import { useApiQuery } from "./use-api-query";
import tenantPropertyService from "../services/tenant-property.service";
import type { Property, PropertyUnit, ApiResponse } from "../api-types";

/**
 * Hook to fetch properties where the tenant has units
 */
export function useTenantProperties(enabled: boolean = true) {
  return useApiQuery<ApiResponse<Property[]>>(
    ["tenant-properties"],
    () => tenantPropertyService.getTenantProperties(),
    {
      enabled,
    }
  );
}

/**
 * Hook to fetch units for a specific property (tenant access only)
 */
export function useTenantPropertyUnits(propertyId: string, enabled: boolean = true) {
  return useApiQuery<ApiResponse<PropertyUnit[]>>(
    ["tenant-property-units", propertyId],
    () => tenantPropertyService.getPropertyUnits(propertyId),
    {
      enabled: enabled && !!propertyId,
    }
  );
}

/**
 * Hook to get tenant's current unit information
 */
export function useTenantUnit(enabled: boolean = true) {
  return useApiQuery<ApiResponse<{
    property: Property;
    unit: PropertyUnit;
  }>>(
    ["tenant-unit"],
    () => tenantPropertyService.getTenantUnit(),
    {
      enabled,
    }
  );
}
