// Compact top HUD (layout C): avatar, name + rank, timer, and a 4-color territory bar with every share labelled.
// The top-right corner is left free for the FDJ purse overlay.

import { gameLayout } from '../../config/layout';
import { Avatar } from '../avatar/Avatar';
import type { SeatInfo } from '../game/match';
import type { MatchUi } from '../game/snapshot';
import { OutlinedText } from '../ui/OutlinedText';

const L = gameLayout.hud;

export const ordinal = (n: number) => (n === 1 ? '1er' : `${n}e`);

function LongHex({ width, height, fill, children, style }: { width: number; height: number; fill: string; children: React.ReactNode; style?: React.CSSProperties }) {
  const k = height / 2;
  return (
    <div style={{ position: 'absolute', width, height, ...style }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <polygon
          points={`${k * 0.6},0 ${width - k * 0.6},0 ${width},${k} ${width - k * 0.6},${height} ${k * 0.6},${height} 0,${k}`}
          fill={fill}
          stroke="#0c0916"
          strokeWidth={5}
          strokeLinejoin="round"
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
    </div>
  );
}

function Trophy({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <path d="M10 6 H30 V14 Q30 24 20 26 Q10 24 10 14 Z" fill="#ffc631" stroke="#6b3d00" strokeWidth={2.5} />
      <path d="M10 9 H4 Q4 18 11 19 M30 9 H36 Q36 18 29 19" fill="none" stroke="#ffc631" strokeWidth={3.5} />
      <rect x={17} y={25} width={6} height={6} fill="#e3a21a" />
      <rect x={12} y={31} width={16} height={5} rx={2} fill="#ffc631" stroke="#6b3d00" strokeWidth={2} />
      <path d="M14 10 Q14 17 18 20" fill="none" stroke="#fff3b0" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}

export function TopHud({ seats, ui, humanSeat }: { seats: SeatInfo[]; ui: MatchUi; humanSeat: number }) {
  const human = seats[humanSeat];
  const order = [humanSeat, ...seats.map((s) => s.seat).filter((s) => s !== humanSeat)];
  const secs = Math.ceil(ui.timeLeft);
  const urgent = ui.phase === 'playing' && secs <= 10;
  const timeText = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  const bar = L.shareBar;

  return (
    <div className="layer" style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: L.avatar.left, top: L.avatar.top }}>
        <Avatar seed={human.avatar} bg={human.palette.tile} size={L.avatar.size} />
      </div>

      {/* name + rank */}
      <div style={{ position: 'absolute', left: L.name.left, top: L.name.top }}>
        <OutlinedText size={L.name.fontSize}>{human.name}</OutlinedText>
      </div>
      <div style={{ position: 'absolute', left: L.rank.left, top: L.rank.top, display: 'flex', alignItems: 'center', gap: L.rank.gap }}>
        <Trophy size={L.rank.trophySize} />
        <OutlinedText size={L.rank.fontSize} color="#ffc631" stroke="#2a1640">
          {ordinal(ui.ranks[humanSeat])}
        </OutlinedText>
        <OutlinedText size={L.rank.ofFontSize} color="#c9c3e6" stroke="#2a1640">
          / {seats.length}
        </OutlinedText>
      </div>

      {/* timer */}
      <LongHex
        width={L.timer.width}
        height={L.timer.height}
        fill={urgent ? '#c4162c' : '#16121f'}
        style={{ left: L.timer.left, top: L.timer.top, animation: urgent ? 'pulse 0.5s ease-in-out infinite' : undefined }}
      >
        <OutlinedText size={L.timer.fontSize} shadow={null} stroke="#0c0916" strokeWidth={3}>
          {timeText}
        </OutlinedText>
      </LongHex>

      {/* territory bar: you first, every share labelled */}
      <div
        style={{
          position: 'absolute',
          left: bar.left,
          top: bar.top,
          width: bar.width,
          height: bar.height,
          borderRadius: 10,
          background: '#14101f',
          boxShadow: '0 0 0 5px #0c0916',
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {order.map((seat) => {
          const p = seats[seat].palette;
          const share = ui.shares[seat];
          const mine = seat === humanSeat;
          return (
            <div
              key={seat}
              style={{
                width: `${share * 100}%`,
                height: '100%',
                background: `linear-gradient(180deg, ${p.light} 0%, ${p.tile} 28%, ${p.tile} 70%, ${p.dark} 100%)`,
                transition: 'width 220ms linear',
                borderRight: '3px solid rgba(12,9,22,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {share >= bar.minLabelShare && (
                <OutlinedText size={mine ? bar.humanFontSize : bar.fontSize} shadow={null} stroke="#0c0916">
                  {Math.round(share * 100)}%
                </OutlinedText>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
