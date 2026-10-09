// Read-only view of the match for the React HUD (refreshed a few times per second + on events).

import { match as cfg } from '../../config/match';
import { jamRisk, type PowderCard } from '../charge/cards';
import type { GaugeStatus, RoundPhase } from '../charge/round';
import type { Match, MatchPhase } from './match';

export interface HumanGaugeUi {
  index: number;
  phase: RoundPhase;
  decisionLeft: number;
  cards: PowderCard[];
  level: number;
  status: GaugeStatus;
  full: boolean;
  outcome: number | null;
  /** Chance (0–1) that one more card jams the cannon. */
  risk: number;
}

/** An opponent's gauge in the current round (shown in the drawer). */
export interface RivalGaugeUi {
  seat: number;
  level: number;
  cards: number;
  status: GaugeStatus;
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
  gauge: HumanGaugeUi | null;
  /** Opponents' gauges during a round (empty between rounds). */
  rivals: RivalGaugeUi[];
  /** Human outcome of the last finished round (until the next one starts). */
  lastOutcome: number | null;
  /** Seconds left with the human's cannon jammed. */
  jamLeft: number;
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
    roundsTotal: cfg.chargeRounds,
    nextRoundIn: next === null ? null : Math.max(0, next - m.time),
    gauge:
      r && h
        ? {
            index: r.index,
            phase: r.phase,
            decisionLeft: Math.max(0, r.decisionLeft),
            cards: [...h.cards],
            level: h.level,
            status: h.status,
            full: h.full,
            outcome: r.outcome(h.seat),
            risk: jamRisk(h.level),
          }
        : null,
    rivals: r
      ? r.gauges
          .filter((x) => !x.isHuman)
          .map((x) => ({ seat: x.seat, level: x.level, cards: x.cards.length, status: x.status, outcome: r.outcome(x.seat) }))
      : [],
    lastOutcome: m.lastOutcome[m.humanSeat],
    jamLeft: m.cannons[m.humanSeat].jamLeft,
  };
}
