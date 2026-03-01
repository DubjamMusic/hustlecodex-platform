/**
 * Prisma Client Initialization
 * 
 * This file provides a singleton Prisma client instance for the entire application.
 * It prevents multiple instances in development (hot reload) and properly handles
 * connection pooling in production.
 * 
 * Usage:
 *   import { prisma } from '@/lib/prisma';
 *   const users = await prisma.user.findMany();
 */

import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { isDevelopment } from './env';

// PrismaClient is attached to the `global` object in development
// to prevent exhausting database connections during hot reloading
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Create a PrismaPg adapter for PostgreSQL connections
 */
function createAdapter() {
  return new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // Match Prisma v5/v6 behavior for SSL
    ssl: process.env.DATABASE_SSL === 'false'
      ? false
      : { rejectUnauthorized: false },
  });
}

/**
 * Create or reuse Prisma client instance
 * In development: reuse global instance to prevent connection issues
 * In production: create new instance (global is not available)
 */
function createPrismaClient() {
  const adapter = createAdapter();
  return new PrismaClient({
    adapter,
    log: isDevelopment
      ? ['query', 'error', 'warn']
      : ['error'],
  });
}

export const prisma = global.prisma || createPrismaClient();

// Assign to global in development to persist across hot reloads
if (isDevelopment) {
  global.prisma = prisma;
}

/**
 * Gracefully disconnect Prisma when the process exits
 * Prevents "Connection pool timeout" errors
 */
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

/**
 * Helper to check database connectivity
 * Useful for health checks and debugging
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Helper to safely execute a query with error handling
 * Wraps Prisma queries with logging and error recovery
 */
export async function safeQuery<T>(
  queryFn: () => Promise<T>,
  fallback?: T
): Promise<T | null> {
  try {
    return await queryFn();
  } catch (error) {
    console.error('Database query error:', error);
    return fallback !== undefined ? fallback : null;
  }
}

/**
 * Export Prisma types for use in other files
 * This ensures type safety when working with database models
 */
export type { 
  User, 
  Decision, 
  AgentResponse, 
  MemoryFragment, 
  TelemetryEvent,
  FeatureFlag,
  Prisma 
} from '@/generated/prisma/client';

// Log initialization in development
if (isDevelopment) {
  console.log('Prisma client initialized (v7 with PrismaPg adapter)');
}
