/**
 * Super Admin Properties Service
 * Handles property management across all landlords
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type { ApiResponse, PaginatedResponse } from "../api-types";

export interface SuperAdminProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  property_type: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  landlord: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  caretaker?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  units_count: number;
  occupied_units_count: number;
  vacant_units_count: number;
  units?: PropertyUnit[];
}

export interface PropertyUnit {
  id: string;
  property_id: string;
  unit_number: string;
  floor_number?: number;
  number_of_bedrooms: number;
  number_of_bathrooms: number;
  square_footage?: number;
  monthly_rent: number;
  is_occupied: boolean;
  is_active: boolean;
  tenant?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  lease?: {
    id: string;
    start_date: string;
    end_date: string;
    status: string;
  };
}

export interface PropertyStatistics {
  total_properties: number;
  active_properties: number;
  inactive_properties: number;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  active_units: number;
  inactive_units: number;
  by_property_type: Array<{
    property_type: string;
    count: number;
  }>;
}

export interface SuperAdminPropertiesQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: 'active' | 'inactive';
  landlord_id?: string;
}

export interface CreatePropertyRequest {
  name: string;
  landlord_id: string;
  description?: string;
  type: 'apartment' | 'house' | 'townhouse' | 'condo' | 'commercial';
  address: string;
  city: string;
  country: string;
  amenities?: string[];
}

export interface CreateUnitRequest {
  property_id: string;
  unit_number: string;
  type: 'studio' | 'one_bedroom' | 'two_bedroom' | 'three_bedroom' | 'four_bedroom' | 'penthouse' | 'shop' | 'office';
  monthly_rent: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  floor_number?: number;
  description?: string;
  amenities?: string[];
}

class SuperAdminPropertiesService {
  private static instance: SuperAdminPropertiesService;

  private constructor() {}

  static getInstance(): SuperAdminPropertiesService {
    if (!SuperAdminPropertiesService.instance) {
      SuperAdminPropertiesService.instance = new SuperAdminPropertiesService();
    }
    return SuperAdminPropertiesService.instance;
  }

  /**
   * Get all properties
   */
  async getAllProperties(
    params?: SuperAdminPropertiesQueryParams
  ): Promise<PaginatedResponse<SuperAdminProperty>> {
    const url = buildUrl("/super-admin/properties", params);
    return apiClient.get<PaginatedResponse<SuperAdminProperty>>(url);
  }

  /**
   * Get a specific property
   */
  async getProperty(propertyId: string): Promise<ApiResponse<SuperAdminProperty>> {
    return apiClient.get<ApiResponse<SuperAdminProperty>>(
      `/super-admin/properties/${propertyId}`
    );
  }

  /**
   * Toggle property status (active/inactive)
   */
  async togglePropertyStatus(propertyId: string): Promise<ApiResponse<SuperAdminProperty>> {
    return apiClient.patch<ApiResponse<SuperAdminProperty>>(
      `/super-admin/properties/${propertyId}/toggle-status`
    );
  }

  /**
   * Toggle unit status (active/inactive)
   */
  async toggleUnitStatus(unitId: string): Promise<ApiResponse<PropertyUnit>> {
    return apiClient.patch<ApiResponse<PropertyUnit>>(
      `/super-admin/properties/units/${unitId}/toggle-status`
    );
  }

  /**
   * Get all landlords (for filtering)
   */
  async getLandlords(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    email: string;
    properties_count: number;
  }>>> {
    return apiClient.get("/super-admin/properties/landlords");
  }

  /**
   * Get property statistics
   */
  async getStatistics(): Promise<ApiResponse<PropertyStatistics>> {
    return apiClient.get<ApiResponse<PropertyStatistics>>(
      "/super-admin/properties/statistics"
    );
  }

  /**
   * Create a new property
   */
  async createProperty(data: CreatePropertyRequest): Promise<ApiResponse<SuperAdminProperty>> {
    return apiClient.post<ApiResponse<SuperAdminProperty>>(
      "/super-admin/properties",
      data
    );
  }

  /**
   * Create a new unit
   */
  async createUnit(data: CreateUnitRequest): Promise<ApiResponse<PropertyUnit>> {
    return apiClient.post<ApiResponse<PropertyUnit>>(
      "/super-admin/units",
      data
    );
  }

  /**
   * Get properties list (for unit creation)
   */
  async getPropertiesList(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    address: string;
    city: string;
    type: string;
    landlord: {
      id: string;
      name: string;
      email: string;
    };
  }>>> {
    return apiClient.get("/super-admin/properties/list");
  }

  /**
   * Get all caretakers (for assignment)
   */
  async getCaretakers(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
  }>>> {
    return apiClient.get("/super-admin/properties/caretakers");
  }

  /**
   * Assign a caretaker to a property
   */
  async assignCaretaker(propertyId: string, caretakerId: string): Promise<ApiResponse<SuperAdminProperty>> {
    return apiClient.patch<ApiResponse<SuperAdminProperty>>(
      `/super-admin/properties/${propertyId}/assign-caretaker`,
      { caretaker_id: caretakerId }
    );
  }

  /**
   * Remove caretaker from a property
   */
  async removeCaretaker(propertyId: string): Promise<ApiResponse<SuperAdminProperty>> {
    return apiClient.delete<ApiResponse<SuperAdminProperty>>(
      `/super-admin/properties/${propertyId}/caretaker`
    );
  }
}

export const superAdminPropertiesService = SuperAdminPropertiesService.getInstance();
export default superAdminPropertiesService;

