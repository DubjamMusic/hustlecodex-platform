import { assertPrOnly, dispatchObjective } from './dispatch.ts';

const cases: Array<[string, string]> = [
  ['add unit tests for dispatch', 'forge'],
  ['write a 12 minute quest for concordance', 'loom'],
  ['recompute prestige density from N V S D', 'ledger'],
  ['daily streak is broken', 'pulse'],
  ['rotate jwt secrets', 'cipher'],
  ['vercel rollback production', 'nexus'],
  ['sentry anomaly on api', 'specter'],
  ['something vague', 'relay'],
];

for (const [objective, expected] of cases) {
  const got = dispatchObjective(objective).figure;
  if (got !== expected) {
    throw new Error(`dispatch("${objective}") => ${got}, expected ${expected}`);
  }
}

try {
  assertPrOnly('main');
  throw new Error('assertPrOnly(main) should throw');
} catch (err) {
  if (!(err instanceof Error) || !err.message.includes('hard stop')) {
    throw err;
  }
}

assertPrOnly('figure/forge/dispatch');
console.log(`ok ${cases.length} dispatch cases + pr-only guard`);
