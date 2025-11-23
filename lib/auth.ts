/**
 * Authentication Service - Legacy Compatibility Layer
 * This file maintains backward compatibility while using the new API service
 * Re-exports types and wraps the new auth service
 */

import { authService } from "./services/auth.service";
import type { User as ApiUser } from "./api-types";

// Re-export User type with legacy compatibility
export interface User {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "landlord" | "tenant" | "caretaker";
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Convert API user to legacy User format
 */
function convertApiUserToLegacyUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    role: apiUser.role as "super_admin" | "landlord" | "tenant" | "caretaker",
    phone: apiUser.phone,
    avatar: apiUser.profile_picture || undefined,
    isVerified: apiUser.is_verified,
    createdAt: apiUser.created_at,
  };
}

/**
 * Authentication Service - Wrapper around the new API service
 * Maintains backward compatibility with existing code
 */
export class AuthService {
  // Login with email/phone and password
  static async login(emailOrPhone: string, password: string): Promise<{ user: User; token: string }> {
    const response = await authService.login(emailOrPhone, password);
    const user = convertApiUserToLegacyUser(response.user);
    return { user, token: response.token };
  }

  // Register new user
  static async register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
    role: "landlord" | "tenant";
  }): Promise<{ user: User; token: string }> {
    const response = await authService.register({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      password_confirmation: data.password,
      address: data.address,
      role: data.role,
    });
    const user = convertApiUserToLegacyUser(response.user);
    return { user, token: response.token };
  }

  // Social media authentication
  static async socialAuth(
    provider: "google" | "facebook",
    role?: "landlord" | "tenant"
  ): Promise<{ user: User; token: string }> {
    // Social auth not yet implemented in API
    // TODO: Implement when backend endpoint is available
    throw new Error("Social authentication is not yet available. Please use email/password login.");
  }

  // Logout
  static async logout(): Promise<void> {
    await authService.logout();
  }

  // Verify token and get user
  static async verifyToken(): Promise<User | null> {
    const apiUser = await authService.verifyToken();
    if (!apiUser) return null;
    return convertApiUserToLegacyUser(apiUser);
  }

  // Forgot password
  static async forgotPassword(email: string): Promise<void> {
    await authService.forgotPassword(email);
  }

  // Get stored token
  static getToken(): string | null {
    return authService.getToken();
  }

  // Get stored user
  static getStoredUser(): User | null {
    const apiUser = authService.getCurrentUser();
    if (!apiUser) return null;
    return convertApiUserToLegacyUser(apiUser);
  }

  // Store token (deprecated - handled by authService)
  static setToken(token: string): void {
    console.warn("AuthService.setToken is deprecated. Token is managed by the API client.");
  }

  // Store user (deprecated - handled by authService)
  static setStoredUser(user: User): void {
    console.warn("AuthService.setStoredUser is deprecated. User is managed by the API client.");
  }

  // Remove token and user (deprecated - use logout)
  static removeToken(): void {
    authService.clearAuth();
  }
}
