// One charge round played simultaneously by the 4 seats (human decides, bots follow their threshold).

import { charge as cfg } from '../../config/charge';
import type { Rng } from '../util/rng';
import { drawCard, levelOf, type PowderCard } from './cards';

/** charging → fired (FEU !, or gauge exactly full) | jammed (over the cap). */
export type GaugeStatus = 'charging' | 'fired' | 'jammed';
export type RoundPhase = 'dealing' | 'deciding' | 'results' | 'done';

export interface Gauge {
  seat: number;
  isHuman: boolean;
  fireAt: number;
  cards: PowderCard[];
  level: number;
  status: GaugeStatus;
  /** Filled the gauge exactly: auto-fire, best shot. */
  full: boolean;
  nextActionIn: number;
}

export type RoundEvent =
  | { type: 'card'; seat: number; level: number }
  | { type: 'resolved'; seat: number; status: GaugeStatus; level: number }
  | { type: 'phase'; phase: RoundPhase };

export class ChargeRound {
  phase: RoundPhase = 'dealing';
  phaseTime = 0;
  decisionLeft = cfg.decisionTimeSec;
  readonly gauges: Gauge[];
  readonly events: RoundEvent[] = [];
  private dealt = 0;

  constructor(
    readonly index: number,
    seats: { isHuman: boolean; fireAt: number }[],
    private rng: Rng,
  ) {
    this.gauges = seats.map((s, seat) => ({
      seat,
      isHuman: s.isHuman,
      fireAt: s.fireAt,
      cards: [],
      level: 0,
      status: 'charging',
      full: false,
      nextActionIn: 0,
    }));
  }

  get human(): Gauge | undefined {
    return this.gauges.find((g) => g.isHuman);
  }

  private setPhase(phase: RoundPhase) {
    this.phase = phase;
    this.phaseTime = 0;
    this.events.push({ type: 'phase', phase });
  }

  private give(g: Gauge) {
    g.cards.push(drawCard(this.rng));
    g.level = levelOf(g.cards);
    this.events.push({ type: 'card', seat: g.seat, level: g.level });
  }

  private resolve(g: Gauge, status: GaugeStatus) {
    if (g.status !== 'charging') return;
    g.status = status;
    this.events.push({ type: 'resolved', seat: g.seat, status, level: g.level });
  }

  private checkAuto(g: Gauge) {
    if (g.status !== 'charging') return;
    if (g.level > cfg.cap) this.resolve(g, 'jammed');
    else if (g.level === cfg.cap) {
      g.full = true;
      this.resolve(g, 'fired');
    }
  }

  private botDelay() {
    const [a, b] = cfg.botActionDelaySec;
    return this.rng.range(a, b);
  }

  load(seat: number) {
    const g = this.gauges[seat];
    if (this.phase !== 'deciding' || g.status !== 'charging') return;
    this.give(g);
    this.checkAuto(g);
  }

  fire(seat: number) {
    if (this.phase !== 'deciding') return;
    this.resolve(this.gauges[seat], 'fired');
  }

  private botStep(g: Gauge) {
    if (g.level < g.fireAt) {
      this.give(g);
      this.checkAuto(g);
    } else {
      this.resolve(g, 'fired');
    }
  }

  update(dt: number) {
    this.phaseTime += dt;
    switch (this.phase) {
      case 'dealing': {
        const due = Math.min(cfg.initialCards, Math.floor(this.phaseTime / cfg.dealIntervalSec) + 1);
        while (this.dealt < due) {
          this.gauges.forEach((g) => this.give(g));
          this.dealt++;
        }
        if (this.dealt >= cfg.initialCards && this.phaseTime >= cfg.initialCards * cfg.dealIntervalSec) {
          this.gauges.forEach((g) => {
            g.nextActionIn = this.botDelay();
            this.checkAuto(g);
          });
          this.setPhase('deciding');
        }
        break;
      }
      case 'deciding': {
        this.decisionLeft -= dt;
        for (const g of this.gauges) {
          if (g.isHuman || g.status !== 'charging') continue;
          g.nextActionIn -= dt;
          if (g.nextActionIn <= 0) {
            this.botStep(g);
            g.nextActionIn = this.botDelay();
          }
        }
        if (this.decisionLeft <= 0) {
          // Time's up: the human fires what is loaded, bots finish instantly
          for (const g of this.gauges) {
            if (g.isHuman) this.resolve(g, 'fired');
            while (g.status === 'charging') this.botStep(g);
          }
        }
        if (this.gauges.every((g) => g.status !== 'charging')) this.setPhase('results');
        break;
      }
      case 'results':
        if (this.phaseTime >= cfg.resultHoldSec) this.setPhase('done');
        break;
      case 'done':
        break;
    }
  }

  /** Special-shot level for a seat (minZone–cap), or null when jammed / too weak. */
  outcome(seat: number): number | null {
    const g = this.gauges[seat];
    if (g.status !== 'fired') return null;
    return g.level >= cfg.minZone && g.level <= cfg.cap ? g.level : null;
  }
}
