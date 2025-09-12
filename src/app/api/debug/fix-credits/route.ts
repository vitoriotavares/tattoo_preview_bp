import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { CreditsService } from "@/lib/services/credits-service";
import { db } from "@/lib/db";
import { purchases } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, forceProcess = false } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'SessionId is required' },
        { status: 400 }
      );
    }

    console.log('=== MANUAL CREDIT RECOVERY ===');
    console.log('Session ID:', sessionId);

    // Get Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed in Stripe' },
        { status: 400 }
      );
    }

    // Check if we already have a purchase record for this session
    const existingPurchase = await db
      .select()
      .from(purchases)
      .where(eq(purchases.stripeSessionId, sessionId))
      .limit(1);

    if (existingPurchase.length > 0 && !forceProcess) {
      return NextResponse.json({
        message: 'Purchase record already exists',
        purchase: existingPurchase[0],
        needsForce: true
      });
    }

    // Extract metadata
    const { userId, packageId, credits } = session.metadata || {};
    
    if (!userId || !packageId || !credits) {
      return NextResponse.json(
        { error: 'Missing metadata in Stripe session' },
        { status: 400 }
      );
    }

    const creditsToAdd = parseInt(credits, 10);
    console.log('Processing manual credit recovery:', {
      userId,
      packageId,
      creditsToAdd,
      sessionId
    });

    // Get user's current credits before
    const creditsBefore = await CreditsService.getUserCredits(userId);
    
    // Create or update purchase record
    let purchaseId: string;
    
    if (existingPurchase.length > 0) {
      // Update existing record
      purchaseId = existingPurchase[0].id;
      await db
        .update(purchases)
        .set({
          status: 'completed',
          completedAt: new Date(),
          stripePaymentIntentId: session.payment_intent as string,
        })
        .where(eq(purchases.id, purchaseId));
      
      console.log('Updated existing purchase record');
    } else {
      // Create new purchase record
      purchaseId = nanoid();
      await db.insert(purchases).values({
        id: purchaseId,
        userId,
        packageId,
        stripePaymentIntentId: session.payment_intent as string,
        stripeSessionId: session.id,
        amount: session.amount_total?.toString() || '0',
        currency: session.currency || 'brl',
        credits: creditsToAdd,
        status: 'completed',
        completedAt: new Date(),
      });
      
      console.log('Created new purchase record');
    }

    // Add credits to user
    const creditsAfter = await CreditsService.addCredits(userId, creditsToAdd, purchaseId);
    
    console.log('✅ Manual credit recovery completed:', {
      purchaseId,
      creditsBefore: creditsBefore?.availableCredits || 0,
      creditsAfter: creditsAfter.availableCredits,
      creditsAdded: creditsToAdd
    });

    return NextResponse.json({
      success: true,
      purchaseId,
      sessionId,
      userId,
      creditsAdded: creditsToAdd,
      creditsBefore: creditsBefore?.availableCredits || 0,
      creditsAfter: creditsAfter.availableCredits,
      message: 'Credits successfully recovered and added to user account'
    });

  } catch (error) {
    console.error('Manual credit recovery error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to recover credits',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}