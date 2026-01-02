/**
 * Caretaker Property Service
 * Handles property and unit management for caretakers (read-only)
 * Following Single Responsibility Principle & SOLID
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  CaretakerProperty,
  CaretakerUnit,
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

class CaretakerPropertyService {
  private static instance: CaretakerPropertyService;

  private constructor() {}

  static getInstance(): CaretakerPropertyService {
    if (!CaretakerPropertyService.instance) {
      CaretakerPropertyService.instance = new CaretakerPropertyService();
    }
    return CaretakerPropertyService.instance;
  }

  // ============================================
  // PROPERTY OPERATIONS (READ-ONLY)
  // ============================================

  /**
   * Get all properties assigned to the caretaker
   * Returns only properties where the caretaker is assigned (via units)
   *
   * @returns List of assigned properties
   */
  async getProperties(): Promise<ApiResponse<CaretakerProperty[]>> {
    return apiClient.get<ApiResponse<CaretakerProperty[]>>("caretaker/properties");
  }

  /**
   * Get detailed information about a specific property
   *
   * @param propertyId - UUID of the property
   * @returns Property details
   */
  async getProperty(propertyId: string): Promise<ApiResponse<CaretakerProperty>> {
    return apiClient.get<ApiResponse<CaretakerProperty>>(
      `caretaker/properties/${propertyId}`
    );
  }

  /**
   * Get all units in a specific property
   *
   * @param propertyId - UUID of the property
   * @returns List of units in the property
   */
  async getPropertyUnits(propertyId: string): Promise<ApiResponse<CaretakerUnit[]>> {
    return apiClient.get<ApiResponse<CaretakerUnit[]>>(
      `caretaker/properties/${propertyId}/units`
    );
  }

  // ============================================
  // UNIT OPERATIONS (READ-ONLY)
  // ============================================

  /**
   * Get all units assigned to the caretaker
   * Supports filtering by property, occupancy status, etc.
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of units
   */
  async getUnits(
    params?: UnitQueryParams
  ): Promise<PaginatedResponse<CaretakerUnit>> {
    const url = buildUrl("caretaker/units", params);
    return apiClient.get<PaginatedResponse<CaretakerUnit>>(url);
  }

  /**
   * Get detailed information about a specific unit
   *
   * @param unitId - UUID of the unit
   * @returns Unit details
   */
  async getUnit(unitId: string): Promise<ApiResponse<CaretakerUnit>> {
    return apiClient.get<ApiResponse<CaretakerUnit>>(`caretaker/units/${unitId}`);
  }

  // ============================================
  // FILTERING HELPERS
  // ============================================

  /**
   * Get occupied units
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of occupied units
   */
  async getOccupiedUnits(
    params?: UnitQueryParams
  ): Promise<PaginatedResponse<CaretakerUnit>> {
    return this.getUnits({ ...params, is_occupied: true });
  }

  /**
   * Get vacant units
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of vacant units
   */
  async getVacantUnits(
    params?: UnitQueryParams
  ): Promise<PaginatedResponse<CaretakerUnit>> {
    return this.getUnits({ ...params, is_occupied: false });
  }

  /**
   * Get units for a specific property (alternative method)
   * 
   * @param propertyId - UUID of the property
   * @param params - Additional query parameters
   * @returns Paginated list of units in the property
   */
  async getUnitsByProperty(
    propertyId: string,
    params?: UnitQueryParams
  ): Promise<PaginatedResponse<CaretakerUnit>> {
    return this.getUnits({ ...params, property_id: propertyId });
  }

  /**
   * Get active units only
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of active units
   */
  async getActiveUnits(
    params?: UnitQueryParams
  ): Promise<PaginatedResponse<CaretakerUnit>> {
    return this.getUnits({ ...params, is_active: true });
  }

  // ============================================
  // SUMMARY & STATISTICS
  // ============================================

  /**
   * Get property summary
   * Extracts key information from property data
   * 
   * @param propertyId - UUID of the property
   * @returns Simplified property summary
   */
  async getPropertySummary(propertyId: string): Promise<{
    id: string;
    name: string;
    address: string;
    total_units: number;
    occupied_units: number;
    vacant_units: number;
    occupancy_rate: number;
  }> {
    const response = await this.getProperty(propertyId);
    const property = response.data!;

    const vacantUnits = property.total_units - property.occupied_units;
    const occupancyRate = property.total_units > 0
      ? (property.occupied_units / property.total_units) * 100
      : 0;

    return {
      id: property.id,
      name: property.name,
      address: property.address,
      total_units: property.total_units,
      occupied_units: property.occupied_units,
      vacant_units: vacantUnits,
      occupancy_rate: Math.round(occupancyRate * 100) / 100,
    };
  }

  /**
   * Get landlord contact information for a property
   * Useful for communication
   * 
   * @param propertyId - UUID of the property
   * @returns Landlord contact details
   */
  async getLandlordContact(propertyId: string): Promise<{
    id: string;
    name: string;
    email: string;
    phone: string;
  }> {
    const response = await this.getProperty(propertyId);
    return response.data!.landlord;
  }
}

// Export singleton instance
export const caretakerPropertyService = CaretakerPropertyService.getInstance();
export default caretakerPropertyService;

