// Chunky cartoon powder card: « +3 » and three flames on the face, a cannonball on the back.

import type { CSSProperties } from 'react';
import { cardVisual } from '../../config/charge';
import type { PowderCard } from './cards';

export function Flame({ size, color = '#ff8a1f', style }: { size: number; color?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 40 48" style={{ overflow: 'visible', flexShrink: 0, ...style }}>
      <path
        d="M20 2 C24 12 34 16 34 30 C34 40 27 46 20 46 C13 46 6 40 6 30 C6 22 11 18 13 12 C15 18 17 20 19 20 C20 14 18 8 20 2 Z"
        fill={color}
        stroke="#2a1640"
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <path d="M20 22 C23 28 27 30 27 35 C27 40 24 42 20 42 C16 42 13 40 13 35 C13 31 17 29 20 22 Z" fill="#ffe36b" />
    </svg>
  );
}

export function ChargeCard({ card, scale = 1, style, faceDown }: { card?: PowderCard; scale?: number; style?: CSSProperties; faceDown?: boolean }) {
  const w = cardVisual.width * scale;
  const h = cardVisual.height * scale;
  const r = cardVisual.radius * scale;
  const base: CSSProperties = {
    position: 'relative',
    width: w,
    height: h,
    borderRadius: r,
    boxShadow: `0 0 0 ${4 * scale}px #1b1430, 0 ${6 * scale}px 0 ${4 * scale}px rgba(27,20,48,0.85)`,
    flexShrink: 0,
    ...style,
  };
  if (faceDown || !card) {
    return (
      <div
        style={{
          ...base,
          background:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.14) 0 8px, rgba(255,255,255,0) 8px 16px), linear-gradient(180deg,#8a4cf0,#5a24b8)',
          border: `${6 * scale}px solid #f4f1ff`,
        }}
      >
        {/* cannonball with a lit fuse */}
        <svg width={w * 0.6} height={w * 0.6} viewBox="0 0 60 60" style={{ position: 'absolute', left: '50%', top: '52%', transform: 'translate(-50%,-50%)', overflow: 'visible' }}>
          <circle cx={28} cy={34} r={20} fill="#2c2540" stroke="#140e24" strokeWidth={4} />
          <ellipse cx={21} cy={27} rx={6} ry={4} fill="rgba(255,255,255,0.6)" transform="rotate(-35 21 27)" />
          <path d="M40 18 Q46 8 52 10" fill="none" stroke="#c9a26b" strokeWidth={4} strokeLinecap="round" />
          <circle cx={53} cy={9} r={5} fill="#ffe36b" stroke="#ff8a1f" strokeWidth={2} />
        </svg>
      </div>
    );
  }
  const n = card.value;
  const flame = 26 * scale;
  return (
    <div style={{ ...base, background: 'linear-gradient(180deg,#fff8e6,#ffe7b8)' }}>
      <div style={{ position: 'absolute', inset: 6 * scale, borderRadius: r * 0.7, boxShadow: `inset 0 0 0 ${3 * scale}px #ffb347` }} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 14 * scale,
          textAlign: 'center',
          fontFamily: 'var(--font-title)',
          fontSize: 68 * scale,
          lineHeight: 1,
          color: '#ff7a1a',
          WebkitTextStroke: `${9 * scale}px #2a1640`,
          paintOrder: 'stroke fill',
        }}
      >
        +{n}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 8 * scale,
          right: 8 * scale,
          bottom: 14 * scale,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 2 * scale,
        }}
      >
        {Array.from({ length: n }, (_, i) => (
          <Flame key={i} size={n > 3 ? flame * 0.86 : flame} />
        ))}
      </div>
    </div>
  );
}
