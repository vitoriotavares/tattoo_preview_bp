import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * Security middleware for debug endpoints
 * Ensures debug routes are only accessible in development or by authorized admins
 */
export async function withDebugSecurity<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Block in production environment
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Debug endpoints not available in production' },
        { status: 404 }
      );
    }

    // Require authentication in development
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Authentication required for debug endpoints' },
          { status: 401 }
        );
      }

      // Optional: Add admin check if you have admin roles
      // const isAdmin = await checkAdminRole(session.user.id);
      // if (!isAdmin) {
      //   return NextResponse.json(
      //     { error: 'Admin access required' },
      //     { status: 403 }
      //   );
      // }

      // Add security headers
      const response = await handler(request, ...args);
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

      return response;
    } catch (error) {
      console.error('Debug security check failed:', error);
      return NextResponse.json(
        { error: 'Security check failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper function to check if current environment allows debug access
 */
export function isDebugAllowed(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/**
 * Rate limiting for debug endpoints
 */
const debugRateLimit = new Map<string, { count: number; resetTime: number }>();

export function checkDebugRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = debugRateLimit.get(ip);

  if (!limit || now > limit.resetTime) {
    // Reset or initialize
    debugRateLimit.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }

  if (limit.count >= 10) { // Max 10 requests per minute
    return false;
  }

  limit.count++;
  return true;
}