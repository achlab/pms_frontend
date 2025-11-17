/**
 * Unit Service
 * Handles all unit-related API operations for tenant portal
 */

import { apiClient } from "../api-client";
import type { Unit, ApiResponse } from "../api-types";

/**
 * Unit Service
 * Provides methods for unit management operations
 */
class UnitService {
  private readonly baseUrl = "/units";

  /**
   * Get tenant's current unit(s)
   * @param tenantId - Tenant user ID
   * @returns Promise with array of units
   */
  async getMyUnit(tenantId: string): Promise<ApiResponse<Unit[]>> {
    const response = await apiClient.get<ApiResponse<Unit[]>>(this.baseUrl, {
      params: { tenant_id: tenantId },
    });
    return response.data;
  }

  /**
   * Get unit details by ID
   * @param unitId - Unit ID
   * @returns Promise with unit details
   */
  async getUnitDetails(unitId: string): Promise<ApiResponse<Unit>> {
    const response = await apiClient.get<ApiResponse<Unit>>(
      `${this.baseUrl}/${unitId}`
    );
    return response.data;
  }
}

// Export singleton instance
export const unitService = new UnitService();
export default UnitService;

