import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the current path
  const path = request.nextUrl.pathname

  // Get user data from cookies
  const userCookie = request.cookies.get('auth_user')?.value
  console.log('Middleware - Raw cookie value:', userCookie)
  
  let user = null
  if (userCookie) {
    try {
      const decodedUserStr = decodeURIComponent(userCookie)
      user = JSON.parse(decodedUserStr)
      console.log('Middleware - Parsed user:', user)
    } catch (error) {
      console.error('Middleware - Error parsing user cookie:', error)
    }
  }

  console.log('Middleware - Path:', path)
  console.log('Middleware - User:', user)

  // If no user is logged in and trying to access protected routes
  if (!user && path !== '/login' && path !== '/register') {
    console.log('Middleware - No user, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is logged in and accessing login/register pages
  if (user && (path === '/login' || path === '/register')) {
    console.log('Middleware - User already logged in, redirecting to dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user is logged in and accessing root dashboard
  if (user && path === '/dashboard') {
    console.log('Middleware - Redirecting to role-specific dashboard')
    const dashboardPath = (() => {
      switch (user.role) {
        case 'super_admin':
          return '/admin/dashboard'
        case 'landlord':
          return '/landlord/dashboard'
        case 'caretaker':
          return '/caretaker/dashboard'
        case 'tenant':
          return '/tenant/dashboard'
        default:
          return '/dashboard'
      }
    })()

    if (dashboardPath !== '/dashboard') {
      return NextResponse.redirect(new URL(dashboardPath, request.url))
    }
  }

  // Role-based access protection
  if (user) {
    const roleBasedPaths = {
      super_admin: ['/admin'],
      landlord: ['/landlord'],
      caretaker: ['/caretaker'],
      tenant: ['/tenant'],
    }

    const userRole = user.role as keyof typeof roleBasedPaths
    const allowedPaths = roleBasedPaths[userRole] || []
    const isAccessingOtherRolePath = Object.entries(roleBasedPaths)
      .filter(([role]) => role !== userRole)
      .some(([_, paths]) => paths.some(p => path.startsWith(p)))

    if (isAccessingOtherRolePath) {
      console.log('Middleware - Invalid role access, redirecting to appropriate dashboard')
      return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url))
    }
  }

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