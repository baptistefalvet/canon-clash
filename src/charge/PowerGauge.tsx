// The power gauge: one cell per level, the shot zones (with their icon above) and the red « jammed » cell at the end.
// Used live in the round (fills as cards are drawn, shows where the next card can land) and as the read-only legend.

import { useEffect, useRef, type CSSProperties } from 'react';
import { bonusByLevel } from '../../config/bonuses';
import { charge as cfg } from '../../config/charge';
import { gaugeShape as G } from '../../config/layout';
import { staging, stagingCopy as copy } from '../../config/staging';
import { bonusArt } from '../ui/bonusArt';
import { OutlinedText } from '../ui/OutlinedText';
import { maxCard } from './cards';
import type { GaugeStatus } from './round';

const JAM_RED = '#ff3b52';
const LOW_FILL = 'linear-gradient(180deg,#ffffff,#d9dcf0)';

export interface GaugeCell {
  /** 1…cap, or cap + 1 for the jam cell. */
  level: number;
  kind: 'low' | 'zone' | 'jam';
  x: number;
  w: number;
}

/** Cell layout inside a bar of `width` (track padding included). */
export function gaugeCells(width: number): GaugeCell[] {
  const kinds: GaugeCell['kind'][] = [];
  for (let l = 1; l <= cfg.cap; l++) kinds.push(bonusByLevel[l] ? 'zone' : 'low');
  kinds.push('jam');
  const weight = (k: GaugeCell['kind']) => (k === 'zone' ? G.zoneCellWeight : k === 'jam' ? G.jamCellWeight : G.lowCellWeight);
  const inner = width - G.trackPad * 2 - G.cellGap * (kinds.length - 1);
  const unit = inner / kinds.reduce((s, k) => s + weight(k), 0);
  let x = G.trackPad;
  return kinds.map((kind, i) => {
    const w = weight(kind) * unit;
    const cell = { level: i + 1, kind, x, w };
    x += w + G.cellGap;
    return cell;
  });
}

export function JamIcon({ size }: { size: number }) {
  const pts = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 ? 26 : 46;
    return `${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`;
  }).join(' ');
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      <polygon points={pts} fill={JAM_RED} stroke="#2a1640" strokeWidth={7} strokeLinejoin="round" />
      <polygon points={pts} fill="#ffb3bd" transform="translate(50 50) scale(0.5) translate(-50 -50)" />
      <text x={50} y={66} textAnchor="middle" fontFamily="Lilita One" fontSize={44} fill="#ffffff" stroke="#2a1640" strokeWidth={6} paintOrder="stroke">
        !
      </text>
    </svg>
  );
}

type HeaderState = 'idle' | 'dim' | 'target' | 'won';

function zoneState(zone: number, level: number, status: GaugeStatus | 'idle', won: number | null | undefined): HeaderState {
  if (status === 'idle') return 'idle';
  if (won !== undefined && won !== null) return zone === won ? 'won' : 'dim';
  if (status === 'jammed') return 'dim';
  if (status === 'fired') return zone === level ? 'won' : 'dim';
  if (zone === level) return 'target';
  return zone < level ? 'dim' : 'idle';
}

export function PowerGauge({
  width,
  headerHeight,
  barHeight,
  artSize,
  nameFontSize,
  level,
  status = 'idle',
  won,
  flyLevel,
  ghost = false,
}: {
  width: number;
  headerHeight: number;
  barHeight: number;
  artSize: number;
  nameFontSize: number;
  level: number;
  /** 'idle' = read-only legend. */
  status?: GaugeStatus | 'idle';
  won?: number | null;
  flyLevel?: number | null;
  /** Show the cells the next card can land on. */
  ghost?: boolean;
}) {
  const cells = gaugeCells(width);
  const prev = useRef(level);
  const from = prev.current;
  useEffect(() => {
    prev.current = level;
  }, [level]);
  const jammed = status === 'jammed';
  const lowCells = cells.filter((c) => c.kind === 'low');
  const lowEnd = lowCells.length ? lowCells[lowCells.length - 1].x + lowCells[lowCells.length - 1].w : 0;
  const jamCell = cells[cells.length - 1];
  const ghostTo = ghost ? level + maxCard : level;

  return (
    <div style={{ position: 'relative', width, height: headerHeight + barHeight }}>
      {/* ---- headers ---- */}
      {lowCells.length > 0 && (
        <div
          style={{
            position: 'absolute',
            left: G.trackPad,
            width: lowEnd - G.trackPad,
            top: 0,
            height: headerHeight,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            <span style={{ flex: 1, height: 4, borderRadius: 2, background: '#5b5f7a' }} />
            <span style={{ fontFamily: 'var(--font-title)', fontSize: nameFontSize * 0.9, color: '#8f93ad', letterSpacing: 1, whiteSpace: 'nowrap' }}>{copy.zoneNone}</span>
            <span style={{ flex: 1, height: 4, borderRadius: 2, background: '#5b5f7a' }} />
          </div>
        </div>
      )}
      {cells
        .filter((c) => c.kind === 'zone')
        .map((c) => {
          const b = bonusByLevel[c.level];
          const st = zoneState(c.level, level, status, won);
          const lit = st === 'target' || st === 'won';
          const jackpot = c.level === cfg.cap;
          return (
            <div
              key={c.level}
              style={{
                position: 'absolute',
                left: c.x - 4,
                width: c.w + 8,
                top: 0,
                height: headerHeight - 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 2,
                opacity: st === 'dim' ? staging.zoneDimOpacity : 1,
                filter: st === 'dim' ? 'grayscale(0.7)' : undefined,
                transform: lit ? `translateY(-6px) scale(${staging.zoneTargetScale})` : 'none',
                transformOrigin: 'bottom center',
                transition: 'opacity 200ms, transform 220ms cubic-bezier(.3,1.6,.5,1), filter 200ms',
                animation: flyLevel === c.level ? 'card-fly 650ms cubic-bezier(.4,0,.6,1) forwards' : st === 'won' ? 'pulse 0.45s ease-in-out infinite' : undefined,
              }}
            >
              {lit && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '42%',
                    width: artSize * 1.9,
                    height: artSize * 1.9,
                    transform: 'translate(-50%,-50%)',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${b.color}cc 0%, ${b.color}00 68%)`,
                    animation: 'halo-pulse 0.9s ease-in-out infinite',
                  }}
                />
              )}
              <img
                src={bonusArt(b.id)}
                alt=""
                draggable={false}
                style={{ position: 'relative', width: artSize, height: artSize, objectFit: 'contain', filter: 'drop-shadow(0 4px 0 rgba(10,5,25,0.45))' }}
              />
              <OutlinedText size={nameFontSize} color={lit || jackpot ? b.color : '#ffffff'} shadowOffset={2} style={{ position: 'relative' }}>
                {b.name}
              </OutlinedText>
            </div>
          );
        })}
      <div
        style={{
          position: 'absolute',
          left: jamCell.x - 6,
          width: jamCell.w + 12,
          top: 0,
          height: headerHeight - 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 2,
          animation: jammed ? 'pulse 0.35s ease-in-out infinite' : undefined,
        }}
      >
        <JamIcon size={artSize * 0.86} />
        <OutlinedText size={nameFontSize * 0.86} color="#ff8a98" shadowOffset={2}>
          {copy.zoneJam}
        </OutlinedText>
      </div>

      {/* ---- bar ---- */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: headerHeight,
          width,
          height: barHeight,
          borderRadius: G.radius + G.trackPad,
          background: '#1b1430',
          boxShadow: jammed
            ? `0 0 0 4px ${JAM_RED}, 0 0 30px 10px rgba(255,59,82,0.6)`
            : '0 0 0 4px #141026, inset 0 4px 0 rgba(0,0,0,0.4)',
          animation: jammed ? 'shake-x 0.45s ease-out' : undefined,
          transition: 'box-shadow 200ms',
        }}
      >
        {cells.map((c) => {
          const b = bonusByLevel[c.level];
          const filled = c.kind === 'jam' ? jammed : c.level <= level || jammed;
          const delay = !jammed && c.level > from ? (c.level - from - 1) * staging.cellPourMs : 0;
          const fillBg = jammed
            ? `linear-gradient(180deg,#ff8a98,${JAM_RED})`
            : c.kind === 'zone'
              ? `linear-gradient(180deg, #ffffff -40%, ${b.color} 45%, ${b.dark} 140%)`
              : LOW_FILL;
          const emptyBg =
            c.kind === 'jam'
              ? `repeating-linear-gradient(135deg, ${JAM_RED}66 0 12px, rgba(255,59,82,0.18) 12px 24px)`
              : c.kind === 'zone'
                ? `linear-gradient(0deg, rgba(27,20,48,0.55), rgba(27,20,48,0.55)), ${b.color}`
                : '#2e3150';
          const inGhost = ghost && !jammed && c.level > level && c.level <= ghostTo;
          const cellStyle: CSSProperties = { position: 'absolute', left: c.x, top: G.trackPad, width: c.w, height: barHeight - G.trackPad * 2, borderRadius: G.radius };
          return (
            <div key={c.level} style={cellStyle}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: G.radius, background: emptyBg, boxShadow: 'inset 0 -5px 0 rgba(0,0,0,0.25)' }} />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: G.radius,
                  background: fillBg,
                  boxShadow: 'inset 0 -6px 0 rgba(0,0,0,0.2), inset 0 5px 0 rgba(255,255,255,0.55)',
                  opacity: filled ? 1 : 0,
                  transform: filled ? 'none' : 'scale(0.4, 0.2)',
                  transition: `opacity 120ms ${delay}ms, transform 260ms cubic-bezier(.3,1.7,.5,1) ${delay}ms`,
                }}
              />
              {inGhost && (
                <div
                  style={{
                    position: 'absolute',
                    inset: -3,
                    borderRadius: G.radius + 3,
                    border: `4px dashed ${c.kind === 'jam' ? '#ffb3bd' : '#ffffff'}`,
                    background: c.kind === 'jam' ? 'rgba(255,59,82,0.35)' : 'rgba(255,255,255,0.12)',
                    animation: 'ghost-pulse 0.8s ease-in-out infinite',
                  }}
                />
              )}
              {c.kind !== 'jam' && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-title)',
                    fontSize: Math.min(G.numberFontSize, barHeight * 0.42),
                    color: filled ? 'rgba(27,20,48,0.55)' : 'rgba(255,255,255,0.32)',
                    transition: `color 150ms ${delay}ms`,
                  }}
                >
                  {c.level}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
