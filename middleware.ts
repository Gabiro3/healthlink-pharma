import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  try {
    // Create a Supabase client configured for the middleware
    const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() })
    
    // Check if we have a session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Get the pathname of the request
    const path = request.nextUrl.pathname

    // If the user is not signed in and the requested path is protected, redirect to login
    if (!session && isProtectedRoute(path)) {
      // Create the URL for the login page
      const redirectUrl = new URL('/login', request.url)
      
      // Add the original URL as a query parameter for later redirection
      redirectUrl.searchParams.set('redirectTo', path)
      
      // Redirect to the login page
      return NextResponse.redirect(redirectUrl)
    }

    // If the user is signed in and trying to access auth pages, redirect to dashboard
    if (session && isAuthRoute(path)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch (error) {
    // Log the error but don't block the request
    console.error('Authentication middleware error:', error)
  }

  // Continue with the request if authentication check passes or for non-protected routes
  return NextResponse.next()
}

// Define which routes are protected (require authentication)
function isProtectedRoute(path: string): boolean {
  const protectedPaths = [
    '/dashboard',
    '/products',
    '/orders',
    '/sales',
    '/settings',
    '/inventory',
    '/reports',
    '/prescriptions',
  ]
  
  return protectedPaths.some(protectedPath => 
    path === protectedPath || path.startsWith(`${protectedPath}/`)
  )
}

// Define which routes are auth routes (login, register, etc.)
function isAuthRoute(path: string): boolean {
  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password']
  return authPaths.includes(path)
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    // Match all protected routes
    '/dashboard/:path*',
    '/products/:path*',
    '/orders/:path*',
    '/sales/:path*',
    '/settings/:path*',
    '/inventory/:path*',
    '/reports/:path*',
    '/prescriptions/:path*',
    // Match auth routes
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
}
