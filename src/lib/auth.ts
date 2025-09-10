import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db"

// Validate required environment variables
const requiredEnvVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  POSTGRES_URL: process.env.POSTGRES_URL,
}

console.log('[AUTH] Environment validation:', {
  hasGoogleClientId: !!requiredEnvVars.GOOGLE_CLIENT_ID,
  hasGoogleClientSecret: !!requiredEnvVars.GOOGLE_CLIENT_SECRET,
  hasSecret: !!requiredEnvVars.BETTER_AUTH_SECRET,
  hasPostgresUrl: !!requiredEnvVars.POSTGRES_URL,
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
})

// Check for missing variables
const missing = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missing.length > 0) {
  const error = `Missing required environment variables: ${missing.join(', ')}`
  console.error('[AUTH] Configuration error:', error)
  throw new Error(error)
}

console.log('[AUTH] Initializing better-auth...')

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  socialProviders: {
    google: {
      clientId: requiredEnvVars.GOOGLE_CLIENT_ID as string,
      clientSecret: requiredEnvVars.GOOGLE_CLIENT_SECRET as string,
    },
  },
  secret: requiredEnvVars.BETTER_AUTH_SECRET as string,
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
})

console.log('[AUTH] Better-auth initialized successfully')