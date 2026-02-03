/**
 * Environment Variables Validation
 * 
 * This file validates all environment variables using Zod schemas.
 * It ensures type safety and provides helpful error messages for missing/invalid vars.
 * 
 * Usage:
 *   import { env } from '@/lib/env';
 *   const apiKey = env.OPENAI_API_KEY;
 * 
 * To validate env vars at build time:
 *   npm run validate-env (or import this file in next.config.js)
 */

import { z } from 'zod';

// Helper to parse boolean strings
const booleanString = z
  .string()
  .transform((val) => val === 'true')
  .default('false');

// Helper to parse comma-separated strings
const commaSeparated = z
  .string()
  .transform((val) => val.split(',').map(v => v.trim()).filter(Boolean))
  .default('');

/**
 * Server-side environment variables schema
 * These are NEVER exposed to the browser
 */
const serverSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // AI Provider Keys
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required').optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  
  // Database
  DATABASE_URL: z.string().url('Invalid DATABASE_URL format').optional(),
  DIRECT_URL: z.string().url('Invalid DIRECT_URL format').optional(),
  
  // SMTP
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().email().optional(),
  SMTP_FROM_NAME: z.string().optional(),
  
  // Feature Flags (local)
  FEATURE_FLAGS: z.string().optional(),
  
  // Vercel Edge Config
  EDGE_CONFIG: z.string().optional(),
  EDGE_CONFIG_ITEM_KEY: z.string().default('hustlecodex_features'),
  
  // Analytics
  ANALYTICS_WRITE_KEY: z.string().optional(),
  
  // Payments
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Legacy Supabase
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  
  // Security
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters').optional(),
  ALLOWED_ORIGINS: commaSeparated.optional(),
  
  // Development
  DEBUG_MODE: booleanString,
  MOCK_AI_RESPONSES: booleanString,
  
  // Monetization
  PREMIUM_TIER_ID: z.string().default('premium_v1'),
  FREE_TIER_DECISION_LIMIT: z.string().default('50'),
  FREE_TIER_MEMORY_LIMIT: z.string().default('100'),
});

/**
 * Client-side environment variables schema
 * These are exposed to the browser (must be prefixed with NEXT_PUBLIC_)
 */
const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SITE_NAME: z.string().default('HustleCodeX'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: booleanString,
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_GUMROAD_ID: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLIC_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_ENABLE_PAYMENTS: booleanString,
  NEXT_PUBLIC_ENABLE_NEXUS_RECOVERY: booleanString,
});

/**
 * Combined schema for all environment variables
 */
const envSchema = serverSchema.merge(clientSchema);

/**
 * Validate and parse environment variables
 * This runs at import time, so errors are caught early
 */
const parseEnv = () => {
  // In browser, only client vars are available
  if (typeof window !== 'undefined') {
    const clientEnv = clientSchema.safeParse(process.env);
    
    if (!clientEnv.success) {
      console.error('❌ Invalid client environment variables:', clientEnv.error.flatten().fieldErrors);
      throw new Error('Invalid client environment variables');
    }
    
    return clientEnv.data;
  }
  
  // On server, all vars are available
  const serverEnv = envSchema.safeParse(process.env);
  
  if (!serverEnv.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(serverEnv.error.flatten().fieldErrors, null, 2));
    throw new Error('Invalid environment variables');
  }
  
  return serverEnv.data;
};

/**
 * Validated and typed environment variables
 * Use this throughout your app instead of process.env
 */
export const env = parseEnv();

/**
 * Type-safe way to check if we're in production
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Type-safe way to check if we're in development
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Type-safe way to check if debug mode is enabled
 */
export const isDebugMode = process.env.DEBUG_MODE === 'true';

/**
 * Helper to parse feature flags from string
 * Format: "feature1:true,feature2:false"
 */
export function parseFeatureFlags(flagString?: string): Record<string, boolean> {
  if (!flagString) return {};
  
  return flagString.split(',').reduce((acc, flag) => {
    const [key, value] = flag.split(':').map(s => s.trim());
    if (key && value) {
      acc[key] = value === 'true';
    }
    return acc;
  }, {} as Record<string, boolean>);
}

/**
 * Get parsed feature flags from environment
 */
export const localFeatureFlags = typeof window === 'undefined'
  ? parseFeatureFlags(process.env.FEATURE_FLAGS)
  : {};

/**
 * Export types for use in other files
 */
export type Env = z.infer<typeof envSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

// Log validation success in development
if (isDevelopment && typeof window === 'undefined') {
  console.log('✅ Environment variables validated successfully');
}
