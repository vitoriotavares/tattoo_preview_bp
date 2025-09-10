import { db } from '@/lib/db';
import { userCredits, creditPackages, purchases } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export interface UserCreditsInfo {
  id: string;
  userId: string;
  totalCredits: number;
  usedCredits: number;
  freeCreditsUsed: number;
  availableCredits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: string; // in cents as decimal string
  stripePriceId?: string | null;
  active: boolean;
}

export class CreditsService {
  static async getUserCredits(userId: string): Promise<UserCreditsInfo | null> {
    const result = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const credits = result[0];
    return {
      ...credits,
      availableCredits: credits.totalCredits - credits.usedCredits,
    };
  }

  static async createUserCredits(userId: string): Promise<UserCreditsInfo> {
    const id = nanoid();
    
    const [result] = await db
      .insert(userCredits)
      .values({
        id,
        userId,
        totalCredits: 3, // 3 free credits
        usedCredits: 0,
        freeCreditsUsed: 0,
      })
      .returning();

    return {
      ...result,
      availableCredits: result.totalCredits - result.usedCredits,
    };
  }

  static async ensureUserCredits(userId: string): Promise<UserCreditsInfo> {
    let credits = await this.getUserCredits(userId);
    
    if (!credits) {
      credits = await this.createUserCredits(userId);
    }
    
    return credits;
  }

  static async consumeCredit(userId: string): Promise<{ success: boolean; remainingCredits: number; error?: string }> {
    const credits = await this.getUserCredits(userId);
    
    if (!credits) {
      return { 
        success: false, 
        remainingCredits: 0, 
        error: 'User credits not found' 
      };
    }

    if (credits.availableCredits <= 0) {
      return { 
        success: false, 
        remainingCredits: 0, 
        error: 'Insufficient credits' 
      };
    }

    // Update credits
    const updateData: Record<string, unknown> = {
      usedCredits: credits.usedCredits + 1,
      updatedAt: new Date(),
    };

    // Track free credits usage
    if (credits.freeCreditsUsed < 3) {
      updateData.freeCreditsUsed = credits.freeCreditsUsed + 1;
    }

    await db
      .update(userCredits)
      .set(updateData)
      .where(eq(userCredits.userId, userId));

    return { 
      success: true, 
      remainingCredits: credits.availableCredits - 1 
    };
  }

  static async addCredits(userId: string, creditsToAdd: number, purchaseId?: string): Promise<UserCreditsInfo> {
    const credits = await this.ensureUserCredits(userId);

    const [result] = await db
      .update(userCredits)
      .set({
        totalCredits: credits.totalCredits + creditsToAdd,
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, userId))
      .returning();

    return {
      ...result,
      availableCredits: result.totalCredits - result.usedCredits,
    };
  }

  static async getAvailablePackages(): Promise<CreditPackage[]> {
    const packages = await db
      .select()
      .from(creditPackages)
      .where(eq(creditPackages.active, true));

    return packages.map(pkg => ({
      ...pkg,
      price: pkg.price, // Already a string from decimal type
      stripePriceId: pkg.stripePriceId || undefined,
    }));
  }

  static async createDefaultPackages(): Promise<void> {
    const defaultPackages = [
      {
        id: nanoid(),
        name: 'Starter',
        credits: 5,
        price: '990', // $9.90 in cents
        stripePriceId: null,
        active: true,
      },
      {
        id: nanoid(),
        name: 'Popular',
        credits: 15,
        price: '2490', // $24.90 in cents
        stripePriceId: null,
        active: true,
      },
      {
        id: nanoid(),
        name: 'Pro',
        credits: 40,
        price: '4990', // $49.90 in cents
        stripePriceId: null,
        active: true,
      },
      {
        id: nanoid(),
        name: 'Studio',
        credits: 100,
        price: '9990', // $99.90 in cents
        stripePriceId: null,
        active: true,
      },
    ];

    // Check if packages already exist
    const existing = await db.select().from(creditPackages).limit(1);
    
    if (existing.length === 0) {
      await db.insert(creditPackages).values(defaultPackages);
    }
  }

  static async recordPurchase(
    userId: string,
    packageId: string,
    amount: string,
    credits: number,
    stripeSessionId?: string,
    stripePaymentIntentId?: string
  ): Promise<string> {
    const purchaseId = nanoid();

    await db.insert(purchases).values({
      id: purchaseId,
      userId,
      packageId,
      stripeSessionId,
      stripePaymentIntentId,
      amount,
      credits,
      currency: 'usd',
      status: 'pending',
    });

    return purchaseId;
  }

  static async completePurchase(purchaseId: string): Promise<boolean> {
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.id, purchaseId))
      .limit(1);

    if (!purchase || purchase.status !== 'pending') {
      return false;
    }

    // Update purchase status
    await db
      .update(purchases)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(purchases.id, purchaseId));

    // Add credits to user
    await this.addCredits(purchase.userId, purchase.credits, purchaseId);

    return true;
  }

  static async formatPrice(priceInCents: string): Promise<string> {
    const price = parseFloat(priceInCents) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }

  // Stripe Integration Methods

  /**
   * Create a Stripe checkout session for purchasing credits
   */
  static async createCheckoutSession(
    packageId: string,
    userId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    // Get the credit package
    const packageResult = await db
      .select()
      .from(creditPackages)
      .where(and(
        eq(creditPackages.id, packageId),
        eq(creditPackages.active, true)
      ))
      .limit(1);

    if (packageResult.length === 0) {
      throw new Error('Package not found or inactive');
    }

    const creditPackage = packageResult[0];

    if (!creditPackage.stripePriceId) {
      throw new Error('Package does not have a Stripe price configured');
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: creditPackage.stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        packageId,
        credits: creditPackage.credits.toString(),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: undefined, // Will be filled by Stripe
    });

    return session;
  }

  /**
   * Handle successful Stripe payment webhook
   */
  static async handleStripePaymentSuccess(
    session: Stripe.Checkout.Session
  ): Promise<boolean> {
    try {
      console.log('=== CREDITS SERVICE: Processing payment ===');
      const { userId, packageId, credits } = session.metadata || {};
      
      console.log('Metadata - userId:', userId, 'packageId:', packageId, 'credits:', credits);
      
      if (!userId || !packageId || !credits) {
        console.error('❌ Missing required metadata in Stripe session');
        throw new Error('Missing required metadata in Stripe session');
      }

      const creditsToAdd = parseInt(credits, 10);
      console.log('Adding credits to user:', creditsToAdd);
      
      // Create purchase record
      const purchaseId = nanoid();
      console.log('Creating purchase record with ID:', purchaseId);
      
      await db.insert(purchases).values({
        id: purchaseId,
        userId,
        packageId,
        stripePaymentIntentId: session.payment_intent as string,
        stripeSessionId: session.id,
        amount: session.amount_total?.toString() || '0',
        currency: session.currency || 'usd',
        credits: creditsToAdd,
        status: 'completed',
        completedAt: new Date(),
      });
      
      console.log('✅ Purchase record created');

      // Add credits to user
      const updatedCredits = await this.addCredits(userId, creditsToAdd, purchaseId);
      console.log('✅ Credits added. New totals:', {
        total: updatedCredits.totalCredits,
        used: updatedCredits.usedCredits,
        available: updatedCredits.availableCredits
      });

      return true;
    } catch (error) {
      console.error('❌ Error handling Stripe payment:', error);
      return false;
    }
  }

  /**
   * Update credit packages with Stripe price IDs
   */
  static async updatePackageStripePrices(packageUpdates: {
    id: string;
    stripePriceId: string;
  }[]): Promise<void> {
    for (const update of packageUpdates) {
      await db
        .update(creditPackages)
        .set({ 
          stripePriceId: update.stripePriceId,
          updatedAt: new Date()
        })
        .where(eq(creditPackages.id, update.id));
    }
  }

  /**
   * Create Stripe products and prices for credit packages
   */
  static async createStripeProductsAndPrices(): Promise<void> {
    const packages = await this.getAvailablePackages();
    const updates: { id: string; stripePriceId: string }[] = [];

    for (const pkg of packages) {
      if (pkg.stripePriceId) {
        continue; // Already has a Stripe price
      }

      try {
        // Create product
        const product = await stripe.products.create({
          name: `TattooPreview - ${pkg.name}`,
          description: `${pkg.credits} créditos para processamento de tatuagens`,
          metadata: {
            packageId: pkg.id,
            credits: pkg.credits.toString(),
          },
        });

        // Create price
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: parseInt(pkg.price, 10),
          currency: 'usd',
          metadata: {
            packageId: pkg.id,
            credits: pkg.credits.toString(),
          },
        });

        updates.push({
          id: pkg.id,
          stripePriceId: price.id,
        });

        console.log(`Created Stripe product and price for package ${pkg.name}: ${price.id}`);
      } catch (error) {
        console.error(`Error creating Stripe product for package ${pkg.id}:`, error);
      }
    }

    if (updates.length > 0) {
      await this.updatePackageStripePrices(updates);
      console.log(`Updated ${updates.length} packages with Stripe price IDs`);
    }
  }
}