/**
 * Landlord Unit Service
 * Handles all unit management operations for landlords (Full CRUD)
 * Following Single Responsibility Principle & SOLID
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  LandlordUnit,
  CreateUnitRequest,
  UpdateUnitRequest,
  AssignUnitRequest,
  UnitStatistics,
  ApiResponse,
  PaginatedResponse,
} from "../api-types";

/**
 * Query parameters for units
 */
export interface UnitQueryParams {
  property_id?: string;
  is_occupied?: boolean;
  is_active?: boolean;
  per_page?: number;
  page?: number;
}

class LandlordUnitService {
  private static instance: LandlordUnitService;

  private constructor() {}

  static getInstance(): LandlordUnitService {
    if (!LandlordUnitService.instance) {
      LandlordUnitService.instance = new LandlordUnitService();
    }
    return LandlordUnitService.instance;
  }

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  /**
   * Get all units owned by the landlord
   * Supports filtering by property, occupancy status, etc.
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of units
   */
  async getUnits(
    params?: UnitQueryParams
  ): Promise<PaginatedResponse<LandlordUnit>> {
    const url = buildUrl("/units", params);
    return apiClient.get<PaginatedResponse<LandlordUnit>>(url);
  }

  /**
   * Create a new unit
   * 
   * @param data - Unit creation data
   * @returns Created unit
   */
  async createUnit(data: CreateUnitRequest): Promise<ApiResponse<LandlordUnit>> {
    // Units must be created under a specific property
    return apiClient.post<ApiResponse<LandlordUnit>>(`/properties/${data.property_id}/units`, data);
  }

  /**
   * Update unit information
   * 
   * @param unitId - UUID of the unit
   * @param data - Updated unit data
   * @returns Updated unit
   */
  async updateUnit(
    unitId: string,
    data: UpdateUnitRequest
  ): Promise<ApiResponse<LandlordUnit>> {
    return apiClient.put<ApiResponse<LandlordUnit>>(`/units/${unitId}`, data);
  }

  /**
   * Delete unit (soft delete)
   * 
   * @param unitId - UUID of the unit
   * @returns Success response
   */
  async deleteUnit(unitId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/units/${unitId}`);
  }

  // ============================================
  // ASSIGNMENT OPERATIONS
  // ============================================

  /**
   * Assign tenant to unit
   * 
   * @param propertyId - UUID of the property
   * @param unitId - UUID of the unit
   * @param data - Assignment data
   * @returns Updated unit
   */
  async assignUnit(
    propertyId: string,
    unitId: string,
    data: AssignUnitRequest
  ): Promise<ApiResponse<LandlordUnit>> {
    return apiClient.patch<ApiResponse<LandlordUnit>>(
      `/properties/${propertyId}/units/${unitId}/assign`,
      data
    );
  }

  /**
   * Assign tenant to unit
   * 
   * @param propertyId - UUID of the property
   * @param unitId - UUID of the unit
   * @param tenantId - UUID of the tenant
   * @returns Updated unit
   */
  async assignTenant(
    propertyId: string,
    unitId: string,
    tenantId: string
  ): Promise<ApiResponse<LandlordUnit>> {
    return this.assignUnit(propertyId, unitId, { tenant_id: tenantId });
  }

  /**
   * Assign caretaker to unit
   * 
   * @param propertyId - UUID of the property
   * @param unitId - UUID of the unit
   * @param caretakerId - UUID of the caretaker
   * @returns Updated unit
   */
  async assignCaretaker(
    propertyId: string,
    unitId: string,
    caretakerId: string
  ): Promise<ApiResponse<LandlordUnit>> {
    return this.assignUnit(propertyId, unitId, { caretaker_id: caretakerId });
  }

  /**
   * Remove tenant from unit (unassign)
   * 
   * @param propertyId - UUID of the property
   * @param unitId - UUID of the unit
   * @returns Updated unit
   */
  async removeTenant(
    propertyId: string,
    unitId: string
  ): Promise<ApiResponse<LandlordUnit>> {
    return apiClient.delete<ApiResponse<LandlordUnit>>(
      `/properties/${propertyId}/units/${unitId}/tenant`
    );
  }

  /**
   * Disable unit
   * 
   * @param propertyId - UUID of the property
   * @param unitId - UUID of the unit
   * @param reason - Reason for disabling the unit
   * @returns Updated unit
   */
  async disableUnit(
    propertyId: string,
    unitId: string,
    reason: string = "Disabled by landlord"
  ): Promise<ApiResponse<LandlordUnit>> {
    return apiClient.patch<ApiResponse<LandlordUnit>>(
      `/properties/${propertyId}/units/${unitId}/disable`,
      { reason }
    );
  }

  /**
   * Enable unit
   * 
   * @param propertyId - UUID of the property
   * @param unitId - UUID of the unit
   * @returns Updated unit
   */
  async enableUnit(
    propertyId: string,
    unitId: string
  ): Promise<ApiResponse<LandlordUnit>> {
    return apiClient.patch<ApiResponse<LandlordUnit>>(
      `/properties/${propertyId}/units/${unitId}/enable`
    );
  }

  /**
   * Get single unit with full details by unit ID only
   * 
   * @param unitId - UUID of the unit
   * @returns Unit with full details
   */
  async getUnitDetails(unitId: string): Promise<ApiResponse<LandlordUnit>> {
    return apiClient.get<ApiResponse<LandlordUnit>>(`/units/${unitId}`);
  }

  /**
   * Get single unit with full details
   * 
   * @param propertyId - UUID of the property
   * @param unitId - UUID of the unit
   * @returns Unit with full details
   */
  async getUnit(
    propertyId: string,
    unitId: string
  ): Promise<ApiResponse<LandlordUnit>> {
    return apiClient.get<ApiResponse<LandlordUnit>>(
      `/properties/${propertyId}/units/${unitId}`
    );
  }

  // ============================================
  // AVAILABILITY CHECKING
  // ============================================

  /**
   * Check if a unit is available
   * 
   * @param unitId - UUID of the unit
   * @returns Availability status
   */
  async checkAvailability(unitId: string): Promise<ApiResponse<{
    available: boolean;
    reason?: string;
  }>> {
    return apiClient.get<ApiResponse<{
      available: boolean;
      reason?: string;
    }>>(`/units/${unitId}/availability`);
  }

  /**
   * Bulk check availability for multiple units
   * 
   * @param unitIds - Array of unit UUIDs
   * @returns Availability status for each unit
   */
  async bulkCheckAvailability(unitIds: string[]): Promise<ApiResponse<{
    [unitId: string]: {
      available: boolean;
      reason?: string;
    };
  }>> {
    return apiClient.post<ApiResponse<{
      [unitId: string]: {
        available: boolean;
        reason?: string;
      };
    }>>("/units/check-availability", { unit_ids: unitIds });
  }

  // ============================================
  // STATISTICS & ANALYTICS
  // ============================================

  /**
   * Get unit statistics
   * 
   * @returns Unit statistics
   */
  async getStatistics(): Promise<ApiResponse<UnitStatistics>> {
    return apiClient.get<ApiResponse<UnitStatistics>>("/units/statistics");
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get units by property
   * 
   * @param propertyId - UUID of the property
   * @param params - Additional query parameters
   * @returns Paginated list of units in the property
   */
  async getUnitsByProperty(
    propertyId: string,
    params?: UnitQueryParams
  ): Promise<PaginatedResponse<LandlordUnit>> {
    return this.getUnits({ ...params, property_id: propertyId });
  }

  /**
   * Get available units only
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of available units
   */
  async getAvailableUnits(
    params?: UnitQueryParams
  ): Promise<PaginatedResponse<LandlordUnit>> {
    return this.getUnits({ ...params, is_occupied: false });
  }

  /**
   * Get occupied units only
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of occupied units
   */
  async getOccupiedUnits(
    params?: UnitQueryParams
  ): Promise<PaginatedResponse<LandlordUnit>> {
    return this.getUnits({ ...params, is_occupied: true });
  }

  /**
   * Get unit summary (basic info only)
   * 
   * @param unitId - UUID of the unit
   * @returns Simplified unit summary
   */
  async getUnitSummary(unitId: string): Promise<{
    id: string;
    unit_number: string;
    property_name: string;
    unit_type: string;
    rental_amount: number;
    is_occupied: boolean;
  }> {
    const response = await apiClient.get<ApiResponse<LandlordUnit>>(`/units/${unitId}`);
    const unit = response.data!;
    
    return {
      id: unit.id,
      unit_number: unit.unit_number,
      property_name: unit.property?.name || "Unknown Property",
      unit_type: unit.unit_type,
      rental_amount: unit.rental_amount,
      is_occupied: unit.is_occupied,
    };
  }

  /**
   * Get tenant for a unit
   * 
   * @param unitId - UUID of the unit
   * @returns Tenant details or null
   */
  async getUnitTenant(unitId: string): Promise<{
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null> {
    const response = await apiClient.get<ApiResponse<LandlordUnit>>(`/units/${unitId}`);
    return response.data?.tenant || null;
  }

  /**
   * Get caretaker for a unit
   * 
   * @param unitId - UUID of the unit
   * @returns Caretaker details or null
   */
  async getUnitCaretaker(unitId: string): Promise<{
    id: string;
    name: string;
    phone: string;
  } | null> {
    const response = await apiClient.get<ApiResponse<LandlordUnit>>(`/units/${unitId}`);
    return response.data?.caretaker || null;
  }

  /**
   * Calculate occupancy rate for all units
   * 
   * @returns Occupancy rate as percentage
   */
  async calculateOccupancyRate(): Promise<number> {
    const response = await this.getStatistics();
    const stats = response.data!;
    
    if (stats.total_units === 0) return 0;
    return (stats.occupied_units / stats.total_units) * 100;
  }

  /**
   * Calculate total monthly revenue from all units
   * 
   * @returns Total monthly revenue
   */
  async calculateTotalRevenue(): Promise<number> {
    const response = await this.getUnits({ is_occupied: true });
    const occupiedUnits = response.data || [];
    
    return occupiedUnits.reduce((total, unit) => total + unit.rental_amount, 0);
  }

  /**
   * Get units requiring maintenance
   * 
   * @returns Units with maintenance requests
   */
  async getUnitsRequiringMaintenance(): Promise<LandlordUnit[]> {
    // This would typically filter units with active maintenance requests
    // For now, return empty array as maintenance integration is separate
    return [];
  }

  /**
   * Search units by various criteria
   * 
   * @param query - Search query
   * @returns Matching units
   */
  async searchUnits(query: string): Promise<LandlordUnit[]> {
    const response = await this.getUnits();
    const allUnits = response.data || [];
    
    const lowercaseQuery = query.toLowerCase();
    return allUnits.filter(unit => 
      unit.unit_number.toLowerCase().includes(lowercaseQuery) ||
      unit.unit_type.toLowerCase().includes(lowercaseQuery) ||
      unit.property?.name?.toLowerCase().includes(lowercaseQuery) ||
      unit.tenant?.name?.toLowerCase().includes(lowercaseQuery)
    );
  }
}

// Export singleton instance
export const landlordUnitService = LandlordUnitService.getInstance();
export default landlordUnitService;