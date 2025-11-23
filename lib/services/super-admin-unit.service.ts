/**
 * Super Admin Unit Service
 * Handles unit oversight across ALL properties and landlords
 * Following Single Responsibility Principle & SOLID
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  SystemUnit,
  SuperAdminUnitQueryParams,
  ApiResponse,
  PaginatedResponse,
} from "../api-types";

class SuperAdminUnitService {
  private static instance: SuperAdminUnitService;

  private constructor() {}

  static getInstance(): SuperAdminUnitService {
    if (!SuperAdminUnitService.instance) {
      SuperAdminUnitService.instance = new SuperAdminUnitService();
    }
    return SuperAdminUnitService.instance;
  }

  // ============================================
  // SYSTEM-WIDE UNIT QUERIES
  // ============================================

  /**
   * Get all units across ALL properties and landlords
   * System-wide view with complete context
   * 
   * @param params - Query parameters for filtering
   * @returns Paginated list of all units
   */
  async getAllUnits(
    params?: SuperAdminUnitQueryParams
  ): Promise<PaginatedResponse<SystemUnit>> {
    const url = buildUrl("/units", params);
    return apiClient.get<PaginatedResponse<SystemUnit>>(url);
  }

  /**
   * Get a specific unit by ID
   * 
   * @param unitId - UUID of the unit
   * @returns Unit details with full context
   */
  async getUnitDetails(unitId: string): Promise<ApiResponse<SystemUnit>> {
    return apiClient.get<ApiResponse<SystemUnit>>(`/units/${unitId}`);
  }

  /**
   * Get units by property
   * 
   * @param propertyId - UUID of the property
   * @param params - Additional query parameters
   * @returns Units in specified property
   */
  async getUnitsByProperty(
    propertyId: string,
    params?: SuperAdminUnitQueryParams
  ): Promise<PaginatedResponse<SystemUnit>> {
    return this.getAllUnits({ ...params, property_id: propertyId });
  }

  /**
   * Get units by landlord
   * 
   * @param landlordId - UUID of the landlord
   * @param params - Additional query parameters
   * @returns Units owned by specified landlord
   */
  async getUnitsByLandlord(
    landlordId: string,
    params?: SuperAdminUnitQueryParams
  ): Promise<PaginatedResponse<SystemUnit>> {
    return this.getAllUnits({ ...params, landlord_id: landlordId });
  }

  /**
   * Get occupied units
   * 
   * @param params - Additional query parameters
   * @returns All occupied units across system
   */
  async getOccupiedUnits(
    params?: SuperAdminUnitQueryParams
  ): Promise<PaginatedResponse<SystemUnit>> {
    return this.getAllUnits({ ...params, is_occupied: true });
  }

  /**
   * Get vacant units
   * 
   * @param params - Additional query parameters
   * @returns All vacant units across system
   */
  async getVacantUnits(
    params?: SuperAdminUnitQueryParams
  ): Promise<PaginatedResponse<SystemUnit>> {
    return this.getAllUnits({ ...params, is_occupied: false });
  }

  /**
   * Get active units
   * 
   * @param params - Additional query parameters
   * @returns All active units
   */
  async getActiveUnits(
    params?: SuperAdminUnitQueryParams
  ): Promise<PaginatedResponse<SystemUnit>> {
    return this.getAllUnits({ ...params, is_active: true });
  }

  /**
   * Get inactive units
   * 
   * @param params - Additional query parameters
   * @returns All inactive units
   */
  async getInactiveUnits(
    params?: SuperAdminUnitQueryParams
  ): Promise<PaginatedResponse<SystemUnit>> {
    return this.getAllUnits({ ...params, is_active: false });
  }

  /**
   * Get units by bedroom count
   * 
   * @param bedrooms - Number of bedrooms
   * @param params - Additional query parameters
   * @returns Units with specified bedroom count
   */
  async getUnitsByBedrooms(
    bedrooms: number,
    params?: SuperAdminUnitQueryParams
  ): Promise<PaginatedResponse<SystemUnit>> {
    return this.getAllUnits({ ...params, bedrooms });
  }

  /**
   * Get units by rent range
   * 
   * @param minRent - Minimum rent
   * @param maxRent - Maximum rent
   * @param params - Additional query parameters
   * @returns Units within rent range
   */
  async getUnitsByRentRange(
    minRent?: number,
    maxRent?: number,
    params?: SuperAdminUnitQueryParams
  ): Promise<PaginatedResponse<SystemUnit>> {
    return this.getAllUnits({
      ...params,
      min_rent: minRent,
      max_rent: maxRent,
    });
  }

  // ============================================
  // UNIT STATISTICS
  // ============================================

  /**
   * Get comprehensive unit statistics
   * 
   * @returns System-wide unit statistics
   */
  async getUnitStatistics(): Promise<ApiResponse<{
    total_units: number;
    occupied_units: number;
    vacant_units: number;
    active_units: number;
    inactive_units: number;
    overall_occupancy_rate: number;
    by_landlord: {
      landlord_id: string;
      landlord_name: string;
      total_units: number;
      occupied_units: number;
      occupancy_rate: number;
    }[];
    by_property: {
      property_id: string;
      property_name: string;
      landlord_name: string;
      total_units: number;
      occupied_units: number;
      occupancy_rate: number;
    }[];
    by_bedroom_count: Record<number, number>;
    average_rent: number;
    total_monthly_revenue: number;
  }>> {
    return apiClient.get("/units/statistics");
  }

  /**
   * Get unit statistics for a landlord
   * 
   * @param landlordId - UUID of the landlord
   * @returns Landlord-specific unit statistics
   */
  async getLandlordUnitStatistics(
    landlordId: string
  ): Promise<ApiResponse<{
    total_units: number;
    occupied_units: number;
    vacant_units: number;
    occupancy_rate: number;
    average_rent: number;
    total_monthly_revenue: number;
  }>> {
    return apiClient.get(`/landlords/${landlordId}/units/statistics`);
  }

  /**
   * Get unit statistics for a property
   * 
   * @param propertyId - UUID of the property
   * @returns Property-specific unit statistics
   */
  async getPropertyUnitStatistics(
    propertyId: string
  ): Promise<ApiResponse<{
    total_units: number;
    occupied_units: number;
    vacant_units: number;
    occupancy_rate: number;
    average_rent: number;
  }>> {
    return apiClient.get(`/properties/${propertyId}/units/statistics`);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get unit summary with key information
   * 
   * @param unitId - UUID of the unit
   * @returns Simplified unit summary
   */
  async getUnitSummary(unitId: string): Promise<{
    id: string;
    unit_number: string;
    property_name: string;
    landlord_name: string;
    monthly_rent: number;
    is_occupied: boolean;
    tenant_name?: string;
    bedrooms: number;
    bathrooms: number;
  }> {
    const response = await this.getUnitDetails(unitId);
    const unit = response.data!;

    return {
      id: unit.id,
      unit_number: unit.unit_number,
      property_name: unit.property.name,
      landlord_name: unit.property.landlord.name,
      monthly_rent: unit.monthly_rent,
      is_occupied: unit.is_occupied,
      tenant_name: unit.current_tenant?.name,
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
    };
  }

  /**
   * Get total unit count
   * 
   * @returns Total number of units in system
   */
  async getTotalUnitCount(): Promise<number> {
    const response = await this.getAllUnits({ per_page: 1 });
    return response.meta?.total || 0;
  }

  /**
   * Get unit count by landlord
   * 
   * @param landlordId - UUID of the landlord
   * @returns Number of units owned by landlord
   */
  async getUnitCountByLandlord(landlordId: string): Promise<number> {
    const response = await this.getUnitsByLandlord(landlordId, { per_page: 1 });
    return response.meta?.total || 0;
  }

  /**
   * Get unit count by property
   * 
   * @param propertyId - UUID of the property
   * @returns Number of units in property
   */
  async getUnitCountByProperty(propertyId: string): Promise<number> {
    const response = await this.getUnitsByProperty(propertyId, { per_page: 1 });
    return response.meta?.total || 0;
  }

  /**
   * Get vacant unit count
   * 
   * @returns Number of vacant units in system
   */
  async getVacantUnitCount(): Promise<number> {
    const response = await this.getVacantUnits({ per_page: 1 });
    return response.meta?.total || 0;
  }

  /**
   * Get occupied unit count
   * 
   * @returns Number of occupied units in system
   */
  async getOccupiedUnitCount(): Promise<number> {
    const response = await this.getOccupiedUnits({ per_page: 1 });
    return response.meta?.total || 0;
  }

  /**
   * Calculate system-wide occupancy rate
   * 
   * @returns Overall occupancy rate percentage
   */
  async calculateSystemOccupancyRate(): Promise<number> {
    const stats = await this.getUnitStatistics();
    const data = stats.data!;

    if (data.total_units === 0) return 0;
    return Math.round((data.occupied_units / data.total_units) * 100 * 10) / 10;
  }

  /**
   * Get current tenant for unit
   * 
   * @param unitId - UUID of the unit
   * @returns Current tenant or null
   */
  async getCurrentTenant(unitId: string): Promise<{
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null> {
    const unit = await this.getUnitDetails(unitId);
    return unit.data!.current_tenant || null;
  }

  /**
   * Check if unit is available
   * 
   * @param unitId - UUID of the unit
   * @returns Boolean indicating if unit is available
   */
  async isUnitAvailable(unitId: string): Promise<boolean> {
    const unit = await this.getUnitDetails(unitId);
    return !unit.data!.is_occupied && unit.data!.is_active;
  }

  /**
   * Get landlord for unit
   * 
   * @param unitId - UUID of the unit
   * @returns Landlord information
   */
  async getUnitLandlord(unitId: string): Promise<{
    id: string;
    name: string;
  }> {
    const unit = await this.getUnitDetails(unitId);
    return unit.data!.property.landlord;
  }

  /**
   * Get property for unit
   * 
   * @param unitId - UUID of the unit
   * @returns Property information
   */
  async getUnitProperty(unitId: string): Promise<{
    id: string;
    name: string;
    landlord: {
      id: string;
      name: string;
    };
  }> {
    const unit = await this.getUnitDetails(unitId);
    return unit.data!.property;
  }

  // ============================================
  // COMPARATIVE ANALYSIS
  // ============================================

  /**
   * Compare units by landlord
   * 
   * @returns Landlord comparison data
   */
  async compareLandlordUnits(): Promise<ApiResponse<{
    landlords: {
      landlord_id: string;
      landlord_name: string;
      total_units: number;
      occupied_units: number;
      vacant_units: number;
      occupancy_rate: number;
      average_rent: number;
      total_monthly_revenue: number;
    }[];
    system_averages: {
      avg_occupancy_rate: number;
      avg_rent: number;
    };
  }>> {
    return apiClient.get("/units/landlord-comparison");
  }

  /**
   * Get units needing attention (vacant for long time, etc.)
   * 
   * @returns Units requiring attention
   */
  async getUnitsNeedingAttention(): Promise<ApiResponse<SystemUnit[]>> {
    return apiClient.get<ApiResponse<SystemUnit[]>>("/units/needs-attention");
  }

  /**
   * Get high-revenue units
   * 
   * @param limit - Number of units to return
   * @returns Top revenue-generating units
   */
  async getHighRevenueUnits(limit: number = 10): Promise<ApiResponse<SystemUnit[]>> {
    return apiClient.get<ApiResponse<SystemUnit[]>>(
      `/units/high-revenue?limit=${limit}`
    );
  }

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  /**
   * Validate unit data
   * 
   * @param data - Unit data to validate
   * @returns Validation result
   */
  validateUnitData(data: {
    unit_number?: string;
    monthly_rent?: number;
    bedrooms?: number;
    bathrooms?: number;
  }): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (data.unit_number && data.unit_number.length < 1) {
      errors.push("Unit number is required");
    }

    if (data.monthly_rent !== undefined && data.monthly_rent <= 0) {
      errors.push("Monthly rent must be greater than 0");
    }

    if (data.bedrooms !== undefined && data.bedrooms < 0) {
      errors.push("Bedrooms cannot be negative");
    }

    if (data.bathrooms !== undefined && data.bathrooms < 0) {
      errors.push("Bathrooms cannot be negative");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const superAdminUnitService = SuperAdminUnitService.getInstance();
export default superAdminUnitService;

