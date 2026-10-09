// Shared splash layout (TitleScreen and BetMenu): backdrop, logo, pitch, prize tag, footer slot.

import type { ReactNode } from 'react';
import { economy } from '../../config/economy';
import { bonusByTotal } from '../../config/bonuses';
import { formatEuros } from '../purse/format';
import { Backdrop } from '../ui/Backdrop';
import { Logo } from '../ui/Logo';
import { OutlinedText } from '../ui/OutlinedText';
import { BonusCard } from '../hud/BonusCard';

export function CardFan({ top }: { top: number }) {
  const totals = [18, 19, 20, 21];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top, height: 300 }}>
      {totals.map((t, i) => {
        const a = (i - 1.5) * 9;
        return (
          <div
            key={t}
            style={{
              position: 'absolute',
              left: 540 - 98 + (i - 1.5) * 205,
              top: Math.abs(i - 1.5) * 26,
              transform: `rotate(${a}deg)`,
              animation: `float-y ${2.6 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`,
            }}
          >
            <BonusCard bonus={bonusByTotal[t]} width={196} height={210} state={t === 21 ? 'target' : 'idle'} />
          </div>
        );
      })}
    </div>
  );
}

export function TitleLayout({ footer }: { footer: ReactNode }) {
  return (
    <div className="layer">
      <Backdrop />
      <div style={{ position: 'absolute', left: 90, top: 290, animation: 'pop-in 600ms ease-out both' }}>
        <Logo />
      </div>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 880, textAlign: 'center', animation: 'fade-up 500ms 200ms ease-out both' }}>
        <OutlinedText size={58} style={{ whiteSpace: 'normal', lineHeight: 1.15 }}>
          Conquérez le plateau,
        </OutlinedText>
        <br />
        <OutlinedText size={58} style={{ whiteSpace: 'normal', lineHeight: 1.15, marginTop: 12 }}>
          boostez vos canons au <span style={{ color: '#ffd75a' }}>Blackjack</span> !
        </OutlinedText>
      </div>

      {/* Prize tag */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1060, textAlign: 'center', animation: 'fade-up 500ms 350ms ease-out both' }}>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 150,
            width: 760,
            height: 760,
            marginLeft: -380,
            marginTop: -380,
            background: 'repeating-conic-gradient(from 0deg, rgba(255,215,90,0.16) 0deg 10deg, rgba(255,215,90,0) 10deg 20deg)',
            maskImage: 'radial-gradient(circle, #000 20%, transparent 65%)',
            WebkitMaskImage: 'radial-gradient(circle, #000 20%, transparent 65%)',
            animation: 'spin 24s linear infinite',
          }}
        />
        <div style={{ position: 'relative' }}>
          <OutlinedText size={66} color="#ffffff">
            GAGNEZ JUSQU&apos;À
          </OutlinedText>
        </div>
        <div style={{ position: 'relative', marginTop: 18, animation: 'pulse 1.6s ease-in-out infinite' }}>
          <OutlinedText
            size={190}
            gradient="linear-gradient(180deg,#fff6c2 0%,#ffd75a 35%,#f2a823 80%,#d27d10 100%)"
            stroke="#2a1640"
            strokeWidth={16}
            shadowOffset={14}
          >
            {formatEuros(economy.advertisedMaxCents)} !
          </OutlinedText>
        </div>
      </div>

      {footer}
    </div>
  );
}
