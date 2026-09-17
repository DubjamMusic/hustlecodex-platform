/**
 * Relay dispatch — maps an objective to one Action figure.
 * Keep this file free of Cipher/Nexus/Specter prose.
 */

export type FigureId =
  | 'forge'
  | 'loom'
  | 'ledger'
  | 'relay'
  | 'pulse'
  | 'cipher'
  | 'nexus'
  | 'specter'
  | 'affirm'
  | 'challenge';

export interface DispatchResult {
  figure: FigureId;
  reason: string;
  branchPrefix: string;
  mergePolicy: 'pr-only';
}

const RULES: Array<{ figure: FigureId; needles: string[] }> = [
  { figure: 'cipher', needles: ['security', 'auth', 'crypto', 'owasp', 'jwt'] },
  { figure: 'nexus', needles: ['deploy', 'vercel', 'rollback', 'env var'] },
  { figure: 'specter', needles: ['anomaly', 'observability', 'sentry', 'logs'] },
  { figure: 'affirm', needles: ['affirm', 'validate decision'] },
  { figure: 'challenge', needles: ['challenge the decision', 'devil advocate'] },
  { figure: 'ledger', needles: ['density', 'prestige', 'n/v/s/d', 'xlsx'] },
  { figure: 'loom', needles: ['quest', 'narrative', 'player', 'story'] },
  { figure: 'pulse', needles: ['streak', 'daily', 'velocity', 'reminder'] },
  { figure: 'forge', needles: ['implement', 'test', 'pr', 'code', 'typescript', 'python'] },
];

export function dispatchObjective(objective: string): DispatchResult {
  const hay = objective.toLowerCase();
  const hit = RULES.find((rule) => rule.needles.some((n) => hay.includes(n)));
  const figure = hit?.figure ?? 'relay';
  return {
    figure,
    reason: hit ? `matched:${hit.needles.find((n) => hay.includes(n))}` : 'no-match-default-relay',
    branchPrefix: `figure/${figure}/`,
    mergePolicy: 'pr-only',
  };
}

export function assertPrOnly(targetBranch: string): void {
  if (targetBranch === 'main' || targetBranch === 'master') {
    throw new Error('Relay hard stop: writes go to figure/* branches, not main');
  }
}
