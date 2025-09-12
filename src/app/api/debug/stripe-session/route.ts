import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { CreditsService } from "@/lib/services/credits-service";
import { db } from "@/lib/db";
import { purchases } from "@/lib/schema";
import { eq } from "drizzle-orm";

interface DebugInfo {
  stripeSession?: {
    id: string;
    payment_status: string;
    payment_intent: string | null;
    amount_total: number | null;
    currency: string | null;
    metadata: Record<string, string> | null;
    created: Date;
    expires_at: Date;
  };
  stripeSessionError?: string;
  purchaseRecords?: Array<{
    id: string;
    userId: string;
    packageId: string;
    stripeSessionId: string | null;
    credits: number;
    status: string;
  }>;
  userCredits?: {
    id: string;
    userId: string;
    totalCredits: number;
    usedCredits: number;
    availableCredits: number;
  } | null;
  userPurchases?: Array<{
    id: string;
    userId: string;
    packageId: string;
    stripeSessionId: string | null;
    credits: number;
    status: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    
    if (!sessionId && !userId) {
      return NextResponse.json(
        { error: 'SessionId or UserId required' },
        { status: 400 }
      );
    }

    const debug: DebugInfo = {};

    // Get Stripe session details
    if (sessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        debug.stripeSession = {
          id: session.id,
          payment_status: session.payment_status,
          payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null,
          amount_total: session.amount_total,
          currency: session.currency,
          metadata: session.metadata,
          created: new Date(session.created * 1000),
          expires_at: new Date(session.expires_at * 1000),
        };
      } catch (error) {
        debug.stripeSessionError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // Get purchase records
    if (sessionId) {
      const purchaseRecords = await db
        .select()
        .from(purchases)
        .where(eq(purchases.stripeSessionId, sessionId));
      
      debug.purchaseRecords = purchaseRecords;
    }

    // Get user credits
    if (userId) {
      const credits = await CreditsService.getUserCredits(userId);
      debug.userCredits = credits;

      // Get all purchases for this user
      const userPurchases = await db
        .select()
        .from(purchases)
        .where(eq(purchases.userId, userId));
      
      debug.userPurchases = userPurchases;
    }

    return NextResponse.json({
      sessionId,
      userId,
      debug,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug stripe session error:', error);
    return NextResponse.json(
      { error: 'Failed to debug session' },
      { status: 500 }
    );
  }
}