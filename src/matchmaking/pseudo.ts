// Random gamer-tag style pseudos for the simulated opponents.

import { pseudo } from '../../config/players';
import { Rng } from '../util/rng';

function rollPseudo(rng: Rng): string {
  return rng
    .pick(pseudo.templates)
    .replace('{a}', rng.pick(pseudo.a))
    .replace('{b}', rng.pick(pseudo.b))
    .replace('{n}', String(rng.int(pseudo.numberMin, pseudo.numberMax)));
}

/** `count` distinct pseudos that fit within the configured length. */
export function randomPseudos(count: number, rng = new Rng()): string[] {
  const out = new Set<string>();
  let tries = 0;
  while (out.size < count) {
    const name = rollPseudo(rng);
    const tooLong = name.length > pseudo.maxLength && tries++ < pseudo.maxRerolls;
    if (!tooLong) out.add(name.slice(0, pseudo.maxLength));
  }
  return [...out];
}
