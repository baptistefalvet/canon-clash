// Color Clash-style unit card: framed blue card, hex pattern, artwork and the blackjack total badge.

import type { BonusInfo } from '../../config/bonuses';
import { bonusArt } from '../ui/bonusArt';
import { HexBadge } from '../ui/HexBadge';

export type CardState = 'idle' | 'dim' | 'target' | 'won' | 'played';

const HEX_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='48' viewBox='0 0 56 48'%3E%3Cpath d='M14 1 L42 1 L55 24 L42 47 L14 47 L1 24 Z' fill='none' stroke='white' stroke-opacity='0.16' stroke-width='2'/%3E%3C/svg%3E\")";

export function BonusCard({
  bonus,
  width,
  height,
  state,
  style,
}: {
  bonus: BonusInfo;
  width: number;
  height: number;
  state: CardState;
  style?: React.CSSProperties;
}) {
  const jackpot = bonus.total === 21;
  const dim = state === 'dim';
  const lit = state === 'target' || state === 'won';
  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        transition: 'transform 160ms ease-out, filter 160ms',
        transform: state === 'target' ? 'translateY(-14px) scale(1.04)' : state === 'won' ? 'translateY(-22px) scale(1.1)' : 'none',
        animation: state === 'won' ? 'pulse 0.45s ease-in-out infinite' : undefined,
        ...style,
      }}
    >
      {lit && (
        <div
          style={{
            position: 'absolute',
            inset: -14,
            borderRadius: 26,
            background: jackpot ? 'radial-gradient(circle, rgba(255,214,80,0.9), rgba(255,180,0,0) 70%)' : 'radial-gradient(circle, rgba(140,255,120,0.85), rgba(80,220,60,0) 70%)',
            filter: 'blur(6px)',
          }}
        />
      )}
      {/* frame */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 18,
          background: jackpot ? 'linear-gradient(180deg,#fff3b0,#ffc631 50%,#e39a25)' : 'linear-gradient(180deg,#f4f8ff,#cfdcf0)',
          boxShadow: '0 0 0 4px #1b1430, 0 8px 0 #1b1430',
        }}
      />
      {/* inner */}
      <div
        style={{
          position: 'absolute',
          inset: 7,
          borderRadius: 12,
          overflow: 'hidden',
          background: `${HEX_PATTERN}, linear-gradient(180deg, #7fd6ff 0%, #45b2ff 45%, #2b8ff0 100%)`,
          boxShadow: 'inset 0 0 0 3px rgba(20,60,140,0.35)',
        }}
      >
        <img
          src={bonusArt(bonus.id)}
          alt={bonus.name}
          draggable={false}
          style={{ position: 'absolute', left: '50%', top: '44%', width: width * 0.92, transform: 'translate(-50%,-50%)', filter: 'drop-shadow(0 6px 0 rgba(10,30,90,0.35))' }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 8,
            textAlign: 'center',
            fontFamily: 'var(--font-title)',
            fontSize: 30,
            color: '#fff',
            WebkitTextStroke: '6px #123a7a',
            paintOrder: 'stroke fill',
          }}
        >
          {bonus.name}
        </div>
        {dim && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(115deg, rgba(70,60,140,0.72) 0%, rgba(70,60,140,0.72) 55%, rgba(120,110,190,0.55) 55%, rgba(120,110,190,0.55) 100%)',
            }}
          />
        )}
      </div>
      <HexBadge
        size={78}
        skin={dim ? 'grey' : jackpot ? 'gold' : 'green'}
        style={{ position: 'absolute', left: '50%', bottom: -34, transform: 'translateX(-50%)' }}
      >
        {bonus.total}
      </HexBadge>
    </div>
  );
}
