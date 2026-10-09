// Chunky cartoon playing card (face or back).

import type { CSSProperties } from 'react';
import { cardVisual } from '../../config/blackjack';
import { isRed, type Card } from './cards';

export function PlayingCard({ card, scale = 1, style, faceDown }: { card?: Card; scale?: number; style?: CSSProperties; faceDown?: boolean }) {
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
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-title)',
            fontSize: 46 * scale,
            color: '#ffd75a',
            WebkitTextStroke: `${6 * scale}px #2a1640`,
            paintOrder: 'stroke fill',
          }}
        >
          21
        </div>
      </div>
    );
  }
  const color = isRed(card.suit) ? '#e22e41' : '#1b1430';
  return (
    <div style={{ ...base, background: 'linear-gradient(180deg,#ffffff,#eeeaf7)' }}>
      <div
        style={{
          position: 'absolute',
          left: 10 * scale,
          top: 6 * scale,
          fontFamily: 'var(--font-title)',
          fontSize: 44 * scale,
          lineHeight: 1,
          color,
          textAlign: 'center',
        }}
      >
        {card.rank}
        <div style={{ fontSize: 34 * scale, marginTop: -2 * scale }}>{card.suit}</div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 10 * scale,
          bottom: 4 * scale,
          fontSize: 72 * scale,
          lineHeight: 1,
          color,
          fontFamily: 'var(--font-title)',
        }}
      >
        {card.suit}
      </div>
    </div>
  );
}
