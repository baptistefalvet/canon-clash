// « CANON CLASH » logo: multicolor tilted letters (Color Clash style) + gold CLASH + powder cards.

import { teams } from '../../config/players';
import { OutlinedText } from './OutlinedText';
import { ChargeCard } from '../charge/ChargeCard';

const LETTER_COLORS = [teams.blue.tile, teams.red.tile, teams.green.tile, teams.yellow.tile, teams.blue.tile];
const TILTS = [-6, 4, -3, 5, -4];

export function Logo({ scale = 1 }: { scale?: number }) {
  return (
    <div style={{ position: 'relative', width: 900 * scale, height: 520 * scale, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
      {/* powder cards fanned behind CLASH */}
      <div style={{ position: 'absolute', left: 770, top: 150, transform: 'rotate(14deg)' }}>
        <ChargeCard card={{ value: 3, id: -1 }} scale={1.2} />
      </div>
      <div style={{ position: 'absolute', left: 836, top: 196, transform: 'rotate(28deg)' }}>
        <ChargeCard card={{ value: 4, id: -2 }} scale={1.2} />
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'center', gap: 4 }}>
        {'CANON'.split('').map((ch, i) => (
          <span key={i} style={{ display: 'inline-block', transform: `rotate(${TILTS[i]}deg) translateY(${i % 2 ? 10 : 0}px)` }}>
            <OutlinedText
              size={230}
              gradient={`linear-gradient(180deg, #ffffff 0%, ${LETTER_COLORS[i]} 22%, ${LETTER_COLORS[i]} 70%, rgba(0,0,0,0.25) 100%)`}
              stroke="#ffffff"
              strokeWidth={14}
              shadow="#1b1430"
              shadowOffset={18}
            >
              {ch}
            </OutlinedText>
          </span>
        ))}
      </div>

      <div style={{ position: 'absolute', left: 20, top: 205 }}>
        <OutlinedText
          size={240}
          gradient="linear-gradient(180deg, #fff6c2 0%, #ffd75a 30%, #f2a823 75%, #d27d10 100%)"
          stroke="#2a1640"
          strokeWidth={16}
          shadow="#1b1430"
          shadowOffset={20}
        >
          CLASH
        </OutlinedText>
      </div>

      {/* COLOR ribbon */}
      <div
        style={{
          position: 'absolute',
          left: 170,
          top: 438,
          width: 560,
          height: 92,
          borderRadius: 46,
          background: 'linear-gradient(180deg,#b07cff,#7a3fe0 60%,#5a24b8)',
          boxShadow: '0 0 0 7px #1b1430, 0 10px 0 7px #1b1430, inset 0 5px 0 rgba(255,255,255,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
        }}
      >
        {[teams.blue.tile, teams.red.tile].map((c) => (
          <span key={c} style={{ width: 30, height: 30, borderRadius: 6, background: c, boxShadow: '0 0 0 4px #1b1430' }} />
        ))}
        <OutlinedText size={74} strokeWidth={8} shadowOffset={5}>
          COLOR
        </OutlinedText>
        {[teams.green.tile, teams.yellow.tile].map((c) => (
          <span key={c} style={{ width: 30, height: 30, borderRadius: 6, background: c, boxShadow: '0 0 0 4px #1b1430' }} />
        ))}
      </div>
    </div>
  );
}
