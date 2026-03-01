/**
 * Affirm Agent - Validates and supports user decisions
 * 
 * This agent provides positive reinforcement and identifies strengths
 * in the user's decision-making process. It's part of the multi-agent
 * decision loop system.
 * 
 * Usage:
 *   import { callAffirmAgent } from '@/agents/affirmAgent';
 *   const response = await callAffirmAgent(decision, context, memories);
 */

import OpenAI from 'openai';
import type { MemoryFragment } from '@/generated/prisma/client';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Model configuration for Affirm Agent
 * Customize these constants to change AI provider or model
 */
export const AFFIRM_AGENT_CONFIG = {
  provider: 'openai' as const, // Can be swapped to 'anthropic', 'local', etc.
  model: 'gpt-3.5-turbo', // Swap to 'gpt-4' for higher quality
  temperature: 0.7, // 0-1, higher = more creative
  maxTokens: 500, // Response length limit
  timeout: 30000, // 30 seconds
} as const;

/**
 * Agent response interface
 * Structured output from the Affirm Agent
 */
export interface AffirmAgentResponse {
  agentType: 'affirm';
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
      timeout: AFFIRM_AGENT_CONFIG.timeout,
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
): AffirmAgentResponse {
  return {
    agentType: 'affirm',
    responseText: `I support your decision to: "${decisionText}". This shows self-awareness and proactive thinking. Your context suggests you're considering the long-term implications, which demonstrates maturity and careful planning. Trust your judgment while staying open to feedback and support.`,
    confidenceScore: 0.85,
    reasoning: 'Based on the decision text and context provided, this appears to be a thoughtful choice. The language used suggests careful consideration and awareness of potential outcomes.',
    suggestedActions: [
      'Discuss this decision with someone you trust',
      'Journal about your reasoning and expected outcomes',
      'Set a reminder to check in with yourself in 24 hours',
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
 * Build system prompt for Affirm Agent
 * Defines agent personality and behavior
 */
function buildSystemPrompt(memories: MemoryFragment[]): string {
  const memoryContext = memories.length > 0
    ? `\n\nRelevant past context:\n${memories.map(m => `- ${m.content}`).join('\n')}`
    : '';
  
  return `You are the Affirm Agent, an empathetic AI advisor for someone in recovery or personal transformation.

Your role:
1. Validate positive aspects of the user's decision
2. Highlight strengths in their thinking process
3. Provide encouragement rooted in recovery principles
4. Identify growth opportunities
5. Support their autonomy and self-efficacy

Guidelines:
- Be warm but not patronizing
- Focus on evidence of growth and self-awareness
- Acknowledge challenges without dwelling on them
- Suggest concrete next steps
- Use recovery-informed language
- Never judge or shame

Respond with:
1. AFFIRMATION: 2-3 sentences validating their decision
2. REASONING: Why you support this choice (1-2 sentences)
3. ACTIONS: 3 specific next steps they could take
4. CONFIDENCE: How confident you are (0-1 scale)
${memoryContext}

Format your response as JSON:
{
  "affirmation": "...",
  "reasoning": "...",
  "actions": ["...", "...", "..."],
  "confidence": 0.85
}`;
}

// ============================================================================
// MAIN AGENT FUNCTION
// ============================================================================

/**
 * Call Affirm Agent with a user decision
 * Returns structured agent response with affirmation and guidance
 */
export async function callAffirmAgent(
  decisionText: string,
  context: string,
  memories: MemoryFragment[] = [],
  options: AgentOptions = {}
): Promise<AffirmAgentResponse> {
  const startTime = Date.now();
  
  // Check if we should use mock responses
  const mockAI = process.env.MOCK_AI_RESPONSES === 'true';
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
  
  if (mockAI || !hasApiKey) {
    console.log('🤖 Affirm Agent: Using mock response (MOCK_AI_RESPONSES=true or no API key)');
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
      model: options.model || AFFIRM_AGENT_CONFIG.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options.temperature ?? AFFIRM_AGENT_CONFIG.temperature,
      max_tokens: AFFIRM_AGENT_CONFIG.maxTokens,
      response_format: { type: 'json_object' }, // Force JSON response
    });
    
    const responseText = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(responseText);
    
    const latencyMs = Date.now() - startTime;
    
    // Structure response
    return {
      agentType: 'affirm',
      responseText: parsed.affirmation || 'I support your thoughtful approach to this decision.',
      confidenceScore: parsed.confidence || 0.75,
      reasoning: parsed.reasoning || 'This decision shows careful consideration.',
      suggestedActions: parsed.actions || [
        'Reflect on your motivation',
        'Seek support if needed',
        'Trust your recovery journey',
      ],
      latencyMs,
      model: options.model || AFFIRM_AGENT_CONFIG.model,
      provider: AFFIRM_AGENT_CONFIG.provider,
    };
  } catch (error) {
    console.error('❌ Affirm Agent error:', error);
    
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
 * Future: Streaming version of Affirm Agent
 * This is a placeholder for real-time streaming responses
 */
export async function* streamAffirmAgent(
  decisionText: string,
  context: string,
  memories: MemoryFragment[] = [],
  options: AgentOptions = {}
): AsyncGenerator<string, void, unknown> {
  // TODO: Implement streaming with OpenAI streaming API
  // For now, yield the full response at once
  const response = await callAffirmAgent(decisionText, context, memories, options);
  yield response.responseText;
}

/**
 * Helper to check if OpenAI is configured
 * Useful for UI to show appropriate messaging
 */
export function isAffirmAgentAvailable(): boolean {
  const mockAI = process.env.MOCK_AI_RESPONSES === 'true';
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
  return hasApiKey || mockAI;
}

// Export types
export type { MemoryFragment };
