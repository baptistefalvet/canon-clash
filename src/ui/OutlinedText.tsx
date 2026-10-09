// Chunky cartoon text: fill + thick outline + offset drop outline (Color Clash / FDJ title style).

import type { CSSProperties, ReactNode } from 'react';

export function OutlinedText({
  children,
  size,
  color = '#ffffff',
  stroke = '#2a1640',
  strokeWidth,
  shadow = '#140e24',
  shadowOffset,
  gradient,
  style,
  className,
}: {
  children: ReactNode;
  size: number;
  color?: string;
  stroke?: string;
  strokeWidth?: number;
  shadow?: string | null;
  shadowOffset?: number;
  gradient?: string;
  style?: CSSProperties;
  className?: string;
}) {
  const sw = strokeWidth ?? Math.max(3, Math.round(size * 0.12));
  const so = shadowOffset ?? Math.max(2, Math.round(size * 0.07));
  const fill: CSSProperties = gradient
    ? { backgroundImage: gradient, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }
    : { color };
  return (
    <span className={`otext ${className ?? ''}`} style={{ fontSize: size, ...style }}>
      {shadow && (
        <span
          className="otext-shadow"
          aria-hidden
          style={{ transform: `translateY(${so}px)`, color: shadow, WebkitTextStroke: `${sw * 2}px ${shadow}` }}
        >
          {children}
        </span>
      )}
      <span className="otext-stroke" aria-hidden style={{ color: stroke, WebkitTextStroke: `${sw * 2}px ${stroke}` }}>
        {children}
      </span>
      <span style={{ position: 'relative', ...fill }}>{children}</span>
    </span>
  );
}
