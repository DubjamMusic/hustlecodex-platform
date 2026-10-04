/**
 * badge-spar — Wave Q spar
 * Repo: hustlecodex-platform
 * Job: mint a prestige badge tier from N/V/S/D.
 * Frozen this wave: agents/affirmAgent.ts and agents/challengeAgent.ts.
 * Does not read env, tokens, or secret stores.
 */

export const WAVE_ID = 'Q-20261004-spar';
export const FIGURE_ID = 'badge-spar';

export type BadgeScores = {
  nodes: number;
  velocity: number;
  streak: number;
  decision: number;
};

export type BadgeTier = 'ember' | 'spark' | 'flare' | 'nova';

export type BadgeMint = {
  figureId: typeof FIGURE_ID;
  waveId: typeof WAVE_ID;
  primaryPath: 'lib/figures/badgeSparContract.ts';
  density: number;
  tier: BadgeTier;
  frozenAgents: ['affirmAgent', 'challengeAgent'];
};

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function prestigeDensity(scores: BadgeScores): number {
  const nodes = clamp(scores.nodes);
  const velocity = clamp(scores.velocity);
  const streak = clamp(scores.streak);
  const decision = clamp(scores.decision);
  return Math.round(Math.pow(nodes * velocity * streak * decision, 0.25));
}

export function mintBadge(scores: BadgeScores): BadgeMint {
  const density = prestigeDensity(scores);
  const tier: BadgeTier =
    density >= 85 ? 'nova' : density >= 70 ? 'flare' : density >= 50 ? 'spark' : 'ember';
  return {
    figureId: FIGURE_ID,
    waveId: WAVE_ID,
    primaryPath: 'lib/figures/badgeSparContract.ts',
    density,
    tier,
    frozenAgents: ['affirmAgent', 'challengeAgent'],
  };
}

export function badgeSelfCheck(): { passed: number; waveId: string; figureId: string } {
  const nova = mintBadge({ nodes: 90, velocity: 88, streak: 86, decision: 92 });
  if (nova.tier !== 'nova' || nova.density < 85) throw new Error('nova miss');
  const ember = mintBadge({ nodes: 10, velocity: 20, streak: 30, decision: 40 });
  if (ember.tier !== 'ember') throw new Error('ember miss');
  if (nova.frozenAgents.join(',') !== 'affirmAgent,challengeAgent') {
    throw new Error('frozen pair drifted');
  }
  return { passed: 3, waveId: WAVE_ID, figureId: FIGURE_ID };
}
