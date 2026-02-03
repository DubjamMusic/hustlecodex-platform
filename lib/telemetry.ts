/**
 * Telemetry & Analytics Module
 * 
 * Tracks user behavior, system performance, and decision outcomes.
 * Supports both database storage (Prisma) and optional external analytics.
 * 
 * Usage:
 *   import { logDecisionEvent, logAgentDisagreement } from '@/lib/telemetry';
 *   await logDecisionEvent(userId, decisionId, metadata);
 */

import { prisma, Prisma } from './prisma';
import { env } from './env';
import { isFeatureEnabled, FEATURES } from './featureFlags';

// ============================================================================
// TELEMETRY CONFIGURATION
// ============================================================================

/**
 * Telemetry event types
 * Add new event types here as features expand
 */
export const TELEMETRY_EVENTS = {
  // Decision loop events
  DECISION_CREATED: 'decision_created',
  DECISION_COMPLETED: 'decision_completed',
  
  // Agent events
  AGENT_CALLED: 'agent_called',
  AGENT_RESPONDED: 'agent_responded',
  AGENT_ERROR: 'agent_error',
  AGENT_DISAGREEMENT: 'agent_disagreement',
  
  // Memory events
  MEMORY_ACCESSED: 'memory_accessed',
  MEMORY_CREATED: 'memory_created',
  MEMORY_REFERENCED: 'memory_reference',
  
  // User engagement
  USER_LOGIN: 'user_login',
  USER_RETURN: 'user_return',
  USER_FEEDBACK: 'user_feedback',
  
  // System performance
  API_REQUEST: 'api_request',
  API_ERROR: 'api_error',
  SLOW_QUERY: 'slow_query',
} as const;

export type TelemetryEventType = typeof TELEMETRY_EVENTS[keyof typeof TELEMETRY_EVENTS];

/**
 * Telemetry event properties interface
 * Flexible JSON structure for event metadata
 */
export interface TelemetryProperties {
  [key: string]: string | number | boolean | null | undefined | TelemetryProperties;
}

/**
 * Options for logging telemetry events
 */
export interface TelemetryOptions {
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  skipExternal?: boolean; // Don't send to external analytics
  skipDatabase?: boolean; // Don't store in database (e.g., for high-volume events)
}

// ============================================================================
// DATABASE LOGGING
// ============================================================================

/**
 * Log telemetry event to database
 * Stores event in TelemetryEvent table via Prisma
 */
async function logToDatabase(
  eventType: TelemetryEventType,
  eventName: string,
  properties: TelemetryProperties,
  options: {
    userId?: string;
    decisionId?: string;
    sessionId?: string;
    userAgent?: string;
    ipAddress?: string;
    latencyMs?: number;
    success?: boolean;
    errorMessage?: string;
  }
): Promise<void> {
  try {
    await prisma.telemetryEvent.create({
      data: {
        eventType,
        eventName,
        properties: properties as Prisma.JsonObject,
        userId: options.userId,
        decisionId: options.decisionId,
        sessionId: options.sessionId,
        userAgent: options.userAgent,
        ipAddress: options.ipAddress,
        latencyMs: options.latencyMs,
        success: options.success ?? true,
        errorMessage: options.errorMessage,
      },
    });
  } catch (error) {
    console.error('Failed to log telemetry to database:', error);
    // Don't throw - telemetry failures shouldn't break app
  }
}

// ============================================================================
// EXTERNAL ANALYTICS
// ============================================================================

/**
 * Send telemetry event to external analytics service
 * Supports Mixpanel, Amplitude, Segment, or custom endpoints
 */
async function sendToExternalAnalytics(
  eventType: TelemetryEventType,
  eventName: string,
  properties: TelemetryProperties,
  userId?: string
): Promise<void> {
  // Check if external analytics is configured
  if (!env.ANALYTICS_WRITE_KEY) {
    return; // No external analytics configured
  }
  
  try {
    // Example: Send to Segment/Mixpanel/Amplitude
    // Customize this based on your analytics provider
    const payload = {
      event: eventName,
      userId,
      properties: {
        ...properties,
        eventType,
        timestamp: new Date().toISOString(),
        platform: 'hustlecodex',
      },
    };
    
    // TODO: Implement actual API call to your analytics service
    // Example for Segment:
    // await fetch('https://api.segment.io/v1/track', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Basic ${Buffer.from(env.ANALYTICS_WRITE_KEY + ':').toString('base64')}`,
    //   },
    //   body: JSON.stringify(payload),
    // });
    
    console.log('📊 External analytics:', eventName, payload);
  } catch (error) {
    console.error('Failed to send to external analytics:', error);
    // Don't throw - telemetry failures shouldn't break app
  }
}

// ============================================================================
// PUBLIC API - DECISION EVENTS
// ============================================================================

/**
 * Log when a user creates a new decision
 * Track engagement and decision frequency
 */
export async function logDecisionEvent(
  userId: string,
  decisionId: string,
  metadata: {
    category?: string;
    decisionLength: number;
    contextLength: number;
    hasMemories: boolean;
  },
  options: TelemetryOptions = {}
): Promise<void> {
  // Check if telemetry is enabled
  if (!(await isFeatureEnabled(FEATURES.TELEMETRY_ENABLED, userId))) {
    return;
  }
  
  const properties: TelemetryProperties = {
    decisionId,
    category: metadata.category || 'uncategorized',
    decisionLength: metadata.decisionLength,
    contextLength: metadata.contextLength,
    hasMemories: metadata.hasMemories,
  };
  
  // Log to database
  if (!options.skipDatabase) {
    await logToDatabase(
      TELEMETRY_EVENTS.DECISION_CREATED,
      'Decision Created',
      properties,
      {
        userId,
        decisionId,
        sessionId: options.sessionId,
        userAgent: options.userAgent,
        ipAddress: options.ipAddress,
      }
    );
  }
  
  // Log to external analytics
  if (!options.skipExternal) {
    await sendToExternalAnalytics(
      TELEMETRY_EVENTS.DECISION_CREATED,
      'Decision Created',
      properties,
      userId
    );
  }
}

/**
 * Log when a decision is completed (user provides feedback)
 * Track decision outcomes and quality
 */
export async function logDecisionCompleted(
  userId: string,
  decisionId: string,
  metadata: {
    feedbackScore: number; // 1-5
    timeTakenMs: number;
    userFeedback?: string;
  },
  options: TelemetryOptions = {}
): Promise<void> {
  if (!(await isFeatureEnabled(FEATURES.TELEMETRY_ENABLED, userId))) {
    return;
  }
  
  const properties: TelemetryProperties = {
    decisionId,
    feedbackScore: metadata.feedbackScore,
    timeTakenMs: metadata.timeTakenMs,
    hasFeedback: Boolean(metadata.userFeedback),
  };
  
  await logToDatabase(
    TELEMETRY_EVENTS.DECISION_COMPLETED,
    'Decision Completed',
    properties,
    {
      userId,
      decisionId,
      latencyMs: metadata.timeTakenMs,
      sessionId: options.sessionId,
    }
  );
}

// ============================================================================
// PUBLIC API - AGENT EVENTS
// ============================================================================

/**
 * Log agent disagreement
 * Track when agents provide conflicting recommendations
 */
export async function logAgentDisagreement(
  userId: string,
  decisionId: string,
  metadata: {
    affirmConfidence: number;
    challengeConfidence: number;
    disagreementReason: string;
  },
  options: TelemetryOptions = {}
): Promise<void> {
  if (!(await isFeatureEnabled(FEATURES.TELEMETRY_ENABLED, userId))) {
    return;
  }
  
  const properties: TelemetryProperties = {
    decisionId,
    affirmConfidence: metadata.affirmConfidence,
    challengeConfidence: metadata.challengeConfidence,
    disagreementReason: metadata.disagreementReason,
    confidenceDelta: Math.abs(metadata.affirmConfidence - metadata.challengeConfidence),
  };
  
  await logToDatabase(
    TELEMETRY_EVENTS.AGENT_DISAGREEMENT,
    'Agent Disagreement',
    properties,
    {
      userId,
      decisionId,
      sessionId: options.sessionId,
    }
  );
  
  await sendToExternalAnalytics(
    TELEMETRY_EVENTS.AGENT_DISAGREEMENT,
    'Agent Disagreement',
    properties,
    userId
  );
}

/**
 * Log agent response
 * Track agent performance and latency
 */
export async function logAgentResponse(
  userId: string,
  decisionId: string,
  metadata: {
    agentType: 'affirm' | 'challenge' | string;
    model: string;
    latencyMs: number;
    tokenCount?: number;
    confidenceScore: number;
    success: boolean;
    errorMessage?: string;
  },
  options: TelemetryOptions = {}
): Promise<void> {
  if (!(await isFeatureEnabled(FEATURES.TELEMETRY_ENABLED, userId))) {
    return;
  }
  
  const properties: TelemetryProperties = {
    decisionId,
    agentType: metadata.agentType,
    model: metadata.model,
    tokenCount: metadata.tokenCount,
    confidenceScore: metadata.confidenceScore,
  };
  
  await logToDatabase(
    TELEMETRY_EVENTS.AGENT_RESPONDED,
    `Agent Responded: ${metadata.agentType}`,
    properties,
    {
      userId,
      decisionId,
      latencyMs: metadata.latencyMs,
      success: metadata.success,
      errorMessage: metadata.errorMessage,
      sessionId: options.sessionId,
    }
  );
}

// ============================================================================
// PUBLIC API - MEMORY EVENTS
// ============================================================================

/**
 * Log memory fragment reference
 * Track which memories are most useful
 */
export async function logMemoryReference(
  userId: string,
  decisionId: string,
  metadata: {
    memoryIds: string[];
    totalMemories: number;
    avgRelevanceScore: number;
  },
  options: TelemetryOptions = {}
): Promise<void> {
  if (!(await isFeatureEnabled(FEATURES.TELEMETRY_ENABLED, userId))) {
    return;
  }
  
  const properties: TelemetryProperties = {
    decisionId,
    memoryCount: metadata.memoryIds.length,
    totalMemories: metadata.totalMemories,
    avgRelevanceScore: metadata.avgRelevanceScore,
    memoryIds: metadata.memoryIds.join(','),
  };
  
  await logToDatabase(
    TELEMETRY_EVENTS.MEMORY_REFERENCED,
    'Memory Referenced',
    properties,
    {
      userId,
      decisionId,
      sessionId: options.sessionId,
    }
  );
}

// ============================================================================
// PUBLIC API - USER ENGAGEMENT
// ============================================================================

/**
 * Log user return visit
 * Track retention and engagement patterns
 */
export async function logUserReturn(
  userId: string,
  metadata: {
    daysSinceLastVisit: number;
    totalDecisions: number;
    consecutiveDays: number;
  },
  options: TelemetryOptions = {}
): Promise<void> {
  if (!(await isFeatureEnabled(FEATURES.TELEMETRY_ENABLED, userId))) {
    return;
  }
  
  const properties: TelemetryProperties = {
    daysSinceLastVisit: metadata.daysSinceLastVisit,
    totalDecisions: metadata.totalDecisions,
    consecutiveDays: metadata.consecutiveDays,
    isReturningUser: metadata.daysSinceLastVisit > 0,
  };
  
  await logToDatabase(
    TELEMETRY_EVENTS.USER_RETURN,
    'User Return',
    properties,
    {
      userId,
      sessionId: options.sessionId,
      userAgent: options.userAgent,
    }
  );
  
  await sendToExternalAnalytics(
    TELEMETRY_EVENTS.USER_RETURN,
    'User Return',
    properties,
    userId
  );
}

// ============================================================================
// PUBLIC API - SYSTEM PERFORMANCE
// ============================================================================

/**
 * Log API request performance
 * Track slow endpoints and errors
 */
export async function logApiRequest(
  endpoint: string,
  metadata: {
    method: string;
    statusCode: number;
    latencyMs: number;
    userId?: string;
    errorMessage?: string;
  },
  options: TelemetryOptions = {}
): Promise<void> {
  const properties: TelemetryProperties = {
    endpoint,
    method: metadata.method,
    statusCode: metadata.statusCode,
  };
  
  const eventType = metadata.statusCode >= 400 
    ? TELEMETRY_EVENTS.API_ERROR 
    : metadata.latencyMs > 5000
    ? TELEMETRY_EVENTS.SLOW_QUERY
    : TELEMETRY_EVENTS.API_REQUEST;
  
  await logToDatabase(
    eventType,
    `API Request: ${endpoint}`,
    properties,
    {
      userId: metadata.userId,
      latencyMs: metadata.latencyMs,
      success: metadata.statusCode < 400,
      errorMessage: metadata.errorMessage,
      sessionId: options.sessionId,
      userAgent: options.userAgent,
    }
  );
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

/**
 * Get decision analytics for a user
 * Useful for dashboard and insights
 */
export async function getUserDecisionAnalytics(userId: string) {
  const [totalDecisions, recentDecisions, avgFeedbackScore] = await Promise.all([
    // Total decisions
    prisma.decision.count({ where: { userId } }),
    
    // Decisions in last 7 days
    prisma.decision.count({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    
    // Average feedback score
    prisma.decision.aggregate({
      where: { userId, userFeedbackScore: { not: null } },
      _avg: { userFeedbackScore: true },
    }),
  ]);
  
  return {
    totalDecisions,
    recentDecisions,
    avgFeedbackScore: avgFeedbackScore._avg.userFeedbackScore || 0,
  };
}

/**
 * Get agent performance metrics
 * Track agent quality and disagreements
 */
export async function getAgentPerformanceMetrics(agentType: string, days = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const [totalResponses, avgLatency, avgConfidence, disagreements] = await Promise.all([
    // Total responses
    prisma.agentResponse.count({
      where: { agentType, createdAt: { gte: since } },
    }),
    
    // Average latency
    prisma.agentResponse.aggregate({
      where: { agentType, createdAt: { gte: since } },
      _avg: { latencyMs: true },
    }),
    
    // Average confidence
    prisma.agentResponse.aggregate({
      where: { agentType, createdAt: { gte: since } },
      _avg: { confidenceScore: true },
    }),
    
    // Disagreements
    prisma.agentResponse.count({
      where: {
        agentType,
        createdAt: { gte: since },
        disagreesWithOtherAgents: true,
      },
    }),
  ]);
  
  return {
    totalResponses,
    avgLatency: avgLatency._avg.latencyMs || 0,
    avgConfidence: avgConfidence._avg.confidenceScore || 0,
    disagreements,
    disagreementRate: totalResponses > 0 ? disagreements / totalResponses : 0,
  };
}

// Export types
export type { TelemetryEventType, TelemetryProperties, TelemetryOptions };
