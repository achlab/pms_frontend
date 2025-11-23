/**
 * Super Admin User Service
 * Handles user management operations for super admins (Create ALL roles)
 * Following Single Responsibility Principle & SOLID
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type {
  SuperAdminCreateUserRequest,
  SuperAdminUser,
  SuperAdminUserQueryParams,
  UserStatistics,
  UserRole,
  ApiResponse,
  PaginatedResponse,
} from "../api-types";

class SuperAdminUserService {
  private static instance: SuperAdminUserService;

  private constructor() {}

  static getInstance(): SuperAdminUserService {
    if (!SuperAdminUserService.instance) {
      SuperAdminUserService.instance = new SuperAdminUserService();
    }
    return SuperAdminUserService.instance;
  }

  // ============================================
  // UNIVERSAL USER CREATION (ALL ROLES)
  // ============================================

  /**
   * Create any type of user (super_admin, landlord, caretaker, tenant)
   * Super admins have full user creation privileges
   * 
   * @param data - User creation data with role selection
   * @returns Created user with token
   */
  async createUser(
    data: SuperAdminCreateUserRequest
  ): Promise<ApiResponse<{ user: SuperAdminUser; token: string }>> {
    return apiClient.post<ApiResponse<{ user: SuperAdminUser; token: string }>>(
      "/users",
      data
    );
  }

  /**
   * Create a landlord
   * Convenience method with pre-set role
   * 
   * @param data - Landlord creation data
   * @returns Created landlord with token
   */
  async createLandlord(
    data: Omit<SuperAdminCreateUserRequest, "role">
  ): Promise<ApiResponse<{ user: SuperAdminUser; token: string }>> {
    return apiClient.post<ApiResponse<{ user: SuperAdminUser; token: string }>>(
      "/landlords",
      { ...data, role: "landlord" }
    );
  }

  /**
   * Create a caretaker (must specify landlord)
   * 
   * @param data - Caretaker creation data
   * @param landlordId - ID of the landlord to assign to
   * @returns Created caretaker with token
   */
  async createCaretaker(
    data: Omit<SuperAdminCreateUserRequest, "role" | "landlord_id">,
    landlordId: string
  ): Promise<ApiResponse<{ user: SuperAdminUser; token: string }>> {
    return this.createUser({
      ...data,
      role: "caretaker",
      landlord_id: landlordId,
    });
  }

  /**
   * Create a tenant (must specify landlord)
   * 
   * @param data - Tenant creation data
   * @param landlordId - ID of the landlord to assign to
   * @returns Created tenant with token
   */
  async createTenant(
    data: Omit<SuperAdminCreateUserRequest, "role" | "landlord_id">,
    landlordId: string
  ): Promise<ApiResponse<{ user: SuperAdminUser; token: string }>> {
    return this.createUser({
      ...data,
      role: "tenant",
      landlord_id: landlordId,
    });
  }

  /**
   * Create another super admin
   * Only super admins can create other super admins
   * 
   * @param data - Super admin creation data
   * @returns Created super admin with token
   */
  async createSuperAdmin(
    data: Omit<SuperAdminCreateUserRequest, "role" | "landlord_id">
  ): Promise<ApiResponse<{ user: SuperAdminUser; token: string }>> {
    return this.createUser({
      ...data,
      role: "super_admin",
    });
  }

  // ============================================
  // USER QUERIES (SYSTEM-WIDE)
  // ============================================

  /**
   * Get all users in the system
   * 
   * @param params - Query parameters for filtering
   * @returns Paginated list of users
   */
  async getAllUsers(
    params?: SuperAdminUserQueryParams
  ): Promise<PaginatedResponse<SuperAdminUser>> {
    const url = buildUrl("/users", params);
    return apiClient.get<PaginatedResponse<SuperAdminUser>>(url);
  }

  /**
   * Get a specific user by ID
   * 
   * @param userId - UUID of the user
   * @returns User details
   */
  async getUserDetails(userId: string): Promise<ApiResponse<SuperAdminUser>> {
    return apiClient.get<ApiResponse<SuperAdminUser>>(`/users/${userId}`);
  }

  /**
   * Get users by role
   * 
   * @param role - User role to filter by
   * @param params - Additional query parameters
   * @returns Paginated list of users with specified role
   */
  async getUsersByRole(
    role: UserRole,
    params?: SuperAdminUserQueryParams
  ): Promise<PaginatedResponse<SuperAdminUser>> {
    return this.getAllUsers({ ...params, role });
  }

  /**
   * Search users across all roles
   * 
   * @param query - Search query
   * @param params - Additional query parameters
   * @returns Paginated search results
   */
  async searchUsers(
    query: string,
    params?: SuperAdminUserQueryParams
  ): Promise<PaginatedResponse<SuperAdminUser>> {
    return this.getAllUsers({ ...params, search: query });
  }

  // ============================================
  // LANDLORD QUERIES
  // ============================================

  /**
   * Get all landlords in the system
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of landlords
   */
  async getAllLandlords(
    params?: SuperAdminUserQueryParams
  ): Promise<PaginatedResponse<SuperAdminUser>> {
    return this.getUsersByRole("landlord", params);
  }

  /**
   * Get landlords with properties
   * 
   * @param params - Additional query parameters
   * @returns Landlords who own properties
   */
  async getLandlordsWithProperties(
    params?: SuperAdminUserQueryParams
  ): Promise<PaginatedResponse<SuperAdminUser>> {
    return this.getAllLandlords({ ...params, has_properties: true });
  }

  /**
   * Get landlords without properties
   * 
   * @param params - Additional query parameters
   * @returns Landlords without any properties
   */
  async getLandlordsWithoutProperties(
    params?: SuperAdminUserQueryParams
  ): Promise<PaginatedResponse<SuperAdminUser>> {
    return this.getAllLandlords({ ...params, has_properties: false });
  }

  /**
   * Get active landlords
   * 
   * @param params - Additional query parameters
   * @returns Active landlords only
   */
  async getActiveLandlords(
    params?: SuperAdminUserQueryParams
  ): Promise<PaginatedResponse<SuperAdminUser>> {
    return this.getAllLandlords({ ...params, is_active: true });
  }

  // ============================================
  // CARETAKER QUERIES
  // ============================================

  /**
   * Get all caretakers in the system
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of caretakers
   */
  async getAllCaretakers(
    params?: SuperAdminUserQueryParams
  ): Promise<PaginatedResponse<SuperAdminUser>> {
    return this.getUsersByRole("caretaker", params);
  }

  /**
   * Get caretakers by landlord
   * 
   * @param landlordId - ID of the landlord
   * @param params - Additional query parameters
   * @returns Caretakers belonging to specified landlord
   */
  async getCaretakersByLandlord(
    landlordId: string,
    params?: SuperAdminUserQueryParams
  ): Promise<PaginatedResponse<SuperAdminUser>> {
    return this.getAllCaretakers({ ...params, landlord_id: landlordId });
  }

  /**
   * Get assigned caretakers (those with properties)
   * 
   * @param params - Additional query parameters
   * @returns Caretakers assigned to properties
   */
  async getAssignedCaretakers(
    params?: SuperAdminUserQueryParams
  ): Promise<PaginatedResponse<SuperAdminUser>> {
    return this.getAllCaretakers({ ...params, is_assigned: true });
  }

  /**
   * Get unassigned caretakers
   * 
   * @param params - Additional query parameters
   * @returns Caretakers not assigned to any property
   */
  async getUnassignedCaretakers(
    params?: SuperAdminUserQueryParams
  ): Promise<PaginatedResponse<SuperAdminUser>> {
    return this.getAllCaretakers({ ...params, is_assigned: false });
  }

  // ============================================
  // TENANT QUERIES
  // ============================================

  /**
   * Get all tenants in the system
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of tenants
   */
  async getAllTenants(
    params?: SuperAdminUserQueryParams
  ): Promise<PaginatedResponse<SuperAdminUser>> {
    return this.getUsersByRole("tenant", params);
  }

  /**
   * Get tenants by landlord
   * 
   * @param landlordId - ID of the landlord
   * @param params - Additional query parameters
   * @returns Tenants belonging to specified landlord
   */
  async getTenantsByLandlord(
    landlordId: string,
    params?: SuperAdminUserQueryParams
  ): Promise<PaginatedResponse<SuperAdminUser>> {
    return this.getAllTenants({ ...params, landlord_id: landlordId });
  }

  /**
   * Get tenants with active leases
   * 
   * @param params - Additional query parameters
   * @returns Tenants who have active leases
   */
  async getTenantsWithLeases(
    params?: SuperAdminUserQueryParams
  ): Promise<PaginatedResponse<SuperAdminUser>> {
    return this.getAllTenants({ ...params, has_lease: true });
  }

  /**
   * Get tenants without leases
   * 
   * @param params - Additional query parameters
   * @returns Tenants without active leases
   */
  async getTenantsWithoutLeases(
    params?: SuperAdminUserQueryParams
  ): Promise<PaginatedResponse<SuperAdminUser>> {
    return this.getAllTenants({ ...params, has_lease: false });
  }

  // ============================================
  // SUPER ADMIN QUERIES
  // ============================================

  /**
   * Get all super admins
   * 
   * @param params - Additional query parameters
   * @returns Paginated list of super admins
   */
  async getAllSuperAdmins(
    params?: SuperAdminUserQueryParams
  ): Promise<PaginatedResponse<SuperAdminUser>> {
    return this.getUsersByRole("super_admin", params);
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  /**
   * Update user information
   * 
   * @param userId - UUID of the user
   * @param data - Updated user data
   * @returns Updated user
   */
  async updateUser(
    userId: string,
    data: Partial<SuperAdminCreateUserRequest>
  ): Promise<ApiResponse<SuperAdminUser>> {
    return apiClient.put<ApiResponse<SuperAdminUser>>(
      `/users/${userId}`,
      data
    );
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

  /**
   * Disable a user account
   * 
   * @param userId - UUID of the user
   * @returns Updated user
   */
  async disableUser(userId: string): Promise<ApiResponse<SuperAdminUser>> {
    return apiClient.patch<ApiResponse<SuperAdminUser>>(
      `/users/${userId}/disable`
    );
  }

  /**
   * Enable a user account
   * 
   * @param userId - UUID of the user
   * @returns Updated user
   */
  async enableUser(userId: string): Promise<ApiResponse<SuperAdminUser>> {
    return apiClient.patch<ApiResponse<SuperAdminUser>>(
      `/users/${userId}/enable`
    );
  }

  /**
   * Reset user password
   * 
   * @param userId - UUID of the user
   * @returns Success response
   */
  async resetUserPassword(userId: string): Promise<ApiResponse<{ temporary_password: string }>> {
    return apiClient.post<ApiResponse<{ temporary_password: string }>>(
      `/users/${userId}/reset-password`
    );
  }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get comprehensive user statistics
   * 
   * @returns User statistics by role
   */
  async getUserStatistics(): Promise<ApiResponse<UserStatistics>> {
    return apiClient.get<ApiResponse<UserStatistics>>("/users/statistics");
  }

  /**
   * Get recently created users
   * 
   * @param days - Number of days to look back (default: 30)
   * @returns Recently created users
   */
  async getRecentlyCreatedUsers(
    days: number = 30
  ): Promise<PaginatedResponse<SuperAdminUser>> {
    return this.getAllUsers({ per_page: 50 });
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get user count by role
   * 
   * @param role - User role
   * @returns Count of users with specified role
   */
  async getUserCountByRole(role: UserRole): Promise<number> {
    const response = await this.getUsersByRole(role, { per_page: 1 });
    return response.meta?.total || 0;
  }

  /**
   * Get total user count
   * 
   * @returns Total number of users in system
   */
  async getTotalUserCount(): Promise<number> {
    const response = await this.getAllUsers({ per_page: 1 });
    return response.meta?.total || 0;
  }

  /**
   * Check if email is available
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
   * Verify user email
   * 
   * @param userId - UUID of the user
   * @returns Success response
   */
  async verifyUserEmail(userId: string): Promise<ApiResponse<SuperAdminUser>> {
    return apiClient.post<ApiResponse<SuperAdminUser>>(
      `/users/${userId}/verify-email`
    );
  }

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
    role: UserRole;
    is_verified: boolean;
    is_active: boolean;
    landlord_name?: string;
    properties_count?: number;
    created_at: string;
  }> {
    const response = await this.getUserDetails(userId);
    const user = response.data!;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_verified: user.is_verified,
      is_active: true, // Assuming active if retrieved
      landlord_name: user.landlord?.name,
      properties_count: user.properties_count,
      created_at: user.created_at,
    };
  }

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  /**
   * Validate user creation data
   * 
   * @param data - User data to validate
   * @returns Validation result
   */
  validateUserData(data: SuperAdminCreateUserRequest): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Basic validation
    if (!data.name || data.name.length < 2) {
      errors.push("Name must be at least 2 characters");
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("Invalid email format");
    }

    if (!data.phone || data.phone.length < 10) {
      errors.push("Phone number must be at least 10 characters");
    }

    if (!data.password || data.password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (data.password !== data.password_confirmation) {
      errors.push("Password and confirmation do not match");
    }

    // Role-specific validation
    if ((data.role === "caretaker" || data.role === "tenant") && !data.landlord_id) {
      errors.push(`${data.role} must be assigned to a landlord`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if role requires landlord assignment
   * 
   * @param role - User role to check
   * @returns Boolean indicating if landlord is required
   */
  requiresLandlord(role: UserRole): boolean {
    return role === "caretaker" || role === "tenant";
  }
}

// Export singleton instance
export const superAdminUserService = SuperAdminUserService.getInstance();
export default superAdminUserService;

