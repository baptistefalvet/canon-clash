// Ambient firefly particles (CSS animated).

import { useMemo } from 'react';
import { fireflies } from '../../config/flow';
import { stage } from '../../config/layout';

export function Fireflies({ count = fireflies.count, color }: { count?: number; color?: string }) {
  const flies = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: Math.random() * stage.width,
        y: Math.random() * stage.height,
        size: fireflies.minSize + Math.random() * (fireflies.maxSize - fireflies.minSize),
        dur: fireflies.minDurationSec + Math.random() * (fireflies.maxDurationSec - fireflies.minDurationSec),
        delay: -Math.random() * fireflies.maxDurationSec,
        dx: (Math.random() - 0.5) * 160,
        dy: -40 - Math.random() * 160,
      })),
    [count],
  );
  return (
    <div className="layer" style={{ pointerEvents: 'none' }}>
      {flies.map((f, i) => (
        <span
          key={i}
          className="firefly"
          style={
            {
              left: f.x,
              top: f.y,
              width: f.size * 3,
              height: f.size * 3,
              '--dur': `${f.dur}s`,
              '--delay': `${f.delay}s`,
              '--dx': `${f.dx}px`,
              '--dy': `${f.dy}px`,
              ...(color ? { background: `radial-gradient(circle, #fff 0%, ${color} 35%, transparent 70%)` } : {}),
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
