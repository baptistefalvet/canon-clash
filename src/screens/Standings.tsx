// Final ranking row shown on Win / Lose.

import { seats, teams } from '../../config/players';
import type { MatchStanding } from '../app/store';
import { Avatar } from '../avatar/Avatar';
import { ordinal } from '../hud/TopHud';
import { OutlinedText } from '../ui/OutlinedText';

export function Standings({ standings }: { standings: MatchStanding[] }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 22 }}>
      {standings.map((s, i) => {
        const team = teams[seats[s.seat].team];
        return (
          <div
            key={s.seat}
            className="fdj-section"
            style={{
              width: 220,
              padding: '18px 0 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              borderColor: s.isHuman ? '#ffc631' : undefined,
              animation: `fade-up 400ms ${300 + i * 120}ms ease-out both`,
            }}
          >
            <OutlinedText size={40} color={s.rank === 1 ? '#ffd75a' : '#d6caf7'}>
              {ordinal(s.rank)}
            </OutlinedText>
            <Avatar seed={s.avatar} bg={team.tile} size={110} shape="circle" />
            <OutlinedText size={34} color={s.isHuman ? '#ffd75a' : '#ffffff'}>
              {s.name}
            </OutlinedText>
            <OutlinedText size={46} color={team.light}>
              {Math.round(s.share * 100)} %
            </OutlinedText>
          </div>
        );
      })}
    </div>
  );
}
