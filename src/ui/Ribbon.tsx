// Gold title ribbon used on FDJ panels (« Règles du jeu », « Félicitations »…).

import type { CSSProperties } from 'react';
import { OutlinedText } from './OutlinedText';

export function Ribbon({
  text,
  width = 800,
  fontSize = 92,
  style,
}: {
  text: string;
  width?: number;
  fontSize?: number;
  style?: CSSProperties;
}) {
  const h = 172;
  const w = width;
  const tail = 120;
  const body = { x: 70, y: 8, w: w - 140, h: 118 };
  return (
    <div style={{ position: 'relative', width: w, height: h, ...style }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs>
          <linearGradient id="rib-face" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe48a" />
            <stop offset="0.18" stopColor="#f8cf4e" />
            <stop offset="0.6" stopColor="#f2b52e" />
            <stop offset="1" stopColor="#e39a25" />
          </linearGradient>
          <linearGradient id="rib-tail" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e9a02a" />
            <stop offset="1" stopColor="#b8650f" />
          </linearGradient>
        </defs>
        {/* Tails */}
        {[0, 1].map((side) => {
          const flip = side === 1;
          const x0 = flip ? w - 8 : 8;
          const dir = flip ? -1 : 1;
          const pts = [
            [x0, 54],
            [x0 + dir * tail, 54],
            [x0 + dir * tail, 150],
            [x0, 150],
            [x0 + dir * 38, 102],
          ]
            .map((p) => p.join(','))
            .join(' ');
          const fold = [
            [x0 + dir * (tail - 50), 126],
            [x0 + dir * tail, 150],
            [x0 + dir * tail, 126],
          ]
            .map((p) => p.join(','))
            .join(' ');
          return (
            <g key={side}>
              <polygon points={pts} fill="url(#rib-tail)" stroke="#140e24" strokeWidth={6} strokeLinejoin="round" />
              <polygon points={fold} fill="#592b04" stroke="#140e24" strokeWidth={5} strokeLinejoin="round" />
            </g>
          );
        })}
        {/* Main band */}
        <path
          d={`M${body.x} ${body.y + 6} Q${w / 2} ${body.y - 6} ${body.x + body.w} ${body.y + 6} L${body.x + body.w} ${body.y + body.h} Q${w / 2} ${body.y + body.h - 12} ${body.x} ${body.y + body.h} Z`}
          fill="url(#rib-face)"
          stroke="#140e24"
          strokeWidth={7}
          strokeLinejoin="round"
        />
        <path
          d={`M${body.x + 14} ${body.y + 18} Q${w / 2} ${body.y + 6} ${body.x + body.w - 14} ${body.y + 18}`}
          fill="none"
          stroke="#fff3b8"
          strokeWidth={5}
          strokeLinecap="round"
          opacity={0.8}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: body.y + body.h / 2 - fontSize * 0.56,
          textAlign: 'center',
        }}
      >
        <OutlinedText size={fontSize} stroke="#2a1640" shadow="#2a1640" strokeWidth={7} shadowOffset={6}>
          {text}
        </OutlinedText>
      </div>
    </div>
  );
}
