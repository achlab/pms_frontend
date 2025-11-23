/**
 * Landlord Property Service
 * Handles all property management operations for landlords (Full CRUD)
 * Following Single Responsibility Principle & SOLID
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  LandlordProperty,
  LandlordUnit,
  CreatePropertyRequest,
  UpdatePropertyRequest,
  PropertyFinancials,
  ApiResponse,
} from "../api-types";

class LandlordPropertyService {
  private static instance: LandlordPropertyService;

  private constructor() {}

  static getInstance(): LandlordPropertyService {
    if (!LandlordPropertyService.instance) {
      LandlordPropertyService.instance = new LandlordPropertyService();
    }
    return LandlordPropertyService.instance;
  }

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  /**
   * Get all properties owned by the landlord
   * 
   * @returns List of all properties
   */
  async getProperties(): Promise<ApiResponse<LandlordProperty[]>> {
    return apiClient.get<ApiResponse<LandlordProperty[]>>("/properties");
  }

  /**
   * Create a new property
   * 
   * @param data - Property creation data
   * @returns Created property
   */
  async createProperty(
    data: CreatePropertyRequest
  ): Promise<ApiResponse<LandlordProperty>> {
    return apiClient.post<ApiResponse<LandlordProperty>>("/properties", data);
  }

  /**
   * Get detailed information about a specific property
   * 
   * @param propertyId - UUID of the property
   * @returns Property details with units
   */
  async getProperty(propertyId: string): Promise<ApiResponse<LandlordProperty>> {
    return apiClient.get<ApiResponse<LandlordProperty>>(
      `/properties/${propertyId}`
    );
  }

  /**
   * Update property information
   * 
   * @param propertyId - UUID of the property
   * @param data - Updated property data
   * @returns Updated property
   */
  async updateProperty(
    propertyId: string,
    data: UpdatePropertyRequest
  ): Promise<ApiResponse<LandlordProperty>> {
    return apiClient.put<ApiResponse<LandlordProperty>>(
      `/properties/${propertyId}`,
      data
    );
  }

  /**
   * Delete a property
   * 
   * @param propertyId - UUID of the property
   * @returns Success response
   */
  async deleteProperty(propertyId: string): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/properties/${propertyId}`);
  }

  // ============================================
  // PROPERTY STATUS MANAGEMENT
  // ============================================

  /**
   * Disable a property (soft delete)
   * 
   * @param propertyId - UUID of the property
   * @returns Updated property
   */
  async disableProperty(propertyId: string): Promise<ApiResponse<LandlordProperty>> {
    return apiClient.patch<ApiResponse<LandlordProperty>>(
      `/properties/${propertyId}/disable`
    );
  }

  /**
   * Enable a previously disabled property
   * 
   * @param propertyId - UUID of the property
   * @returns Updated property
   */
  async enableProperty(propertyId: string): Promise<ApiResponse<LandlordProperty>> {
    return apiClient.patch<ApiResponse<LandlordProperty>>(
      `/properties/${propertyId}/enable`
    );
  }

  // ============================================
  // PROPERTY UNITS
  // ============================================

  /**
   * Get all units in a property
   * 
   * @param propertyId - UUID of the property
   * @returns List of units in the property
   */
  async getPropertyUnits(propertyId: string): Promise<ApiResponse<LandlordUnit[]>> {
    return apiClient.get<ApiResponse<LandlordUnit[]>>(
      `/properties/${propertyId}/units`
    );
  }

  /**
   * Get available units in a property
   * Units that are not occupied and active
   * 
   * @param propertyId - UUID of the property
   * @returns List of available units
   */
  async getAvailableUnits(propertyId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>(
      `/properties/${propertyId}/available-units`
    );
  }

  // ============================================
  // PROPERTY STATISTICS
  // ============================================

  /**
   * Get property-specific statistics
   * 
   * @param propertyId - UUID of the property
   * @returns Property statistics including occupancy, revenue, etc.
   */
  async getPropertyStatistics(propertyId: string): Promise<ApiResponse<{
    total_units: number;
    occupied_units: number;
    vacant_units: number;
    occupancy_rate: number;
    monthly_revenue: number;
    active_leases: number;
    maintenance_requests: number;
  }>> {
    return apiClient.get(
      `/properties/${propertyId}/statistics`
    );
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get property summary with calculated stats
   * Combines property data with key metrics
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
    verification_status: string;
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
      address: property.street_address,
      total_units: property.total_units,
      occupied_units: property.occupied_units,
      vacant_units: vacantUnits,
      occupancy_rate: Math.round(occupancyRate * 100) / 100,
      verification_status: property.verification_status,
    };
  }

  /**
   * Check if property has vacant units
   * 
   * @param propertyId - UUID of the property
   * @returns Boolean indicating if property has vacant units
   */
  async hasVacantUnits(propertyId: string): Promise<boolean> {
    const response = await this.getProperty(propertyId);
    const property = response.data!;
    return property.occupied_units < property.total_units;
  }

  /**
   * Get caretaker assigned to property
   * 
   * @param propertyId - UUID of the property
   * @returns Caretaker details or null
   */
  async getPropertyCaretaker(propertyId: string): Promise<{
    id: string;
    name: string;
    phone: string;
    email?: string;
  } | null> {
    const response = await this.getProperty(propertyId);
    return response.data!.caretaker || null;
  }

  /**
   * Assign or update caretaker for a property
   * 
   * @param propertyId - UUID of the property
   * @param caretakerId - UUID of the caretaker
   * @returns Updated property
   */
  async assignCaretaker(
    propertyId: string,
    caretakerId: string
  ): Promise<ApiResponse<LandlordProperty>> {
    return this.updateProperty(propertyId, { caretaker_id: caretakerId });
  }

  /**
   * Remove caretaker from property
   * 
   * @param propertyId - UUID of the property
   * @returns Updated property
   */
  async removeCaretaker(propertyId: string): Promise<ApiResponse<LandlordProperty>> {
    return this.updateProperty(propertyId, { caretaker_id: undefined });
  }

  /**
   * Get single property with full details
   * 
   * @param propertyId - UUID of the property
   * @returns Property with full details
   */
  async getProperty(propertyId: string): Promise<ApiResponse<LandlordProperty>> {
    return apiClient.get<ApiResponse<LandlordProperty>>(`/properties/${propertyId}`);
  }

  /**
   * Disable property
   * 
   * @param propertyId - UUID of the property
   * @returns Updated property
   */
  async disableProperty(propertyId: string): Promise<ApiResponse<LandlordProperty>> {
    return apiClient.patch<ApiResponse<LandlordProperty>>(`/properties/${propertyId}/disable`);
  }

  /**
   * Enable property
   * 
   * @param propertyId - UUID of the property
   * @returns Updated property
   */
  async enableProperty(propertyId: string): Promise<ApiResponse<LandlordProperty>> {
    return apiClient.patch<ApiResponse<LandlordProperty>>(`/properties/${propertyId}/enable`);
  }

  /**
   * Get property financial details
   * 
   * @param propertyId - UUID of the property
   * @returns Financial analytics
   */
  async getPropertyFinancials(propertyId: string): Promise<ApiResponse<PropertyFinancials>> {
    return apiClient.get<ApiResponse<PropertyFinancials>>(`/properties/${propertyId}/financials`);
  }

  /**
   * Get comprehensive property statistics
   * 
   * @param propertyId - UUID of the property
   * @returns Property statistics including units, revenue, tenants
   */
  async getPropertyStatistics(propertyId: string): Promise<ApiResponse<{
    property_id: string;
    property_name: string;
    is_active: boolean;
    units: {
      total: number;
      active: number;
      disabled: number;
      occupied: number;
      vacant: number;
      occupancy_rate: number;
    };
    revenue: {
      monthly_revenue: number;
      potential_revenue: number;
      lost_revenue: number;
      revenue_efficiency: number;
    };
    tenants: {
      total: number;
      list: Array<{
        id: string;
        name: string;
        email: string;
        phone: string;
      }>;
    };
    unit_types: Array<{
      type: string;
      total: number;
      occupied: number;
      disabled: number;
      average_rent: number;
    }>;
    caretaker: {
      id: string;
      name: string;
      phone: string;
    } | null;
    last_updated: string;
  }>> {
    return apiClient.get<ApiResponse<any>>(`/properties/${propertyId}/statistics`);
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  /**
   * Get properties with filters
   * Useful for dashboard and reports
   * 
   * @param filters - Filter criteria
   * @returns Filtered list of properties
   */
  async getPropertiesWithFilters(filters: {
    verification_status?: string;
    has_vacant_units?: boolean;
    has_caretaker?: boolean;
  }): Promise<LandlordProperty[]> {
    const allProperties = await this.getProperties();
    let properties = allProperties.data || [];

    if (filters.verification_status) {
      properties = properties.filter(
        (p) => p.verification_status === filters.verification_status
      );
    }

    if (filters.has_vacant_units !== undefined) {
      properties = properties.filter((p) => {
        const hasVacant = p.occupied_units < p.total_units;
        return filters.has_vacant_units ? hasVacant : !hasVacant;
      });
    }

    if (filters.has_caretaker !== undefined) {
      properties = properties.filter((p) => {
        const hasCaretaker = !!p.caretaker;
        return filters.has_caretaker ? hasCaretaker : !hasCaretaker;
      });
    }

    return properties;
  }

  /**
   * Get properties sorted by occupancy rate
   * 
   * @param ascending - Sort order (default: descending)
   * @returns Sorted list of properties
   */
  async getPropertiesByOccupancy(ascending: boolean = false): Promise<LandlordProperty[]> {
    const allProperties = await this.getProperties();
    const properties = allProperties.data || [];

    return properties.sort((a, b) => {
      const rateA = a.total_units > 0 ? (a.occupied_units / a.total_units) : 0;
      const rateB = b.total_units > 0 ? (b.occupied_units / b.total_units) : 0;
      return ascending ? rateA - rateB : rateB - rateA;
    });
  }

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  /**
   * Validate property before creation/update
   * 
   * @param data - Property data to validate
   * @returns Validation result
   */
  validatePropertyData(data: CreatePropertyRequest | UpdatePropertyRequest): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if ('name' in data && data.name) {
      if (data.name.length < 3) {
        errors.push("Property name must be at least 3 characters");
      }
      if (data.name.length > 255) {
        errors.push("Property name must not exceed 255 characters");
      }
    }

    if ('street_address' in data && data.street_address) {
      if (data.street_address.length < 5) {
        errors.push("Street address must be at least 5 characters");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const landlordPropertyService = LandlordPropertyService.getInstance();
export default landlordPropertyService;

