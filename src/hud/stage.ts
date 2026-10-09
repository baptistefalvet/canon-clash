// Bottom panel stage: one value describing what the player is being asked to do right now.

import { bonusByTotal, type BonusInfo } from '../../config/bonuses';
import { blackjack as bjCfg } from '../../config/blackjack';
import { match as matchCfg } from '../../config/match';
import { staging } from '../../config/staging';
import type { MatchUi } from '../game/snapshot';

export type PanelStage =
  /** Next deal is coming; `ready` during the last seconds. */
  | { kind: 'waiting'; secs: number; progress: number; ready: boolean }
  /** All deals played: only the territory war is left. */
  | { kind: 'lastStretch'; secs: number; progress: number }
  | { kind: 'ended' }
  | { kind: 'dealing' }
  /** The human must pick HIT or STAND. `stand` is the bonus standing now would give. */
  | { kind: 'deciding'; timeK: number; urgent: boolean; total: number; stand: BonusInfo | null }
  /** The human's hand is resolved (others may still play, then results). */
  | { kind: 'resolved' };

export function panelStage(ui: MatchUi): PanelStage {
  if (ui.phase === 'ending' || ui.phase === 'over') return { kind: 'ended' };
  const h = ui.hand;
  if (h) {
    if (h.phase === 'dealing') return { kind: 'dealing' };
    if (h.phase === 'deciding' && h.status === 'playing') {
      const timeK = h.decisionLeft / bjCfg.decisionTimeSec;
      const stand = h.total >= bjCfg.minBonusTotal ? (bonusByTotal[h.total] ?? null) : null;
      return { kind: 'deciding', timeK, urgent: timeK < staging.urgentDecisionK, total: h.total, stand };
    }
    return { kind: 'resolved' };
  }
  const left = ui.nextRoundIn;
  if (left === null) return { kind: 'lastStretch', secs: Math.ceil(ui.timeLeft), progress: ui.timeLeft / matchCfg.durationSec };
  const span = ui.roundsStarted === 0 ? matchCfg.firstRoundAtSec : matchCfg.roundIntervalSec;
  const secs = Math.ceil(left);
  return { kind: 'waiting', secs, progress: 1 - left / span, ready: ui.phase === 'playing' && secs <= staging.readySec };
}

/** True while a hand is on the table (bonus row shrinks, hand area takes the focus). */
export const handOnTable = (s: PanelStage) => s.kind === 'dealing' || s.kind === 'deciding' || s.kind === 'resolved';
