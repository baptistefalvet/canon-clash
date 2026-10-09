// One blackjack deal played simultaneously by the 4 seats (human decides, bots follow their threshold).

import { blackjack as cfg } from '../../config/blackjack';
import type { Rng } from '../util/rng';
import { drawCard, handTotal, type Card } from './cards';

export type HandStatus = 'playing' | 'stood' | 'bust' | 'blackjack' | 'twentyone';
export type RoundPhase = 'dealing' | 'deciding' | 'results' | 'done';

export interface Hand {
  seat: number;
  isHuman: boolean;
  standOn: number;
  cards: Card[];
  total: number;
  soft: boolean;
  status: HandStatus;
  nextActionIn: number;
}

export type RoundEvent =
  | { type: 'card'; seat: number }
  | { type: 'resolved'; seat: number; status: HandStatus; total: number }
  | { type: 'phase'; phase: RoundPhase };

export class BlackjackRound {
  phase: RoundPhase = 'dealing';
  phaseTime = 0;
  decisionLeft = cfg.decisionTimeSec;
  readonly hands: Hand[];
  readonly events: RoundEvent[] = [];
  private dealt = 0;

  constructor(
    readonly index: number,
    seats: { isHuman: boolean; standOn: number }[],
    private rng: Rng,
  ) {
    this.hands = seats.map((s, seat) => ({
      seat,
      isHuman: s.isHuman,
      standOn: s.standOn,
      cards: [],
      total: 0,
      soft: false,
      status: 'playing',
      nextActionIn: 0,
    }));
  }

  get human(): Hand | undefined {
    return this.hands.find((h) => h.isHuman);
  }

  private setPhase(phase: RoundPhase) {
    this.phase = phase;
    this.phaseTime = 0;
    this.events.push({ type: 'phase', phase });
  }

  private give(h: Hand) {
    h.cards.push(drawCard(this.rng));
    const { total, soft } = handTotal(h.cards);
    h.total = total;
    h.soft = soft;
    this.events.push({ type: 'card', seat: h.seat });
  }

  private resolve(h: Hand, status: HandStatus) {
    if (h.status !== 'playing') return;
    h.status = status;
    this.events.push({ type: 'resolved', seat: h.seat, status, total: h.total });
  }

  private checkAuto(h: Hand) {
    if (h.status !== 'playing') return;
    if (h.total > cfg.target) this.resolve(h, 'bust');
    else if (h.total === cfg.target) this.resolve(h, h.cards.length === cfg.initialCards ? 'blackjack' : 'twentyone');
  }

  private botDelay() {
    const [a, b] = cfg.botActionDelaySec;
    return this.rng.range(a, b);
  }

  hit(seat: number) {
    const h = this.hands[seat];
    if (this.phase !== 'deciding' || h.status !== 'playing') return;
    this.give(h);
    this.checkAuto(h);
  }

  stand(seat: number) {
    const h = this.hands[seat];
    if (this.phase !== 'deciding') return;
    this.resolve(h, 'stood');
  }

  private botStep(h: Hand) {
    if (h.total < h.standOn) {
      this.give(h);
      this.checkAuto(h);
    } else {
      this.resolve(h, 'stood');
    }
  }

  update(dt: number) {
    this.phaseTime += dt;
    switch (this.phase) {
      case 'dealing': {
        const due = Math.min(cfg.initialCards, Math.floor(this.phaseTime / cfg.dealIntervalSec) + 1);
        while (this.dealt < due) {
          this.hands.forEach((h) => this.give(h));
          this.dealt++;
        }
        if (this.dealt >= cfg.initialCards && this.phaseTime >= cfg.initialCards * cfg.dealIntervalSec) {
          this.hands.forEach((h) => {
            h.nextActionIn = this.botDelay();
            this.checkAuto(h);
          });
          this.setPhase('deciding');
        }
        break;
      }
      case 'deciding': {
        this.decisionLeft -= dt;
        for (const h of this.hands) {
          if (h.isHuman || h.status !== 'playing') continue;
          h.nextActionIn -= dt;
          if (h.nextActionIn <= 0) {
            this.botStep(h);
            h.nextActionIn = this.botDelay();
          }
        }
        if (this.decisionLeft <= 0) {
          // Time's up: the human stands, bots finish instantly
          for (const h of this.hands) {
            if (h.isHuman) this.resolve(h, 'stood');
            while (h.status === 'playing') this.botStep(h);
          }
        }
        if (this.hands.every((h) => h.status !== 'playing')) this.setPhase('results');
        break;
      }
      case 'results':
        if (this.phaseTime >= cfg.resultHoldSec) this.setPhase('done');
        break;
      case 'done':
        break;
    }
  }

  /** Bonus total for a seat (18–21), or null when bust / too low. */
  outcome(seat: number): number | null {
    const h = this.hands[seat];
    if (h.status === 'bust') return null;
    return h.total >= cfg.minBonusTotal && h.total <= cfg.target ? h.total : null;
  }
}
