// Powder cards and the odds shown to the player. Each player draws from an independent infinite shoe.

import { charge as cfg } from '../../config/charge';
import type { Rng } from '../util/rng';

export interface PowderCard {
  value: number;
  id: number;
}

let nextId = 1;

export function drawCard(rng: Rng): PowderCard {
  return { value: rng.pick(cfg.deck), id: nextId++ };
}

export const levelOf = (cards: PowderCard[]) => cards.reduce((sum, c) => sum + c.value, 0);

export const minCard = Math.min(...cfg.deck);
export const maxCard = Math.max(...cfg.deck);

/** Chance (0–1) that one more card jams a cannon at `level`. Exact: the shoe is infinite. */
export function jamRisk(level: number): number {
  return cfg.deck.filter((v) => level + v > cfg.cap).length / cfg.deck.length;
}
