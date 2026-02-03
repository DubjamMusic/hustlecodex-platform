/**
 * Challenge Agent - Questions and pressure-tests user decisions
 * 
 * This agent provides critical analysis and identifies potential risks
 * in the user's decision-making process. It balances the Affirm Agent
 * to provide comprehensive decision support.
 * 
 * Usage:
 *   import { callChallengeAgent } from '@/agents/challengeAgent';
 *   const response = await callChallengeAgent(decision, context, memories);
 */

import OpenAI from 'openai';
import type { MemoryFragment } from '@prisma/client';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Model configuration for Challenge Agent
 * Customize these constants to change AI provider or model
 */
export const CHALLENGE_AGENT_CONFIG = {
  provider: 'openai' as const, // Can be swapped to 'anthropic', 'local', etc.
  model: 'gpt-3.5-turbo', // Swap to 'gpt-4' for higher quality
  temperature: 0.8, // Slightly higher than affirm for diverse perspectives
  maxTokens: 500, // Response length limit
  timeout: 30000, // 30 seconds
} as const;

/**
 * Agent response interface
 * Structured output from the Challenge Agent
 */
export interface ChallengeAgentResponse {
  agentType: 'challenge';
  responseText: string;
  confidenceScore: number; // 0-1
  reasoning: string;
  suggestedActions: string[];
  latencyMs: number;
  model: string;
  provider: string;
  disagreesWithOtherAgents?: boolean;
}

/**
 * Agent options for customization
 */
export interface AgentOptions {
  userId?: string;
  streaming?: boolean; // Future: enable streaming responses
  model?: string; // Override default model
  temperature?: number; // Override default temperature
}

// ============================================================================
// OPENAI CLIENT INITIALIZATION
// ============================================================================

let openaiClient: OpenAI | null = null;

/**
 * Get or initialize OpenAI client
 * Lazy initialization to avoid errors if API key is missing
 */
function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey,
      timeout: CHALLENGE_AGENT_CONFIG.timeout,
    });
  }
  
  return openaiClient;
}

// ============================================================================
// MOCK RESPONSES
// ============================================================================

/**
 * Generate mock response when AI is not available
 * Used when MOCK_AI_RESPONSES=true or OPENAI_API_KEY is missing
 */
function generateMockResponse(
  decisionText: string,
  context: string
): ChallengeAgentResponse {
  return {
    agentType: 'challenge',
    responseText: `Let me challenge you on: "${decisionText}". Have you considered all potential risks? While your context shows thought, I want you to dig deeper into the "what ifs" that could derail this choice. Recovery requires us to anticipate obstacles, not just hope for the best.`,
    confidenceScore: 0.75,
    reasoning: 'Based on the decision and context, there may be hidden risks or blind spots that need addressing. The language suggests optimism, but we need to balance that with realism.',
    suggestedActions: [
      'List 3 things that could go wrong with this decision',
      'Identify your triggers and how this decision affects them',
      'Talk to someone who might disagree with this choice',
    ],
    latencyMs: 50,
    model: 'mock-model',
    provider: 'mock',
  };
}

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

/**
 * Build system prompt for Challenge Agent
 * Defines agent personality and behavior
 */
function buildSystemPrompt(memories: MemoryFragment[]): string {
  const memoryContext = memories.length > 0
    ? `\n\nRelevant past context:\n${memories.map(m => `- ${m.content}`).join('\n')}`
    : '';
  
  return `You are the Challenge Agent, a critical-thinking AI advisor for someone in recovery or personal transformation.

Your role:
1. Question assumptions in the user's decision
2. Identify potential risks and blind spots
3. Pressure-test their reasoning
4. Offer alternative perspectives
5. Encourage deeper self-reflection

Guidelines:
- Be direct but not harsh
- Focus on constructive criticism, not judgment
- Ask probing questions
- Highlight potential consequences
- Balance realism with support
- Never dismiss their autonomy

Respond with:
1. CHALLENGE: 2-3 sentences questioning their decision or raising concerns
2. REASONING: Why you're raising these concerns (1-2 sentences)
3. ACTIONS: 3 specific next steps to address risks
4. CONFIDENCE: How confident you are in your concerns (0-1 scale)
${memoryContext}

Format your response as JSON:
{
  "challenge": "...",
  "reasoning": "...",
  "actions": ["...", "...", "..."],
  "confidence": 0.75
}`;
}

// ============================================================================
// MAIN AGENT FUNCTION
// ============================================================================

/**
 * Call Challenge Agent with a user decision
 * Returns structured agent response with critical analysis
 */
export async function callChallengeAgent(
  decisionText: string,
  context: string,
  memories: MemoryFragment[] = [],
  options: AgentOptions = {}
): Promise<ChallengeAgentResponse> {
  const startTime = Date.now();
  
  // Check if we should use mock responses
  const mockAI = process.env.MOCK_AI_RESPONSES === 'true';
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
  
  if (mockAI || !hasApiKey) {
    console.log('🤖 Challenge Agent: Using mock response (MOCK_AI_RESPONSES=true or no API key)');
    return generateMockResponse(decisionText, context);
  }
  
  try {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error('OpenAI client not initialized');
    }
    
    // Build prompt
    const systemPrompt = buildSystemPrompt(memories);
    const userPrompt = `Decision: ${decisionText}\n\nContext: ${context}`;
    
    // Call OpenAI API
    const completion = await client.chat.completions.create({
      model: options.model || CHALLENGE_AGENT_CONFIG.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options.temperature ?? CHALLENGE_AGENT_CONFIG.temperature,
      max_tokens: CHALLENGE_AGENT_CONFIG.maxTokens,
      response_format: { type: 'json_object' }, // Force JSON response
    });
    
    const responseText = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(responseText);
    
    const latencyMs = Date.now() - startTime;
    
    // Structure response
    return {
      agentType: 'challenge',
      responseText: parsed.challenge || 'Consider the potential risks and consequences of this decision more carefully.',
      confidenceScore: parsed.confidence || 0.7,
      reasoning: parsed.reasoning || 'Every decision has risks that need to be acknowledged.',
      suggestedActions: parsed.actions || [
        'Identify potential obstacles',
        'Prepare contingency plans',
        'Seek diverse perspectives',
      ],
      latencyMs,
      model: options.model || CHALLENGE_AGENT_CONFIG.model,
      provider: CHALLENGE_AGENT_CONFIG.provider,
    };
  } catch (error) {
    console.error('❌ Challenge Agent error:', error);
    
    // Fallback to mock response on error
    const latencyMs = Date.now() - startTime;
    const mockResponse = generateMockResponse(decisionText, context);
    return {
      ...mockResponse,
      latencyMs,
      responseText: mockResponse.responseText + ' (Note: Fallback response due to API error)',
    };
  }
}

/**
 * Future: Streaming version of Challenge Agent
 * This is a placeholder for real-time streaming responses
 */
export async function* streamChallengeAgent(
  decisionText: string,
  context: string,
  memories: MemoryFragment[] = [],
  options: AgentOptions = {}
): AsyncGenerator<string, void, unknown> {
  // TODO: Implement streaming with OpenAI streaming API
  // For now, yield the full response at once
  const response = await callChallengeAgent(decisionText, context, memories, options);
  yield response.responseText;
}

/**
 * Helper to check if OpenAI is configured
 * Useful for UI to show appropriate messaging
 */
export function isChallengeAgentAvailable(): boolean {
  const mockAI = process.env.MOCK_AI_RESPONSES === 'true';
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
  return hasApiKey || mockAI;
}

// Export types
export type { MemoryFragment };
