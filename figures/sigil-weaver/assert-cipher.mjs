#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const card = JSON.parse(readFileSync(join(here, 'cipher.json'), 'utf8'));

if (card.figureId !== 'sigil-weaver') throw new Error('bad figureId');
const banned = card.bannedTokens || [];
const blob = JSON.stringify(card).toLowerCase();
for (const token of banned) {
  if (card.figureId.includes(token)) throw new Error('banned in id: ' + token);
}
for (const lever of ['N', 'V', 'S', 'D']) {
  if (typeof card.levers[lever] !== 'number') throw new Error('missing lever ' + lever);
}
const w = card.weights;
const total = w.N + w.V + w.S + w.D;
if (Math.abs(total - 1) > 1e-9) throw new Error('weights must sum to 1');
const density = Math.pow(
  Math.pow(card.levers.N, w.N) *
    Math.pow(card.levers.V, w.V) *
    Math.pow(card.levers.S, w.S) *
    Math.pow(card.levers.D, w.D),
  1 / total,
);
if (!card.frozen.includes('agents/affirmAgent.ts')) throw new Error('affirm not frozen');
if (!card.frozen.includes('agents/challengeAgent.ts')) throw new Error('challenge not frozen');
if (card.mergePolicy !== 'pr-only') throw new Error('merge policy must be pr-only');
console.log(`ok sigil-weaver density=${density.toFixed(3)} frozen=${card.frozen.length}`);
