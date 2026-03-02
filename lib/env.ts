/**
 * Environment Utilities
 *
 * Provides helper functions for checking the current environment
 * and accessing environment variables safely.
 */

/**
 * Check if running in development mode
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Check if running in test mode
 */
export const isTest = process.env.NODE_ENV === 'test';

/**
 * Get environment variable with optional fallback
 */
export function getEnv(key: string, fallback?: string): string {
  return process.env[key] || fallback || '';
}

/**
 * Check if an environment variable is set
 */
export function hasEnv(key: string): boolean {
  return Boolean(process.env[key]);
}
