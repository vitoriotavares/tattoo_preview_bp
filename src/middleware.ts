import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protected routes that require authentication
  const protectedRoutes: string[] = [];
  
  // Check if the current path is protected
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Check for better-auth session token
    const sessionToken = request.cookies.get('better-auth.session_token')?.value;
    
    if (!sessionToken) {
      // Redirect to Google OAuth sign in
      const signInUrl = new URL('/api/auth/signin/google', request.url);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};