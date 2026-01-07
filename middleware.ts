import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware for role-based access control
 * Note: Due to Edge runtime limitations, we use cookies for middleware auth check
 * The AuthContext provider handles the actual localStorage auth
 */

type UserRole = 'super_admin' | 'landlord' | 'caretaker' | 'tenant'

interface User {
  id: string
  role: UserRole
  email: string
  name: string
  isVerified?: boolean
  is_verified?: boolean // API might use snake_case
}

// Public routes (no authentication required)
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/',
]

// Role-specific protected route prefixes
const ROLE_ROUTE_PREFIXES: Record<UserRole, string[]> = {
  super_admin: ['/admin'],
  landlord: ['/landlord'],
  caretaker: ['/caretaker'],
  tenant: ['/tenant'],
}

// Shared routes accessible by all authenticated users
// Keep maintenance shared because caretakers/tenants use it;
// landlords/super_admins will be redirected from the page logic.
const SHARED_ROUTES = ['/profile', '/settings', '/maintenance']

// Default dashboard routes per role
const DEFAULT_DASHBOARDS: Record<UserRole, string> = {
  super_admin: '/admin/dashboard',
  landlord: '/landlord/dashboard',
  caretaker: '/caretaker/dashboard',
  tenant: '/tenant/dashboard',
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    path === route || (route === '/' && path === '/')
  )

  // Try to get user from cookie (set by AuthContext on login)
  const authToken = request.cookies.get('auth_token')?.value
  const userCookie = request.cookies.get('auth_user')?.value
  
  let user: User | null = null
  if (userCookie) {
    try {
      user = JSON.parse(decodeURIComponent(userCookie))
    } catch (error) {
      console.error('Middleware - Error parsing user cookie:', error)
    }
  }

  // ============================================
  // 1. UNAUTHENTICATED ACCESS
  // ============================================
  
  if (!user || !authToken) {
    // Allow access to public routes
    if (isPublicRoute) {
      return NextResponse.next()
    }
    
    // Redirect to login with return URL
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  // ============================================
  // 2. AUTHENTICATED ACCESS TO PUBLIC ROUTES
  // ============================================

  // Check if user is verified (handle both camelCase and snake_case)
  const isVerified = user.isVerified === true || user.is_verified === true // Only verified if explicitly true

  // Redirect logged-in users away from login/register
  if (path === '/login' || path === '/register') {
    if (isVerified) {
      return NextResponse.redirect(new URL(DEFAULT_DASHBOARDS[user.role], request.url))
    } else {
      // Unverified users stay on login/register pages
      return NextResponse.next()
    }
  }

  // Redirect from root to role-specific dashboard (only if verified)
  if (path === '/' || path === '/dashboard') {
    if (isVerified) {
      return NextResponse.redirect(new URL(DEFAULT_DASHBOARDS[user.role], request.url))
    } else {
      // Unverified users go to login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // ============================================
  // 3. ROLE-BASED ACCESS CONTROL
  // ============================================

  // Check if user is verified - unverified users can only access public routes
  if (!isVerified) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('message', 'Please verify your email before accessing the dashboard')
    return NextResponse.redirect(loginUrl)
  }

  // Check if accessing a shared route
  const isSharedRoute = SHARED_ROUTES.some(route => path.startsWith(route))
  if (isSharedRoute) {
    return NextResponse.next()
  }

  // Check if user is accessing a route for their role
  const userRolePrefixes = ROLE_ROUTE_PREFIXES[user.role] || []
  const hasAccessToRoute = userRolePrefixes.some(prefix => path.startsWith(prefix))

  if (hasAccessToRoute) {
    return NextResponse.next()
  }

  // Check if trying to access another role's routes
  const isAccessingOtherRoleRoute = Object.entries(ROLE_ROUTE_PREFIXES)
    .filter(([role]) => role !== user.role)
    .some(([_, prefixes]) => prefixes.some(prefix => path.startsWith(prefix)))

  if (isAccessingOtherRoleRoute) {
    // Redirect to user's default dashboard
    return NextResponse.redirect(new URL(DEFAULT_DASHBOARDS[user.role], request.url))
  }

  // ============================================
  // 4. ALLOW ACCESS (Shared routes or valid paths)
  // ============================================
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}