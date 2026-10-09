// Victory: heavy celebration FX, prize revealed after a short delay (already credited to the purse).

import { useEffect, useMemo, useState } from 'react';
import { useAppState } from '../app/store';
import { formatEuros } from '../purse/format';
import { Backdrop } from '../ui/Backdrop';
import { Fireflies } from '../ui/Fireflies';
import { OutlinedText } from '../ui/OutlinedText';
import { Ribbon } from '../ui/Ribbon';
import { sfx } from '../audio/sfx';
import { EndButtons } from './EndButtons';
import { Standings } from './Standings';
import { teams } from '../../config/players';
import { resultScreens } from '../../config/flow';

const CONFETTI_COLORS = [teams.blue.tile, teams.red.tile, teams.green.tile, teams.yellow.tile, '#ffffff', '#c27cff'];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: resultScreens.confettiCount }, (_, i) => ({
        left: Math.random() * 1080,
        delay: Math.random() * 2.5,
        dur: 2.6 + Math.random() * 2.2,
        size: 14 + Math.random() * 16,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        drift: (Math.random() - 0.5) * 300,
        spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720),
      })),
    [],
  );
  return (
    <div className="layer" style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {pieces.map((p, i) => (
        <span
          key={i}
          style={
            {
              position: 'absolute',
              left: p.left,
              top: -40,
              width: p.size,
              height: p.size * 0.6,
              background: p.color,
              borderRadius: 3,
              boxShadow: '0 0 0 2px rgba(27,20,48,0.5)',
              animation: `confetti-fall ${p.dur}s linear ${p.delay}s infinite`,
              '--drift': `${p.drift}px`,
              '--spin': `${p.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function WinScreen() {
  const result = useAppState((s) => s.lastResult);
  const [revealed, setRevealed] = useState(false);
  const [shown, setShown] = useState(0);
  const prize = result?.prizeCents ?? 0;

  useEffect(() => {
    sfx.win();
    const t = window.setTimeout(() => setRevealed(true), resultScreens.revealDelayMs);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!revealed) return;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / resultScreens.countUpMs);
      setShown(Math.round(prize * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
      else sfx.coin();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [revealed, prize]);

  return (
    <div className="layer">
      <Backdrop dim={0.6} fireflies={false} />
      {/* burst rays */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 900,
          top: 820 - 900,
          width: 1800,
          height: 1800,
          background: 'repeating-conic-gradient(from 0deg, rgba(255,214,90,0.28) 0deg 9deg, rgba(255,214,90,0) 9deg 18deg)',
          maskImage: 'radial-gradient(circle, #000 15%, transparent 60%)',
          WebkitMaskImage: 'radial-gradient(circle, #000 15%, transparent 60%)',
          animation: 'spin 18s linear infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 540 - 380,
          top: 820 - 380,
          width: 760,
          height: 760,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,236,150,0.75) 0%, rgba(255,190,60,0.35) 40%, rgba(255,160,0,0) 70%)',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      />
      <Fireflies count={40} />
      <Confetti />

      <div style={{ position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', animation: 'pop-in 500ms ease-out both' }}>
        <Ribbon text="Félicitations" width={860} fontSize={96} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', animation: 'fade-up 500ms 200ms ease-out both' }}>
        <OutlinedText size={84}>VOUS AVEZ GAGNÉ</OutlinedText>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', height: 260 }}>
        {revealed && (
          <div style={{ animation: 'pop-in 520ms ease-out both' }}>
            <OutlinedText
              size={230}
              gradient="linear-gradient(180deg,#fff6c2 0%,#ffd75a 35%,#f2a823 80%,#d27d10 100%)"
              stroke="#2a1640"
              strokeWidth={18}
              shadowOffset={16}
            >
              {formatEuros(shown)}
            </OutlinedText>
          </div>
        )}
      </div>
      {revealed && result?.prizeLabel && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 990, textAlign: 'center', animation: 'fade-up 400ms 300ms ease-out both' }}>
          <OutlinedText size={66} color="#8cf06b">
            {result.prizeLabel}
          </OutlinedText>
        </div>
      )}
      {result && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1130 }}>
          <Standings standings={result.standings} />
        </div>
      )}
      <EndButtons top={1620} />
    </div>
  );
}
