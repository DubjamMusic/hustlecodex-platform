/**
 * Decision Loop API Endpoint
 * 
 * Main API route for processing user decisions through the multi-agent system.
 * Accepts decision input, retrieves relevant memories, calls agents in parallel,
 * stores results, and logs telemetry.
 * 
 * POST /api/decision
 * 
 * Request body:
 *   {
 *     userId: string,
 *     decisionText: string,
 *     context: string,
 *     category?: string
 *   }
 * 
 * Response:
 *   {
 *     decision: { id, text, category, ... },
 *     agents: {
 *       affirm: { response, confidence, actions, ... },
 *       challenge: { response, confidence, actions, ... }
 *     },
 *     memories: [...],
 *     meta: { processingTime, featureFlags, ... }
 *   }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isFeatureEnabled, FEATURES } from '@/lib/featureFlags';
import { getRelevantMemories, createMemoryFragment } from '@/lib/memory';
import { callAffirmAgent } from '@/agents/affirmAgent';
import { callChallengeAgent } from '@/agents/challengeAgent';
import {
  logDecisionEvent,
  logAgentResponse,
  logMemoryReference,
  logAgentDisagreement,
  logApiRequest,
} from '@/lib/telemetry';
import { env } from '@/lib/env';

// ============================================================================
// REQUEST VALIDATION
// ============================================================================

/**
 * Zod schema for validating decision request body
 * Ensures type safety and data integrity
 */
const DecisionRequestSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  decisionText: z.string().min(10, 'Decision text must be at least 10 characters').max(2000),
  context: z.string().min(10, 'Context must be at least 10 characters').max(5000),
  category: z.string().optional(),
});

type DecisionRequest = z.infer<typeof DecisionRequestSchema>;

// ============================================================================
// FEATURE FLAG CHECKS
// ============================================================================

/**
 * Check if decision loop is enabled for user
 * Respects feature flags and user tier
 */
async function checkFeatureAccess(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  // Check if decision loop is enabled globally
  const decisionLoopEnabled = await isFeatureEnabled(FEATURES.DECISION_LOOP_ENABLED, userId);
  if (!decisionLoopEnabled) {
    return { allowed: false, reason: 'Decision loop feature is not enabled' };
  }
  
  // Check if multi-agent is enabled (optional feature flag)
  const multiAgentEnabled = await isFeatureEnabled(FEATURES.MULTI_AGENT_ENABLED, userId);
  
  // Check user's decision limit (monetization hook)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true },
  });
  
  if (!user) {
    return { allowed: false, reason: 'User not found' };
  }
  
  // Count user's decisions today (monetization: free tier limit)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const decisionsToday = await prisma.decision.count({
    where: {
      userId,
      createdAt: { gte: today },
    },
  });
  
  const limit = user.tier === 'free' 
    ? parseInt(env.FREE_TIER_DECISION_LIMIT || '50')
    : 999999; // Effectively unlimited for premium users
  
  if (decisionsToday >= limit) {
    return {
      allowed: false,
      reason: `Free tier limit reached (${limit} decisions per day). Upgrade to premium for unlimited access.`,
    };
  }
  
  return { allowed: true };
}

// ============================================================================
// MAIN API HANDLER
// ============================================================================

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const startTime = Date.now();
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // 1. VALIDATE INPUT
    const validation = DecisionRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return res.status(400).json({
        error: 'Invalid request body',
        details: errors,
      });
    }
    
    const { userId, decisionText, context, category } = validation.data;
    
    // 2. CHECK FEATURE ACCESS
    const access = await checkFeatureAccess(userId);
    if (!access.allowed) {
      return res.status(403).json({
        error: access.reason,
        upgradeUrl: '/pricing', // Monetization hook: link to pricing page
      });
    }
    
    // 3. CHECK FEATURE FLAGS
    const multiAgentEnabled = await isFeatureEnabled(FEATURES.MULTI_AGENT_ENABLED, userId);
    const telemetryEnabled = await isFeatureEnabled(FEATURES.TELEMETRY_ENABLED, userId);
    
    // 4. RETRIEVE RELEVANT MEMORIES
    const memories = await getRelevantMemories(userId, `${decisionText} ${context}`, {
      category,
      limit: 5,
    });
    
    console.log(`📝 Decision from user ${userId}: Retrieved ${memories.length} memories`);
    
    // 5. CREATE DECISION RECORD
    const decision = await prisma.decision.create({
      data: {
        userId,
        decisionText,
        context,
        category: category || null,
      },
    });
    
    // 6. CALL AGENTS IN PARALLEL
    // This is the core of the multi-agent system
    const agentPromises = [];
    
    // Always call affirm agent
    const affirmPromise = callAffirmAgent(decisionText, context, memories);
    agentPromises.push(affirmPromise);
    
    // Call challenge agent if multi-agent is enabled
    let challengePromise: Promise<any> | null = null;
    if (multiAgentEnabled) {
      challengePromise = callChallengeAgent(decisionText, context, memories);
      agentPromises.push(challengePromise);
    }
    
    // Wait for all agents to respond
    const [affirmResponse, challengeResponse] = await Promise.all(agentPromises);
    
    console.log(`🤖 Agents responded: Affirm (${affirmResponse.latencyMs}ms)${challengeResponse ? `, Challenge (${challengeResponse.latencyMs}ms)` : ''}`);
    
    // 7. DETECT AGENT DISAGREEMENT
    let disagreement = false;
    let disagreementReason = '';
    
    if (challengeResponse && affirmResponse) {
      const confidenceDelta = Math.abs(affirmResponse.confidenceScore - challengeResponse.confidenceScore);
      if (confidenceDelta > 0.3) {
        disagreement = true;
        disagreementReason = 'Significant confidence score difference';
      }
    }
    
    // 8. STORE AGENT RESPONSES
    const agentResponsePromises = [
      prisma.agentResponse.create({
        data: {
          decisionId: decision.id,
          agentType: 'affirm',
          model: affirmResponse.model,
          provider: affirmResponse.provider,
          responseText: affirmResponse.responseText,
          confidenceScore: affirmResponse.confidenceScore,
          reasoning: affirmResponse.reasoning,
          suggestedActions: affirmResponse.suggestedActions,
          latencyMs: affirmResponse.latencyMs,
          disagreesWithOtherAgents: disagreement,
          disagreementReason: disagreement ? disagreementReason : null,
        },
      }),
    ];
    
    if (challengeResponse) {
      agentResponsePromises.push(
        prisma.agentResponse.create({
          data: {
            decisionId: decision.id,
            agentType: 'challenge',
            model: challengeResponse.model,
            provider: challengeResponse.provider,
            responseText: challengeResponse.responseText,
            confidenceScore: challengeResponse.confidenceScore,
            reasoning: challengeResponse.reasoning,
            suggestedActions: challengeResponse.suggestedActions,
            latencyMs: challengeResponse.latencyMs,
            disagreesWithOtherAgents: disagreement,
            disagreementReason: disagreement ? disagreementReason : null,
          },
        })
      );
    }
    
    await Promise.all(agentResponsePromises);
    
    // 9. CREATE MEMORY FRAGMENTS
    // Store key insights from this decision for future reference
    const memoryPromises = [];
    
    // Create memory from decision context
    if (context.length > 50) {
      memoryPromises.push(
        createMemoryFragment(userId, context.substring(0, 500), {
          decisionId: decision.id,
          category: category || undefined,
          tags: [category || 'decision'],
          relevanceScore: 0.8,
          confidenceScore: 0.9,
        })
      );
    }
    
    // Create memory from affirm agent's key insight
    if (affirmResponse.reasoning.length > 20) {
      memoryPromises.push(
        createMemoryFragment(
          userId,
          `Affirm: ${affirmResponse.reasoning}`,
          {
            decisionId: decision.id,
            category: category || undefined,
            tags: ['agent-insight', 'affirm', category || 'decision'],
            relevanceScore: affirmResponse.confidenceScore,
            confidenceScore: affirmResponse.confidenceScore,
          }
        )
      );
    }
    
    await Promise.all(memoryPromises);
    
    // 10. LOG TELEMETRY
    if (telemetryEnabled) {
      const telemetryPromises = [
        logDecisionEvent(userId, decision.id, {
          category: category || undefined,
          decisionLength: decisionText.length,
          contextLength: context.length,
          hasMemories: memories.length > 0,
        }),
        
        logAgentResponse(userId, decision.id, {
          agentType: 'affirm',
          model: affirmResponse.model,
          latencyMs: affirmResponse.latencyMs,
          confidenceScore: affirmResponse.confidenceScore,
          success: true,
        }),
      ];
      
      if (challengeResponse) {
        telemetryPromises.push(
          logAgentResponse(userId, decision.id, {
            agentType: 'challenge',
            model: challengeResponse.model,
            latencyMs: challengeResponse.latencyMs,
            confidenceScore: challengeResponse.confidenceScore,
            success: true,
          })
        );
      }
      
      if (memories.length > 0) {
        telemetryPromises.push(
          logMemoryReference(userId, decision.id, {
            memoryIds: memories.map(m => m.id),
            totalMemories: memories.length,
            avgRelevanceScore: memories.reduce((sum, m) => sum + m.finalScore, 0) / memories.length,
          })
        );
      }
      
      if (disagreement && challengeResponse) {
        telemetryPromises.push(
          logAgentDisagreement(userId, decision.id, {
            affirmConfidence: affirmResponse.confidenceScore,
            challengeConfidence: challengeResponse.confidenceScore,
            disagreementReason,
          })
        );
      }
      
      // Execute telemetry in background (don't await)
      Promise.all(telemetryPromises).catch(error => {
        console.error('Telemetry error:', error);
      });
    }
    
    // 11. BUILD RESPONSE
    const processingTime = Date.now() - startTime;
    
    const response = {
      decision: {
        id: decision.id,
        text: decisionText,
        context,
        category: category || null,
        createdAt: decision.createdAt,
      },
      agents: {
        affirm: {
          response: affirmResponse.responseText,
          confidence: affirmResponse.confidenceScore,
          reasoning: affirmResponse.reasoning,
          actions: affirmResponse.suggestedActions,
          latency: affirmResponse.latencyMs,
          model: affirmResponse.model,
        },
        ...(challengeResponse && {
          challenge: {
            response: challengeResponse.responseText,
            confidence: challengeResponse.confidenceScore,
            reasoning: challengeResponse.reasoning,
            actions: challengeResponse.suggestedActions,
            latency: challengeResponse.latencyMs,
            model: challengeResponse.model,
          },
        }),
      },
      memories: memories.map(m => ({
        id: m.id,
        content: m.content,
        relevanceScore: m.finalScore,
        category: m.category,
        createdAt: m.createdAt,
      })),
      meta: {
        processingTime,
        multiAgentEnabled,
        memoriesUsed: memories.length,
        disagreement,
      },
    };
    
    // Log API request performance
    await logApiRequest('/api/decision', {
      method: 'POST',
      statusCode: 200,
      latencyMs: processingTime,
      userId,
    });
    
    console.log(`✅ Decision processed in ${processingTime}ms`);
    
    return res.status(200).json(response);
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Decision API error:', error);
    
    // Log error
    await logApiRequest('/api/decision', {
      method: 'POST',
      statusCode: 500,
      latencyMs: processingTime,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
