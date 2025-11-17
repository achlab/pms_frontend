/**
 * Authentication Service
 * Handles all authentication-related API calls
 * Following Single Responsibility Principle
 */

import apiClient, { tokenManager } from "../api-client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyPasswordRequest,
  User,
  ApiResponse,
} from "../api-types";

class AuthenticationService {
  private static instance: AuthenticationService;

  private constructor() {}

  static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/login", {
      email,
      password,
    });

    // Store token and user data
    if (response.success && response.token) {
      tokenManager.setToken(response.token);
      tokenManager.setUserData(response.user);
    }

    return response;
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/register", data);

    // Store token and user data
    if (response.success && response.token) {
      tokenManager.setToken(response.token);
      tokenManager.setUserData(response.user);
    }

    return response;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.post<ApiResponse<null>>("/logout");
      return response;
    } finally {
      // Always clear local data even if API call fails
      tokenManager.clearAll();
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    return apiClient.post<ApiResponse<null>>("/password/forgot", { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<null>> {
    return apiClient.post<ApiResponse<null>>("/password/reset", data);
  }

  /**
   * Change current user's password
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<null>> {
    return apiClient.put<ApiResponse<null>>("/profile/password", data);
  }

  /**
   * Verify user's password
   */
  async verifyPassword(password: string): Promise<ApiResponse<{ valid: boolean }>> {
    return apiClient.post<ApiResponse<{ valid: boolean }>>("/profile/password/verify", {
      password,
    });
  }

  /**
   * Get current user from storage
   */
  getCurrentUser(): User | null {
    return tokenManager.getUserData();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!tokenManager.getToken();
  }

  /**
   * Get current auth token
   */
  getToken(): string | null {
    return tokenManager.getToken();
  }

  /**
   * Verify token validity (optional - can call a verify endpoint if available)
   */
  async verifyToken(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      // Try to get user profile to verify token
      const response = await apiClient.get<ApiResponse<User>>("/profile");
      
      if (response.success && response.data) {
        tokenManager.setUserData(response.data);
        return response.data;
      }

      return null;
    } catch (error) {
      // Token is invalid
      tokenManager.clearAll();
      return null;
    }
  }

  /**
   * Update stored user data
   */
  updateUserData(user: User): void {
    tokenManager.setUserData(user);
  }

  /**
   * Clear all authentication data
   */
  clearAuth(): void {
    tokenManager.clearAll();
  }
}

// Export singleton instance
export const authService = AuthenticationService.getInstance();
export default authService;

