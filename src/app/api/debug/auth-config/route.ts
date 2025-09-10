import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    console.log('[DEBUG] Checking auth configuration...');
    
    // Check environment variables
    const config = {
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      googleClientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
      betterAuthSecretLength: process.env.BETTER_AUTH_SECRET?.length || 0,
    };

    console.log('[DEBUG] Auth config:', config);

    // Try to import and test auth
    try {
      const { auth } = await import('@/lib/auth');
      console.log('[DEBUG] Auth imported successfully');
      
      // Test if auth object has expected methods
      const authMethods = Object.keys(auth);
      console.log('[DEBUG] Auth methods:', authMethods);
      
      return NextResponse.json({
        success: true,
        config,
        authMethods,
        message: 'Auth configuration loaded successfully'
      });
      
    } catch (authError) {
      console.error('[DEBUG] Auth import error:', authError);
      return NextResponse.json({
        success: false,
        config,
        error: authError instanceof Error ? authError.message : 'Unknown auth error',
        message: 'Failed to import auth configuration'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[DEBUG] General error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Debug check failed'
    }, { status: 500 });
  }
}