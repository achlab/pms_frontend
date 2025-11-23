/**
 * Super Admin Property Service
 * Handles property oversight across ALL landlords
 * Following Single Responsibility Principle & SOLID
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  SystemProperty,
  SuperAdminPropertyQueryParams,
  ApiResponse,
  PaginatedResponse,
} from "../api-types";

class SuperAdminPropertyService {
  private static instance: SuperAdminPropertyService;

  private constructor() {}

  static getInstance(): SuperAdminPropertyService {
    if (!SuperAdminPropertyService.instance) {
      SuperAdminPropertyService.instance = new SuperAdminPropertyService();
    }
    return SuperAdminPropertyService.instance;
  }

  // ============================================
  // SYSTEM-WIDE PROPERTY QUERIES
  // ============================================

  /**
   * Get all properties across ALL landlords
   * System-wide view with landlord context
   * 
   * @param params - Query parameters for filtering
   * @returns Paginated list of all properties
   */
  async getAllProperties(
    params?: SuperAdminPropertyQueryParams
  ): Promise<PaginatedResponse<SystemProperty>> {
    const url = buildUrl("/properties", params);
    return apiClient.get<PaginatedResponse<SystemProperty>>(url);
  }

  /**
   * Get a specific property by ID
   * 
   * @param propertyId - UUID of the property
   * @returns Property details with landlord context
   */
  async getPropertyDetails(
    propertyId: string
  ): Promise<ApiResponse<SystemProperty>> {
    return apiClient.get<ApiResponse<SystemProperty>>(
      `/properties/${propertyId}`
    );
  }

  /**
   * Get properties by landlord
   * 
   * @param landlordId - UUID of the landlord
   * @param params - Additional query parameters
   * @returns Properties owned by specified landlord
   */
  async getPropertiesByLandlord(
    landlordId: string,
    params?: SuperAdminPropertyQueryParams
  ): Promise<PaginatedResponse<SystemProperty>> {
    return this.getAllProperties({ ...params, landlord_id: landlordId });
  }

  /**
   * Get active properties
   * 
   * @param params - Additional query parameters
   * @returns Active properties across all landlords
   */
  async getActiveProperties(
    params?: SuperAdminPropertyQueryParams
  ): Promise<PaginatedResponse<SystemProperty>> {
    return this.getAllProperties({ ...params, is_active: true });
  }

  /**
   * Get inactive properties
   * 
   * @param params - Additional query parameters
   * @returns Inactive properties
   */
  async getInactiveProperties(
    params?: SuperAdminPropertyQueryParams
  ): Promise<PaginatedResponse<SystemProperty>> {
    return this.getAllProperties({ ...params, is_active: false });
  }

  /**
   * Get properties with caretakers assigned
   * 
   * @param params - Additional query parameters
   * @returns Properties with caretakers
   */
  async getPropertiesWithCaretakers(
    params?: SuperAdminPropertyQueryParams
  ): Promise<PaginatedResponse<SystemProperty>> {
    return this.getAllProperties({ ...params, has_caretaker: true });
  }

  /**
   * Get properties without caretakers
   * 
   * @param params - Additional query parameters
   * @returns Properties without caretakers
   */
  async getPropertiesWithoutCaretakers(
    params?: SuperAdminPropertyQueryParams
  ): Promise<PaginatedResponse<SystemProperty>> {
    return this.getAllProperties({ ...params, has_caretaker: false });
  }

  /**
   * Search properties across all landlords
   * 
   * @param query - Search query
   * @param params - Additional query parameters
   * @returns Matching properties
   */
  async searchProperties(
    query: string,
    params?: SuperAdminPropertyQueryParams
  ): Promise<PaginatedResponse<SystemProperty>> {
    return this.getAllProperties({ ...params, search: query });
  }

  // ============================================
  // PROPERTY STATISTICS
  // ============================================

  /**
   * Get comprehensive property statistics
   * 
   * @returns System-wide property statistics
   */
  async getPropertyStatistics(): Promise<ApiResponse<{
    total_properties: number;
    active_properties: number;
    inactive_properties: number;
    properties_with_caretakers: number;
    properties_without_caretakers: number;
    by_landlord: {
      landlord_id: string;
      landlord_name: string;
      properties_count: number;
      active_count: number;
    }[];
    average_units_per_property: number;
    total_units: number;
    occupied_units: number;
    vacant_units: number;
    overall_occupancy_rate: number;
  }>> {
    return apiClient.get("/properties/statistics");
  }

  /**
   * Get property statistics for a specific landlord
   * 
   * @param landlordId - UUID of the landlord
   * @returns Landlord-specific property statistics
   */
  async getLandlordPropertyStatistics(
    landlordId: string
  ): Promise<ApiResponse<{
    total_properties: number;
    active_properties: number;
    total_units: number;
    occupied_units: number;
    occupancy_rate: number;
    monthly_revenue: number;
  }>> {
    return apiClient.get(`/landlords/${landlordId}/properties/statistics`);
  }

  /**
   * Get units for a property
   * 
   * @param propertyId - UUID of the property
   * @returns Units in the property
   */
  async getPropertyUnits(propertyId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>(
      `/properties/${propertyId}/units`
    );
  }

  /**
   * Get available units in a property
   * 
   * @param propertyId - UUID of the property
   * @returns Available units
   */
  async getAvailableUnitsInProperty(
    propertyId: string
  ): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>(
      `/properties/${propertyId}/available-units`
    );
  }

  // ============================================
  // PROPERTY PERFORMANCE & INSIGHTS
  // ============================================

  /**
   * Get top performing properties (by occupancy & revenue)
   * 
   * @param limit - Number of properties to return
   * @returns Top performing properties
   */
  async getTopPerformingProperties(
    limit: number = 10
  ): Promise<ApiResponse<SystemProperty[]>> {
    return apiClient.get<ApiResponse<SystemProperty[]>>(
      `/properties/top-performers?limit=${limit}`
    );
  }

  /**
   * Get underperforming properties
   * 
   * @param limit - Number of properties to return
   * @returns Underperforming properties
   */
  async getUnderperformingProperties(
    limit: number = 10
  ): Promise<ApiResponse<SystemProperty[]>> {
    return apiClient.get<ApiResponse<SystemProperty[]>>(
      `/properties/underperforming?limit=${limit}`
    );
  }

  /**
   * Get properties by occupancy rate range
   * 
   * @param minRate - Minimum occupancy rate
   * @param params - Additional query parameters
   * @returns Properties matching criteria
   */
  async getPropertiesByOccupancyRate(
    minRate: number,
    params?: SuperAdminPropertyQueryParams
  ): Promise<PaginatedResponse<SystemProperty>> {
    return this.getAllProperties({ ...params, min_occupancy_rate: minRate });
  }

  /**
   * Get properties by unit count range
   * 
   * @param minUnits - Minimum number of units
   * @param maxUnits - Maximum number of units
   * @param params - Additional query parameters
   * @returns Properties matching criteria
   */
  async getPropertiesByUnitCount(
    minUnits?: number,
    maxUnits?: number,
    params?: SuperAdminPropertyQueryParams
  ): Promise<PaginatedResponse<SystemProperty>> {
    return this.getAllProperties({
      ...params,
      min_units: minUnits,
      max_units: maxUnits,
    });
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get property summary with key information
   * 
   * @param propertyId - UUID of the property
   * @returns Simplified property summary
   */
  async getPropertySummary(propertyId: string): Promise<{
    id: string;
    name: string;
    landlord_name: string;
    landlord_email: string;
    caretaker_name?: string;
    total_units: number;
    occupied_units: number;
    occupancy_rate: number;
    monthly_revenue: number;
    is_active: boolean;
  }> {
    const response = await this.getPropertyDetails(propertyId);
    const property = response.data!;

    return {
      id: property.id,
      name: property.name,
      landlord_name: property.landlord.name,
      landlord_email: property.landlord.email,
      caretaker_name: property.caretaker?.name,
      total_units: property.total_units,
      occupied_units: property.occupied_units,
      occupancy_rate: property.occupancy_rate,
      monthly_revenue: property.monthly_revenue,
      is_active: property.is_active,
    };
  }

  /**
   * Get total property count
   * 
   * @returns Total number of properties in system
   */
  async getTotalPropertyCount(): Promise<number> {
    const response = await this.getAllProperties({ per_page: 1 });
    return response.meta?.total || 0;
  }

  /**
   * Get property count by landlord
   * 
   * @param landlordId - UUID of the landlord
   * @returns Number of properties owned by landlord
   */
  async getPropertyCountByLandlord(landlordId: string): Promise<number> {
    const response = await this.getPropertiesByLandlord(landlordId, {
      per_page: 1,
    });
    return response.meta?.total || 0;
  }

  /**
   * Calculate occupancy rate for property
   * 
   * @param propertyId - UUID of the property
   * @returns Occupancy rate percentage
   */
  async calculateOccupancyRate(propertyId: string): Promise<number> {
    const property = await this.getPropertyDetails(propertyId);
    const data = property.data!;

    if (data.total_units === 0) return 0;
    return Math.round((data.occupied_units / data.total_units) * 100 * 10) / 10;
  }

  /**
   * Check if property has vacant units
   * 
   * @param propertyId - UUID of the property
   * @returns Boolean indicating if property has vacant units
   */
  async hasVacantUnits(propertyId: string): Promise<boolean> {
    const property = await this.getPropertyDetails(propertyId);
    return property.data!.vacant_units > 0;
  }

  /**
   * Get landlord for property
   * 
   * @param propertyId - UUID of the property
   * @returns Landlord information
   */
  async getPropertyLandlord(propertyId: string): Promise<{
    id: string;
    name: string;
    email: string;
    phone: string;
  }> {
    const property = await this.getPropertyDetails(propertyId);
    return property.data!.landlord;
  }

  /**
   * Get caretaker for property
   * 
   * @param propertyId - UUID of the property
   * @returns Caretaker information or null
   */
  async getPropertyCaretaker(propertyId: string): Promise<{
    id: string;
    name: string;
    phone: string;
  } | null> {
    const property = await this.getPropertyDetails(propertyId);
    return property.data!.caretaker || null;
  }

  /**
   * Get landlord properties grouped by status
   * 
   * @param landlordId - UUID of the landlord
   * @returns Properties grouped by status
   */
  async getLandlordPropertiesGroupedByStatus(landlordId: string): Promise<{
    active: SystemProperty[];
    inactive: SystemProperty[];
  }> {
    const [activeResponse, inactiveResponse] = await Promise.all([
      this.getPropertiesByLandlord(landlordId, { is_active: true }),
      this.getPropertiesByLandlord(landlordId, { is_active: false }),
    ]);

    return {
      active: activeResponse.data || [],
      inactive: inactiveResponse.data || [],
    };
  }

  // ============================================
  // COMPARATIVE ANALYSIS
  // ============================================

  /**
   * Compare properties by landlord
   * 
   * @returns Landlord comparison data
   */
  async compareLandlordProperties(): Promise<ApiResponse<{
    landlords: {
      landlord_id: string;
      landlord_name: string;
      properties_count: number;
      total_units: number;
      occupied_units: number;
      occupancy_rate: number;
      monthly_revenue: number;
    }[];
    system_averages: {
      avg_properties_per_landlord: number;
      avg_units_per_property: number;
      avg_occupancy_rate: number;
    };
  }>> {
    return apiClient.get("/properties/landlord-comparison");
  }

  /**
   * Get properties needing attention (low occupancy, no caretaker, etc.)
   * 
   * @returns Properties requiring attention
   */
  async getPropertiesNeedingAttention(): Promise<ApiResponse<SystemProperty[]>> {
    return apiClient.get<ApiResponse<SystemProperty[]>>(
      "/properties/needs-attention"
    );
  }

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  /**
   * Validate property data
   * 
   * @param data - Property data to validate
   * @returns Validation result
   */
  validatePropertyData(data: {
    name?: string;
    landlord_id?: string;
  }): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (data.name && data.name.length < 2) {
      errors.push("Property name must be at least 2 characters");
    }

    if (data.landlord_id && data.landlord_id.length === 0) {
      errors.push("Landlord ID is required");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const superAdminPropertyService = SuperAdminPropertyService.getInstance();
export default superAdminPropertyService;

