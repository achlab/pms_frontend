/**
 * Landlord User Service
 * Handles user creation and management for landlords (Caretakers & Tenants)
 * Following Single Responsibility Principle & SOLID
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  AvailableTenant,
  ApiResponse,
  PaginatedResponse,
} from "../api-types";

/**
 * Query parameters for users
 */
export interface UserQueryParams {
  role?: "caretaker" | "tenant";
  is_active?: boolean;
  per_page?: number;
  page?: number;
}

class LandlordUserService {
  private static instance: LandlordUserService;

  private constructor() {}

  static getInstance(): LandlordUserService {
    if (!LandlordUserService.instance) {
      LandlordUserService.instance = new LandlordUserService();
    }
    return LandlordUserService.instance;
  }

  // ============================================
  // USER CREATION
  // ============================================

  /**
   * Create a new user (caretaker or tenant)
   * 
   * @param data - User creation data
   * @returns Created user with token
   */
  async createUser(data: CreateUserRequest): Promise<ApiResponse<{
    user: User;
    token: string;
  }>> {
    return apiClient.post<ApiResponse<{
      user: User;
      token: string;
    }>>("/users", data);
  }

  /**
   * Create a caretaker
   * Convenience method with pre-set role
   * 
   * @param data - Caretaker creation data
   * @returns Created caretaker with token
   */
  async createCaretaker(
    data: Omit<CreateUserRequest, "role">
  ): Promise<ApiResponse<{
    user: User;
    token: string;
  }>> {
    return this.createUser({ ...data, role: "caretaker" });
  }

  /**
   * Create a tenant
   * Convenience method with pre-set role
   * 
   * @param data - Tenant creation data
   * @returns Created tenant with token
   */
  async createTenant(
    data: Omit<CreateUserRequest, "role">
  ): Promise<ApiResponse<{
    user: User;
    token: string;
  }>> {
    return this.createUser({ ...data, role: "tenant" });
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  /**
   * Get all users managed by the landlord
   * 
   * @param params - Query parameters for filtering
   * @returns Paginated list of users
   */
  async getUsers(
    params?: UserQueryParams
  ): Promise<PaginatedResponse<User>> {
    const url = buildUrl("/users", params);
    return apiClient.get<PaginatedResponse<User>>(url);
  }

  /**
   * Get a specific user by ID
   * 
   * @param userId - UUID of the user
   * @returns User details
   */
  async getUser(userId: string): Promise<ApiResponse<User>> {
    return apiClient.get<ApiResponse<User>>(`/users/${userId}`);
  }

  /**
   * Update user information
   * 
   * @param userId - UUID of the user
   * @param data - Updated user data
   * @returns Updated user
   */
  async updateUser(
    userId: string,
    data: UpdateUserRequest
  ): Promise<ApiResponse<User>> {
    return apiClient.put<ApiResponse<User>>(`/users/${userId}`, data);
  }

  /**
   * Delete a user
   * 
   * @param userId - UUID of the user
   * @returns Success response
   */
  async deleteUser(userId: string): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/users/${userId}`);
  }

  // ============================================
  // USER STATUS MANAGEMENT
  // ============================================

  /**
   * Disable a user account
   * 
   * @param userId - UUID of the user
   * @returns Updated user
   */
  async disableUser(userId: string): Promise<ApiResponse<User>> {
    return apiClient.patch<ApiResponse<User>>(`/users/${userId}/disable`);
  }

  /**
   * Enable a user account
   * 
   * @param userId - UUID of the user
   * @returns Updated user
   */
  async enableUser(userId: string): Promise<ApiResponse<User>> {
    return apiClient.patch<ApiResponse<User>>(`/users/${userId}/enable`);
  }

  // ============================================
  // CARETAKER MANAGEMENT
  // ============================================

  /**
   * Get all caretakers
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of caretakers
   */
  async getCaretakers(
    params?: UserQueryParams
  ): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, role: "caretaker" });
  }

  /**
   * Get active caretakers
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of active caretakers
   */
  async getActiveCaretakers(
    params?: UserQueryParams
  ): Promise<PaginatedResponse<User>> {
    return this.getCaretakers({ ...params, is_active: true });
  }

  /**
   * Get available caretakers (not assigned to max properties)
   * 
   * @returns List of available caretakers
   */
  async getAvailableCaretakers(): Promise<ApiResponse<User[]>> {
    return apiClient.get<ApiResponse<User[]>>("/users/caretakers/available");
  }

  // ============================================
  // TENANT MANAGEMENT
  // ============================================

  /**
   * Get all tenants
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of tenants
   */
  async getTenants(
    params?: UserQueryParams
  ): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, role: "tenant" });
  }

  /**
   * Get active tenants
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of active tenants
   */
  async getActiveTenants(
    params?: UserQueryParams
  ): Promise<PaginatedResponse<User>> {
    return this.getTenants({ ...params, is_active: true });
  }

  /**
   * Get tenants without active leases
   * 
   * @returns List of unassigned tenants
   */
  async getUnassignedTenants(): Promise<ApiResponse<User[]>> {
    return apiClient.get<ApiResponse<User[]>>("/users/tenants/unassigned");
  }

  // ============================================
  // USER STATISTICS
  // ============================================

  /**
   * Get user statistics
   * 
   * @returns User statistics
   */
  async getStatistics(): Promise<ApiResponse<{
    total_users: number;
    total_caretakers: number;
    total_tenants: number;
    active_caretakers: number;
    active_tenants: number;
    inactive_users: number;
  }>> {
    return apiClient.get("/users/statistics");
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get user summary with key information
   * 
   * @param userId - UUID of the user
   * @returns Simplified user summary
   */
  async getUserSummary(userId: string): Promise<{
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    is_verified: boolean;
    is_active: boolean;
    created_at: string;
  }> {
    const response = await this.getUser(userId);
    const user = response.data!;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_verified: user.is_verified,
      is_active: true, // Assuming active if retrieved
      created_at: user.created_at,
    };
  }

  /**
   * Check if user is a caretaker
   * 
   * @param userId - UUID of the user
   * @returns Boolean indicating if user is a caretaker
   */
  async isCaretaker(userId: string): Promise<boolean> {
    const response = await this.getUser(userId);
    return response.data!.role === "caretaker";
  }

  /**
   * Check if user is a tenant
   * 
   * @param userId - UUID of the user
   * @returns Boolean indicating if user is a tenant
   */
  async isTenant(userId: string): Promise<boolean> {
    const response = await this.getUser(userId);
    return response.data!.role === "tenant";
  }

  /**
   * Get user's assigned properties (for caretakers)
   * 
   * @param userId - UUID of the caretaker
   * @returns List of assigned properties
   */
  async getUserProperties(userId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>(`/users/${userId}/properties`);
  }

  /**
   * Get user's active lease (for tenants)
   * 
   * @param userId - UUID of the tenant
   * @returns Active lease or null
   */
  async getUserLease(userId: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/users/${userId}/lease`);
  }

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  /**
   * Validate user data before creation/update
   * 
   * @param data - User data to validate
   * @returns Validation result
   */
  validateUserData(data: CreateUserRequest | UpdateUserRequest): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if ('name' in data && data.name) {
      if (data.name.length < 2) {
        errors.push("Name must be at least 2 characters");
      }
    }

    if ('email' in data && (data as CreateUserRequest).email) {
      const email = (data as CreateUserRequest).email;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push("Invalid email format");
      }
    }

    if ('phone' in data && data.phone) {
      if (data.phone.length < 10) {
        errors.push("Phone number must be at least 10 characters");
      }
    }

    if ('password' in data && (data as CreateUserRequest).password) {
      const password = (data as CreateUserRequest).password;
      if (password.length < 8) {
        errors.push("Password must be at least 8 characters");
      }
    }

    if ('password_confirmation' in data && (data as CreateUserRequest).password_confirmation) {
      const password = (data as CreateUserRequest).password;
      const confirmation = (data as CreateUserRequest).password_confirmation;
      if (password !== confirmation) {
        errors.push("Password and confirmation do not match");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email uniqueness
   * 
   * @param email - Email to check
   * @returns Boolean indicating if email is available
   */
  async isEmailAvailable(email: string): Promise<boolean> {
    try {
      const response = await apiClient.post<ApiResponse<{ available: boolean }>>(
        "/users/check-email",
        { email }
      );
      return response.data!.available;
    } catch {
      return false;
    }
  }

  /**
   * Get available tenants for assignment
   * 
   * @returns List of available tenants
   */
  async getAvailableTenants(): Promise<ApiResponse<AvailableTenant[]>> {
    return apiClient.get<ApiResponse<AvailableTenant[]>>("/tenants/available");
  }
}

// Export singleton instance
export const landlordUserService = LandlordUserService.getInstance();
export default landlordUserService;

