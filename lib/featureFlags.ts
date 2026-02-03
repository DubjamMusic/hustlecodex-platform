/**
 * Feature Flags Module
 * 
 * Provides unified interface for feature flags using:
 * 1. Vercel Edge Config (production, ultra-fast)
 * 2. Environment variables (local development)
 * 3. Database overrides (per-user A/B testing)
 * 
 * Usage:
 *   import { isFeatureEnabled } from '@/lib/featureFlags';
 *   if (await isFeatureEnabled('multi_agent_enabled')) { ... }
 * 
 * To add a new feature flag:
 * 1. Add it to the FEATURES constant below
 * 2. Set it in .env.local: FEATURE_FLAGS=your_feature:true
 * 3. (Production) Add to Vercel Edge Config dashboard
 */

import { get as getEdgeConfig } from '@vercel/edge-config';
import { env, localFeatureFlags, isProduction } from './env';
import { prisma } from './prisma';

/**
 * Feature flag definitions
 * Central registry of all feature flags in the system
 */
export const FEATURES = {
  // Core decision loop
  DECISION_LOOP_ENABLED: 'decision_loop_enabled',
  MULTI_AGENT_ENABLED: 'multi_agent_enabled',
  
  // Memory system
  MEMORY_SCORING_ENABLED: 'memory_scoring_enabled',
  MEMORY_DECAY_ENABLED: 'memory_decay_enabled',
  
  // Telemetry
  TELEMETRY_ENABLED: 'telemetry_enabled',
  ANALYTICS_EXPORT_ENABLED: 'analytics_export_enabled',
  
  // AI features
  STREAMING_ENABLED: 'streaming_enabled',
  CLAUDE_ENABLED: 'claude_enabled',
  
  // Premium features (monetization hooks)
  PREMIUM_AGENTS_ENABLED: 'premium_agents_enabled',
  UNLIMITED_MEMORY_ENABLED: 'unlimited_memory_enabled',
  ADVANCED_ANALYTICS_ENABLED: 'advanced_analytics_enabled',
  
  // Experimental
  WEB3_INTEGRATION_ENABLED: 'web3_integration_enabled',
  REAL_TIME_FEATURES_ENABLED: 'real_time_features_enabled',
} as const;

/**
 * Type-safe feature flag keys
 */
export type FeatureKey = typeof FEATURES[keyof typeof FEATURES];

/**
 * Cache for edge config values (prevent repeated API calls)
 */
const edgeConfigCache = new Map<string, { value: boolean; timestamp: number }>();
const CACHE_TTL_MS = 60000; // 1 minute

/**
 * Get feature flag from Vercel Edge Config
 * Falls back to environment variables if Edge Config is not available
 */
async function getEdgeConfigFlag(flagKey: string): Promise<boolean | null> {
  // Check if Edge Config is configured
  if (!env.EDGE_CONFIG) {
    return null;
  }
  
  // Check cache
  const cached = edgeConfigCache.get(flagKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.value;
  }
  
  try {
    // Get all flags from Edge Config
    const flags = await getEdgeConfig<Record<string, boolean>>(env.EDGE_CONFIG_ITEM_KEY);
    
    if (!flags) {
      return null;
    }
    
    const value = flags[flagKey] ?? null;
    
    // Cache the result
    if (value !== null) {
      edgeConfigCache.set(flagKey, { value, timestamp: Date.now() });
    }
    
    return value;
  } catch (error) {
    console.error(`Failed to fetch Edge Config for ${flagKey}:`, error);
    return null;
  }
}

/**
 * Get feature flag from environment variables (local development)
 */
function getEnvFlag(flagKey: string): boolean {
  return localFeatureFlags[flagKey] ?? false;
}

/**
 * Get user-specific feature flag override from database
 * Used for A/B testing and gradual rollouts
 */
async function getUserOverride(flagKey: string, userId?: string): Promise<boolean | null> {
  if (!userId) return null;
  
  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { name: flagKey },
    });
    
    if (!flag) return null;
    
    // Check user-specific override
    const overrides = flag.userOverrides as Record<string, boolean>;
    if (userId in overrides) {
      return overrides[userId];
    }
    
    // Check rollout percentage
    if (flag.rolloutPercentage > 0) {
      // Hash userId to get deterministic rollout
      const hash = hashString(userId);
      const bucket = hash % 100;
      return bucket < flag.rolloutPercentage;
    }
    
    return flag.enabled;
  } catch (error) {
    console.error(`Failed to get user override for ${flagKey}:`, error);
    return null;
  }
}

/**
 * Check if a feature is enabled
 * Priority: User override > Edge Config > Environment variables > Default (false)
 */
export async function isFeatureEnabled(
  flagKey: FeatureKey,
  userId?: string
): Promise<boolean> {
  // 1. Check user-specific override
  if (userId) {
    const userOverride = await getUserOverride(flagKey, userId);
    if (userOverride !== null) {
      return userOverride;
    }
  }
  
  // 2. Check Edge Config (production)
  if (isProduction) {
    const edgeConfigValue = await getEdgeConfigFlag(flagKey);
    if (edgeConfigValue !== null) {
      return edgeConfigValue;
    }
  }
  
  // 3. Check environment variables (development)
  return getEnvFlag(flagKey);
}

/**
 * Check if a feature is enabled synchronously (no user overrides)
 * Use this when you need immediate flag check without async/await
 */
export function isFeatureEnabledSync(flagKey: FeatureKey): boolean {
  return getEnvFlag(flagKey);
}

/**
 * Get all enabled features for a user
 * Useful for debugging and UI feature toggles
 */
export async function getEnabledFeatures(userId?: string): Promise<FeatureKey[]> {
  const results = await Promise.all(
    Object.values(FEATURES).map(async (feature) => ({
      feature,
      enabled: await isFeatureEnabled(feature, userId),
    }))
  );
  
  return results.filter((r) => r.enabled).map((r) => r.feature);
}

/**
 * Simple string hash function for deterministic rollout
 * Returns 0-99 for percentage-based rollout
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Helper to check if premium features are enabled for a user
 * Monetization hook: Check user tier before enabling premium features
 */
export async function isPremiumFeatureEnabled(
  flagKey: FeatureKey,
  userId: string
): Promise<boolean> {
  // First check if feature is enabled at all
  const featureEnabled = await isFeatureEnabled(flagKey, userId);
  if (!featureEnabled) return false;
  
  // Then check user tier (monetization logic)
  // TODO: Implement subscription check via Stripe/Gumroad
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true, tierExpiresAt: true },
    });
    
    if (!user) return false;
    
    // Check if user has premium tier
    if (user.tier === 'free') return false;
    
    // Check if subscription is still active
    if (user.tierExpiresAt && user.tierExpiresAt < new Date()) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to check premium status:', error);
    return false;
  }
}

/**
 * Clear the Edge Config cache
 * Useful after updating feature flags in production
 */
export function clearFeatureFlagCache(): void {
  edgeConfigCache.clear();
}

// Export types
export type { FeatureKey };
