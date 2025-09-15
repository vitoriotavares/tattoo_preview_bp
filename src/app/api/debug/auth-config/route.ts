import { NextRequest, NextResponse } from 'next/server';
import { withDebugSecurity } from '@/lib/debug-security';

async function debugAuthConfigHandler(_request: NextRequest) {
  try {
    // Check environment variables (safe info only)
    const config = {
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      // Remove sensitive length info that could help attackers
    };

    // Try to import and test auth
    try {
      const { auth } = await import('@/lib/auth');

      // Test if auth object has expected methods (safe info)
      const authMethods = Object.keys(auth).slice(0, 5); // Limit exposed methods

      return NextResponse.json({
        success: true,
        config,
        authMethods,
        message: 'Auth configuration status checked',
        debug: true
      });

    } catch (authError) {
      return NextResponse.json({
        success: false,
        config,
        message: 'Auth configuration check failed',
        debug: true
      }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Debug operation failed',
      debug: true
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoints not available in production' },
      { status: 404 }
    );
  }

  return debugAuthConfigHandler(request);
}