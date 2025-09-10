import { pgTable, text, timestamp, boolean, integer, decimal, jsonb } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified"),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// TattooPreview specific tables

export const userCredits = pgTable("user_credits", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  totalCredits: integer("total_credits").notNull().default(3), // 3 free credits on signup
  usedCredits: integer("used_credits").notNull().default(0),
  freeCreditsUsed: integer("free_credits_used").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const imageProcessing = pgTable("image_processing", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type", { enum: ['add', 'remove', 'enhance'] }).notNull(),
  status: text("status", { enum: ['pending', 'processing', 'completed', 'failed'] })
    .notNull()
    .default('pending'),
  inputImageUrl: text("input_image_url").notNull(),
  tattooImageUrl: text("tattoo_image_url"), // nullable for remove/enhance
  outputImageUrl: text("output_image_url"), // result image
  processingTimeMs: integer("processing_time_ms"), // processing time in milliseconds
  creditCost: integer("credit_cost").notNull().default(1),
  metadata: jsonb("metadata"), // store additional data like position, size, etc.
  errorMessage: text("error_message"), // store error details if failed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const creditPackages = pgTable("credit_packages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), // "Starter", "Popular", "Pro", "Studio"
  credits: integer("credits").notNull(),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(), // price in cents
  stripePriceId: text("stripe_price_id"), // Stripe price ID
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const purchases = pgTable("purchases", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  packageId: text("package_id")
    .notNull()
    .references(() => creditPackages.id),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeSessionId: text("stripe_session_id"), // Stripe checkout session ID
  amount: decimal("amount", { precision: 8, scale: 2 }).notNull(), // amount in cents
  currency: text("currency").notNull().default('usd'),
  credits: integer("credits").notNull(), // credits purchased
  status: text("status", { enum: ['pending', 'completed', 'failed', 'refunded'] })
    .notNull()
    .default('pending'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});
