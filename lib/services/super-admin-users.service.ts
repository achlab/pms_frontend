/**
 * Super Admin User Management Service
 * Handles creation of all user types
 */

import apiClient from "../api-client";
import type { ApiResponse, User } from "../api-types";

export interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  bio?: string;
}

class SuperAdminUsersService {
  private static instance: SuperAdminUsersService;

  private constructor() {}

  static getInstance(): SuperAdminUsersService {
    if (!SuperAdminUsersService.instance) {
      SuperAdminUsersService.instance = new SuperAdminUsersService();
    }
    return SuperAdminUsersService.instance;
  }

  /**
   * Create a new tenant
   */
  async createTenant(data: CreateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.post<ApiResponse<User>>(
      "/super-admin/users/tenants",
      data
    );
  }

  /**
   * Create a new landlord
   */
  async createLandlord(data: CreateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.post<ApiResponse<User>>(
      "/super-admin/users/landlords",
      data
    );
  }

  /**
   * Create a new caretaker
   */
  async createCaretaker(data: CreateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.post<ApiResponse<User>>(
      "/super-admin/users/caretakers",
      data
    );
  }
}

export const superAdminUsersService = SuperAdminUsersService.getInstance();
export default superAdminUsersService;

