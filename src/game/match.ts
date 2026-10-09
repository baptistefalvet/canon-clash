// Match orchestration: countdown → territory war with periodic blackjack deals → time up.
// Pure simulation + canvas drawing; React only reads snapshots and forwards the human's HIT/STAND.

import { blackjack as bjCfg } from '../../config/blackjack';
import { bonusAnnounce } from '../../config/bonuses';
import { board } from '../../config/board';
import { fx } from '../../config/fx';
import { match as cfg } from '../../config/match';
import { stage } from '../../config/layout';
import { seats as seatCfg, type Corner } from '../../config/players';
import { Grid } from '../board/grid';
import { buildPalette, type TeamPalette } from '../board/palette';
import { drawEdgeShadow, drawTiles } from '../board/render';
import { Bullets } from '../bullets/bullets';
import { Cannon } from '../cannon/cannon';
import { Particles } from '../fx/particles';
import { BlackjackRound, type HandStatus } from '../blackjack/round';
import { bonusForTotal, spawnBonus } from '../bonuses';
import type { BonusEntity } from '../bonuses/types';
import type { BonusInfo } from '../../config/bonuses';
import { TAU } from '../util/math';
import { Rng } from '../util/rng';
import type { Sim } from './sim';
import { sfx } from '../audio/sfx';
import { drawSeatTags } from './tags';

export type MatchPhase = 'countdown' | 'playing' | 'ending' | 'over';

export interface SeatInfo {
  seat: number;
  name: string;
  avatar: number;
  isHuman: boolean;
  corner: Corner;
  palette: TeamPalette;
  standOn: number;
}

export type MatchEvent =
  | { type: 'countdown'; value: number }
  | { type: 'go' }
  | { type: 'roundStart'; index: number }
  | { type: 'card'; seat: number }
  | { type: 'resolved'; seat: number; status: HandStatus; total: number }
  | { type: 'bonus'; seat: number; bonus: BonusInfo }
  | { type: 'timeUp' }
  | { type: 'over' };

export interface StaticDecor {
  under: HTMLCanvasElement;
  over: HTMLCanvasElement;
}

export class Match implements Sim {
  readonly rng: Rng;
  readonly grid: Grid;
  readonly palettes: TeamPalette[];
  readonly particles = new Particles();
  readonly bullets = new Bullets();
  readonly cannons: Cannon[];
  readonly seats: SeatInfo[];
  readonly humanSeat: number;
  time = 0;
  phase: MatchPhase = 'countdown';
  phaseTime = 0;
  bonuses: BonusEntity[] = [];
  round: BlackjackRound | null = null;
  roundsStarted = 0;
  /** Last blackjack outcome per seat (total or null), kept until the next deal. */
  lastOutcome: (number | null)[];
  readonly events: MatchEvent[] = [];
  private shakeAmt = 0;
  private lastCountdown = -1;
  private pendingBonuses: { seat: number; total: number; at: number }[] = [];

  constructor(profiles: { name: string; avatar: number; isHuman: boolean }[], seed?: number) {
    this.rng = new Rng(seed);
    this.palettes = seatCfg.map((s) => buildPalette(s.team));
    this.grid = new Grid(
      seatCfg.map((s) => s.corner),
      this.rng,
      board.shadeLevels,
    );
    this.seats = seatCfg.map((s, seat) => ({
      seat,
      name: profiles[seat].name,
      avatar: profiles[seat].avatar,
      isHuman: profiles[seat].isHuman,
      corner: s.corner,
      palette: this.palettes[seat],
      standOn: this.rng.pick(bjCfg.botStandOnChoices),
    }));
    this.humanSeat = Math.max(0, this.seats.findIndex((s) => s.isHuman));
    this.cannons = this.seats.map((s) => new Cannon(s.seat, s.corner, this.grid, this.rng.range(0, TAU)));
    this.lastOutcome = this.seats.map(() => null);
  }

  // ---- Sim ----
  shake(amount: number) {
    this.shakeAmt = Math.max(this.shakeAmt, amount);
  }

  // ---- Human input ----
  humanHit() {
    if (!this.round) return;
    this.round.hit(this.humanSeat);
  }

  humanStand() {
    if (!this.round) return;
    this.round.stand(this.humanSeat);
  }

  get timeLeft() {
    return Math.max(0, cfg.durationSec - this.time);
  }

  get nextRoundAt(): number | null {
    if (this.roundsStarted >= cfg.blackjackRounds) return null;
    return cfg.firstRoundAtSec + this.roundsStarted * cfg.roundIntervalSec;
  }

  shares(): number[] {
    return this.seats.map((s) => this.grid.share(s.seat));
  }

  /** 1-based ranks by territory (ties share the better rank). */
  ranks(): number[] {
    const c = this.grid.counts;
    return c.map((v) => 1 + c.filter((o) => o > v).length);
  }

  private setPhase(p: MatchPhase) {
    this.phase = p;
    this.phaseTime = 0;
  }

  update(rawDt: number) {
    const dt = Math.min(rawDt, 1 / 20) * cfg.timeScale;
    this.phaseTime += dt;

    switch (this.phase) {
      case 'countdown': {
        const left = Math.ceil(cfg.countdownSec - this.phaseTime);
        if (left !== this.lastCountdown && left > 0) {
          this.lastCountdown = left;
          this.events.push({ type: 'countdown', value: left });
        }
        if (this.phaseTime >= cfg.countdownSec) {
          this.setPhase('playing');
          this.cannons.forEach((c) => (c.firing = true));
          this.events.push({ type: 'go' });
        }
        break;
      }
      case 'playing': {
        this.time += dt;
        this.updateRounds(dt);
        if (this.time >= cfg.durationSec) {
          this.time = cfg.durationSec;
          this.grid.frozen = true;
          this.cannons.forEach((c) => (c.firing = false));
          this.bullets.items = [];
          this.bonuses = [];
          this.round = null;
          this.pendingBonuses = [];
          this.setPhase('ending');
          this.events.push({ type: 'timeUp' });
        }
        break;
      }
      case 'ending':
        if (this.phaseTime >= cfg.endBannerSec) {
          this.setPhase('over');
          this.events.push({ type: 'over' });
        }
        break;
      case 'over':
        break;
    }

    // Systems (cannons keep sweeping visually during countdown/ending)
    for (const c of this.cannons) c.update(this.phase === 'playing' ? dt : 0, this);
    if (this.phase === 'playing') {
      this.bullets.update(dt, this);
      for (const b of this.bonuses) b.update(dt, this);
      this.bonuses = this.bonuses.filter((b) => !b.done);
    }
    this.drainCaptures();
    this.grid.tick(dt, board.pop.durationSec);
    this.particles.update(dt);
    this.shakeAmt = Math.max(0, this.shakeAmt - this.shakeAmt * fx.shakeDecayPerSec * dt - dt);
  }

  private updateRounds(dt: number) {
    const due = this.nextRoundAt;
    if (!this.round && due !== null && this.time >= due) {
      this.round = new BlackjackRound(
        this.roundsStarted,
        this.seats.map((s) => ({ isHuman: s.isHuman, standOn: s.standOn })),
        this.rng,
      );
      this.roundsStarted++;
      this.lastOutcome = this.seats.map(() => null);
      this.events.push({ type: 'roundStart', index: this.round.index });
    }

    if (this.round) {
      this.round.update(dt);
      for (const e of this.round.events.splice(0)) {
        if (e.type === 'card') {
          this.events.push(e);
          if (e.seat === this.humanSeat) sfx.deal();
        } else if (e.type === 'resolved') {
          this.events.push(e);
          this.lastOutcome[e.seat] = this.round.outcome(e.seat);
          if (e.seat === this.humanSeat) {
            const out = this.round.outcome(e.seat);
            if (out !== null) sfx.good(out);
            else if (e.status === 'bust') sfx.bust();
            else sfx.stand();
          }
        }
      }
      if (this.round.phase === 'done') {
        // Bonuses play automatically, the human's first with a short announce for readability
        this.seats.forEach((s) => {
          const total = this.round!.outcome(s.seat);
          if (total !== null) this.pendingBonuses.push({ seat: s.seat, total, at: this.time + (s.isHuman ? bonusAnnounce.cardFlySec : 0) });
        });
        this.round = null;
      }
    }

    for (let i = this.pendingBonuses.length - 1; i >= 0; i--) {
      const p = this.pendingBonuses[i];
      if (this.time < p.at) continue;
      this.pendingBonuses.splice(i, 1);
      const info = bonusForTotal(p.total);
      if (!info) continue;
      this.bonuses.push(spawnBonus(info.id, p.seat, this));
      this.events.push({ type: 'bonus', seat: p.seat, bonus: info });
      const c = this.cannons[p.seat];
      this.particles.text(c.x + Math.cos(c.midAngle) * 120, c.y + Math.sin(c.midAngle) * 120, `${info.name.toUpperCase()} !`, this.palettes[p.seat].light, 46, 1.4);
    }
  }

  private drainCaptures() {
    const caps = this.grid.captures;
    if (!caps.length) return;
    let humanGain = false;
    for (const c of caps) {
      this.particles.debris(this.grid.centerX(c.index), this.grid.centerY(c.index), this.palettes[c.from].tile, fx.capture.debrisPerTile);
      if (c.to === this.humanSeat) humanGain = true;
    }
    caps.length = 0;
    if (humanGain) sfx.capture();
  }

  draw(ctx: CanvasRenderingContext2D, decor: StaticDecor) {
    ctx.save();
    if (this.shakeAmt > 0.2) ctx.translate((Math.random() - 0.5) * this.shakeAmt * 2, (Math.random() - 0.5) * this.shakeAmt * 2);
    ctx.drawImage(decor.under, 0, 0, decor.under.width, decor.under.height, 0, 0, stage.width, stage.height);
    drawTiles(ctx, this.grid, this.palettes);
    drawEdgeShadow(ctx, this.grid);
    ctx.drawImage(decor.over, 0, 0, decor.over.width, decor.over.height, 0, 0, stage.width, stage.height);

    const order = [...this.cannons].sort((a, b) => a.y - b.y);
    for (const c of order) c.draw(ctx, this.palettes[c.seat]);
    for (const b of this.bonuses) if (b.layer === 'ground') b.draw(ctx, this);
    this.bullets.draw(ctx, this);
    this.particles.draw(ctx);
    for (const b of this.bonuses) if (b.layer === 'air') b.draw(ctx, this);
    drawSeatTags(ctx, this);
    ctx.restore();
  }
}
