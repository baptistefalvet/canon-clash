// Territory model: one owner per tile, capture bookkeeping and spatial helpers.

import { board } from '../../config/board';
import type { Corner } from '../../config/players';
import type { Rng } from '../util/rng';

export interface CaptureEvent {
  index: number;
  from: number;
  to: number;
}

export class Grid {
  readonly cols = board.cols;
  readonly rows = board.rows;
  readonly tile = board.tileSize;
  readonly x0 = board.originX;
  readonly y0 = board.originY;
  readonly width = board.cols * board.tileSize;
  readonly height = board.rows * board.tileSize;
  readonly owner: Int8Array;
  readonly shade: Uint8Array; // index into a per-team shade palette
  readonly popAge: Float32Array; // seconds since capture, < 0 when settled
  readonly counts: number[];
  /** Captures since the last drain (renderer/fx consume them). */
  readonly captures: CaptureEvent[] = [];
  frozen = false;

  constructor(corners: Corner[], rng: Rng, shadeLevels: number) {
    const n = this.cols * this.rows;
    this.owner = new Int8Array(n);
    this.shade = new Uint8Array(n);
    this.popAge = new Float32Array(n).fill(-1);
    this.counts = corners.map(() => 0);
    const halfC = this.cols / 2;
    const halfR = this.rows / 2;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const corner: Corner = `${r < halfR ? 'T' : 'B'}${c < halfC ? 'L' : 'R'}` as Corner;
        const seat = corners.indexOf(corner);
        const i = r * this.cols + c;
        this.owner[i] = seat;
        this.counts[seat]++;
        this.shade[i] = Math.floor(rng.next() * shadeLevels);
      }
    }
  }

  get total() {
    return this.cols * this.rows;
  }

  share(seat: number) {
    return this.counts[seat] / this.total;
  }

  index(c: number, r: number) {
    return r * this.cols + c;
  }

  inside(x: number, y: number) {
    return x >= this.x0 && y >= this.y0 && x < this.x0 + this.width && y < this.y0 + this.height;
  }

  tileAt(x: number, y: number): number {
    if (!this.inside(x, y)) return -1;
    const c = Math.floor((x - this.x0) / this.tile);
    const r = Math.floor((y - this.y0) / this.tile);
    return r * this.cols + c;
  }

  centerX(i: number) {
    return this.x0 + ((i % this.cols) + 0.5) * this.tile;
  }

  centerY(i: number) {
    return this.y0 + (Math.floor(i / this.cols) + 0.5) * this.tile;
  }

  capture(i: number, seat: number): boolean {
    if (this.frozen) return false;
    const from = this.owner[i];
    if (from === seat) return false;
    this.owner[i] = seat;
    this.counts[from]--;
    this.counts[seat]++;
    this.popAge[i] = 0;
    this.captures.push({ index: i, from, to: seat });
    return true;
  }

  /** Captures every tile whose center lies within `radiusPx` of (x, y). Returns the number captured. */
  captureCircle(x: number, y: number, radiusPx: number, seat: number): number {
    const t = this.tile;
    const c0 = Math.max(0, Math.floor((x - radiusPx - this.x0) / t));
    const c1 = Math.min(this.cols - 1, Math.floor((x + radiusPx - this.x0) / t));
    const r0 = Math.max(0, Math.floor((y - radiusPx - this.y0) / t));
    const r1 = Math.min(this.rows - 1, Math.floor((y + radiusPx - this.y0) / t));
    const rr = radiusPx * radiusPx;
    let n = 0;
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const cx = this.x0 + (c + 0.5) * t - x;
        const cy = this.y0 + (r + 0.5) * t - y;
        if (cx * cx + cy * cy <= rr && this.capture(r * this.cols + c, seat)) n++;
      }
    }
    return n;
  }

  /** Tiles owned by someone other than `seat`. */
  enemyTiles(seat: number): number[] {
    const out: number[] = [];
    for (let i = 0; i < this.owner.length; i++) if (this.owner[i] !== seat) out.push(i);
    return out;
  }

  /** Own tiles touching at least one enemy tile (4-neighbourhood). */
  frontier(seat: number): number[] {
    const out: number[] = [];
    const { cols, rows, owner } = this;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (owner[i] !== seat) continue;
        if (
          (c > 0 && owner[i - 1] !== seat) ||
          (c < cols - 1 && owner[i + 1] !== seat) ||
          (r > 0 && owner[i - cols] !== seat) ||
          (r < rows - 1 && owner[i + cols] !== seat)
        )
          out.push(i);
      }
    }
    return out;
  }

  /** Centroid of the tiles of `seat` (null if none). */
  centroid(seat: number): { x: number; y: number } | null {
    let sx = 0;
    let sy = 0;
    let n = 0;
    for (let i = 0; i < this.owner.length; i++) {
      if (this.owner[i] !== seat) continue;
      sx += this.centerX(i);
      sy += this.centerY(i);
      n++;
    }
    return n ? { x: sx / n, y: sy / n } : null;
  }

  tick(dt: number, popDuration: number) {
    const a = this.popAge;
    for (let i = 0; i < a.length; i++) {
      if (a[i] < 0) continue;
      a[i] += dt;
      if (a[i] >= popDuration) a[i] = -1;
    }
  }
}
