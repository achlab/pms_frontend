/**
 * useRoleAccess Hook
 * React hook for role-based access control in components
 * Following React hooks best practices
 */

import { useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { RoleGuard, type Permission } from "../guards/role-guard";
import type { UserRole } from "../api-types";

export function useRoleAccess() {
  const { user, isAuthenticated } = useAuth();

  // Memoize role checks to avoid unnecessary recalculations
  const roleChecks = useMemo(() => ({
    isSuperAdmin: RoleGuard.isSuperAdmin(user),
    isLandlord: RoleGuard.isLandlord(user),
    isCaretaker: RoleGuard.isCaretaker(user),
    isTenant: RoleGuard.isTenant(user),
  }), [user]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: Permission): boolean => {
    return RoleGuard.hasPermission(user, permission);
  };

  /**
   * Check if user has ANY of the specified permissions
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return RoleGuard.hasAnyPermission(user, permissions);
  };

  /**
   * Check if user has ALL of the specified permissions
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return RoleGuard.hasAllPermissions(user, permissions);
  };

  /**
   * Check if user can access a specific route
   */
  const canAccessRoute = (path: string): boolean => {
    return RoleGuard.canAccessRoute(user, path);
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: UserRole): boolean => {
    return RoleGuard.hasRole(user, role);
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return RoleGuard.hasAnyRole(user, roles);
  };

  /**
   * Check if user owns a resource
   */
  const ownsResource = (resourceLandlordId: string | null): boolean => {
    return RoleGuard.ownsResource(user, resourceLandlordId);
  };

  /**
   * Get user's role (null if not authenticated)
   */
  const role = user?.role || null;

  /**
   * Get user's role name
   */
  const roleName = user?.role ? getRoleName(user.role) : null;

  return {
    // User info
    user,
    role,
    roleName,
    isAuthenticated,

    // Role checks
    ...roleChecks,

    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Route checks
    canAccessRoute,

    // Role comparisons
    hasRole,
    hasAnyRole,

    // Resource ownership
    ownsResource,
  };
}

/**
 * Get user-friendly role name
 */
function getRoleName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    super_admin: "Super Admin",
    landlord: "Landlord",
    caretaker: "Caretaker",
    tenant: "Tenant",
  };
  return roleNames[role];
}

/**
 * Hook to require specific permissions
 * Throws error if user doesn't have required permissions
 * Useful for protecting components
 */
export function useRequirePermission(permission: Permission | Permission[]) {
  const { hasPermission, hasAllPermissions } = useRoleAccess();

  const permissions = Array.isArray(permission) ? permission : [permission];
  const hasAccess = Array.isArray(permission) 
    ? hasAllPermissions(permissions)
    : hasPermission(permission);

  if (!hasAccess) {
    throw new Error(`Unauthorized: Missing required permission(s)`);
  }

  return true;
}

/**
 * Hook to require specific role
 * Throws error if user doesn't have required role
 */
export function useRequireRole(role: UserRole | UserRole[]) {
  const { hasRole, hasAnyRole } = useRoleAccess();

  const hasAccess = Array.isArray(role) ? hasAnyRole(role) : hasRole(role);

  if (!hasAccess) {
    throw new Error(`Unauthorized: Required role not met`);
  }

  return true;
}

// Export default
export default useRoleAccess;

