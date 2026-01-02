/**
 * Route Constants
 * Defines role-based route mappings and access control
 * Following KISS and DRY principles
 */

import type { UserRole } from "../api-types";

// ============================================
// ROUTE DEFINITIONS
// ============================================

export const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
] as const;

export const PROTECTED_ROUTES = {
  super_admin: [
    "/admin/dashboard",
    "/admin/users",
    "/admin/properties",
    "/admin/settings",
    "/admin/activity",
    "/admin/disputes",
  ],
  landlord: [
    "/landlord/dashboard",
    "/landlord/properties",
    "/landlord/units",
    "/landlord/tenants",
    "/landlord/invoices",
    "/landlord/payments",
    "/landlord/payment-methods",
    "/landlord/maintenance",
    "/landlord/rent-roll",
    "/landlord/reports",
    "/landlord/profile",
    "/settings",
  ],
  caretaker: [
    "/caretaker/dashboard",
    "/maintenance",
    "/maintenance/create",
    "/maintenance-requests",
    "/my-unit",
    "/profile",
    "/settings",
  ],
  tenant: [
    "/tenant/dashboard",
    "/tenant/profile",
    "/dashboard",
    "/my-lease",
    "/my-unit",
    "/pay-rent",
    "/payments-invoices",
    "/maintenance/create",
    "/maintenance-requests",
    "/meter-readings",
    "/profile",
    "/settings",
  ],
} as const;

// ============================================
// DEFAULT DASHBOARD ROUTES (After Login)
// ============================================

export const DEFAULT_ROUTES: Record<UserRole, string> = {
  super_admin: "/admin/dashboard",
  landlord: "/landlord/dashboard",
  caretaker: "/caretaker/dashboard",
  tenant: "/tenant/dashboard",
};

// ============================================
// SHARED ROUTES (Accessible by multiple roles)
// ============================================

export const SHARED_ROUTES = [
  "/profile",
  "/profile/edit",
  "/settings",
] as const;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get the default dashboard route for a user role
 */
export function getDefaultRoute(role: UserRole): string {
  return DEFAULT_ROUTES[role];
}

/**
 * Check if a route is public (no authentication required)
 */
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((route) => path.startsWith(route));
}

/**
 * Check if a route is shared across roles
 */
export function isSharedRoute(path: string): boolean {
  return SHARED_ROUTES.some((route) => path.startsWith(route));
}

/**
 * Check if a user has access to a specific route
 */
export function hasRouteAccess(role: UserRole, path: string): boolean {
  // Public routes are accessible to everyone
  if (isPublicRoute(path)) {
    return true;
  }

  // Shared routes are accessible to all authenticated users
  if (isSharedRoute(path)) {
    return true;
  }

  // Check role-specific routes
  const roleRoutes = PROTECTED_ROUTES[role];
  return roleRoutes.some((route) => path.startsWith(route));
}

/**
 * Get allowed routes for a specific role
 */
export function getAllowedRoutes(role: UserRole): readonly string[] {
  return [...PROTECTED_ROUTES[role], ...SHARED_ROUTES];
}

/**
 * Determine where to redirect based on current path and user role
 */
export function getRedirectPath(currentPath: string, role: UserRole | null): string {
  // If not authenticated, redirect to login
  if (!role) {
    return `/login?redirect=${encodeURIComponent(currentPath)}`;
  }

  // If trying to access a route they don't have permission for
  if (!hasRouteAccess(role, currentPath)) {
    return getDefaultRoute(role);
  }

  // User has access, no redirect needed
  return currentPath;
}

/**
 * Check if user can access admin routes
 */
export function isAdmin(role: UserRole): boolean {
  return role === "super_admin";
}

/**
 * Check if user can access landlord routes
 */
export function isLandlord(role: UserRole): boolean {
  return role === "landlord" || role === "super_admin";
}

/**
 * Check if user can access caretaker routes
 */
export function isCaretaker(role: UserRole): boolean {
  return role === "caretaker" || role === "super_admin";
}

/**
 * Check if user can access tenant routes
 */
export function isTenant(role: UserRole): boolean {
  return role === "tenant" || role === "super_admin";
}

/**
 * Get user-friendly role name
 */
export function getRoleName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    super_admin: "Super Admin",
    landlord: "Landlord",
    caretaker: "Caretaker",
    tenant: "Tenant",
  };
  return roleNames[role];
}

