// Cards and hand evaluation. Each player draws from an independent infinite shoe.

import { blackjack as cfg } from '../../config/blackjack';
import type { Rng } from '../util/rng';

export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
export const SUITS = ['♠', '♥', '♦', '♣'] as const;

export type Rank = (typeof RANKS)[number];
export type Suit = (typeof SUITS)[number];

export interface Card {
  rank: Rank;
  suit: Suit;
  id: number;
}

let nextId = 1;

export function drawCard(rng: Rng): Card {
  return { rank: rng.pick(RANKS), suit: rng.pick(SUITS), id: nextId++ };
}

export function isRed(suit: Suit) {
  return suit === '♥' || suit === '♦';
}

export function cardValue(rank: Rank): number {
  if (rank === 'A') return cfg.aceLow;
  if (rank === 'J' || rank === 'Q' || rank === 'K') return cfg.faceValue;
  return Number(rank);
}

/** Best total ≤ target when possible (aces count high if that does not bust). */
export function handTotal(cards: Card[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    total += cardValue(c.rank);
    if (c.rank === 'A') aces++;
  }
  const bump = cfg.aceHigh - cfg.aceLow;
  const soft = aces > 0 && total + bump <= cfg.target;
  return { total: soft ? total + bump : total, soft };
}
