// Read-only view of the match for the React HUD (refreshed a few times per second + on events).

import { blackjack as bjCfg } from '../../config/blackjack';
import { match as cfg } from '../../config/match';
import type { Card } from '../blackjack/cards';
import type { HandStatus, RoundPhase } from '../blackjack/round';
import type { Match, MatchPhase } from './match';

export interface HumanHandUi {
  index: number;
  phase: RoundPhase;
  decisionLeft: number;
  cards: Card[];
  total: number;
  soft: boolean;
  status: HandStatus;
  outcome: number | null;
}

/** An opponent's hand in the current deal (shown in the drawer). */
export interface RivalHandUi {
  seat: number;
  total: number;
  cards: number;
  status: HandStatus;
  outcome: number | null;
}

export interface MatchUi {
  phase: MatchPhase;
  timeLeft: number;
  shares: number[];
  ranks: number[];
  roundsStarted: number;
  roundsTotal: number;
  nextRoundIn: number | null;
  hand: HumanHandUi | null;
  /** Opponents' hands during a deal (empty between deals). */
  rivals: RivalHandUi[];
  /** Human outcome of the last finished deal (until the next one starts). */
  lastOutcome: number | null;
}

export function snapshot(m: Match): MatchUi {
  const r = m.round;
  const h = r?.human;
  const next = m.nextRoundAt;
  return {
    phase: m.phase,
    timeLeft: m.timeLeft,
    shares: m.shares(),
    ranks: m.ranks(),
    roundsStarted: m.roundsStarted,
    roundsTotal: cfg.blackjackRounds,
    nextRoundIn: next === null ? null : Math.max(0, next - m.time),
    hand:
      r && h
        ? {
            index: r.index,
            phase: r.phase,
            decisionLeft: Math.max(0, r.decisionLeft),
            cards: [...h.cards],
            total: h.total,
            soft: h.soft,
            status: h.status,
            outcome: r.outcome(h.seat),
          }
        : null,
    rivals: r
      ? r.hands
          .filter((x) => !x.isHuman)
          .map((x) => ({ seat: x.seat, total: x.total, cards: x.cards.length, status: x.status, outcome: r.outcome(x.seat) }))
      : [],
    lastOutcome: m.lastOutcome[m.humanSeat],
  };
}

export const decisionTotal = bjCfg.decisionTimeSec;
