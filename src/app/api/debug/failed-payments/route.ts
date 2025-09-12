import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { purchases } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const onlyFailures = searchParams.get('onlyFailures') === 'true';
    
    console.log('Checking for failed payments...');

    // Get recent completed checkout sessions from Stripe
    const sessions = await stripe.checkout.sessions.list({
      limit,
      status: 'complete'
    });

    // Filter for paid sessions
    const paidSessions = sessions.data.filter(session => session.payment_status === 'paid');

    console.log(`Found ${sessions.data.length} completed sessions, ${paidSessions.length} paid`);

    const analysis = [];

    for (const session of paidSessions) {
      // Check if we have a purchase record for this session
      const purchase = await db
        .select()
        .from(purchases)
        .where(eq(purchases.stripeSessionId, session.id))
        .limit(1);

      const hasPurchaseRecord = purchase.length > 0;
      const metadata = session.metadata || {};
      
      const sessionInfo = {
        sessionId: session.id,
        paymentIntent: session.payment_intent,
        amount: session.amount_total,
        currency: session.currency,
        created: new Date(session.created * 1000),
        customerEmail: session.customer_details?.email,
        metadata: {
          userId: metadata.userId,
          packageId: metadata.packageId,
          credits: metadata.credits
        },
        hasPurchaseRecord,
        purchaseRecord: hasPurchaseRecord ? purchase[0] : null,
        needsRecovery: !hasPurchaseRecord && session.payment_status === 'paid',
        status: session.payment_status
      };

      // If only showing failures, filter here
      if (!onlyFailures || sessionInfo.needsRecovery) {
        analysis.push(sessionInfo);
      }
    }

    // Sort by needs recovery first, then by date
    analysis.sort((a, b) => {
      if (a.needsRecovery && !b.needsRecovery) return -1;
      if (!a.needsRecovery && b.needsRecovery) return 1;
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    });

    const failedCount = analysis.filter(s => s.needsRecovery).length;
    const successfulCount = analysis.filter(s => s.hasPurchaseRecord).length;

    return NextResponse.json({
      summary: {
        totalAnalyzed: analysis.length,
        successfullyProcessed: successfulCount,
        needingRecovery: failedCount,
        successRate: analysis.length > 0 ? ((successfulCount / analysis.length) * 100).toFixed(2) + '%' : '0%'
      },
      sessions: analysis,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Failed payments analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze payments',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}