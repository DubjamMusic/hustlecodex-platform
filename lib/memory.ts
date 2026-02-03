/**
 * Memory Management System
 * 
 * Handles memory fragments - context snippets from past decisions
 * that inform future agent responses. Implements scoring, decay,
 * and relevance algorithms to prioritize useful memories.
 * 
 * Usage:
 *   import { getRelevantMemories, createMemoryFragment } from '@/lib/memory';
 *   const memories = await getRelevantMemories(userId, currentDecision);
 */

import { prisma, MemoryFragment, Prisma } from './prisma';
import { env } from './env';

/**
 * Memory scoring configuration
 * Tune these values to adjust memory relevance behavior
 */
export const MEMORY_CONFIG = {
  // Decay constants
  DECAY_HALF_LIFE_DAYS: 30, // Memories lose half their weight every 30 days
  MAX_AGE_DAYS: 365, // Memories older than 1 year are archived
  
  // Relevance thresholds
  MIN_RELEVANCE_SCORE: 0.3, // Memories below this are filtered out
  MIN_CONFIDENCE_SCORE: 0.5, // Low-confidence memories are weighted less
  
  // Limits (free tier)
  FREE_TIER_MEMORY_LIMIT: parseInt(env.FREE_TIER_MEMORY_LIMIT || '100'),
  PREMIUM_TIER_MEMORY_LIMIT: 10000, // Effectively unlimited
  
  // Retrieval
  DEFAULT_MEMORY_COUNT: 5, // Number of memories to return by default
  MAX_MEMORY_COUNT: 20, // Maximum memories to return in one query
} as const;

/**
 * Interface for memory scoring results
 */
export interface ScoredMemory extends MemoryFragment {
  finalScore: number; // Composite score (relevance * confidence * decay)
}

/**
 * Calculate time-based decay factor
 * Uses exponential decay: score = e^(-λt) where λ = ln(2) / half_life
 * 
 * @param createdAt - When the memory was created
 * @returns Decay factor between 0 and 1
 */
export function calculateDecayFactor(createdAt: Date): number {
  const ageMs = Date.now() - createdAt.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  
  // If memory is too old, return 0
  if (ageDays > MEMORY_CONFIG.MAX_AGE_DAYS) {
    return 0;
  }
  
  // Exponential decay formula
  const lambda = Math.log(2) / MEMORY_CONFIG.DECAY_HALF_LIFE_DAYS;
  const decayFactor = Math.exp(-lambda * ageDays);
  
  return decayFactor;
}

/**
 * Calculate relevance score for a memory given current context
 * Uses simple keyword matching (can be enhanced with embeddings/semantic search)
 * 
 * @param memory - The memory fragment to score
 * @param currentContext - The current decision context
 * @returns Relevance score between 0 and 1
 */
export function calculateRelevanceScore(
  memory: MemoryFragment,
  currentContext: string
): number {
  // Normalize text for comparison
  const memoryText = memory.content.toLowerCase();
  const contextText = currentContext.toLowerCase();
  
  let score = 0;
  
  // 1. Exact phrase match (highest weight)
  if (contextText.includes(memoryText) || memoryText.includes(contextText)) {
    score += 0.5;
  }
  
  // 2. Category match
  if (memory.category) {
    const categoryWords = memory.category.toLowerCase().split(/\s+/);
    for (const word of categoryWords) {
      if (contextText.includes(word)) {
        score += 0.2;
        break;
      }
    }
  }
  
  // 3. Tag match
  if (memory.tags && memory.tags.length > 0) {
    const matchingTags = memory.tags.filter(tag =>
      contextText.includes(tag.toLowerCase())
    );
    score += Math.min(matchingTags.length * 0.1, 0.3);
  }
  
  // 4. Word overlap (TF-IDF-like, simplified)
  const memoryWords = new Set(memoryText.split(/\s+/).filter(w => w.length > 3));
  const contextWords = new Set(contextText.split(/\s+/).filter(w => w.length > 3));
  
  const intersection = new Set([...memoryWords].filter(w => contextWords.has(w)));
  const union = new Set([...memoryWords, ...contextWords]);
  
  if (union.size > 0) {
    const jaccardSimilarity = intersection.size / union.size;
    score += jaccardSimilarity * 0.3;
  }
  
  // Normalize to 0-1 range
  return Math.min(score, 1.0);
}

/**
 * Calculate final composite score for a memory
 * Combines relevance, confidence, and decay
 */
export function calculateFinalScore(
  relevanceScore: number,
  confidenceScore: number,
  decayFactor: number
): number {
  // Weighted product of all factors
  return relevanceScore * confidenceScore * decayFactor;
}

/**
 * Get relevant memories for a given decision context
 * Returns scored and sorted memories
 */
export async function getRelevantMemories(
  userId: string,
  currentContext: string,
  options: {
    category?: string;
    limit?: number;
    minScore?: number;
  } = {}
): Promise<ScoredMemory[]> {
  const {
    category,
    limit = MEMORY_CONFIG.DEFAULT_MEMORY_COUNT,
    minScore = MEMORY_CONFIG.MIN_RELEVANCE_SCORE,
  } = options;
  
  // Fetch user's memories from database
  const memories = await prisma.memoryFragment.findMany({
    where: {
      userId,
      isArchived: false,
      ...(category && { category }),
    },
    orderBy: {
      lastAccessedAt: 'desc', // Most recently accessed first
    },
    take: MEMORY_CONFIG.MAX_MEMORY_COUNT * 2, // Fetch more to filter
  });
  
  // Score each memory
  const scoredMemories: ScoredMemory[] = memories.map(memory => {
    const relevanceScore = calculateRelevanceScore(memory, currentContext);
    const decayFactor = calculateDecayFactor(memory.createdAt);
    const finalScore = calculateFinalScore(
      relevanceScore,
      memory.confidenceScore,
      decayFactor
    );
    
    return {
      ...memory,
      finalScore,
    };
  });
  
  // Filter and sort by final score
  const filtered = scoredMemories
    .filter(m => m.finalScore >= minScore)
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, limit);
  
  // Update lastAccessedAt for retrieved memories
  if (filtered.length > 0) {
    await prisma.memoryFragment.updateMany({
      where: {
        id: { in: filtered.map(m => m.id) },
      },
      data: {
        lastAccessedAt: new Date(),
      },
    });
  }
  
  return filtered;
}

/**
 * Create a new memory fragment from a decision
 */
export async function createMemoryFragment(
  userId: string,
  content: string,
  metadata: {
    decisionId?: string;
    category?: string;
    tags?: string[];
    relevanceScore?: number;
    confidenceScore?: number;
  }
): Promise<MemoryFragment> {
  // Check user's memory limit (monetization hook)
  const userMemoryCount = await prisma.memoryFragment.count({
    where: { userId, isArchived: false },
  });
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true },
  });
  
  const memoryLimit = user?.tier === 'free'
    ? MEMORY_CONFIG.FREE_TIER_MEMORY_LIMIT
    : MEMORY_CONFIG.PREMIUM_TIER_MEMORY_LIMIT;
  
  // Archive oldest memories if over limit
  if (userMemoryCount >= memoryLimit) {
    const oldestMemories = await prisma.memoryFragment.findMany({
      where: { userId, isArchived: false },
      orderBy: { lastAccessedAt: 'asc' },
      take: Math.max(1, userMemoryCount - memoryLimit + 1),
      select: { id: true },
    });
    
    await prisma.memoryFragment.updateMany({
      where: {
        id: { in: oldestMemories.map(m => m.id) },
      },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });
  }
  
  // Create new memory
  return prisma.memoryFragment.create({
    data: {
      userId,
      content,
      decisionId: metadata.decisionId,
      category: metadata.category,
      tags: metadata.tags || [],
      relevanceScore: metadata.relevanceScore || 1.0,
      confidenceScore: metadata.confidenceScore || 1.0,
      decayFactor: 1.0, // Starts at full strength
    },
  });
}

/**
 * Update memory scores based on user feedback
 * Called when user rates a decision's quality
 */
export async function updateMemoryScores(
  decisionId: string,
  feedbackScore: number // 1-5
): Promise<void> {
  // Normalize feedback to 0-1 range
  const normalizedScore = feedbackScore / 5;
  
  // Update confidence scores for all memories linked to this decision
  await prisma.memoryFragment.updateMany({
    where: { decisionId },
    data: {
      confidenceScore: normalizedScore,
    },
  });
}

/**
 * Archive old memories based on decay
 * Run this periodically (cron job or on user activity)
 */
export async function archiveOldMemories(userId: string): Promise<number> {
  const oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - MEMORY_CONFIG.MAX_AGE_DAYS);
  
  const result = await prisma.memoryFragment.updateMany({
    where: {
      userId,
      createdAt: { lt: oldDate },
      isArchived: false,
    },
    data: {
      isArchived: true,
      archivedAt: new Date(),
    },
  });
  
  return result.count;
}

/**
 * Example usage and test data
 * Uncomment to seed test memories for development
 */
export async function seedTestMemories(userId: string): Promise<void> {
  const testMemories = [
    {
      content: 'User successfully avoided a trigger by calling their sponsor',
      category: 'recovery',
      tags: ['trigger', 'sponsor', 'success'],
      relevanceScore: 0.9,
      confidenceScore: 1.0,
    },
    {
      content: 'User struggled with React hooks but found a solution in the docs',
      category: 'coding',
      tags: ['react', 'hooks', 'documentation'],
      relevanceScore: 0.8,
      confidenceScore: 0.9,
    },
    {
      content: 'User felt overwhelmed and took a break, which helped',
      category: 'self-care',
      tags: ['overwhelm', 'break', 'mental-health'],
      relevanceScore: 0.7,
      confidenceScore: 0.8,
    },
  ];
  
  for (const memory of testMemories) {
    await createMemoryFragment(userId, memory.content, memory);
  }
  
  console.log(`✅ Seeded ${testMemories.length} test memories for user ${userId}`);
}
