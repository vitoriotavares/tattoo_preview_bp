import { db } from '@/lib/db';
import { userCredits, creditPackages, purchases } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

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
    let updateData: any = {
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
}