// Bottom panel stage: one value describing what the player is being asked to do right now.

import { bonusByLevel, type BonusInfo } from '../../config/bonuses';
import { charge as chargeCfg } from '../../config/charge';
import { match as matchCfg } from '../../config/match';
import { staging } from '../../config/staging';
import type { MatchUi } from '../game/snapshot';

export type PanelStage =
  /** Next charge round is coming; `ready` during the last seconds. */
  | { kind: 'waiting'; secs: number; progress: number; ready: boolean }
  /** All rounds played: only the territory war is left. */
  | { kind: 'lastStretch'; secs: number; progress: number }
  | { kind: 'ended' }
  | { kind: 'dealing' }
  /** The human must pick CHARGER or FEU !. `fire` is the shot firing now would give, `risk` the jam chance of one more card. */
  | { kind: 'deciding'; timeK: number; urgent: boolean; level: number; fire: BonusInfo | null; risk: number }
  /** The human's gauge is resolved (others may still play, then results). */
  | { kind: 'resolved' };

export function panelStage(ui: MatchUi): PanelStage {
  if (ui.phase === 'ending' || ui.phase === 'over') return { kind: 'ended' };
  const g = ui.gauge;
  if (g) {
    if (g.phase === 'dealing') return { kind: 'dealing' };
    if (g.phase === 'deciding' && g.status === 'charging') {
      const timeK = g.decisionLeft / chargeCfg.decisionTimeSec;
      return { kind: 'deciding', timeK, urgent: timeK < staging.urgentDecisionK, level: g.level, fire: bonusByLevel[g.level] ?? null, risk: g.risk };
    }
    return { kind: 'resolved' };
  }
  const left = ui.nextRoundIn;
  if (left === null) return { kind: 'lastStretch', secs: Math.ceil(ui.timeLeft), progress: ui.timeLeft / matchCfg.durationSec };
  const span = ui.roundsStarted === 0 ? matchCfg.firstRoundAtSec : matchCfg.roundIntervalSec;
  const secs = Math.ceil(left);
  return { kind: 'waiting', secs, progress: 1 - left / span, ready: ui.phase === 'playing' && secs <= staging.readySec };
}

/** True while a round is on (the drawer is open and the gauge takes the focus). */
export const roundOn = (s: PanelStage) => s.kind === 'dealing' || s.kind === 'deciding' || s.kind === 'resolved';
