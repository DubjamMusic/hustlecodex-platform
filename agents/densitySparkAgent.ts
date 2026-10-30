/**
 * Density Spark Agent - Action Figure ID: density-spark
 * Bound primary repo: hustlecodex-platform
 * Wave: 20261030
 *
 * Role: Compute and optimize Prestige Density scores.
 * Knowledge required: Geometric mean formula Density = (N^wN * V^wV * S^wS * D^wD)^(1/sumW)
 * Responsibilities:
 * - Score tasks across Nodes, Velocity, Streak, Decision
 * - Return density + 3 recommended actions
 * - Never touch frozen affirmAgent / challengeAgent pair
 */

export interface DensityScores {
  nodes: number; // 0-100 clarity/structure
  velocity: number; // 0-100 speed
  streak: number; // 0-100 consistency
  decision: number; // 0-100 impact/correctness
}

export interface DensityResult {
  density: number;
  insights: string[];
  nextActions: string[];
}

const WEIGHTS = { nodes: 0.3, velocity: 0.25, streak: 0.2, decision: 0.25 };

export function computeDensity(scores: DensityScores): DensityResult {
  const { nodes, velocity, streak, decision } = scores;
  const wSum = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  const product = Math.pow(nodes, WEIGHTS.nodes) *
                  Math.pow(velocity, WEIGHTS.velocity) *
                  Math.pow(streak, WEIGHTS.streak) *
                  Math.pow(decision, WEIGHTS.decision);
  const density = Math.pow(product, 1 / wSum);

  return {
    density: Math.round(density * 100) / 100,
    insights: [
      `Nodes ${nodes}: structure clarity`,
      `Velocity ${velocity}: execution speed`,
      `Streak ${streak}: reliability over time`,
      `Decision ${decision}: goal alignment`
    ],
    nextActions: [
      'Refine node definitions for clearer task boundaries',
      'Add velocity instrumentation to measure response latency',
      'Log streak events to detect consistency regressions'
    ]
  };
}

export const FIGURE_ID = 'density-spark';
export const WAVE_ID = '20261030';
