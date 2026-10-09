// Lightweight particle system: tile debris, sparks, rings, flashes, smoke, floating texts.

import { fx } from '../../config/fx';
import { TAU } from '../util/math';

export type ParticleKind = 'debris' | 'spark' | 'ring' | 'flash' | 'smoke' | 'text' | 'fire';

export interface Particle {
  kind: ParticleKind;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  age: number;
  life: number;
  size: number;
  color: string;
  color2?: string;
  rot: number;
  vr: number;
  text?: string;
}

export class Particles {
  items: Particle[] = [];

  add(p: Partial<Particle> & { kind: ParticleKind; x: number; y: number; life: number; color: string }) {
    if (this.items.length >= fx.maxParticles) this.items.shift();
    this.items.push({ z: 0, vx: 0, vy: 0, vz: 0, age: 0, size: 6, rot: 0, vr: 0, ...p });
  }

  debris(x: number, y: number, color: string, count: number, power = 1) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TAU;
      const sp = (60 + Math.random() * 140) * power;
      this.add({
        kind: 'debris',
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp * 0.7,
        vz: (260 + Math.random() * 260) * power,
        life: fx.capture.debrisLifeSec * (0.8 + Math.random() * 0.5),
        size: fx.capture.debrisSize * (0.7 + Math.random() * 0.6),
        color,
        rot: Math.random() * TAU,
        vr: (Math.random() - 0.5) * 18,
      });
    }
  }

  sparks(x: number, y: number, color: string, count: number, speed = 420) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TAU;
      const sp = speed * (0.4 + Math.random() * 0.8);
      this.add({ kind: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.25 + Math.random() * 0.25, size: 4, color });
    }
  }

  ring(x: number, y: number, radius: number, color: string, life = fx.explosion.ringLifeSec) {
    this.add({ kind: 'ring', x, y, size: radius, life, color });
  }

  flash(x: number, y: number, radius: number, color = '#fff7c2', life = fx.explosion.flashLifeSec) {
    this.add({ kind: 'flash', x, y, size: radius, life, color });
  }

  smoke(x: number, y: number, count: number, color = 'rgba(255,255,255,0.55)') {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TAU;
      this.add({
        kind: 'smoke',
        x: x + Math.cos(a) * 10,
        y: y + Math.sin(a) * 10,
        vx: Math.cos(a) * 60,
        vy: Math.sin(a) * 60 - 30,
        life: 0.6 + Math.random() * 0.4,
        size: 22 + Math.random() * 18,
        color,
      });
    }
  }

  text(x: number, y: number, text: string, color: string, size = 40, life = 1.1) {
    this.add({ kind: 'text', x, y, vy: -70, life, size, color, text });
  }

  update(dt: number) {
    const g = fx.capture.gravity;
    const items = this.items;
    for (let i = items.length - 1; i >= 0; i--) {
      const p = items[i];
      p.age += dt;
      if (p.age >= p.life) {
        items.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.kind === 'debris') {
        p.vz -= g * dt;
        p.z = Math.max(0, p.z + p.vz * dt);
        p.vx *= 0.98;
        p.vy *= 0.98;
      } else if (p.kind === 'spark' || p.kind === 'fire') {
        p.vx *= 0.9;
        p.vy *= 0.9;
      } else if (p.kind === 'smoke') {
        p.vx *= 0.95;
        p.vy *= 0.95;
      }
    }
  }

  /** Ground-level particles (debris shadows, smoke) go under units; the rest above. */
  draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.items) {
      const k = p.age / p.life;
      switch (p.kind) {
        case 'debris': {
          ctx.globalAlpha = 0.25 * (1 - k);
          ctx.fillStyle = '#000';
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 4, p.size, p.size / 2);
          ctx.globalAlpha = 1 - k * k;
          ctx.save();
          ctx.translate(p.x, p.y - p.z);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
          break;
        }
        case 'spark': {
          ctx.globalAlpha = 1 - k;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * (1 - k * 0.5);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04);
          ctx.stroke();
          break;
        }
        case 'fire': {
          ctx.globalAlpha = 1 - k;
          const r = p.size * (1 - k * 0.6);
          const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
          gr.addColorStop(0, '#fff6c8');
          gr.addColorStop(0.4, p.color);
          gr.addColorStop(1, p.color2 ?? 'rgba(255,80,0,0)');
          ctx.fillStyle = gr;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, TAU);
          ctx.fill();
          break;
        }
        case 'ring': {
          ctx.globalAlpha = 1 - k;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 14 * (1 - k) + 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.3 + 0.7 * Math.sqrt(k)), 0, TAU);
          ctx.stroke();
          break;
        }
        case 'flash': {
          ctx.globalAlpha = 1 - k;
          const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          gr.addColorStop(0, '#ffffff');
          gr.addColorStop(0.35, p.color);
          gr.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = gr;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, TAU);
          ctx.fill();
          break;
        }
        case 'smoke': {
          ctx.globalAlpha = 0.6 * (1 - k);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.6 + k * 0.8), 0, TAU);
          ctx.fill();
          break;
        }
        case 'text': {
          const s = k < 0.15 ? 0.6 + (k / 0.15) * 0.5 : 1.1 - Math.min(0.1, (k - 0.15) * 0.4);
          ctx.globalAlpha = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
          ctx.font = `${Math.round(p.size * s)}px 'Lilita One'`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.lineJoin = 'round';
          ctx.lineWidth = p.size * 0.22;
          ctx.strokeStyle = '#1b1430';
          ctx.strokeText(p.text ?? '', p.x, p.y);
          ctx.fillStyle = p.color;
          ctx.fillText(p.text ?? '', p.x, p.y);
          break;
        }
      }
    }
    ctx.globalAlpha = 1;
  }
}
