// src/lib/generateMeeBot.ts
import { parts } from './meebotParts';

type TraitType = 'BODY' | 'CORE' | 'HEAD' | 'EFFECT';

function pickRandom(partList: { name: string; rarity: number }[]) {
  const total = partList.reduce((sum, p) => sum + p.rarity, 0);
  const rand = Math.random() * total;
  let cumulative = 0;
  for (const p of partList) {
    cumulative += p.rarity;
    if (rand <= cumulative) return p.name;
  }
  // Fallback in case of floating point inaccuracies
  return partList[0].name;
}

export function generateMeeBot(id: number, overrides: Partial<Record<TraitType, string>> = {}) {
  const body = overrides.BODY || pickRandom(parts.body);
  const core = overrides.CORE || pickRandom(parts.core);
  const head = overrides.HEAD || pickRandom(parts.head);
  const effect = overrides.EFFECT || pickRandom(parts.effect);

  const formattedId = String(id).padStart(4, '0');

  return {
    name: `MeeBot #${formattedId}`,
    description: `A unique, procedurally generated MeeBot. This one features a ${body} body, a ${core} core, a ${head} head, and a ${effect} effect.`,
    image: `ipfs://YOUR_CID_HERE/images/${id}.png`, // Placeholder
    attributes: [
      { trait_type: "BODY" as TraitType, value: body },
      { trait_type: "CORE" as TraitType, value: core },
      { trait_type: "HEAD" as TraitType, value: head },
      { trait_type: "EFFECT" as TraitType, value: effect }
    ]
  };
}