/**
 * Tenant Property Service
 * Handles property and unit operations for tenants
 * Tenants can only see properties where they have units
 */

import apiClient from "../api-client";
import type { ApiResponse, Property, Unit } from "../api-types";

class TenantPropertyService {
  private static instance: TenantPropertyService;

  private constructor() {}

  static getInstance(): TenantPropertyService {
    if (!TenantPropertyService.instance) {
      TenantPropertyService.instance = new TenantPropertyService();
    }
    return TenantPropertyService.instance;
  }

  /**
   * Get properties where the tenant has units
   * This uses the general properties endpoint but will be filtered by the backend
   * to only show properties where the current tenant has units
   */
  async getTenantProperties(): Promise<ApiResponse<Property[]>> {
    return apiClient.get<ApiResponse<Property[]>>("/properties");
  }

  /**
   * Get units for a specific property where the tenant has access
   * 
   * @param propertyId - UUID of the property
   * @returns List of units the tenant has access to
   */
  async getPropertyUnits(propertyId: string): Promise<ApiResponse<Unit[]>> {
    return apiClient.get<ApiResponse<Unit[]>>(`/properties/${propertyId}/units`);
  }

  /**
   * Get tenant's current unit information
   * This can be used to pre-select the property and unit in forms
   */
  async getTenantUnit(): Promise<ApiResponse<{
    property: Property;
    unit: Unit;
  }>> {
    return apiClient.get<ApiResponse<{
      property: Property;
      unit: Unit;
    }>>("/tenant/unit");
  }
}

// Export singleton instance
export const tenantPropertyService = TenantPropertyService.getInstance();
export default tenantPropertyService;
