// Color Clash cost badge: rounded green hexagon with an outlined number.

import type { CSSProperties, ReactNode } from 'react';

const SKINS = {
  green: { fill: '#52e04c', hi: '#a8ff8a', rim: '#1d7d22' },
  gold: { fill: '#ffc631', hi: '#fff0a0', rim: '#a86406' },
  grey: { fill: '#8f93ad', hi: '#c9cbe0', rim: '#4b4e66' },
  red: { fill: '#fb586c', hi: '#ffb3bd', rim: '#8a1122' },
  black: { fill: '#16121f', hi: '#3a3350', rim: '#000000' },
};

export function HexBadge({
  children,
  size = 76,
  skin = 'green',
  colors,
  fontSize,
  style,
}: {
  children: ReactNode;
  size?: number;
  skin?: keyof typeof SKINS;
  /** Custom skin (e.g. a gauge zone color), overrides `skin`. */
  colors?: { fill: string; hi: string; rim: string };
  fontSize?: number;
  style?: CSSProperties;
}) {
  const s = colors ?? SKINS[skin];
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${50 + Math.cos(a) * 44},${50 + Math.sin(a) * 44}`;
  }).join(' ');
  const fs = fontSize ?? size * 0.56;
  return (
    <div style={{ position: 'relative', width: size, height: size, ...style }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <polygon points={pts} fill="#1b1430" stroke="#1b1430" strokeWidth={14} strokeLinejoin="round" transform="translate(0 4)" />
        <polygon points={pts} fill={s.rim} stroke={s.rim} strokeWidth={10} strokeLinejoin="round" />
        <polygon points={pts} fill={s.fill} stroke={s.fill} strokeWidth={2} strokeLinejoin="round" transform="translate(50 50) scale(0.86) translate(-50 -50)" />
        <path d="M22 38 Q50 14 78 38" fill="none" stroke={s.hi} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-title)',
          fontSize: fs,
          color: '#fff',
          lineHeight: 1,
          paddingTop: size * 0.04,
          WebkitTextStroke: `${Math.max(3, fs * 0.16)}px #1b1430`,
          paintOrder: 'stroke fill',
        }}
      >
        {children}
      </div>
    </div>
  );
}
