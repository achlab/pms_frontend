/**
 * Super Admin Tenants Hooks
 * React hooks for tenant management across all properties
 */

import { useQuery } from "@tanstack/react-query";
import { superAdminTenantsService } from "../services/super-admin-tenants.service";
import type { SuperAdminTenantsQueryParams } from "../services/super-admin-tenants.service";

/**
 * Hook to fetch all tenants
 */
export function useSuperAdminTenants(params?: SuperAdminTenantsQueryParams) {
  return useQuery({
    queryKey: ['super-admin-tenants', params],
    queryFn: async () => {
      const response = await superAdminTenantsService.getAllTenants(params);
      return response;
    },
  });
}

/**
 * Hook to fetch a single tenant with full details
 */
export function useSuperAdminTenant(tenantId: string) {
  return useQuery({
    queryKey: ['super-admin-tenant', tenantId],
    queryFn: async () => {
      const response = await superAdminTenantsService.getTenant(tenantId);
      return response.data;
    },
    enabled: !!tenantId,
  });
}

/**
 * Hook to fetch tenant statistics
 */
export function useSuperAdminTenantStatistics() {
  return useQuery({
    queryKey: ['super-admin-tenant-statistics'],
    queryFn: async () => {
      const response = await superAdminTenantsService.getStatistics();
      return response.data;
    },
  });
}

/**
 * Hook to fetch properties for filtering
 */
export function useSuperAdminTenantProperties() {
  return useQuery({
    queryKey: ['super-admin-tenant-properties'],
    queryFn: async () => {
      const response = await superAdminTenantsService.getProperties();
      return response.data;
    },
  });
}

