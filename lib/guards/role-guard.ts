/**
 * Role Guard
 * Provides role-based access control utilities
 * Following SOLID principles with clear separation of concerns
 */

import type { UserRole, User } from "../api-types";
import { hasRouteAccess, getDefaultRoute, isPublicRoute } from "../constants/routes";

// ============================================
// PERMISSION DEFINITIONS
// ============================================

export type Permission = 
  // User Management
  | "users:create"
  | "users:read"
  | "users:update"
  | "users:delete"
  | "users:create:all_roles"     // Super Admin only
  | "users:create:landlord"      // Super Admin only
  | "users:create:caretaker"     // Landlord + Super Admin
  | "users:create:tenant"        // Landlord + Super Admin
  // Property Management
  | "properties:create"
  | "properties:read"
  | "properties:update"
  | "properties:delete"
  | "properties:read:all"        // Super Admin only
  // Unit Management
  | "units:create"
  | "units:read"
  | "units:update"
  | "units:delete"
  // Lease Management
  | "leases:create"
  | "leases:read"
  | "leases:update"
  | "leases:delete"
  // Invoice Management
  | "invoices:create"
  | "invoices:read"
  | "invoices:update"
  | "invoices:delete"
  // Payment Management
  | "payments:create"
  | "payments:read"
  | "payments:update"
  // Maintenance Management
  | "maintenance:create"
  | "maintenance:read"
  | "maintenance:update"
  | "maintenance:delete"
  | "maintenance:assign"         // Landlord only
  | "maintenance:approve"        // Landlord only
  // Analytics & Reports
  | "analytics:read"
  | "analytics:read:all"         // Super Admin only
  | "reports:generate"
  // System Settings
  | "settings:read"
  | "settings:update"
  | "settings:system"            // Super Admin only;

// ============================================
// ROLE PERMISSIONS MAPPING
// ============================================

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    // Super Admin has ALL permissions
    "users:create",
    "users:read",
    "users:update",
    "users:delete",
    "users:create:all_roles",
    "users:create:landlord",
    "users:create:caretaker",
    "users:create:tenant",
    "properties:create",
    "properties:read",
    "properties:update",
    "properties:delete",
    "properties:read:all",
    "units:create",
    "units:read",
    "units:update",
    "units:delete",
    "leases:create",
    "leases:read",
    "leases:update",
    "leases:delete",
    "invoices:create",
    "invoices:read",
    "invoices:update",
    "invoices:delete",
    "payments:create",
    "payments:read",
    "payments:update",
    "maintenance:create",
    "maintenance:read",
    "maintenance:update",
    "maintenance:delete",
    "maintenance:assign",
    "maintenance:approve",
    "analytics:read",
    "analytics:read:all",
    "reports:generate",
    "settings:read",
    "settings:update",
    "settings:system",
  ],
  landlord: [
    // User Management (create caretakers and tenants only)
    "users:create:caretaker",
    "users:create:tenant",
    "users:read",
    "users:update",
    // Property Management (their own properties)
    "properties:create",
    "properties:read",
    "properties:update",
    "properties:delete",
    // Unit Management
    "units:create",
    "units:read",
    "units:update",
    "units:delete",
    // Lease Management
    "leases:create",
    "leases:read",
    "leases:update",
    "leases:delete",
    // Invoice Management
    "invoices:create",
    "invoices:read",
    "invoices:update",
    "invoices:delete",
    // Payment Management
    "payments:read",
    "payments:update",
    // Maintenance Management (can assign and approve)
    "maintenance:read",
    "maintenance:update",
    "maintenance:assign",
    "maintenance:approve",
    // Analytics & Reports
    "analytics:read",
    "reports:generate",
    // Settings
    "settings:read",
    "settings:update",
  ],
  caretaker: [
    // Limited user read
    "users:read",
    // Property (read-only for assigned properties)
    "properties:read",
    // Unit (read-only)
    "units:read",
    // Lease (read-only)
    "leases:read",
    // Maintenance (primary responsibility)
    "maintenance:create",
    "maintenance:read",
    "maintenance:update",
    // Basic settings
    "settings:read",
  ],
  tenant: [
    // Property/Unit (read-only for their unit)
    "properties:read",
    "units:read",
    // Lease (read-only their lease)
    "leases:read",
    // Invoice (read their invoices)
    "invoices:read",
    // Payment (create and read their payments)
    "payments:create",
    "payments:read",
    // Maintenance (create and track requests)
    "maintenance:create",
    "maintenance:read",
    // Basic settings
    "settings:read",
  ],
};

// ============================================
// GUARD CLASS
// ============================================

export class RoleGuard {
  /**
   * Check if user has a specific permission
   */
  static hasPermission(user: User | null, permission: Permission): boolean {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role];
    return permissions.includes(permission);
  }

  /**
   * Check if user has ANY of the specified permissions
   */
  static hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
    if (!user) return false;
    return permissions.some((permission) => this.hasPermission(user, permission));
  }

  /**
   * Check if user has ALL of the specified permissions
   */
  static hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
    if (!user) return false;
    return permissions.every((permission) => this.hasPermission(user, permission));
  }

  /**
   * Check if user can access a specific route
   */
  static canAccessRoute(user: User | null, path: string): boolean {
    // Public routes are accessible to everyone
    if (isPublicRoute(path)) {
      return true;
    }

    // Protected routes require authentication
    if (!user) {
      return false;
    }

    return hasRouteAccess(user.role, path);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(user: User | null): boolean {
    return user !== null;
  }

  /**
   * Check if user has a specific role
   */
  static hasRole(user: User | null, role: UserRole): boolean {
    return user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  static hasAnyRole(user: User | null, roles: UserRole[]): boolean {
    if (!user) return false;
    return roles.includes(user.role);
  }

  /**
   * Check if user is Super Admin
   */
  static isSuperAdmin(user: User | null): boolean {
    return this.hasRole(user, "super_admin");
  }

  /**
   * Check if user is Landlord
   */
  static isLandlord(user: User | null): boolean {
    return this.hasRole(user, "landlord");
  }

  /**
   * Check if user is Caretaker
   */
  static isCaretaker(user: User | null): boolean {
    return this.hasRole(user, "caretaker");
  }

  /**
   * Check if user is Tenant
   */
  static isTenant(user: User | null): boolean {
    return this.hasRole(user, "tenant");
  }

  /**
   * Get redirect path for unauthorized access
   */
  static getUnauthorizedRedirect(user: User | null, attemptedPath: string): string {
    if (!user) {
      return `/login?redirect=${encodeURIComponent(attemptedPath)}`;
    }
    return getDefaultRoute(user.role);
  }

  /**
   * Check if user owns a resource (by landlord_id)
   */
  static ownsResource(user: User | null, resourceLandlordId: string | null): boolean {
    if (!user) return false;
    
    // Super Admin can access all resources
    if (this.isSuperAdmin(user)) return true;
    
    // Check if user is the owner
    if (this.isLandlord(user)) {
      return user.id === resourceLandlordId;
    }
    
    // Caretaker and Tenant check against their landlord_id
    return user.landlord_id === resourceLandlordId;
  }

  /**
   * Get all permissions for a role
   */
  static getRolePermissions(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role];
  }
}

// ============================================
// EXPORT FOR CONVENIENCE
// ============================================

export default RoleGuard;

