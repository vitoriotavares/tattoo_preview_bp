import { NextRequest, NextResponse } from 'next/server';
import { withDebugSecurity } from '@/lib/debug-security';
import { db } from '@/lib/db';
import { userCredits, purchases } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

async function debugSessionHandler(request: NextRequest) {
  try {
    // Get user session (already validated by withDebugSecurity)
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session!.user!.id;

    // Get current user credits
    const credits = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    // Get recent purchases (limit sensitive data exposure)
    const recentPurchases = await db
      .select({
        id: purchases.id,
        credits: purchases.credits,
        status: purchases.status,
        createdAt: purchases.createdAt,
      })
      .from(purchases)
      .where(eq(purchases.userId, userId))
      .orderBy(desc(purchases.createdAt))
      .limit(3); // Reduced from 5 to 3

    return NextResponse.json({
      userId: userId.substring(0, 8) + '...', // Partially masked
      credits: credits[0] || null,
      recentPurchases,
      timestamp: new Date().toISOString(),
      debug: true
    });

  } catch (error) {
    // Don't expose internal error details
    return NextResponse.json(
      { error: 'Debug operation failed' },
      { status: 500 }
    );
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

  return debugSessionHandler(request);
}