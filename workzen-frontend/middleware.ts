import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register']

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/admin', '/hr', '/payroll', '/employee', '/profile', '/settings', '/attendance', '/employees', '/timeoff', '/payslips', '/reports']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get('auth-token')?.value

  // Redirect to login if no token and trying to access protected route
  if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If token exists, allow access (token validation is handled by backend)
  if (token) {
    try {
      // Decode the base64 token from backend
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      
      // Add user info to headers for use in components
      const response = NextResponse.next()
      response.headers.set('x-user-email', decoded.email || '')
      return response
    } catch (error) {
      // Invalid token format, but still allow through
      // ProtectedRoute component will handle actual auth checks
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)',
  ],
}
